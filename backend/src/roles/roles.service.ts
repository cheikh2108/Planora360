import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Rôles visibles par une org: ses rôles custom + les rôles système SAUF Super administrateur
  async findAll(organizationId: string, callerRole?: string | null) {
    const isSuperAdmin = callerRole === 'Super administrateur';
    return this.prisma.role.findMany({
      where: {
        OR: [
          { organizationId },
          { organizationId: null },
        ],
        // Seul le Super administrateur se voit lui-même
        ...(isSuperAdmin ? {} : { NOT: { name: 'Super administrateur' } }),
      },
      orderBy: [{ organizationId: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { users: true } } },
    });
  }

  async findOne(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        OR: [{ organizationId }, { organizationId: null }],
      },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Rôle introuvable');
    return role;
  }

  /** Un rôle personnalisé ne peut pas porter le nom d'un rôle système (ex. "Super administrateur"). */
  private async assertNotSystemName(name: string) {
    const system = await this.prisma.role.findFirst({
      where: { organizationId: null, name: { equals: name.trim(), mode: 'insensitive' } },
    });
    if (system) {
      throw new ConflictException(`« ${name} » est un rôle système : choisissez un autre nom`);
    }
  }

  async create(dto: CreateRoleDto, organizationId: string) {
    await this.assertNotSystemName(dto.name);
    const existing = await this.prisma.role.findFirst({
      where: { organizationId, name: dto.name },
    });
    if (existing) throw new ConflictException('Un rôle avec ce nom existe déjà');

    return this.prisma.role.create({
      data: {
        organizationId,
        name: dto.name,
        permissions: dto.permissions,
      },
    });
  }

  async update(id: string, dto: UpdateRoleDto, organizationId: string) {
    const role = await this.prisma.role.findFirst({ where: { id } });
    if (!role) throw new NotFoundException('Rôle introuvable');

    // Les rôles système (organizationId null) ne peuvent pas être modifiés
    if (role.organizationId === null) {
      throw new ForbiddenException('Les rôles système ne peuvent pas être modifiés');
    }
    if (role.organizationId !== organizationId) {
      throw new ForbiddenException('Ce rôle n\'appartient pas à votre organisation');
    }

    if (dto.name) {
      await this.assertNotSystemName(dto.name);
      const conflict = await this.prisma.role.findFirst({
        where: { organizationId, name: dto.name, id: { not: id } },
      });
      if (conflict) throw new ConflictException('Un rôle avec ce nom existe déjà');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.permissions && { permissions: dto.permissions }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({ where: { id } });
    if (!role) throw new NotFoundException('Rôle introuvable');

    if (role.organizationId === null) {
      throw new ForbiddenException('Les rôles système ne peuvent pas être supprimés');
    }
    if (role.organizationId !== organizationId) {
      throw new ForbiddenException('Ce rôle n\'appartient pas à votre organisation');
    }

    const usersWithRole = await this.prisma.user.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      throw new ConflictException(`Ce rôle est assigné à ${usersWithRole} utilisateur(s). Réassignez-les d'abord.`);
    }

    await this.prisma.role.delete({ where: { id } });
  }
}
