import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CapitalizationService } from './capitalization.service';
import { CreateCapitalizationDto } from './dto/create-capitalization.dto';
import { UpdateCapitalizationDto } from './dto/update-capitalization.dto';
import { FilterCapitalizationDto } from './dto/filter-capitalization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { WriteRoles, FIELD_WRITERS } from '../common/guards/write-roles.guard';

const upload = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max pour les médias
};

@Controller('capitalization')
@WriteRoles({ roles: FIELD_WRITERS, permission: 'activity.update' })
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.PRO, SubscriptionPlan.EQUIPE, SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class CapitalizationController {
  constructor(private readonly capitalizationService: CapitalizationService) {}

  @Post()
  async create(@Body() dto: CreateCapitalizationDto, @Request() req) {
    return this.capitalizationService.create(
      dto,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Get()
  async findAll(@Query() filters: FilterCapitalizationDto, @Request() req) {
    return this.capitalizationService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.capitalizationService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCapitalizationDto,
    @Request() req,
  ) {
    return this.capitalizationService.update(
      id,
      dto,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.capitalizationService.remove(
      id,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Post(':id/media')
  @UseInterceptors(FileInterceptor('file', upload))
  async uploadMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @Request() req,
  ) {
    return this.capitalizationService.uploadMedia(
      id,
      file,
      type,
      req.user.organizationId,
    );
  }

  @Delete(':id/media/:mediaId')
  async deleteMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @Request() req,
  ) {
    return this.capitalizationService.deleteMedia(
      mediaId,
      id,
      req.user.organizationId,
    );
  }
}
