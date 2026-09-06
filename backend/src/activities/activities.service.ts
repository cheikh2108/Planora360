import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { ActivityStatus } from '@prisma/client';
import { Readable } from 'stream';
import * as Excel from 'exceljs';
import { PrismaService } from '../common/prisma/prisma.service';
import { PostHogService } from '../analytics/posthog.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const ACTIVITY_INCLUDE = {
  responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
  collaborators: {
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  },
  axis: { select: { id: true, title: true, actionPlanId: true } },
  subActivities: {
    include: {
      responsible: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { checklistItems: true } },
    },
  },
  zones: {
    include: {
      zone: { select: { id: true, name: true, code: true, level: true } },
    },
  },
  _count: { select: { checklistItems: true, documents: true, validations: true } },
};

// Transitions de statut autorisées (manuelles, hors circuit de validation)
const ALLOWED_STATUS_TRANSITIONS: Partial<Record<ActivityStatus, ActivityStatus[]>> = {
  NON_DEMARREE: ['EN_PREPARATION', 'ANNULEE'],
  EN_PREPARATION: ['EN_COURS', 'ANNULEE'],
  EN_COURS: ['EN_ATTENTE', 'SUSPENDUE', 'TERMINEE'],
  EN_ATTENTE: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
  SUSPENDUE: ['EN_COURS', 'ANNULEE'],
  TERMINEE: [],     // seul le circuit de validation peut passer à VALIDEE
  VALIDEE: [],      // état terminal
  EN_RETARD: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
  ANNULEE: [],
};

