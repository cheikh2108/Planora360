import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { EvaluationsService } from './evaluations.service';
import { WriteRoles, PASSATION_WRITERS } from '../../common/guards/write-roles.guard';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Controller('passation/procedures/:procedureId/evaluations')
@WriteRoles({ roles: [...PASSATION_WRITERS, 'Validateur'], permission: 'validation.approve' })
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  create(@Param('procedureId') procedureId: string, @Req() req, @Body() dto: CreateEvaluationDto) {
    return this.evaluationsService.create(procedureId, req.user.id, req.user.organizationId, dto);
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
