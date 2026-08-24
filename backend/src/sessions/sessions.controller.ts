import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionFiltersDto } from './dto/session-filters.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  /**
   * Get all active sessions (Super Admin only)
   */
  @Get()
  @Roles('Super Administrateur')
  async findActiveSessions(@Query() filters: SessionFiltersDto) {
    return this.sessionsService.findActiveSessions({
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });
  }

  /**
   * Get session statistics (Super Admin only)
   */
  @Get('stats')
  @Roles('Super Administrateur')
  async getStats() {
    return this.sessionsService.getStats();
  }

  /**
   * Revoke a specific session (Super Admin only)
   */
  @Delete(':id')
  @Roles('Super Administrateur')
  async revokeSession(@Param('id') id: string) {
    await this.sessionsService.revokeSession(id);
    return { message: 'Session révoquée avec succès' };
  }

  /**
   * Revoke all sessions for a user (Super Admin only)
   */
  @Delete('user/:userId')
  @Roles('Super Administrateur')
  async revokeUserSessions(@Param('userId') userId: string) {
    const result = await this.sessionsService.revokeUserSessions(userId);
    return {
      message: `${result.count} session(s) révoquée(s) avec succès`,
      count: result.count,
    };
  }
}
