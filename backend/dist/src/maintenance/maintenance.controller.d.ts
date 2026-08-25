import { MaintenanceService, UpdateMaintenanceDto } from './maintenance.service';
export declare class MaintenanceController {
    private maintenanceService;
    constructor(maintenanceService: MaintenanceService);
    getStatus(): Promise<import("./maintenance.service").MaintenanceSettings>;
    updateSettings(dto: UpdateMaintenanceDto, user: any): Promise<import("./maintenance.service").MaintenanceSettings>;
}
