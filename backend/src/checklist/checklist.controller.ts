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
  @Roles('org_admin', 'coordonnateur', 'resp_projet', 'chef_service', 'resp_activite')
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
  @Roles('org_admin', 'coordonnateur', 'resp_projet', 'chef_service', 'resp_activite')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() user: any,
  ) {
    return this.checklistService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @Roles('org_admin', 'coordonnateur', 'resp_projet', 'chef_service')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.checklistService.remove(id, user.organizationId);
  }
}
