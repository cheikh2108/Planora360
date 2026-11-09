import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { SoumissionConfidentialityGuard } from '../common/guards/soumission-confidentiality.guard';
import { SoumissionsService } from './soumissions.service';
import { WriteRoles, PASSATION_WRITERS } from '../../common/guards/write-roles.guard';
import { CreateSoumissionDto } from './dto/create-soumission.dto';

@Controller('passation/procedures/:procedureId/soumissions')
@WriteRoles({ roles: PASSATION_WRITERS, permission: 'plan.update' })
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class SoumissionsController {
  constructor(private readonly soumissionsService: SoumissionsService) {}

  @Post()
  create(
    @Param('procedureId') procedureId: string,
    @Req() req,
    @Body() dto: CreateSoumissionDto
  ) {
    return this.soumissionsService.create(procedureId, req.user.organizationId, dto);
  }

  @Get()
  @UseGuards(SoumissionConfidentialityGuard)
  findAll(@Param('procedureId') procedureId: string, @Req() req) {
    return this.soumissionsService.findAll(procedureId, req.user.organizationId);
  }

  @Get(':id')
  @UseGuards(SoumissionConfidentialityGuard)
  findOne(
    @Param('procedureId') procedureId: string,
    @Param('id') id: string,
    @Req() req
  ) {
    return this.soumissionsService.findOne(id, procedureId, req.user.organizationId);
  }
}
