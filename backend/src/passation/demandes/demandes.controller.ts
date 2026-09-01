import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { DemandesService } from './demandes.service';
import { ValidationDecision } from '@prisma/client';

@Controller('passation/demandes')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Post()
  create(@Req() req, @Body() dto: any) {
    return this.demandesService.create(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  findAll(@Req() req, @Query() filters: any) {
    return this.demandesService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.demandesService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: any) {
    return this.demandesService.update(id, req.user.organizationId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.demandesService.remove(id, req.user.organizationId);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req) {
    return this.demandesService.submit(id, req.user.organizationId, req.user.id);
  }

  @Post(':id/validate')
  validate(
    @Param('id') id: string,
    @Req() req,
    @Body('decision') decision: ValidationDecision,
    @Body('commentaire') commentaire?: string,
  ) {
    return this.demandesService.validate(
      id,
      req.user.organizationId,
      req.user.id,
      decision,
      commentaire,
    );
  }

  @Get(':id/workflow')
  getWorkflow(@Param('id') id: string, @Req() req) {
    return this.demandesService.findOne(id, req.user.organizationId);
  }
}
