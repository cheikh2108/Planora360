import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatusProcedure, MethodeProcedure } from '@prisma/client';
import { createWithReference, nextReferenceFrom } from '../../common/utils/reference';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

/** Circuit d'une procédure de passation (changement manuel de statut). */
const PROCEDURE_TRANSITIONS: Record<StatusProcedure, StatusProcedure[]> = {
  BROUILLON: ['PUBLIEE', 'ANNULEE'],
  PUBLIEE: ['EN_COURS', 'CLOTUREE_OFFRES', 'ANNULEE'],
  EN_COURS: ['CLOTUREE_OFFRES', 'ANNULEE'],
  CLOTUREE_OFFRES: ['EVALUATION', 'INFRUCTUEUSE', 'ANNULEE'],
  EVALUATION: ['ATTRIBUEE', 'INFRUCTUEUSE', 'ANNULEE'],
  ATTRIBUEE: [],
  INFRUCTUEUSE: [],
  ANNULEE: [],
};

/**
 * Service de gestion des procédures de passation
 *
 * Gère les consultations et appels d'offres :
 * - Création et publication des procédures
 * - Gestion du dossier de consultation (DAO/TDR)
 * - Réception des soumissions
 * - Clôture et attribution
 */
@Injectable()
export class ProceduresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: any) {
    // Vérifier que la ligne PPM existe si fournie
    if (dto.lignePpmId) {
      const lignePPM = await this.prisma.lignePPM.findFirst({
        where: {
          id: dto.lignePpmId,
          ppm: { organizationId },
        },
      });

      if (!lignePPM) {
        throw new BadRequestException(
          `Ligne PPM #${dto.lignePpmId} introuvable dans votre organisation`,
        );
      }

      // Vérifier qu'elle n'est pas déjà liée à une autre procédure
      const existingProcedure = await this.prisma.procedure.findFirst({
        where: {
          lignePPMId: dto.lignePpmId,
          organizationId,
        },
      });

      if (existingProcedure) {
        throw new BadRequestException(
          `Cette ligne PPM est déjà rattachée à la procédure ${existingProcedure.reference}`,
        );
      }
    }

    this.assertDateOrder(dto);

    // Champs explicitement autorisés (le statut démarre toujours à BROUILLON)
    const data = {
      ...this.toProcedureData(dto),
      objet: dto.objet,
      methode: dto.methode,
      montantEstimatif: dto.montantEstimatif,
      description: dto.description || dto.cahierCharges || dto.objet,
      lignePPMId: dto.lignePpmId ?? null,
      organizationId,
      responsableId: userId,
    };

