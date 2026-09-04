import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HttpCacheInterceptor } from '../common/cache/cache.interceptor';

@Controller('zones')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
@UseInterceptors(HttpCacheInterceptor)
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  create(@Body() createZoneDto: CreateZoneDto, @CurrentUser() user: any) {
    return this.zonesService.create(createZoneDto, user.organizationId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.zonesService.findAll(user.organizationId);
  }

  @Get('tree')
  findTree(@CurrentUser() user: any) {
    return this.zonesService.findTree(user.organizationId);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.zonesService.getZoneStats(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.zonesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateZoneDto: UpdateZoneDto,
    @CurrentUser() user: any,
  ) {
    return this.zonesService.update(id, updateZoneDto, user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.zonesService.remove(id, user.organizationId);
  }
}
