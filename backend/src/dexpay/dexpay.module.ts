import { Module } from '@nestjs/common';
import { DexpayService } from './dexpay.service';
import { DexpayController } from './dexpay.controller';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DexpayController, BillingController],
  providers: [DexpayService, BillingService],
  exports: [DexpayService, BillingService],
})
export class DexpayModule {}
