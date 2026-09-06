import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateZoneConfigDto } from './dto/create-zone-config.dto';
import { UpdateZoneConfigDto } from './dto/update-zone-config.dto';
import { ZONE_PRESETS } from './constants/zone-presets';

@Injectable()
export class ZonesService {
  constructor(
    private prisma: PrismaService,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

  async create(dto: CreateZoneDto, organizationId: string) {
    // Nettoyer les strings vides
    const cleanedDto = {
      ...dto,
      code: dto.code?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      parentId: dto.parentId?.trim() || undefined,
    };

    // Valider que le parent existe si parentId est fourni
    if (cleanedDto.parentId) {
      const parent = await this.prisma.geographicZone.findFirst({
        where: { id: cleanedDto.parentId, organizationId },
      });
      if (!parent) {
        throw new NotFoundException('Zone parente introuvable');
      }
    }

    // Vérifier l'unicité du code si fourni
    if (cleanedDto.code) {
      const existing = await this.prisma.geographicZone.findFirst({
        where: { organizationId, code: cleanedDto.code },
      });
      if (existing) {
        throw new BadRequestException('Ce code de zone existe déjà');
      }
    }

    const zone = await this.prisma.geographicZone.create({
      data: {
        ...cleanedDto,
        organizationId,
      },
      include: {
        parent: { select: { id: true, name: true, level: true } },
        _count: { select: { children: true, activities: true } },
      },
    });

    // Invalider le cache
    await this.cacheInvalidation.invalidateDashboard(organizationId);

    return zone;
  }

  async findAll(organizationId: string) {
    const zones = await this.prisma.geographicZone.findMany({
      where: { organizationId },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true, level: true } },
        _count: { select: { children: true, activities: true } },
      },
    });

    return zones;
  }

  async findTree(organizationId: string) {
    // Récupérer toutes les zones
    const zones = await this.findAll(organizationId);

    // Construire l'arbre hiérarchique
    const zoneMap = new Map();
    zones.forEach((zone) => zoneMap.set(zone.id, { ...zone, children: [] }));

    const tree: any[] = [];
    zones.forEach((zone) => {
      const node = zoneMap.get(zone.id);
      if (zone.parentId) {
        const parent = zoneMap.get(zone.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  async findOne(id: string, organizationId: string) {
    const zone = await this.prisma.geographicZone.findFirst({
      where: { id, organizationId },
      include: {
        parent: { select: { id: true, name: true, level: true } },
        children: {
          select: { id: true, name: true, level: true, code: true },
          orderBy: { name: 'asc' },
        },
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                status: true,
                budgetPlanned: true,
                budgetExecuted: true,
              },
            },
          },
        },
        _count: { select: { children: true, activities: true } },
      },
    });

    if (!zone) {
      throw new NotFoundException('Zone introuvable');
    }

    return zone;
  }

  async update(id: string, dto: UpdateZoneDto, organizationId: string) {
    const existing = await this.findOne(id, organizationId);

    // Nettoyer les strings vides
    const cleanedDto = {
      ...dto,
      code: dto.code?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      parentId: dto.parentId?.trim() || undefined,
    };

    // Vérifier l'unicité du code si modifié
    if (cleanedDto.code && cleanedDto.code !== existing.code) {
      const duplicate = await this.prisma.geographicZone.findFirst({
        where: { organizationId, code: cleanedDto.code, id: { not: id } },
      });
      if (duplicate) {
        throw new BadRequestException('Ce code de zone existe déjà');
      }
    }

    // Empêcher une zone d'être son propre parent ou créer une boucle
    if (cleanedDto.parentId === id) {
      throw new BadRequestException('Une zone ne peut pas être son propre parent');
    }

    const zone = await this.prisma.geographicZone.update({
      where: { id },
      data: cleanedDto,
      include: {
        parent: { select: { id: true, name: true, level: true } },
        _count: { select: { children: true, activities: true } },
      },
    });

    // Invalider le cache
    await this.cacheInvalidation.invalidateDashboard(organizationId);

    return zone;
  }

  async remove(id: string, organizationId: string) {
    const zone = await this.findOne(id, organizationId);

    // Empêcher la suppression si la zone a des enfants
    if (zone._count.children > 0) {
      throw new BadRequestException(
        'Impossible de supprimer une zone qui contient des sous-zones',
      );
    }

    // Empêcher la suppression si la zone a des activités
    if (zone._count.activities > 0) {
      throw new BadRequestException(
        'Impossible de supprimer une zone assignée à des activités',
      );
    }

    const deleted = await this.prisma.geographicZone.delete({ where: { id } });

    // Invalider le cache
    await this.cacheInvalidation.invalidateDashboard(organizationId);

    return deleted;
  }

  /**
   * Obtenir les statistiques par zone
   */
  async getZoneStats(organizationId: string) {
    const zones = await this.prisma.geographicZone.findMany({
      where: { organizationId },
      include: {
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                status: true,
                budgetPlanned: true,
                budgetExecuted: true,
              },
            },
          },
        },
      },
    });

    return zones.map((zone) => {
      const activities = zone.activities.map((az) => az.activity);
      const totalActivities = activities.length;
      const completedActivities = activities.filter(
        (a) => a.status === 'TERMINEE' || a.status === 'VALIDEE',
      ).length;
      const budgetPlanned = activities.reduce(
        (sum, a) => sum + Number(a.budgetPlanned || 0),
        0,
      );
      const budgetExecuted = activities.reduce(
        (sum, a) => sum + Number(a.budgetExecuted || 0),
        0,
      );

      return {
        id: zone.id,
        name: zone.name,
        code: zone.code,
        level: zone.level,
        totalActivities,
        completedActivities,
        completionRate:
          totalActivities > 0
            ? Math.round((completedActivities / totalActivities) * 100)
            : 0,
        budgetPlanned,
        budgetExecuted,
        executionRate:
          budgetPlanned > 0
            ? Math.round((budgetExecuted / budgetPlanned) * 100)
            : 0,
      };
    });
  }

  /**
   * Configuration des zones géographiques
   */
  async getZoneConfig(organizationId: string) {
    let config = await this.prisma.organizationZoneConfig.findUnique({
      where: { organizationId },
    });

    // Créer une config par défaut si elle n'existe pas
    if (!config) {
      try {
        config = await this.prisma.organizationZoneConfig.create({
          data: {
            organizationId,
            preset: 'STANDARD',
            levelLabels: ZONE_PRESETS.STANDARD.levelLabels,
            description: ZONE_PRESETS.STANDARD.description,
          },
        });
      } catch (error) {
        console.error('Erreur création config zone:', error);
        // Si ça échoue, retourner une config virtuelle
        return {
          id: 'virtual',
          organizationId,
          preset: 'STANDARD',
          levelLabels: ZONE_PRESETS.STANDARD.levelLabels,
          description: ZONE_PRESETS.STANDARD.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    return config;
  }

  async createOrUpdateZoneConfig(
    dto: CreateZoneConfigDto | UpdateZoneConfigDto,
    organizationId: string,
  ) {
    try {
      // Si un preset est fourni, charger les labels du preset
      const levelLabels = dto.levelLabels || (dto.preset ? ZONE_PRESETS[dto.preset].levelLabels : ZONE_PRESETS.STANDARD.levelLabels);
      const description = dto.description || (dto.preset ? ZONE_PRESETS[dto.preset].description : ZONE_PRESETS.STANDARD.description);

      const config = await this.prisma.organizationZoneConfig.upsert({
        where: { organizationId },
        create: {
          organizationId,
          preset: (dto as CreateZoneConfigDto).preset || 'STANDARD',
          levelLabels,
          description,
        },
        update: {
          ...(dto.preset && { preset: dto.preset }),
          ...(levelLabels && { levelLabels }),
          ...(description !== undefined && { description }),
        },
      });

      // Invalider le cache
      await this.cacheInvalidation.invalidateDashboard(organizationId);

      return config;
    } catch (error) {
      console.error('Erreur upsert config zone:', error);
      throw new BadRequestException('Impossible de sauvegarder la configuration des zones');
    }
  }

  async getAvailablePresets() {
    return Object.entries(ZONE_PRESETS).map(([key, value]) => ({
      key,
      name: value.name,
      description: value.description,
      levelLabels: value.levelLabels,
    }));
  }

  /**
   * Obtenir le label d'un niveau géographique
   */
  async getLevelLabel(level: number, organizationId: string): Promise<string> {
    const config = await this.getZoneConfig(organizationId);
    const labels = config.levelLabels as Record<string, string>;
    return labels[level.toString()] || `Niveau ${level}`;
  }
}