    return createWithReference(
      () => this.nextReference(organizationId),
      (reference) =>
        this.prisma.procedure.create({
          data: { ...data, reference },
          include: {
            responsable: { select: { id: true, firstName: true, lastName: true } },
            lignePPM: true,
          },
        }),
    );
  }

  /** PROC-<année>-<n°> : numérotation propre à chaque organisation. */
  private async nextReference(organizationId: string): Promise<string> {
    const prefix = `PROC-${new Date().getFullYear()}-`;
    const existing = await this.prisma.procedure.findMany({
      where: { organizationId, reference: { startsWith: prefix } },
      select: { reference: true },
    });
    return nextReferenceFrom(existing.map((r) => r.reference), prefix, 4);
  }

  /**
   * Chronologie d'une procédure : publication ≤ clarification ≤ date limite ≤ ouverture des plis.
   * Les dates absentes de la requête sont prises dans la procédure existante.
   */
  private assertDateOrder(
    dto: Partial<CreateProcedureDto>,
    current?: { datePublication?: Date | null; dateClarification?: Date | null; dateLimite?: Date | null; dateOuverture?: Date | null },
  ) {
    const pick = (v: string | undefined, c?: Date | null) => (v ? new Date(v) : c ?? null);
    const steps: [string, Date | null][] = [
      ['de publication', pick(dto.datePublication, current?.datePublication)],
      ['de clarification', pick(dto.dateClarification, current?.dateClarification)],
      ['limite de dépôt', pick(dto.dateLimite, current?.dateLimite)],
      ["d'ouverture des plis", pick(dto.dateOuverture, current?.dateOuverture)],
    ];
    const known = steps.filter(([, d]) => d) as [string, Date][];
    for (let i = 1; i < known.length; i++) {
      if (known[i][1] < known[i - 1][1]) {
        throw new BadRequestException(`La date ${known[i][0]} ne peut pas précéder la date ${known[i - 1][0]}`);
      }
    }
  }

  /** Champs modifiables communs à la création et à la mise à jour (dates converties). */
  private toProcedureData(dto: Partial<CreateProcedureDto>) {
    const toDate = (v?: string) => (v ? new Date(v) : undefined);
    return {
      ...(dto.objet !== undefined && { objet: dto.objet }),
      ...(dto.methode !== undefined && { methode: dto.methode }),
      ...(dto.montantEstimatif !== undefined && { montantEstimatif: dto.montantEstimatif }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.cahierCharges !== undefined && dto.description === undefined && { description: dto.cahierCharges }),
      ...(dto.datePublication !== undefined && { datePublication: toDate(dto.datePublication) }),
      ...(dto.dateLimite !== undefined && { dateLimite: toDate(dto.dateLimite) }),
      ...(dto.dateOuverture !== undefined && { dateOuverture: toDate(dto.dateOuverture) }),
      ...(dto.dateClarification !== undefined && { dateClarification: toDate(dto.dateClarification) }),
    };
  }

  async findAll(organizationId: string, filters?: any) {
    return this.prisma.procedure.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.methode && { methode: filters.methode }),
        ...(filters?.responsableId && { responsableId: filters.responsableId }),
      },
      include: {
        responsable: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lignePPM: {
          select: {
            id: true,
            reference: true,
            objet: true,
          },
        },
        _count: {
          select: {
            soumissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const procedure = await this.prisma.procedure.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        responsable: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lignePPM: true,
        soumissions: {
          include: {
            fournisseur: {
              select: {
                id: true,
                raisonSociale: true,
                identifiantFiscal: true,
              },
            },
          },
          orderBy: { dateDepot: 'desc' },
        },
        commissions: {
          include: {
            membres: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!procedure) {
      throw new NotFoundException(`Procédure #${id} introuvable`);
    }

    return procedure;
  }

  async update(id: string, organizationId: string, dto: UpdateProcedureDto) {
    const procedure = await this.findOne(id, organizationId);
    const { status, lignePpmId, ...fields } = dto;
    const changesFields = Object.values(fields).some((v) => v !== undefined) || lignePpmId !== undefined;

    // Les champs ne sont modifiables qu'en brouillon
    if (changesFields && procedure.status !== StatusProcedure.BROUILLON) {
      throw new ForbiddenException('Seules les procédures en brouillon peuvent être modifiées (hormis le statut)');
    }

    // Changement de statut manuel : uniquement selon le circuit de passation
    if (status !== undefined && status !== procedure.status) {
      const allowed = PROCEDURE_TRANSITIONS[procedure.status] ?? [];
      if (!allowed.includes(status)) {
        throw new BadRequestException(`Transition de statut invalide : ${procedure.status} → ${status}`);
      }
      if (status === StatusProcedure.PUBLIEE) {
        const dateLimite = fields.dateLimite ?? procedure.dateLimite;
        const dateOuverture = fields.dateOuverture ?? procedure.dateOuverture;
        if (!dateLimite || !dateOuverture) {
          throw new BadRequestException('Les dates limite et d\'ouverture sont obligatoires pour publier');
        }
      }
    }

    this.assertDateOrder(fields, procedure);

    if (lignePpmId) {
      const ligne = await this.prisma.lignePPM.findFirst({ where: { id: lignePpmId, ppm: { organizationId } } });
      if (!ligne) throw new BadRequestException(`Ligne PPM #${lignePpmId} introuvable dans votre organisation`);
    }

    return this.prisma.procedure.update({
      where: { id },
      data: {
        ...this.toProcedureData(fields),
        ...(lignePpmId !== undefined && { lignePPMId: lignePpmId || null }),
        ...(status !== undefined && { status }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const procedure = await this.findOne(id, organizationId);

    // Seules les procédures en brouillon peuvent être supprimées
    if (procedure.status !== StatusProcedure.BROUILLON) {
      throw new ForbiddenException(
        'Seules les procédures en brouillon peuvent être supprimées'
      );
    }

    return this.prisma.procedure.delete({
      where: { id },
    });
  }

  async publish(id: string, organizationId: string) {
    const procedure = await this.findOne(id, organizationId);

    if (procedure.status !== StatusProcedure.BROUILLON) {
      throw new BadRequestException('Cette procédure est déjà publiée');
    }

    // Vérifier que les dates obligatoires sont renseignées
    if (!procedure.dateLimite || !procedure.dateOuverture) {
      throw new BadRequestException(
        'Les dates limite et d\'ouverture sont obligatoires pour publier'
      );
    }

    return this.prisma.procedure.update({
      where: { id },
      data: {
        status: StatusProcedure.PUBLIEE,
        datePublication: new Date(),
      },
    });
  }

  async close(id: string, organizationId: string) {
    const procedure = await this.findOne(id, organizationId);

    if (procedure.status !== StatusProcedure.PUBLIEE && procedure.status !== StatusProcedure.EN_COURS) {
      throw new BadRequestException('Seules les procédures publiées ou en cours peuvent être clôturées');
    }

    return this.prisma.procedure.update({
      where: { id },
      data: {
        status: StatusProcedure.CLOTUREE_OFFRES,
      },
    });
  }

  async cancel(id: string, organizationId: string, motif: string) {
    const procedure = await this.findOne(id, organizationId);

    return this.prisma.procedure.update({
      where: { id },
      data: {
        status: StatusProcedure.ANNULEE,
      },
    });
  }
}
