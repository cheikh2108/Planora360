import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { StatusFournisseur } from '@prisma/client';
import { AddFournisseurDocumentDto as AddDocumentDto } from './dto/add-document.dto';

/**
 * Service de gestion des fournisseurs
 *
 * Gère le référentiel des fournisseurs de l'organisation :
 * - CRUD des fournisseurs
 * - Gestion des statuts (A_VALIDER, ACTIF, SUSPENDU, BLACKLISTE, ARCHIVE)
 * - Gestion des documents administratifs
 * - Historique des évaluations
 *
 * @remarks
 * Un fournisseur peut avoir plusieurs statuts au cours de sa relation avec l'organisation.
 * Le blacklistage nécessite une justification et est traçable dans l'audit log.
 */
@Injectable()
export class FournisseursService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un nouveau fournisseur
   */
  async create(organizationId: string, dto: CreateFournisseurDto) {
    // Vérifier unicité SIRET si fourni
    if (dto.identifiantFiscal) {
      const existing = await this.prisma.fournisseur.findFirst({
        where: {
          organizationId,
          identifiantFiscal: dto.identifiantFiscal,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Un fournisseur avec le SIRET ${dto.identifiantFiscal} existe déjà`
        );
      }
    }

    return this.prisma.fournisseur.create({
      data: {
        ...dto,
        organizationId,
      },
      include: {
        documents: true,
      },
    });
  }

  /**
   * Liste tous les fournisseurs de l'organisation
   */
  async findAll(
    organizationId: string,
    filters?: {
      status?: StatusFournisseur;
      search?: string;
    }
  ) {
    return this.prisma.fournisseur.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { raisonSociale: { contains: filters.search, mode: 'insensitive' } },
            { identifiantFiscal: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            nom: true,
            dateExpiration: true,
          },
        },
        _count: {
          select: {
            soumissions: true,
            evaluations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère un fournisseur par son ID
   */
  async findOne(id: string, organizationId: string) {
    const fournisseur = await this.prisma.fournisseur.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        soumissions: {
          include: {
            procedure: {
              select: {
                id: true,
                reference: true,
              },
            },
          },
          orderBy: { dateDepot: 'desc' },
          take: 10,
        },
        evaluations: {
          include: {
            evaluateur: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        contrats: {
          select: {
            id: true,
            reference: true,
            montantInitial: true,
            montantRevise: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!fournisseur) {
      throw new NotFoundException(`Fournisseur #${id} introuvable`);
    }

    return fournisseur;
  }

  /**
   * Met à jour un fournisseur
   */
  async update(id: string, organizationId: string, dto: UpdateFournisseurDto) {
    await this.findOne(id, organizationId);

    return this.prisma.fournisseur.update({
      where: { id },
      data: dto,
      include: {
        documents: true,
      },
    });
  }

  /**
   * Supprime un fournisseur
   */
  async remove(id: string, organizationId: string) {
    const fournisseur = await this.findOne(id, organizationId);

    // Vérifier qu'il n'a pas de contrats actifs
    const contratsActifs = await this.prisma.contrat.count({
      where: {
        fournisseurId: id,
        status: { in: ['SIGNE', 'EN_COURS'] },
      },
    });

    if (contratsActifs > 0) {
      throw new ForbiddenException(
        'Impossible de supprimer un fournisseur avec des contrats actifs. Archivez-le plutôt.'
      );
    }

    return this.prisma.fournisseur.delete({
      where: { id },
    });
  }

  /**
   * Change le statut d'un fournisseur
   */
  async changeStatus(
    id: string,
    organizationId: string,
    newStatus: StatusFournisseur,
    motif?: string
  ) {
    await this.findOne(id, organizationId);

    // Si blacklistage, motif obligatoire
    if (newStatus === StatusFournisseur.BLACKLISTE && !motif) {
      throw new BadRequestException(
        'Un motif est obligatoire pour blacklister un fournisseur'
      );
    }

    return this.prisma.fournisseur.update({
      where: { id },
      data: {
        status: newStatus,
        // Le motif est propre au statut : il ne doit pas écraser les remarques libres
        motifStatut: newStatus === StatusFournisseur.ACTIF ? null : (motif ?? null),
      },
    });
  }

  /**
   * Ajoute un document à un fournisseur
   */
  async addDocument(
    fournisseurId: string,
    organizationId: string,
    dto: AddDocumentDto,
  ) {
    await this.findOne(fournisseurId, organizationId);

    return this.prisma.fournisseurDocument.create({
      data: {
        fournisseurId,
        type: dto.type,
        nom: dto.nom,
        url: dto.url,
        ...(dto.fileSize !== undefined && { fileSize: dto.fileSize }),
        ...(dto.mimeType !== undefined && { mimeType: dto.mimeType }),
        ...(dto.dateExpiration && { dateExpiration: new Date(dto.dateExpiration) }),
      },
    });
  }

  /**
   * Supprime un document d'un fournisseur
   */
  async removeDocument(
    fournisseurId: string,
    documentId: string,
    organizationId: string
  ) {
    await this.findOne(fournisseurId, organizationId);

    const document = await this.prisma.fournisseurDocument.findUnique({
      where: { id: documentId },
    });

    if (!document || document.fournisseurId !== fournisseurId) {
      throw new NotFoundException('Document introuvable');
    }

    return this.prisma.fournisseurDocument.delete({
      where: { id: documentId },
    });
  }
}
