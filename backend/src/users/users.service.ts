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

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, actorOrganizationId: string, actorRole: string) {
    const orgId = actorRole === 'Super administrateur' && dto.organizationId
      ? dto.organizationId
      : actorOrganizationId;

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Rôle introuvable');

    if (actorRole !== 'Super administrateur' && role.name === 'Super administrateur') {
      throw new ForbiddenException('Vous ne pouvez pas créer un super admin');
    }

    // Vérifier la limite d'utilisateurs du plan
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { subscriptionPlan: true },
    });

    if (!organization) throw new NotFoundException('Organisation introuvable');

    const currentUserCount = await this.prisma.user.count({
      where: { organizationId: orgId },
    });

    const planLimit = PLAN_LIMITS[organization.subscriptionPlan];

    if (currentUserCount >= planLimit.maxUsers) {
      throw new BadRequestException(
        `Limite d'utilisateurs atteinte pour votre formule ${organization.subscriptionPlan}. ` +
        `Maximum autorisé : ${planLimit.maxUsers} utilisateurs. ` +
        `Passez à une formule supérieure pour ajouter plus d'utilisateurs.`
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        organizationId: orgId,
        roleId: dto.roleId,
        mustChangePassword: true,
      },
      include: { role: true },
    });

    const { passwordHash: _, twoFactorSecret: __, ...safe } = user;
    return safe;
  }

  async findUsersForAssignment(organizationId: string) {
    return this.prisma.user.findMany({
      where: {
        organizationId,
        isActive: true, // Seulement les utilisateurs actifs
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

  async findAll(organizationId: string, page = 1, limit = 10) {
    const where = { organizationId };
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
      where: { id, organizationId },
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
      data.passwordHash = await bcrypt.hash(dto.password, 12);
      delete data.password;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    const { passwordHash, twoFactorSecret, ...safe } = updated;
    return safe;
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    await this.prisma.user.delete({ where: { id } });
  }

  findRoles(organizationId?: string, callerRole?: string) {
    const isSuperAdmin = callerRole === 'Super administrateur';
    return this.prisma.role.findMany({
      where: {
        ...(organizationId
          ? { OR: [{ organizationId }, { organizationId: null }] }
          : {}),
        ...(isSuperAdmin ? {} : { NOT: { name: 'Super administrateur' } }),
      },
      orderBy: [{ organizationId: 'asc' }, { name: 'asc' }],
    });
  }
}
