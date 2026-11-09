import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { PpmService } from './ppm.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
import { CreateLignePpmDto } from './dto/create-ligne-ppm.dto';
import { StatusPPM } from '@prisma/client';
import { WriteRoles, PASSATION_WRITERS } from '../../common/guards/write-roles.guard';

@Controller('passation/ppm')
@WriteRoles({ roles: PASSATION_WRITERS, permission: 'plan.update' })
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class PpmController {
  constructor(private readonly ppmService: PpmService) {}

  @Post()
  create(@Req() req, @Body() createPpmDto: CreatePpmDto) {
    return this.ppmService.create(
      req.user.organizationId,
      req.user.id,
      createPpmDto,
    );
  }

  @Get()
  findAll(
    @Req() req,
    @Query('year') year?: number,
    @Query('status') status?: StatusPPM,
    @Query('projectId') projectId?: string,
  ) {
    return this.ppmService.findAll(req.user.organizationId, {
      year: year ? Number(year) : undefined,
      status,
      projectId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.ppmService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updatePpmDto: UpdatePpmDto,
  ) {
    return this.ppmService.update(id, req.user.organizationId, updatePpmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.ppmService.remove(id, req.user.organizationId);
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @Req() req) {
    return this.ppmService.validate(id, req.user.organizationId, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req,
    @Body('status') status: StatusPPM,
  ) {
    return this.ppmService.updateStatus(id, req.user.organizationId, status);
  }

  @Post(':id/lignes')
  addLigne(@Param('id') id: string, @Req() req, @Body() ligneDto: CreateLignePpmDto) {
    return this.ppmService.addLigne(id, req.user.organizationId, req.user.id, ligneDto);
  }

  @Get(':id/export')
  export(
    @Param('id') id: string,
    @Req() req,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
  ) {
    return this.ppmService.export(id, req.user.organizationId, format);
  }
}
