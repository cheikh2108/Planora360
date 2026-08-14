import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlanningService } from './planning.service';
import { CreateAnnualWorkPlanDto } from './dto/create-annual-work-plan.dto';
import { UpdateAnnualWorkPlanDto } from './dto/update-annual-work-plan.dto';
import { UpdateResultsMatrixDto } from './dto/update-results-matrix.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('planning')
@UseGuards(JwtAuthGuard)
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Post('annual-work-plans')
  async createAnnualWorkPlan(
    @Body() dto: CreateAnnualWorkPlanDto,
    @Request() req,
  ) {
    return this.planningService.createAnnualWorkPlan(
      dto,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Get('annual-work-plans')
  async findAllAnnualWorkPlans(@Request() req) {
    return this.planningService.findAllAnnualWorkPlans(req.user.organizationId);
  }

  @Get('annual-work-plans/:id')
  async findOneAnnualWorkPlan(@Param('id') id: string, @Request() req) {
    return this.planningService.findOneAnnualWorkPlan(id, req.user.organizationId);
  }

  @Patch('annual-work-plans/:id')
  async updateAnnualWorkPlan(
    @Param('id') id: string,
    @Body() dto: UpdateAnnualWorkPlanDto,
    @Request() req,
  ) {
    return this.planningService.updateAnnualWorkPlan(
      id,
      dto,
      req.user.organizationId,
    );
  }

  @Patch('annual-work-plans/:id/validate')
  async validateAnnualWorkPlan(@Param('id') id: string, @Request() req) {
    return this.planningService.validateAnnualWorkPlan(
      id,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Delete('annual-work-plans/:id')
  async deleteAnnualWorkPlan(@Param('id') id: string, @Request() req) {
    return this.planningService.deleteAnnualWorkPlan(id, req.user.organizationId);
  }

  @Get('results-matrix')
  async getResultsMatrix(@Request() req) {
    return this.planningService.getResultsMatrix(req.user.organizationId);
  }

  @Patch('results-matrix')
  async updateResultsMatrix(
    @Body() dto: UpdateResultsMatrixDto,
    @Request() req,
  ) {
    return this.planningService.updateResultsMatrix(dto, req.user.organizationId);
  }
}
