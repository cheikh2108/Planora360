import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { PLAN_LIMITS } from '../common/guards/subscription.guard';
import { BCRYPT_SALT_ROUNDS, ROLE_SUPER_ADMIN } from '../common/constants/auth.constants';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, actorOrganizationId: string, actorRole: string) {
    const orgId = this.resolveOrganizationId(dto.organizationId, actorOrganizationId, actorRole);

    await this.validateEmailUniqueness(dto.email);
    const role = await this.validateRole(dto.roleId, actorRole);
    await this.validateUserLimit(orgId);

    const user = await this.createUser(dto, orgId);
    return this.sanitizeUserResponse(user);
  }

  private resolveOrganizationId(
    dtoOrganizationId: string | undefined,
    actorOrganizationId: string,
    actorRole: string,
  ): string {
    return actorRole === ROLE_SUPER_ADMIN && dtoOrganizationId
      ? dtoOrganizationId
      : actorOrganizationId;
  }

  private async validateEmailUniqueness(email: string) {
    const existing = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');
  }

  private async validateRole(roleId: string, actorRole: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Rôle introuvable');

    if (actorRole !== ROLE_SUPER_ADMIN && role.name === ROLE_SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas créer un super admin');
    }

    return role;
  }

  private async validateUserLimit(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { subscriptionPlan: true },
    });

    if (!organization) throw new NotFoundException('Organisation introuvable');

    const currentUserCount = await this.prisma.user.count({
      where: { organizationId, deletedAt: null },
    });

    const planLimit = PLAN_LIMITS[organization.subscriptionPlan];

    if (currentUserCount >= planLimit.maxUsers) {
      throw new BadRequestException(
        `Limite d'utilisateurs atteinte pour votre formule ${organization.subscriptionPlan}. ` +
        `Maximum autorisé : ${planLimit.maxUsers} utilisateurs. ` +
        `Passez à une formule supérieure pour ajouter plus d'utilisateurs.`
      );
    }
  }

  private async createUser(dto: CreateUserDto, organizationId: string) {
    const passwordHash = await this.hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        organizationId,
        roleId: dto.roleId,
        mustChangePassword: true,
      },
      include: { role: true },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  private sanitizeUserResponse(user: any) {
    const { passwordHash: _, twoFactorSecret: __, ...safe } = user;
    return safe;
  }

  async findUsersForAssignment(organizationId: string) {
    return this.prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });
  }

  async findAll(organizationId: string, page = 1, limit = 20) {
    const where = { organizationId, deletedAt: null };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: users.map(({ passwordHash, twoFactorSecret, ...u }) => u),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const { passwordHash, twoFactorSecret, ...safe } = user;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto, organizationId: string) {
    await this.findOne(id, organizationId);

    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await this.hashPassword(dto.password);
      delete data.password;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return this.sanitizeUserResponse(updated);
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    // Soft delete : marquer comme supprimé au lieu de vraiment supprimer
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  findRoles(organizationId?: string, callerRole?: string) {
    const isSuperAdmin = callerRole === ROLE_SUPER_ADMIN;
    return this.prisma.role.findMany({
      where: {
        ...(organizationId
          ? { OR: [{ organizationId }, { organizationId: null }] }
          : {}),
        ...(isSuperAdmin ? {} : { NOT: { name: ROLE_SUPER_ADMIN } }),
      },
      orderBy: [{ organizationId: 'asc' }, { name: 'asc' }],
    });
  }
}
