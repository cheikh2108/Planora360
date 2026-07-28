import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('org_admin', 'coordonnateur', 'auditeur', 'super_admin')
  findAll(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.auditService.findByOrganization(user.organizationId, limit ? parseInt(limit) : 100);
  }

  @Get('activity/:id')
  @Roles('org_admin', 'coordonnateur', 'resp_projet', 'auditeur', 'super_admin')
  findByActivity(@Param('id') id: string, @CurrentUser() user: any) {
    return this.auditService.findByEntity('Activity', id, user.organizationId);
  }
}
