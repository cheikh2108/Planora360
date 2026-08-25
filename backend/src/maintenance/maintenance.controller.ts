import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { MaintenanceService, UpdateMaintenanceDto } from './maintenance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  /**
   * GET /api/maintenance/status
   * Endpoint PUBLIC pour check si le site est en maintenance
   * Utilisé par le middleware Next.js
   */
  @Get('status')
  async getStatus() {
    return this.maintenanceService.getMaintenanceStatus();
  }

  /**
   * PUT /api/maintenance
   * Toggle le mode maintenance (super admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super administrateur')
  @Put()
  async updateSettings(
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: any,
  ) {
    return this.maintenanceService.updateMaintenanceSettings(dto, user.id);
  }
}
