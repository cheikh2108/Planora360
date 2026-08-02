import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findFirst({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Une organisation avec ce nom existe déjà');

    const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
    if (emailTaken) throw new ConflictException('Cet email est déjà utilisé');

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        subscriptionPlan: dto.subscriptionPlan,
      },
    });

    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'Administrateur', organizationId: null },
    });
    if (!adminRole) throw new NotFoundException('Rôle Administrateur introuvable');

    const tempPassword = randomBytes(6).toString('base64url').slice(0, 10);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.user.create({
      data: {
        email: dto.adminEmail,
        firstName: dto.adminFirstName,
        lastName: dto.adminLastName,
        passwordHash,
        organizationId: org.id,
        roleId: adminRole.id,
        mustChangePassword: true,
      },
    });

    await this.notifications.sendWelcomeCredentials({
      email: dto.adminEmail,
      firstName: dto.adminFirstName,
      orgName: org.name,
      tempPassword,
    });

    return org;
  }

  findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true, actionPlans: true } } },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { actionPlans: true, users: true } } },
    });
    if (!org) throw new NotFoundException('Organisation introuvable');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.organization.delete({ where: { id } });
  }
}
