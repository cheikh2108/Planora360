import { Module } from '@nestjs/common';
import { PpmService } from './ppm.service';
import { PpmController } from './ppm.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PpmController],
  providers: [PpmService],
  exports: [PpmService],
})
export class PpmModule {}
