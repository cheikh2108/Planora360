import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterOrganizationDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
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
    refresh(token: string): Promise<{
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
    logout(userId: string): Promise<void>;
    setup2fa(userId: string): Promise<{
        qrCode: string;
        secret: string;
    }>;
    enable2fa(userId: string, token: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
    disable2fa(userId: string, token: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
