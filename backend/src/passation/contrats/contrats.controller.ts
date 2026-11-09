import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { ContratsService } from './contrats.service';
import { StatusContrat } from '@prisma/client';
import { CreateContratDto } from './dto/create-contrat.dto';
import { WriteRoles, PASSATION_WRITERS } from '../../common/guards/write-roles.guard';
import { UpdateContratDto } from './dto/update-contrat.dto';

@Controller('passation/contrats')
@WriteRoles({ roles: PASSATION_WRITERS, permission: 'plan.update' })
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class ContratsController {
  constructor(private readonly contratsService: ContratsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateContratDto) {
    return this.contratsService.create(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  findAll(@Req() req, @Query() filters: any) {
    return this.contratsService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.contratsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateContratDto) {
    return this.contratsService.update(id, req.user.organizationId, dto);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Req() req, @Body('motif') motif?: string) {
    return this.contratsService.changeStatus(
      id,
      req.user.organizationId,
      StatusContrat.SUSPENDU,
      motif
    );
  }

  @Post(':id/terminate')
  terminate(@Param('id') id: string, @Req() req, @Body('motif') motif?: string) {
    return this.contratsService.changeStatus(
      id,
      req.user.organizationId,
      StatusContrat.TERMINE,
      motif
    );
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Req() req) {
    return this.contratsService.changeStatus(
      id,
      req.user.organizationId,
      StatusContrat.CLOTURE
    );
  }

  @Get(':id/dashboard')
  getDashboard(@Param('id') id: string, @Req() req) {
    return this.contratsService.getDashboard(id, req.user.organizationId);
  }
}
