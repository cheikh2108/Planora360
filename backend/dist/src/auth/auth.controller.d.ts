import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { SecurityEventsService } from '../security-events/security-events.service';
export declare class AuthController {
    private authService;
    private securityEventsService;
    constructor(authService: AuthService, securityEventsService: SecurityEventsService);
    register(dto: RegisterOrganizationDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
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
    } | {
        requiresTwoFactor: boolean;
    }>;
    private extractIpAddress;
    refresh(dto: RefreshTokenDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
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
    }>;
    logout(user: any): Promise<void>;
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
}
