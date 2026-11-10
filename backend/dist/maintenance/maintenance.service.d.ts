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
export declare class MaintenanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getMaintenanceStatus(): Promise<MaintenanceSettings>;
    updateMaintenanceSettings(dto: UpdateMaintenanceDto, userId: string): Promise<MaintenanceSettings>;
}
