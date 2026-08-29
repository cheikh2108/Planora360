import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommonPassationModule } from '../common/common-passation.module';

@Module({
  imports: [PrismaModule, CommonPassationModule],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
