import { Module } from '@nestjs/common';
import { ContratsService } from './contrats.service';
import { ContratsController } from './contrats.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommonPassationModule } from '../common/common-passation.module';

@Module({
  imports: [PrismaModule, CommonPassationModule],
  controllers: [ContratsController],
  providers: [ContratsService],
  exports: [ContratsService],
})
export class ContratsModule {}
