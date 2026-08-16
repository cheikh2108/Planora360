import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Patch('my/brand-color')
  @Roles('Super administrateur', 'Administrateur')
  updateBrandColor(@Body('brandColor') brandColor: string, @CurrentUser() user: any) {
    return this.organizationsService.updateBrandColor(user.organizationId, brandColor);
  }

  @Post()
  @Roles('Super administrateur')
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get()
  @Roles('Super administrateur')
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get('pending')
  @Roles('Super administrateur')
  findPending() {
    return this.organizationsService.findPending();
  }

  @Get(':id')
  @Roles('Super administrateur')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Super administrateur')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @Patch(':id/approve')
  @Roles('Super administrateur')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string) {
    return this.organizationsService.approve(id);
  }

  @Patch(':id/reject')
  @Roles('Super administrateur')
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string, @Body() dto: { reason?: string }) {
    return this.organizationsService.reject(id, dto.reason);
  }

  @Delete(':id')
  @Roles('Super administrateur')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
