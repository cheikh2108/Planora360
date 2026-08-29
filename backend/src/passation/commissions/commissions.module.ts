import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommonPassationModule } from '../common/common-passation.module';

@Module({
  imports: [PrismaModule, CommonPassationModule],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