@Injectable()
export class ActivitiesService {
  constructor(
    private prisma: PrismaService,
    private posthog: PostHogService,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

  async create(dto: CreateActivityDto, organizationId: string, currentUserId: string) {
    await this.validateAxis(dto.axisId, organizationId);
    await this.validateParentActivity(dto.parentActivityId, organizationId);
    await this.validateResponsible(dto.responsibleId, organizationId);
    await this.validateZones(dto.zoneIds, organizationId);

    const activity = await this.createActivity(dto, organizationId, currentUserId);

    // Track activity creation
    const axis = await this.prisma.axis.findUnique({ where: { id: dto.axisId }, select: { actionPlanId: true } });
    if (axis) {
      this.posthog.trackActivityCreated(currentUserId, activity.id, axis.actionPlanId, organizationId);
    }

    if (dto.collaboratorIds?.length) {
      await this.addCollaborators(activity.id, dto.collaboratorIds);
    }

    if (dto.zoneIds?.length) {
      await this.assignZones(activity.id, dto.zoneIds);
    }

    // Invalider le cache du dashboard après création d'activité
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return dto.collaboratorIds?.length || dto.zoneIds?.length ? this.findActivityById(activity.id) : activity;
  }

  private async validateAxis(axisId: string, organizationId: string) {
    const axis = await this.prisma.axis.findFirst({
      where: { id: axisId, actionPlan: { organizationId } },
    });
    if (!axis) throw new NotFoundException('Axe introuvable');
  }

  private async validateParentActivity(parentActivityId: string | undefined, organizationId: string) {
    if (!parentActivityId) return;

    const parent = await this.prisma.activity.findFirst({
      where: { id: parentActivityId, organizationId },
    });
    if (!parent) throw new NotFoundException('Activité parente introuvable');
  }

  private async validateResponsible(responsibleId: string | undefined, organizationId: string) {
    if (!responsibleId) return;

    const responsible = await this.prisma.user.findFirst({
      where: { id: responsibleId, organizationId },
    });
    if (!responsible) throw new NotFoundException('Responsable introuvable');
  }

  private async validateZones(zoneIds: string[] | undefined, organizationId: string) {
    if (!zoneIds?.length) return;

    const zones = await this.prisma.geographicZone.findMany({
      where: { id: { in: zoneIds }, organizationId },
    });
    if (zones.length !== zoneIds.length) {
      throw new BadRequestException('Une ou plusieurs zones géographiques sont invalides');
    }
  }

  private async createActivity(dto: CreateActivityDto, organizationId: string, currentUserId: string) {
    const { collaboratorIds, zoneIds, responsibleId, startDate, dueDate, ...rest } = dto;

    return this.prisma.activity.create({
      data: {
        ...rest,
        organizationId,
        responsibleId: responsibleId ?? currentUserId,
        startDate: startDate && startDate.trim() ? new Date(startDate) : new Date(),
        dueDate: dueDate && dueDate.trim() ? new Date(dueDate) : new Date(),
      },
      include: ACTIVITY_INCLUDE,
    });
  }

  private async addCollaborators(activityId: string, collaboratorIds: string[]) {
    await this.prisma.activityCollaborator.createMany({
      data: collaboratorIds.map((userId) => ({ activityId, userId })),
      skipDuplicates: true,
    });
  }

  private async assignZones(activityId: string, zoneIds: string[]) {
    await this.prisma.activityZone.createMany({
      data: zoneIds.map((zoneId, index) => ({
        activityId,
        zoneId,
        isPrimary: index === 0, // La première zone est primaire
      })),
      skipDuplicates: true,
    });
  }

  private async findActivityById(activityId: string) {
    return this.prisma.activity.findFirst({
      where: { id: activityId },
      include: ACTIVITY_INCLUDE,
    }) as any;
  }

  async findAll(
    organizationId: string,
    planId?: string,
    zoneId?: string,
    page = 1,
    limit = 20,
  ) {
    const where: any = {
      organizationId,
      parentActivityId: null,
      ...(planId ? { axis: { actionPlanId: planId } } : {}),
      ...(zoneId ? { zones: { some: { zoneId } } } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: ACTIVITY_INCLUDE,
      }),
      this.prisma.activity.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, organizationId },
      include: {
        ...ACTIVITY_INCLUDE,
        checklistItems: {
          include: {
            responsible: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { order: 'asc' },
        },
        validations: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');
    return activity;
  }

  async update(id: string, dto: UpdateActivityDto, organizationId: string) {
    await this.findOne(id, organizationId);
    const { collaboratorIds, zoneIds, status, ...data } = dto as any;
    const updateData: any = { ...data };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);

    const activity = await this.prisma.activity.update({
      where: { id },
      data: updateData,
      include: ACTIVITY_INCLUDE,
    });

    let needsReload = false;

    if (Array.isArray(collaboratorIds)) {
      await this.prisma.activityCollaborator.deleteMany({ where: { activityId: id } });
      if (collaboratorIds.length) {
        await this.prisma.activityCollaborator.createMany({
          data: collaboratorIds.map((userId: string) => ({ activityId: id, userId })),
          skipDuplicates: true,
        });
      }
      needsReload = true;
    }

    // Gérer les zones si fournies
    if (Array.isArray(zoneIds)) {
      if (zoneIds.length) {
        await this.validateZones(zoneIds, organizationId);
      }
      // Supprimer les zones existantes
      await this.prisma.activityZone.deleteMany({ where: { activityId: id } });
      // Ajouter les nouvelles zones si fournies
      if (zoneIds.length) {
        await this.assignZones(id, zoneIds);
      }
      needsReload = true;
    }

    // Invalider le cache après modification
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return needsReload
      ? (this.prisma.activity.findFirst({ where: { id }, include: ACTIVITY_INCLUDE }) as any)
      : activity;
  }

  async updateStatus(id: string, newStatus: ActivityStatus, organizationId: string) {
    const activity = await this.findOne(id, organizationId);
    const allowed = ALLOWED_STATUS_TRANSITIONS[activity.status] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transition de statut invalide : ${activity.status} → ${newStatus}`,
      );
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: { status: newStatus },
      include: ACTIVITY_INCLUDE,
    });

    // Invalider le cache après changement de statut
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return updated;
  }

  async remove(id: string, organizationId: string) {
    const activity = await this.findOne(id, organizationId);
    if (activity.status === 'VALIDEE') {
      throw new ForbiddenException('Une activité validée ne peut pas être supprimée');
    }

    const deleted = await this.prisma.activity.delete({ where: { id } });

    // Invalider le cache après suppression
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return deleted;
  }

  async importFromExcel(
    file: Express.Multer.File,
    planId: string,
    organizationId: string,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Vérifier que le plan existe et appartient à l'organisation
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id: planId, organizationId },
      include: { axes: true },
    });

    if (!plan) {
      throw new NotFoundException('Plan d\'action introuvable');
    }

    // Parser le fichier Excel avec exceljs (avec protection contre les fichiers corrompus)
    let workbook: Excel.Workbook;
    try {
      workbook = new Excel.Workbook();
      const stream = Readable.from(file.buffer);
      await workbook.xlsx.read(stream);
    } catch (error) {
      throw new BadRequestException(
        'Impossible de lire le fichier. Assurez-vous qu\'il s\'agit d\'un fichier Excel valide (.xlsx, .xls) ou CSV.',
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('Le fichier Excel est vide');
    }

    // Limite de sécurité : max 1000 lignes
    const MAX_ROWS = 1000;
    if (worksheet.rowCount > MAX_ROWS + 1) { // +1 pour l'entête
      throw new BadRequestException(
        `Le fichier contient trop de lignes (max ${MAX_ROWS}). Importez en plusieurs fois.`,
      );
    }

    // Extraire les données
    const data: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell) => {
          headers.push(String(cell.value).trim());
        });
      } else {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber - 1]] = cell.value;
        });
        data.push(rowData);
      }
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('Le fichier Excel ne contient aucune donnée');
    }

    // Récupérer tous les utilisateurs et zones de l'organisation pour les lookups
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const zones = await this.prisma.geographicZone.findMany({
      where: { organizationId },
      select: { id: true, code: true, name: true },
    });

    const errors: Array<{ line: number; error: string }> = [];
    const created: Array<any> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const lineNumber = i + 2; // +2 car ligne 1 = headers, et index commence à 0

      try {
        // Validation des champs obligatoires
        if (!row['Titre'] || !row['Axe'] || !row['Responsable'] || !row['Date début'] || !row['Date fin']) {
          errors.push({
            line: lineNumber,
            error: 'Colonnes manquantes (Titre, Axe, Responsable, Date début, Date fin sont obligatoires)',
          });
          continue;
        }

        // Trouver l'axe par son nom
        const axis = plan.axes.find(a => a.title.toLowerCase() === String(row['Axe']).toLowerCase().trim());
        if (!axis) {
          errors.push({
            line: lineNumber,
            error: `Axe "${row['Axe']}" introuvable dans le plan d'action`,
          });
          continue;
        }

        // Trouver le responsable par email
        const responsible = users.find(u => u.email.toLowerCase() === String(row['Responsable']).toLowerCase().trim());
        if (!responsible) {
          errors.push({
            line: lineNumber,
            error: `Responsable "${row['Responsable']}" introuvable (vérifiez l'email)`,
          });
          continue;
        }

        // Parser les dates
        let startDate: Date;
        let dueDate: Date;

        try {
          startDate = this.parseExcelDate(row['Date début']);
          dueDate = this.parseExcelDate(row['Date fin']);

          if (dueDate < startDate) {
            errors.push({
              line: lineNumber,
              error: 'La date de fin doit être après la date de début',
            });
            continue;
          }
        } catch (e) {
          errors.push({
            line: lineNumber,
            error: `Dates invalides (format attendu: YYYY-MM-DD ou DD/MM/YYYY)`,
          });
          continue;
        }

        // Valider la priorité si fournie
        const priority = row['Priorité'] ? String(row['Priorité']).toUpperCase().trim() : 'MOYENNE';
        if (!['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE'].includes(priority)) {
          errors.push({
            line: lineNumber,
            error: `Priorité invalide "${row['Priorité']}" (valeurs acceptées: FAIBLE, MOYENNE, ELEVEE, CRITIQUE)`,
          });
          continue;
        }

        // Parser le budget si fourni
        let budgetPlanned: number | null = null;
        if (row['Budget planifié']) {
          const parsed = parseFloat(String(row['Budget planifié']).replace(/\s/g, '').replace(',', '.'));
          if (isNaN(parsed) || parsed < 0) {
            errors.push({
              line: lineNumber,
              error: `Budget invalide "${row['Budget planifié']}"`,
            });
            continue;
          }
          budgetPlanned = parsed;
        }

        // Parser les zones si fournies
        const zoneCodes = row['Zones'] ? String(row['Zones']).split(',').map(c => c.trim()) : [];
        const zoneIds: string[] = [];

        if (zoneCodes.length > 0) {
          for (const code of zoneCodes) {
            const zone = zones.find(z => z.code?.toLowerCase() === code.toLowerCase() || z.name.toLowerCase() === code.toLowerCase());
            if (!zone) {
              errors.push({
                line: lineNumber,
                error: `Zone "${code}" introuvable (utilisez le code ou le nom exact)`,
              });
              continue;
            }
            zoneIds.push(zone.id);
          }
        }

        // Créer l'activité (avec sanitization des strings)
        const activity = await this.prisma.activity.create({
          data: {
            organizationId,
            axisId: axis.id,
            responsibleId: responsible.id,
            title: this.sanitizeString(String(row['Titre']).trim(), 200),
            description: row['Description'] ? this.sanitizeString(String(row['Description']).trim(), 5000) : null,
            expectedResults: row['Résultats attendus'] ? this.sanitizeString(String(row['Résultats attendus']).trim(), 2000) : null,
            startDate,
            dueDate,
            priority,
            budgetPlanned,
            status: 'NON_DEMARREE',
            zones: zoneIds.length > 0 ? {
              create: zoneIds.map((zoneId, idx) => ({
                zoneId,
                isPrimary: idx === 0, // La première zone est primaire
              })),
            } : undefined,
          },
          include: ACTIVITY_INCLUDE,
        });

        created.push(activity);

        // Analytics
        this.posthog.capture(userId, 'activity_imported', {
          activityId: activity.id,
          planId,
          source: 'excel',
        });
      } catch (error) {
        errors.push({
          line: lineNumber,
          error: error.message || 'Erreur lors de la création',
        });
      }
    }

    // Invalider le cache
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return {
      success: created.length,
      errors: errors.length,
      total: data.length,
      created,
      errorDetails: errors,
    };
  }

  /**
   * Sanitize une string pour éviter les injections et limiter la longueur
   */
  private sanitizeString(value: string, maxLength: number): string {
    if (!value) return '';

    let sanitized = value
      // Enlever les caractères de contrôle dangereux (sauf \n et \t)
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
      // Enlever les scripts et tags HTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '');

    // Limiter la longueur
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized.trim();
  }

  /**
   * Parse une date depuis Excel (supporte format Excel numérique, YYYY-MM-DD, DD/MM/YYYY)
   */
  private parseExcelDate(value: any): Date {
    if (!value) throw new Error('Date vide');

    // Si c'est déjà une date JS
    if (value instanceof Date) {
      return value;
    }

    // Si c'est un nombre Excel (nombre de jours depuis 1900-01-01)
    if (typeof value === 'number') {
      // Excel date: nombre de jours depuis le 1er janvier 1900
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000); // -2 pour bug Excel 1900
      return date;
    }

    // Si c'est une string
    const str = String(value).trim();

    // Format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) return date;
    }

    // Format DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [day, month, year] = str.split('/');
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) return date;
    }

    throw new Error(`Format de date invalide: ${value}`);
  }
}
