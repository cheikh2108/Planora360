import { Controller, Post, Patch, Body, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SecurityEventsService } from '../security-events/security-events.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private securityEventsService: SecurityEventsService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 inscriptions max par minute
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterOrganizationDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives max par minute
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    try {
      const result = await this.authService.login(dto);

      // Track successful login
      await this.securityEventsService.trackLoginAttempt({
        email: dto.email,
        ipAddress,
        success: true,
        userAgent,
      });

      return result;
    } catch (error) {
      // Track failed login
      await this.securityEventsService.trackLoginAttempt({
        email: dto.email,
        ipAddress,
        success: false,
        userAgent,
      });

      throw error;
    }
  }

  /**
   * Extract IP address from request
   * Handles proxies (CloudFlare, Nginx, etc.)
   */
  private extractIpAddress(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
    }

    const cfConnectingIp = request.headers['cf-connecting-ip'];
    if (cfConnectingIp) {
      return typeof cfConnectingIp === 'string' ? cfConnectingIp : cfConnectingIp[0];
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return typeof realIp === 'string' ? realIp : realIp[0];
    }

    return request.ip || request.socket?.remoteAddress || 'unknown';
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  setup2fa(@CurrentUser() user: any) {
    return this.authService.setup2fa(user.id);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  enable2fa(@CurrentUser() user: any, @Body() dto: Verify2faDto) {
    return this.authService.enable2fa(user.id, dto.token);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  disable2fa(@CurrentUser() user: any, @Body() dto: Verify2faDto) {
    return this.authService.disable2fa(user.id, dto.token);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  changePassword(@CurrentUser() user: any, @Body() dto: { newPassword: string }) {
    return this.authService.changePassword(user.id, dto.newPassword);
  }
}
