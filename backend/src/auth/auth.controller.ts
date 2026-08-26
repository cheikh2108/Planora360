import { Controller, Post, Patch, Body, UseGuards, HttpCode, HttpStatus, Req, Res, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SecurityEventsService } from '../security-events/security-events.service';
import { CsrfService } from '../common/csrf/csrf.service';
import { PrismaService } from '../common/prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private securityEventsService: SecurityEventsService,
    private csrfService: CsrfService,
    private prisma: PrismaService,
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
  async login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    try {
      const result = await this.authService.login(dto, ipAddress, userAgent);

      // Track successful login
      await this.securityEventsService.trackLoginAttempt({
        email: dto.email,
        ipAddress,
        success: true,
        userAgent,
      });

      // Si 2FA requis, ne pas définir de cookies ni générer de CSRF
      if ('requiresTwoFactor' in result) {
        return result; // { requiresTwoFactor: true }
      }

      // Vérifier le mode maintenance APRÈS l'authentification réussie
      await this.checkMaintenanceMode(result.user);


      // Générer token CSRF
      const csrfToken = this.csrfService.generateToken();

      // Définir les cookies httpOnly (protection XSS)
      this.setSecureCookies(response, result.accessToken, result.refreshToken, csrfToken);

      // Retourner uniquement les infos utilisateur + CSRF token (pas les tokens dans le body)
      return {
        user: result.user,
        csrfToken, // Le frontend en a besoin pour les requêtes futures
      };
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
   * Définit les cookies sécurisés (httpOnly, secure, sameSite)
   */
  private setSecureCookies(response: Response, accessToken: string, refreshToken: string, csrfToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access Token (15 minutes)
    response.cookie('accessToken', accessToken, {
      httpOnly: true, // Protection XSS
      secure: isProduction, // HTTPS seulement en production
      sameSite: 'lax', // Protection CSRF basique
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Refresh Token (7 jours)
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/',
    });

    // CSRF Token (non httpOnly, le frontend doit pouvoir le lire)
    response.cookie('csrf-token', csrfToken, {
      httpOnly: false, // Frontend doit le lire pour l'envoyer dans le header
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
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
  async refresh(@Body() dto: RefreshTokenDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    // Priorité: cookie > body (rétrocompatibilité)
    const refreshToken = request.cookies?.['refreshToken'] || dto.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token manquant');
    }

    const result = await this.authService.refresh(refreshToken, ipAddress, userAgent);

    // Générer nouveau token CSRF
    const csrfToken = this.csrfService.generateToken();

    // Définir les nouveaux cookies (token rotation)
    this.setSecureCookies(response, result.accessToken, result.refreshToken, csrfToken);

    return {
      user: result.user,
      csrfToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(user.id);

    // Supprimer tous les cookies
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/' });
    response.clearCookie('csrf-token', { path: '/' });

    return { message: 'Déconnexion réussie' };
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

  /**
   * Vérifie si le mode maintenance est activé et bloque les utilisateurs non-super-admins
   */
  private async checkMaintenanceMode(user: any): Promise<void> {
    // Récupérer les settings de maintenance
    const settings = await this.prisma.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    // Si mode maintenance désactivé, autoriser
    if (!settings || !settings.maintenanceMode) {
      return;
    }

    // Vérifier si l'utilisateur est super admin (permission "*")
    const permissions = user?.role?.permissions as string[] | null;
    if (permissions?.includes('*')) {
      return; // Super admin peut se connecter
    }

    // Bloquer les utilisateurs normaux
    throw new ServiceUnavailableException({
      statusCode: 503,
      message:
        settings.maintenanceMessage ||
        'Le système est actuellement en maintenance. Veuillez réessayer dans quelques instants.',
      estimatedEnd: settings.scheduledEnd,
    });
  }
}
