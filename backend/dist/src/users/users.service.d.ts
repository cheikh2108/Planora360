import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto, actorOrganizationId: string, actorRole: string): Promise<any>;
    private resolveOrganizationId;
    private validateEmailUniqueness;
    private validateRole;
    private validateUserLimit;
    private createUser;
    private hashPassword;
    private sanitizeUserResponse;
    findUsersForAssignment(organizationId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: {
            id: string;
            name: string;
        };
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
    update(id: string, dto: UpdateUserDto, organizationId: string): Promise<any>;
    remove(id: string, organizationId: string): Promise<void>;
    findDeleted(organizationId: string): Promise<({
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        id: string;
        email: string;
        organizationId: string;
        roleId: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
        twoFactorSecret: string | null;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    restore(id: string, organizationId: string): Promise<{
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        id: string;
        email: string;
        organizationId: string;
        roleId: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
        twoFactorSecret: string | null;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    hardDelete(id: string, organizationId: string): Promise<void>;
    cleanupOldDeletedUsers(): Promise<{
        count: number;
    }>;
    findRoles(organizationId?: string, callerRole?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string | null;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
}
