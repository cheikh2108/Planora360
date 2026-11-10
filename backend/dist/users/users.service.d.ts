import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    create(dto: CreateUserDto, actorOrganizationId: string, actorRole: string | null): Promise<any>;
    private resolveOrganizationId;
    private validateEmailUniqueness;
    private validateRole;
    private validateUserLimit;
    private createUser;
    private hashPassword;
    private sanitizeUserResponse;
    findUsersForAssignment(organizationId: string): Promise<{
        role: {
            id: string;
            name: string;
        };
        email: string;
        id: string;
        firstName: string;
        lastName: string;
    }[]>;
    findAll(organizationId: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(organizationId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        with2FA: number;
    }>;
    findOne(id: string, organizationId: string): Promise<any>;
    update(id: string, dto: UpdateUserDto, organizationId: string, actorRole?: string | null): Promise<any>;
    remove(id: string, organizationId: string): Promise<void>;
    findDeleted(organizationId: string): Promise<({
        role: {
            organizationId: string | null;
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        email: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        roleId: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
        twoFactorSecret: string | null;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
        deletedAt: Date | null;
        tokensValidAfter: Date | null;
    })[]>;
    restore(id: string, organizationId: string): Promise<{
        role: {
            organizationId: string | null;
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        email: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        roleId: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
        twoFactorSecret: string | null;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
        deletedAt: Date | null;
        tokensValidAfter: Date | null;
    }>;
    hardDelete(id: string, organizationId: string): Promise<void>;
    cleanupOldDeletedUsers(): Promise<{
        count: number;
    }>;
    findRoles(organizationId?: string, callerRole?: string | null): import(".prisma/client").Prisma.PrismaPromise<{
        organizationId: string | null;
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
}
