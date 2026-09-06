import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus, Query, UseInterceptors, UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ImportActivitiesDto } from './dto/import-activities.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const upload = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max pour les imports Excel
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Validation du type MIME (sécurité)
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV.'),
        false,
      );
    }
  },
};

@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post()
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  create(@Body() dto: CreateActivityDto, @CurrentUser() user: any) {
    return this.activitiesService.create(dto, user.organizationId, user.id);
  }

  @Post('import')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet')
  @UseInterceptors(FileInterceptor('file', upload))
  importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportActivitiesDto,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return this.activitiesService.importFromExcel(
      file,
      dto.planId,
      user.organizationId,
      user.id,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('planId') planId?: string,
    @Query('zoneId') zoneId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.findAll(
      user.organizationId,
      planId,
      zoneId,
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
