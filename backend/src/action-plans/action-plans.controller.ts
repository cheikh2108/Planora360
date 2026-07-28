import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ActionPlansService } from './action-plans.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { CreateAxisDto, UpdateAxisDto } from './dto/create-axis.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('action-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionPlansController {
  constructor(private actionPlansService: ActionPlansService) {}

  @Post()
  @Roles('org_admin', 'coordonnateur', 'resp_projet')
  create(@Body() dto: CreateActionPlanDto, @CurrentUser() user: any) {
    return this.actionPlansService.create(dto, user.organizationId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.actionPlansService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.actionPlansService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles('org_admin', 'coordonnateur', 'resp_projet')
  update(@Param('id') id: string, @Body() dto: UpdateActionPlanDto, @CurrentUser() user: any) {
    return this.actionPlansService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @Roles('org_admin', 'coordonnateur')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.actionPlansService.remove(id, user.organizationId);
  }

  // Axes
  @Post(':planId/axes')
  @Roles('org_admin', 'coordonnateur', 'resp_projet')
  createAxis(@Param('planId') planId: string, @Body() dto: CreateAxisDto, @CurrentUser() user: any) {
    return this.actionPlansService.createAxis(planId, dto, user.organizationId);
  }

  @Patch('axes/:axisId')
  @Roles('org_admin', 'coordonnateur', 'resp_projet')
  updateAxis(@Param('axisId') axisId: string, @Body() dto: UpdateAxisDto, @CurrentUser() user: any) {
    return this.actionPlansService.updateAxis(axisId, dto, user.organizationId);
  }

  @Delete('axes/:axisId')
  @Roles('org_admin', 'coordonnateur')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAxis(@Param('axisId') axisId: string, @CurrentUser() user: any) {
    return this.actionPlansService.removeAxis(axisId, user.organizationId);
  }
}
