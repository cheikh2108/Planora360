import { Module } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { DemandesController } from './demandes.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommonPassationModule } from '../common/common-passation.module';

@Module({
  imports: [PrismaModule, CommonPassationModule],
  controllers: [DemandesController],
  providers: [DemandesService],
  exports: [DemandesService],
})
export class DemandesModule {}
