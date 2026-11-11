import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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
    const existing = await this.prisma.organization.findFirst({ where: { name: dto.name, deletedAt: null } });
    if (existing) throw new ConflictException('Une organisation avec ce nom existe déjà');

    // Vérifier uniquement les users non-supprimés
    const emailTaken = await this.prisma.user.findFirst({
      where: { email: dto.adminEmail, deletedAt: null }
    });
    if (emailTaken) throw new ConflictException('Cet email est déjà utilisé');

    const isTrialPlan = !dto.subscriptionPlan || dto.subscriptionPlan === 'INDIVIDUEL';
    const trialEndsAt = isTrialPlan
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : undefined;

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        subscriptionPlan: dto.subscriptionPlan ?? 'INDIVIDUEL',
        status: 'ACTIVE',
        trialEndsAt,
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

  findPending() {
    return this.prisma.organization.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'PENDING_APPROVAL' }
        ],
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true } },
        users: { take: 1, orderBy: { createdAt: 'asc' }, select: { email: true, firstName: true, lastName: true } },
      },
    });
  }

  findAll() {
    return this.prisma.organization.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true, actionPlans: true } } },
    });
  }

  findDeleted() {
    return this.prisma.organization.findMany({
      where: { NOT: { deletedAt: null } },
      orderBy: { deletedAt: 'desc' },
      include: {
        _count: { select: { users: true, actionPlans: true } },
      },
    });
  }

  async approve(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          take: 1, // Premier utilisateur créé (admin)
        },
      },
    });

    if (!org) throw new NotFoundException('Organisation introuvable');
    if (org.status !== 'PENDING' && org.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Organisation non en attente de validation');
    }

    // Nouveau mot de passe temporaire, pour l'administrateur (premier compte) uniquement
    const admin = org.users[0];
    const tempPassword = randomBytes(6).toString('base64url').slice(0, 10);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          subscriptionStatus: 'ACTIVE',
        },
      });

      await tx.user.updateMany({
        where: { organizationId: id, deletedAt: null },
        data: { isActive: true },
      });

      if (admin) {
        // Mot de passe envoyé par e-mail → changement obligatoire à la première connexion
        await tx.user.update({
          where: { id: admin.id },
          data: { passwordHash, mustChangePassword: true, tokensValidAfter: new Date() },
        });
      }
    });

    // Envoyer les credentials au premier utilisateur (admin)
    if (admin) {
      await this.notifications.sendWelcomeCredentials({
        email: admin.email,
        firstName: admin.firstName,
        orgName: org.name,
        tempPassword,
      });
    }

    return { message: 'Organisation approuvée et credentials envoyés' };
  }

  async reject(id: string, reason?: string) {
    const org = await this.findOne(id);
    if (org.status !== 'PENDING' && org.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Organisation non en attente de validation');
    }

    await this.prisma.organization.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason?.trim() || null },
    });

    // Prévenir la personne inscrite (premier compte de l'organisation)
    const registrant = await this.prisma.user.findFirst({
      where: { organizationId: id, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { email: true, firstName: true },
    });
    if (registrant) {
      await this.notifications.sendRegistrationRejected({
        email: registrant.email,
        firstName: registrant.firstName,
        orgName: org.name,
        reason: reason?.trim() || undefined,
      });
    }

    return { message: 'Organisation rejetée' };
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { actionPlans: true, users: true } } },
    });
    if (!org) throw new NotFoundException('Organisation introuvable');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    if (dto.name) {
      const taken = await this.prisma.organization.findFirst({
        where: { name: dto.name, deletedAt: null, NOT: { id } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Une organisation avec ce nom existe déjà');
    }
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async updateBrandColor(organizationId: string, brandColor: string) {
    if (!/^#[0-9a-fA-F]{6}$/.test(brandColor)) {
      throw new BadRequestException('Couleur invalide — format attendu : #rrggbb');
    }
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: { brandColor },
      select: { id: true, brandColor: true },
    });
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id);
    this.validateCurrentUserId(currentUserId);

    const currentUser = await this.getCurrentUser(currentUserId);
    this.preventSelfDeletion(currentUser.organizationId, id);

    // 🛡️ Protection SuperAdmin : empêcher la suppression d'organisations contenant des superadmins
    await this.preventSuperAdminDeletion(id);

    await this.softDeleteOrganizationWithUsers(id);
    return { message: 'Organisation et utilisateurs désactivés' };
  }

  async restore(id: string) {
    const organization = await this.findDeletedOrganization(id);
    await this.restoreOrganizationWithUsers(id);

    return {
      message: 'Organisation et utilisateurs restaurés',
      usersRestored: organization._count.users,
    };
  }

  async hardDelete(id: string) {
    // Vérifier que l'organisation existe et est supprimée
    const organization = await this.findDeletedOrganization(id);

    // 🛡️ Protection SuperAdmin : empêcher la suppression DÉFINITIVE d'organisations contenant des superadmins (même soft-deleted)
    await this.preventSuperAdminDeletion(id, true);

    // Suppression définitive (libère le nom d'organisation et les emails)
    await this.prisma.$transaction([
      // 1. Supprimer tous les utilisateurs de l'organisation
      this.prisma.user.deleteMany({
        where: { organizationId: id },
      }),
      // 2. Supprimer l'organisation
      this.prisma.organization.delete({
        where: { id },
      }),
    ]);

    return {
      message: 'Organisation supprimée définitivement',
      usersDeleted: organization._count.users,
    };
  }

  private validateCurrentUserId(currentUserId: string) {
    if (!currentUserId) {
      throw new BadRequestException('Impossible d\'identifier l\'utilisateur actuel.');
    }
  }

  private async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { id: true, organizationId: true, role: { select: { name: true } } },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur actuel introuvable ou inactif.');
    }

    return user;
  }

  private preventSelfDeletion(userOrganizationId: string, targetOrganizationId: string) {
    if (userOrganizationId === targetOrganizationId) {
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer votre propre organisation. ' +
        'Cela vous déconnecterait et supprimerait votre compte.'
      );
    }
  }

  private async preventSuperAdminDeletion(organizationId: string, includeDeleted = false) {
    // Vérifier s'il y a des superadmins dans l'organisation (actifs ou tous selon le contexte)
    const superAdminCount = await this.prisma.user.count({
      where: {
        organizationId,
        ...(includeDeleted ? {} : { deletedAt: null }),
        role: {
          name: 'Super administrateur',
        },
      },
    });

    if (superAdminCount > 0) {
      throw new BadRequestException(
        `Cette organisation contient ${superAdminCount} Super Administrateur(s) et ne peut pas être supprimée. ` +
        'Transférez d\'abord les Super Administrateurs vers une autre organisation.'
      );
    }
  }

  private async findDeletedOrganization(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!organization) {
      throw new NotFoundException('Organisation introuvable');
    }

    if (organization.deletedAt === null) {
      throw new BadRequestException('Cette organisation est déjà active');
    }

    return organization;
  }

  private async softDeleteOrganizationWithUsers(organizationId: string) {
    const deletedAt = new Date();

    await this.prisma.$transaction([
      // Les comptes déjà supprimés gardent leur date : la restauration ne les ramènera pas
      this.prisma.user.updateMany({
        where: { organizationId, deletedAt: null },
        data: { deletedAt, isActive: false },
      }),
      this.prisma.organization.update({
        where: { id: organizationId },
        data: { deletedAt },
      }),
    ]);
  }

  private async restoreOrganizationWithUsers(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { deletedAt: true },
    });
    // Seuls les comptes désactivés en même temps que l'organisation sont restaurés ;
    // un compte supprimé auparavant reste supprimé.
    await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { organizationId, deletedAt: org?.deletedAt ?? undefined },
        data: { deletedAt: null, isActive: true },
      }),
      this.prisma.organization.update({
        where: { id: organizationId },
        data: { deletedAt: null },
      }),
    ]);
  }
}
