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
    register(dto: RegisterOrganizationDto): Promise<{
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
                permissions: any;
            };
            organization: {
                id: any;
                name: any;
                brandColor: any;
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
                permissions: any;
            };
            organization: {
                id: any;
                name: any;
                brandColor: any;
            } | undefined;
        };
        csrfToken: string;
    }>;
    logout(user: any, response: Response): Promise<{
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
    changePassword(user: any, dto: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    private checkMaintenanceMode;
}
