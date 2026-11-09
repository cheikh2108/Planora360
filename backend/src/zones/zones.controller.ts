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
import { CreateZoneConfigDto } from './dto/create-zone-config.dto';
import { UpdateZoneConfigDto } from './dto/update-zone-config.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionGuard, RequiresPlan } from '../common/guards/subscription.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HttpCacheInterceptor } from '../common/cache/cache.interceptor';
import { WriteRoles, ZONE_WRITERS } from '../common/guards/write-roles.guard';

@Controller('zones')
@WriteRoles({ roles: ZONE_WRITERS, permission: 'plan.update' })
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

  // ========== Configuration des zones géographiques ==========
  // Déclarées avant les routes « :id » : sinon GET /zones/config est capturé par findOne.

  @Get('config/presets')
  getPresets() {
    return this.zonesService.getAvailablePresets();
  }

  @Get('config')
  getConfig(@CurrentUser() user: any) {
    return this.zonesService.getZoneConfig(user.organizationId);
  }

  @Post('config')
  createConfig(@Body() dto: CreateZoneConfigDto, @CurrentUser() user: any) {
    return this.zonesService.createOrUpdateZoneConfig(dto, user.organizationId);
  }

  @Patch('config')
  updateConfig(@Body() dto: UpdateZoneConfigDto, @CurrentUser() user: any) {
    return this.zonesService.createOrUpdateZoneConfig(dto, user.organizationId);
  }

  // ========== Zones ==========

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
