import { Module } from '@nestjs/common';
import { CapitalizationController } from './capitalization.controller';
import { CapitalizationService } from './capitalization.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CapitalizationController],
  providers: [CapitalizationService],
  exports: [CapitalizationService],
})
export class CapitalizationModule {}
