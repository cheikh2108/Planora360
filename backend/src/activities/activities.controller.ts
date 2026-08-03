import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post()
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  create(@Body() dto: CreateActivityDto, @CurrentUser() user: any) {
    return this.activitiesService.create(dto, user.organizationId, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('planId') planId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.findAll(
      user.organizationId,
      planId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.activitiesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité")
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto, @CurrentUser() user: any) {
    return this.activitiesService.update(id, dto, user.organizationId);
  }

  @Patch(':id/status')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité")
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: any) {
    return this.activitiesService.updateStatus(id, dto.status, user.organizationId);
  }

  @Delete(':id')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.activitiesService.remove(id, user.organizationId);
  }
}
