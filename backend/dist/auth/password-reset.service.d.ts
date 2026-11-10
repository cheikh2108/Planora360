import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare const RESET_TOKEN_TTL_MINUTES = 30;
export declare const FORGOT_PASSWORD_MESSAGE = "Si un compte actif correspond \u00E0 cette adresse, un e-mail contenant un lien de r\u00E9initialisation vient d'\u00EAtre envoy\u00E9.";
export declare class PasswordResetService {
    private readonly prisma;
    private readonly notifications;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService, config: ConfigService);
    requestReset(email: string, requestIp?: string): Promise<{
        message: string;
    }>;
    checkToken(token: string): Promise<{
        valid: boolean;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    private findUsable;
    private frontendUrl;
}
