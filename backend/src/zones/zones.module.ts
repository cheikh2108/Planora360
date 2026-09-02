import { Module } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { ZonesController } from './zones.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CacheModule } from '../common/cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [ZonesController],
  providers: [ZonesService],
  exports: [ZonesService],
})
export class ZonesModule {}
