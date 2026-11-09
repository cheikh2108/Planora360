import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestQuoteDto } from './dto/request-quote.dto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { SecurityEventsService } from '../security-events/security-events.service';
import { CsrfService } from '../common/csrf/csrf.service';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class AuthController {
    private authService;
    private securityEventsService;
    private csrfService;
    private prisma;
    constructor(authService: AuthService, securityEventsService: SecurityEventsService, csrfService: CsrfService, prisma: PrismaService);
    getWebSocketToken(user: any): Promise<{
        token: string;
        expiresIn: number;
    }>;
    register(dto: RegisterOrganizationDto): Promise<{
        requiresQuote: boolean;
        plan: "PRO" | "EQUIPE" | "ORGANISATION" | "ENTERPRISE";
        message: string;
        success?: undefined;
        organizationId?: undefined;
        userId?: undefined;
        status?: undefined;
    } | {
        success: boolean;
        organizationId: string;
        userId: string;
        status: string;
        message: string;
        requiresQuote?: undefined;
        plan?: undefined;
    }>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
        email: string;
    }>;
    requestQuote(dto: RequestQuoteDto): Promise<{
        success: boolean;
        message: string;
    }>;
    login(dto: LoginDto, request: Request, response: Response): Promise<{
        requiresTwoFactor: boolean;
    } | {
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            organizationId: any;
            isActive: any;
            mustChangePassword: any;
            twoFactorEnabled: any;
            role: {
                id: any;
                name: any;
                organizationId: any;
                permissions: any;
            };
            organization: {
                id: any;
                name: any;
                brandColor: any;
                subscriptionPlan: any;
            } | undefined;
        };
        csrfToken: string;
    }>;
    private setSecureCookies;
    private extractIpAddress;
    refresh(dto: RefreshTokenDto, request: Request, response: Response): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            organizationId: any;
            isActive: any;
            mustChangePassword: any;
            twoFactorEnabled: any;
            role: {
                id: any;
                name: any;
                organizationId: any;
                permissions: any;
            };
            organization: {
                id: any;
                name: any;
                brandColor: any;
                subscriptionPlan: any;
            } | undefined;
        };
        csrfToken: string;
    }>;
    getCsrfToken(response: Response): {
        csrfToken: string;
    };
    getMe(user: any): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            organizationId: any;
            isActive: any;
            mustChangePassword: any;
            twoFactorEnabled: any;
            role: {
                id: any;
                name: any;
                organizationId: any;
                permissions: any;
            };
            organization: {
                id: any;
                name: any;
                brandColor: any;
                subscriptionPlan: any;
            } | undefined;
        };
    }>;
    logout(user: any, request: Request, response: Response): Promise<{
        message: string;
    }>;
    setup2fa(user: any): Promise<{
        qrCode: string;
        secret: string;
    }>;
    enable2fa(user: any, dto: Verify2faDto): Promise<{
        message: string;
    }>;
    disable2fa(user: any, dto: Verify2faDto): Promise<{
        message: string;
    }>;
    changePassword(user: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    private checkMaintenanceMode;
}
