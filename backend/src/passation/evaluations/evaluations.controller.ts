import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { EvaluationsService } from './evaluations.service';

@Controller('passation/procedures/:procedureId/evaluations')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  create(@Param('procedureId') procedureId: string, @Req() req, @Body() dto: any) {
    return this.evaluationsService.create(procedureId, req.user.id, dto);
  }

  @Get()
  findAll(@Param('procedureId') procedureId: string, @Req() req) {
    return this.evaluationsService.findAll(procedureId, req.user.organizationId);
  }

  @Get('synthese')
  getSynthese(@Param('procedureId') procedureId: string, @Req() req) {
    return this.evaluationsService.getSynthese(procedureId, req.user.organizationId);
  }
}
