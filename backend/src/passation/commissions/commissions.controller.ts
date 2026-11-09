import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { CommissionsService } from './commissions.service';
import { WriteRoles, PASSATION_WRITERS } from '../../common/guards/write-roles.guard';
import { CreateCommissionDto, AddMembreDto } from './dto/create-commission.dto';

@Controller('passation/commissions')
@WriteRoles({ roles: PASSATION_WRITERS, permission: 'plan.update' })
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateCommissionDto) {
    return this.commissionsService.create(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.commissionsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.commissionsService.findOne(id, req.user.organizationId);
  }

  @Post(':id/membres')
  addMembre(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: AddMembreDto,
  ) {
    return this.commissionsService.addMembre(id, req.user.organizationId, dto.userId, dto.role);
  }

  @Delete(':id/membres/:membreId')
  removeMembre(
    @Param('id') id: string,
    @Param('membreId') membreId: string,
    @Req() req
  ) {
    return this.commissionsService.removeMembre(id, membreId, req.user.organizationId);
  }
}
