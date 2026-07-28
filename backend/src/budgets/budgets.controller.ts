import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post('activities/:activityId/budgets')
  @Roles('Administrateur', 'Responsable de projet', 'Responsable financier')
  create(
    @Param('activityId') activityId: string,
    @Body() dto: CreateBudgetDto,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.createForActivity(activityId, dto, user.organizationId);
  }

  @Get('activities/:activityId/budgets')
  findByActivity(@Param('activityId') activityId: string, @CurrentUser() user: any) {
    return this.budgetsService.findByActivity(activityId, user.organizationId);
  }

  @Patch('budgets/:id')
  @Roles('Administrateur', 'Responsable de projet', 'Responsable financier')
  update(@Param('id') id: string, @Body() dto: UpdateBudgetDto, @CurrentUser() user: any) {
    return this.budgetsService.update(id, dto, user.organizationId);
  }

  @Delete('budgets/:id')
  @Roles('Administrateur', 'Responsable financier')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.budgetsService.remove(id, user.organizationId);
  }

  @Get('budgets/summary')
  getSummary(@CurrentUser() user: any) {
    return this.budgetsService.getSummaryByOrganization(user.organizationId);
  }

  @Get('budgets/summary/plan/:planId')
  getSummaryByPlan(@Param('planId') planId: string, @CurrentUser() user: any) {
    return this.budgetsService.getSummaryByPlan(planId, user.organizationId);
  }
}
