import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('activities/:activityId/checklist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChecklistController {
  constructor(private checklistService: ChecklistService) {}

  @Post()
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité")
  create(
    @Param('activityId') activityId: string,
    @Body() dto: CreateChecklistItemDto,
    @CurrentUser() user: any,
  ) {
    return this.checklistService.create(activityId, dto, user.organizationId);
  }

  @Get()
  findAll(@Param('activityId') activityId: string, @CurrentUser() user: any) {
    return this.checklistService.findAll(activityId, user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.checklistService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité")
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() user: any,
  ) {
    return this.checklistService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.checklistService.remove(id, user.organizationId);
  }
}
