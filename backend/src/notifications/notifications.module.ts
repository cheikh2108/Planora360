import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationFeedService } from './notification-feed.service';
import { NotificationsController } from './notifications.controller';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationFeedService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
