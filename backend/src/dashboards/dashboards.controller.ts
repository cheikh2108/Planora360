import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HttpCacheInterceptor } from '../common/cache/cache.interceptor';

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpCacheInterceptor) // Cache activé sur tous les endpoints
export class DashboardsController {
  constructor(private dashboardsService: DashboardsService) {}

  @Get('overview')
  getOverview(
    @CurrentUser() user: any,
    @Query('planId') planId?: string,
    @Query('responsibleId') responsibleId?: string,
    @Query('status') status?: string,
  ) {
    return this.dashboardsService.getOverview(user.organizationId, { planId, responsibleId, status });
  }

  @Get('performance')
  getPerformanceByResponsible(
    @CurrentUser() user: any,
    @Query('planId') planId?: string,
    @Query('status') status?: string,
  ) {
    return this.dashboardsService.getPerformanceByResponsible(user.organizationId, planId, status);
  }

  @Get('plan/:planId/progress')
  getActivityProgress(@Param('planId') planId: string, @CurrentUser() user: any) {
    return this.dashboardsService.getActivityProgress(user.organizationId, planId);
  }
}
