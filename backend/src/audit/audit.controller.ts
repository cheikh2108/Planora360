import { Controller, Get, Param, Query, UseGuards, HttpCode, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard, RequiresPlan } from '../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditFiltersDto } from './dto/audit-filters.dto';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('Administrateur', 'Coordinateur', 'Auditeur', 'Super administrateur')
  findAll(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.auditService.findByOrganization(
      user.organizationId,
      limit ? parseInt(limit) : 50,
      page ? parseInt(page) : 1,
    );
  }

  @Get('activity/:id')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Auditeur', 'Super administrateur')
  findByActivity(@Param('id') id: string, @CurrentUser() user: any) {
    return this.auditService.findByEntity('Activity', id, user.organizationId);
  }

  /**
   * Phase 3: Advanced search with filters
   * Super Admin only
   */
  @Get('search')
  @Roles('Super administrateur')
  async searchWithFilters(
    @Query() filters: AuditFiltersDto,
    @CurrentUser() user: any,
  ) {
    // Super Admin can search across all organizations
    // Regular users are restricted to their organization
    const searchParams = {
      ...filters,
      // Super admin : toutes les organisations, sauf filtre explicite
      organizationId: filters.organizationId || undefined,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    return this.auditService.findWithFilters(searchParams);
  }

  /**
   * Phase 3: Export audit logs as CSV
   * Super Admin only
   */
  @Get('export')
  @Roles('Super administrateur')
  @HttpCode(200)
  async export(
    @Query() filters: AuditFiltersDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const searchParams = {
      ...filters,
      // Super admin : toutes les organisations, sauf filtre explicite
      organizationId: filters.organizationId || undefined,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      limit: 10000, // Max export limit
    };

    const { entries } = await this.auditService.findWithFilters(searchParams);

    // Build CSV
    const header = [
      'Date',
      'Organization ID',
      'User',
      'Action',
      'Entity Type',
      'Entity ID',
      'IP Address',
      'User Agent',
      'Request ID',
      'Metadata',
    ].join(',');

    const rows = entries.map((entry) => {
      const date = new Date(entry.createdAt).toISOString();
      const userName = `${entry.user.firstName} ${entry.user.lastName}`;
      const metadata = JSON.stringify(entry.metadata || {}).replace(/"/g, '""');

      return [
        date,
        entry.organizationId,
        `"${userName}"`,
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.ipAddress || '',
        `"${entry.userAgent || ''}"`,
        entry.requestId || '',
        `"${metadata}"`,
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  }
}
