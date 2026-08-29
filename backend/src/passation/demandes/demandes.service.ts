import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatusDemandeAchat, ValidationDecision } from '@prisma/client';

@Injectable()
export class DemandesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: any) {
    // Générer référence unique
    const count = await this.prisma.demandeAchat.count({
      where: { organizationId },
    });
    const reference = `DA-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.demandeAchat.create({
      data: {
        ...dto,
        reference,
        organizationId,
        demandeurId: userId,
      },
      include: {
        demandeur: { select: { id: true, firstName: true, lastName: true } },
        lignePPM: true,
        activity: { select: { id: true, title: true } },
      },
    });
  }

  async findAll(organizationId: string, filters?: any) {
    return this.prisma.demandeAchat.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.demandeurId && { demandeurId: filters.demandeurId }),
        ...(filters?.activityId && { activityId: filters.activityId }),
      },
      include: {
        demandeur: { select: { id: true, firstName: true, lastName: true } },
        lignePPM: { select: { id: true, reference: true, objet: true } },
        activity: { select: { id: true, title: true } },
        validations: {
          include: {
            validateur: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const demande = await this.prisma.demandeAchat.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        demandeur: { select: { id: true, firstName: true, lastName: true, email: true } },
        lignePPM: true,
        activity: { select: { id: true, title: true } },
        validations: {
          include: {
            validateur: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!demande) {
      throw new NotFoundException(`Demande #${id} introuvable`);
    }

    return demande;
  }

  async update(id: string, organizationId: string, dto: any) {
    const demande = await this.findOne(id, organizationId);

    if ([StatusDemandeAchat.APPROUVEE, StatusDemandeAchat.REJETEE].includes(demande.status)) {
      throw new ForbiddenException('Impossible de modifier une demande approuvée ou rejetée');
    }

    return this.prisma.demandeAchat.update({
      where: { id },
      data: dto,
      include: {
        demandeur: { select: { id: true, firstName: true, lastName: true } },
        validations: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.demandeAchat.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Soumettre la demande pour validation (lance le workflow)
   */
  async submit(id: string, organizationId: string, userId: string) {
    const demande = await this.findOne(id, organizationId);

    if (demande.status !== StatusDemandeAchat.BROUILLON) {
      throw new BadRequestException('Seules les demandes en brouillon peuvent être soumises');
    }

    // Créer les étapes de validation
    const validationSteps = await this.createValidationWorkflow(demande);

    return this.prisma.demandeAchat.update({
      where: { id },
      data: {
        status: StatusDemandeAchat.SOUMISE,
        validations: {
          create: validationSteps,
        },
      },
      include: {
        validations: {
          include: {
            validateur: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Valider ou rejeter une demande (workflow)
   */
  async validate(
    id: string,
    organizationId: string,
    userId: string,
    decision: ValidationDecision,
    commentaire?: string,
  ) {
    const demande = await this.findOne(id, organizationId);

    // Trouver la validation en attente pour cet utilisateur
    const validation = demande.validations.find(
      v => v.validateurId === userId && v.decision === ValidationDecision.EN_ATTENTE,
    );

    if (!validation) {
      throw new ForbiddenException('Aucune validation en attente pour cet utilisateur');
    }

    // Mettre à jour la validation
    await this.prisma.validationDemande.update({
      where: { id: validation.id },
      data: {
        decision,
        commentaire,
        dateDecision: new Date(),
      },
    });

    // Déterminer le nouveau statut de la demande
    let newStatus = demande.status;

    if (decision === ValidationDecision.REJETE) {
      newStatus = StatusDemandeAchat.REJETEE;
    } else {
      // Vérifier si toutes les validations sont approuvées
      const allValidations = await this.prisma.validationDemande.findMany({
        where: { demandeId: id },
      });

      const allApproved = allValidations.every(
        v => v.decision === ValidationDecision.APPROUVE,
      );

      if (allApproved) {
        newStatus = StatusDemandeAchat.APPROUVEE;
      } else {
        newStatus = StatusDemandeAchat.EN_VALIDATION;
      }
    }

    return this.prisma.demandeAchat.update({
      where: { id },
      data: { status: newStatus },
      include: {
        validations: {
          include: {
            validateur: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Créer le workflow de validation selon le montant
   */
  private async createValidationWorkflow(demande: any) {
    const montant = Number(demande.montantEstimatif);
    const steps = [];

    // Règles de validation par tranche de montant
    if (montant < 5000) {
      // < 5000 : Validation hiérarchique uniquement
      steps.push({
        etape: 'VERIFICATION_HIERARCHIQUE',
        ordre: 1,
        validateurId: await this.getHierarchicalValidator(demande.demandeurId),
      });
    } else if (montant < 50000) {
      // 5000-50000 : Hiérarchique + Technique
      steps.push({
        etape: 'VERIFICATION_HIERARCHIQUE',
        ordre: 1,
        validateurId: await this.getHierarchicalValidator(demande.demandeurId),
      });
      steps.push({
        etape: 'VALIDATION_TECHNIQUE',
        ordre: 2,
        validateurId: await this.getTechnicalValidator(demande.organizationId),
      });
    } else {
      // > 50000 : Hiérarchique + Technique + Administrative
      steps.push({
        etape: 'VERIFICATION_HIERARCHIQUE',
        ordre: 1,
        validateurId: await this.getHierarchicalValidator(demande.demandeurId),
      });
      steps.push({
        etape: 'VALIDATION_TECHNIQUE',
        ordre: 2,
        validateurId: await this.getTechnicalValidator(demande.organizationId),
      });
      steps.push({
        etape: 'VALIDATION_ADMINISTRATIVE',
        ordre: 3,
        validateurId: await this.getAdministrativeValidator(demande.organizationId),
      });
    }

    return steps;
  }

  private async getHierarchicalValidator(userId: string): Promise<string> {
    // TODO: Implémenter la logique de récupération du supérieur hiérarchique
    // Pour l'instant, retourner le premier admin de l'organisation
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    const admin = await this.prisma.user.findFirst({
      where: {
        organizationId: user.organizationId,
        role: { name: 'Admin' },
      },
    });

    return admin?.id || userId;
  }

  private async getTechnicalValidator(organizationId: string): Promise<string> {
    // TODO: Récupérer l'utilisateur avec permission 'passation:demandes:validate:technique'
    const admin = await this.prisma.user.findFirst({
      where: {
        organizationId,
        role: { name: 'Admin' },
      },
    });

    return admin?.id;
  }

  private async getAdministrativeValidator(organizationId: string): Promise<string> {
    // TODO: Récupérer l'utilisateur avec permission 'passation:demandes:validate:admin'
    const admin = await this.prisma.user.findFirst({
      where: {
        organizationId,
        role: { name: 'Admin' },
      },
    });

    return admin?.id;
  }
}
