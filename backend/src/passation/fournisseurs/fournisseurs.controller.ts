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
import { FournisseursService } from './fournisseurs.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { StatusFournisseur } from '@prisma/client';

@Controller('passation/fournisseurs')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class FournisseursController {
  constructor(private readonly fournisseursService: FournisseursService) {}

  @Post()
  create(@Req() req, @Body() createFournisseurDto: CreateFournisseurDto) {
    return this.fournisseursService.create(
      req.user.organizationId,
      createFournisseurDto
    );
  }

  @Get()
  findAll(
    @Req() req,
    @Query('status') status?: StatusFournisseur,
    @Query('search') search?: string
  ) {
    return this.fournisseursService.findAll(req.user.organizationId, {
      status,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.fournisseursService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateFournisseurDto: UpdateFournisseurDto
  ) {
    return this.fournisseursService.update(
      id,
      req.user.organizationId,
      updateFournisseurDto
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.fournisseursService.remove(id, req.user.organizationId);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Req() req, @Body('motif') motif?: string) {
    return this.fournisseursService.changeStatus(
      id,
      req.user.organizationId,
      StatusFournisseur.SUSPENDU,
      motif
    );
  }

  @Post(':id/blacklist')
  blacklist(@Param('id') id: string, @Req() req, @Body('motif') motif: string) {
    return this.fournisseursService.changeStatus(
      id,
      req.user.organizationId,
      StatusFournisseur.BLACKLISTE,
      motif
    );
  }

  @Post(':id/activate')
  activate(@Param('id') id: string, @Req() req) {
    return this.fournisseursService.changeStatus(
      id,
      req.user.organizationId,
      StatusFournisseur.ACTIF
    );
  }

  @Get(':id/documents')
  getDocuments(@Param('id') id: string, @Req() req) {
    return this.fournisseursService.findOne(id, req.user.organizationId);
  }

  @Post(':id/documents')
  addDocument(
    @Param('id') id: string,
    @Req() req,
    @Body() documentData: any
  ) {
    return this.fournisseursService.addDocument(
      id,
      req.user.organizationId,
      documentData
    );
  }

  @Delete(':id/documents/:docId')
  removeDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Req() req
  ) {
    return this.fournisseursService.removeDocument(
      id,
      docId,
      req.user.organizationId
    );
  }
}
