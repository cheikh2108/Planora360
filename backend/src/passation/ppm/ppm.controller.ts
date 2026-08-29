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
import { PpmService } from './ppm.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
import { StatusPPM } from '@prisma/client';

@Controller('api/passation/ppm')
@UseGuards(JwtAuthGuard)
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

  @Get(':id/export')
  export(
    @Param('id') id: string,
    @Req() req,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
  ) {
    return this.ppmService.export(id, req.user.organizationId, format);
  }
}
