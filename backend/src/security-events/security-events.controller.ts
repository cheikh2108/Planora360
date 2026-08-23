import { Controller, Get, Patch, Param, Body, Query, UseGuards, HttpCode } from '@nestjs/common';
import { SecurityEventsService } from './security-events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SecurityEventFiltersDto, ResolveSecurityEventDto } from './dto/security-event.dto';

/**
 * Security Events Controller
 * Phase 4: Security Center pour Super Admin
 */

@Controller('security-events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super administrateur')
export class SecurityEventsController {
  constructor(private securityEventsService: SecurityEventsService) {}

  /**
   * Recherche avec filtres
   * Super Admin only
   */
  @Get()
  async findAll(@Query() filters: SecurityEventFiltersDto) {
    return this.securityEventsService.findWithFilters({
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });
  }

  /**
   * Statistiques globales
   * Super Admin only
   */
  @Get('stats')
  async getStats(@Query('organizationId') organizationId?: string) {
    return this.securityEventsService.getStats(organizationId);
  }

  /**
   * Résoudre un événement
   * Super Admin only
   */
  @Patch(':id/resolve')
  @HttpCode(200)
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveSecurityEventDto,
    @CurrentUser() user: any,
  ) {
    return this.securityEventsService.resolve(id, {
      resolvedBy: user.sub,
      resolution: dto.resolution,
    });
  }

  /**
   * Marquer comme faux positif
   * Super Admin only
   */
  @Patch(':id/false-positive')
  @HttpCode(200)
  async markAsFalsePositive(
    @Param('id') id: string,
    @Body() dto: { reason: string },
    @CurrentUser() user: any,
  ) {
    return this.securityEventsService.markAsFalsePositive(id, {
      resolvedBy: user.sub,
      reason: dto.reason,
    });
  }
}
