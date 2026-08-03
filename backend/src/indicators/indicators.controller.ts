import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('indicators')
@UseGuards(JwtAuthGuard)
export class IndicatorsController {
  constructor(private indicatorsService: IndicatorsService) {}

  @Post()
  create(@Body() dto: CreateIndicatorDto, @CurrentUser() user: any) {
    return this.indicatorsService.create(dto, user.organizationId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('activityId') activityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.indicatorsService.findAll(
      user.organizationId,
      activityId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.indicatorsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIndicatorDto, @CurrentUser() user: any) {
    return this.indicatorsService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.indicatorsService.remove(id, user.organizationId);
  }
}
