import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatusDemandeAchat, ValidationDecision } from '@prisma/client';
import { ValidationWorkflowService } from '../common/services/validation-workflow.service';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

/**
 * Service de gestion des demandes d'achat
 *
 * Gère le cycle de vie complet des demandes d'achat :
 * - Création et modification
 * - Soumission pour validation
 * - Workflow de validation multi-étapes
 * - Gestion des statuts
 *
 * @remarks
 * Les demandes suivent un workflow strict basé sur le montant :
 * - < 5000 : Validation hiérarchique uniquement
 * - 5000-50000 : Validation hiérarchique + technique
 * - > 50000 : Validation complète (hiérarchique + technique + administrative)
 */
@Injectable()
export class DemandesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: ValidationWorkflowService,
  ) {}

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
      where: { id, organizationId },
      include: {
        demandeur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        lignePPM: true,
        activity: {
          select: {
            id: true,
            title: true
          }
        },
        validations: {
          include: {
            validateur: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
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

    // Ne pas permettre la modification si approuvée ou rejetée
    if (
      demande.status === StatusDemandeAchat.APPROUVEE ||
      demande.status === StatusDemandeAchat.REJETEE
    ) {
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
    const demande = await this.findOne(id, organizationId);

    // Seules les demandes en brouillon ou rejetées peuvent être supprimées
    if (
      demande.status !== StatusDemandeAchat.BROUILLON &&
      demande.status !== StatusDemandeAchat.REJETEE
    ) {
      throw new ForbiddenException(
        'Seules les demandes en brouillon ou rejetées peuvent être supprimées'
      );
    }

    // Soft delete via statut ANNULEE
    return this.prisma.demandeAchat.update({
      where: { id },
      data: { status: StatusDemandeAchat.ANNULEE },
    });
  }

  /**
   * Soumet une demande pour validation
   *
   * Lance le workflow de validation adapté au montant de la demande.
   * Les étapes de validation sont créées automatiquement selon les seuils.
   *
   * @param id ID de la demande
   * @param organizationId ID de l'organisation
   * @param userId ID de l'utilisateur soumettant
   * @returns Demande mise à jour avec les validations créées
   *
   * @throws {BadRequestException} Si la demande n'est pas en brouillon
   */
  async submit(id: string, organizationId: string, userId: string) {
    const demande = await this.findOne(id, organizationId);

    if (demande.status !== StatusDemandeAchat.BROUILLON) {
      throw new BadRequestException(ERROR_MESSAGES.DEMANDE.ONLY_DRAFT_CAN_BE_SUBMITTED);
    }

    // Créer le workflow de validation adapté au montant
    const workflow = await this.workflowService.createWorkflow({
      amount: Number(demande.montantEstimatif),
      organizationId,
      requesterId: userId,
    });

    return this.prisma.demandeAchat.update({
      where: { id },
      data: {
        status: StatusDemandeAchat.SOUMISE,
        validations: {
          create: workflow.steps,
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
   * Valide ou rejette une demande d'achat
   *
   * Traite la décision d'un validateur dans le workflow.
   * Met à jour automatiquement le statut de la demande selon les règles :
   * - Si rejeté : demande passe en REJETEE
   * - Si toutes validations approuvées : demande passe en APPROUVEE
}
   * - Sinon : demande reste EN_VALIDATION
   *
   * @param id ID de la demande
   * @param organizationId ID de l'organisation
   * @param userId ID du validateur
   * @param decision Décision (APPROUVE ou REJETE)
   * @param commentaire Commentaire optionnel
   * @returns Demande mise à jour
   *
   * @throws {ForbiddenException} Si aucune validation en attente pour cet utilisateur
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
      throw new ForbiddenException(ERROR_MESSAGES.DEMANDE.NO_PENDING_VALIDATION);
    }

    // Mettre à jour la validation
    await this.prisma.validationDemande.update({
      where: { id: validation.id },
      data: {
        decision,
        commentaire,
        validatedAt: new Date(),
      },
    });

    // Déterminer le nouveau statut de la demande
    let newStatus = demande.status;

    if (decision === ValidationDecision.REJETE) {
      newStatus = StatusDemandeAchat.REJETEE;
    } else {
      // Vérifier si toutes les validations sont approuvées
      const allApproved = await this.workflowService.areAllValidationsApproved(id);

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
}
