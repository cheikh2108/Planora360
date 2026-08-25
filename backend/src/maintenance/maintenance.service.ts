import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface MaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
}

export interface UpdateMaintenanceDto {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère les settings actuels (endpoint public pour le frontend)
   */
  async getMaintenanceStatus(): Promise<MaintenanceSettings> {
    const settings = await this.prisma.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!settings) {
      return {
        maintenanceMode: false,
      };
    }

    return {
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage || undefined,
      scheduledStart: settings.scheduledStart || undefined,
      scheduledEnd: settings.scheduledEnd || undefined,
    };
  }

  /**
   * Toggle ou met à jour les settings (super admin only)
   */
  async updateMaintenanceSettings(
    dto: UpdateMaintenanceDto,
    userId: string,
  ): Promise<MaintenanceSettings> {
    // Trouver ou créer settings
    let settings = await this.prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: {
          maintenanceMode: dto.maintenanceMode,
          maintenanceMessage: dto.maintenanceMessage,
          scheduledStart: dto.scheduledStart
            ? new Date(dto.scheduledStart)
            : null,
          scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
          updatedBy: userId,
        },
      });
    } else {
      settings = await this.prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          maintenanceMode: dto.maintenanceMode,
          maintenanceMessage: dto.maintenanceMessage,
          scheduledStart: dto.scheduledStart
            ? new Date(dto.scheduledStart)
            : null,
          scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
          updatedBy: userId,
        },
      });
    }

    return this.getMaintenanceStatus();
  }
}
