import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findRoles(user: any): import(".prisma/client").Prisma.PrismaPromise<{
        organizationId: string | null;
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    getStats(user: any): Promise<{
        total: number;
        active: number;
        inactive: number;
        with2FA: number;
    }>;
    listForAssignment(user: any): Promise<{
        role: {
            id: string;
            name: string;
        };
        email: string;
        id: string;
        firstName: string;
        lastName: string;
    }[]>;
    create(dto: CreateUserDto, user: any): Promise<any>;
    findAll(user: any, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    findDeleted(user: any): Promise<({
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
        notificationsReadAt: Date | null;
        notificationPreferences: import("@prisma/client/runtime/client").JsonValue | null;
        updatedAt: Date;
        deletedAt: Date | null;
        tokensValidAfter: Date | null;
    })[]>;
    findOne(id: string, user: any): Promise<any>;
    restore(id: string, user: any): Promise<{
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
        notificationsReadAt: Date | null;
        notificationPreferences: import("@prisma/client/runtime/client").JsonValue | null;
        updatedAt: Date;
        deletedAt: Date | null;
        tokensValidAfter: Date | null;
    }>;
    update(id: string, dto: UpdateUserDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<void>;
    hardDelete(id: string, user: any): Promise<void>;
}
