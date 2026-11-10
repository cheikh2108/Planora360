import { Body, Controller, Get, HttpCode, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationFeedService } from './notification-feed.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

/**
 * Notifications in-app : accessibles à tout utilisateur connecté, quelle que soit sa formule.
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private feed: NotificationFeedService) {}

  @Get()
  list(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.feed.list(user, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Post('read-all')
  @HttpCode(200)
  markAllRead(@CurrentUser() user: any) {
    return this.feed.markAllRead(user.id);
  }

  @Get('preferences')
  getPreferences(@CurrentUser() user: any) {
    return this.feed.getPreferences(user.id);
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: any, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.feed.updatePreferences(user.id, dto);
  }
}
