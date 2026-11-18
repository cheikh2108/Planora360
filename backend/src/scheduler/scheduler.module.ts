import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { DexpayModule } from '../dexpay/dexpay.module';

@Module({
  imports: [DexpayModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
