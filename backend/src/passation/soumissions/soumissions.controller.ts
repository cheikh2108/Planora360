import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SoumissionConfidentialityGuard } from '../common/guards/soumission-confidentiality.guard';
import { SoumissionsService } from './soumissions.service';

@Controller('api/passation/procedures/:procedureId/soumissions')
@UseGuards(JwtAuthGuard)
export class SoumissionsController {
  constructor(private readonly soumissionsService: SoumissionsService) {}

  @Post()
  create(
    @Param('procedureId') procedureId: string,
    @Req() req,
    @Body() dto: any
  ) {
    return this.soumissionsService.create(
      procedureId,
      dto.fournisseurId,
      req.user.id,
      dto
    );
  }

  @Get()
  @UseGuards(SoumissionConfidentialityGuard)
  findAll(@Param('procedureId') procedureId: string, @Req() req) {
    return this.soumissionsService.findAll(procedureId, req.user.organizationId);
  }

  @Get(':id')
  @UseGuards(SoumissionConfidentialityGuard)
  findOne(
    @Param('procedureId') procedureId: string,
    @Param('id') id: string,
    @Req() req
  ) {
    return this.soumissionsService.findOne(id, procedureId, req.user.organizationId);
  }
}
