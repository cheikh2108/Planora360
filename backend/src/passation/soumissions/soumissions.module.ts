import { Module } from '@nestjs/common';
import { SoumissionsService } from './soumissions.service';
import { SoumissionsController } from './soumissions.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommonPassationModule } from '../common/common-passation.module';

@Module({
  imports: [PrismaModule, CommonPassationModule],
  controllers: [SoumissionsController],
  providers: [SoumissionsService],
  exports: [SoumissionsService],
})
export class SoumissionsModule {}
