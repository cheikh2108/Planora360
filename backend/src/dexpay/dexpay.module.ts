import { Module } from '@nestjs/common';
import { DexpayService } from './dexpay.service';
import { DexpayController } from './dexpay.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DexpayController],
  providers: [DexpayService],
  exports: [DexpayService],
})
export class DexpayModule {}
