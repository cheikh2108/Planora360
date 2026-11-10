import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { PostHogService } from '../analytics/posthog.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    private posthog;
    private notifications;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService, posthog: PostHogService, notifications: NotificationsService);
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
    requestQuote(data: {
        organization: string;
        plan: string;
        billingCycle?: string;
        fullName: string;
        email: string;
        phone?: string;
        estimatedUsers?: number;
        message?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    private validateUniqueOrganization;
    private validateUniqueEmail;
    private findAdminRole;
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
    } | {
        requiresTwoFactor: boolean;
    }>;
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
    private findRefreshToken;
    private validateRefreshTokenExpiry;
    private deleteRefreshToken;
    logout(userId: string, sessionId?: string | null, refreshToken?: string): Promise<void>;
    logoutEverywhere(userId: string): Promise<void>;
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
    changePassword(userId: string, currentPassword: string, newPassword: string, sessionId?: string | null): Promise<{
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
    generateWebSocketToken(user: any): Promise<{
        token: string;
        expiresIn: number;
    }>;
    serializeUserResponse(user: any): {
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
}
