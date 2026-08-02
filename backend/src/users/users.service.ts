import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

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

  async findAll(organizationId: string) {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ passwordHash, twoFactorSecret, ...u }) => u);
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
