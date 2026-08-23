import { Module } from '@nestjs/common';
import { SecurityEventsService } from './security-events.service';
import { SecurityEventsController } from './security-events.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SecurityEventsService],
  controllers: [SecurityEventsController],
  exports: [SecurityEventsService],
})
export class SecurityEventsModule {}
