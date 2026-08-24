import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    private sessionsService;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService, sessionsService: SessionsService);
    register(dto: RegisterOrganizationDto): Promise<{
        message: string;
    }>;
    private validateUniqueOrganization;
    private validateUniqueEmail;
    private findAdminRole;
    private createOrganization;
    private createAdminUser;
    private hashPassword;
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
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
    private findActiveUser;
    private validateOrganizationStatus;
    private validatePassword;
    private verifyTOTP;
    private updateLastLogin;
    refresh(token: string, ipAddress?: string, userAgent?: string): Promise<{
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
    private findRefreshToken;
    private validateRefreshTokenExpiry;
    private deleteRefreshToken;
    logout(userId: string): Promise<void>;
    setup2fa(userId: string): Promise<{
        qrCode: string;
        secret: string;
    }>;
    enable2fa(userId: string, token: string): Promise<{
        message: string;
    }>;
    private findUserOrThrow;
    private findUserWithTOTPSecret;
    private generateTOTPSecret;
    private generateQRCode;
    private storeTOTPSecret;
    changePassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
    disable2fa(userId: string, token: string): Promise<{
        message: string;
    }>;
    private validatePasswordStrength;
    private generateTokens;
    private createJWTPayload;
    private signAccessToken;
    private createRefreshToken;
    private serializeUserResponse;
}
