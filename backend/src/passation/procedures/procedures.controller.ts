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
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';

@Controller('passation/procedures')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateProcedureDto) {
    return this.proceduresService.create(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  findAll(@Req() req, @Query() filters: any) {
    return this.proceduresService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.proceduresService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: any) {
    return this.proceduresService.update(id, req.user.organizationId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.proceduresService.remove(id, req.user.organizationId);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Req() req) {
    return this.proceduresService.publish(id, req.user.organizationId);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Req() req) {
    return this.proceduresService.close(id, req.user.organizationId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req, @Body('motif') motif: string) {
    return this.proceduresService.cancel(id, req.user.organizationId, motif);
  }
}
