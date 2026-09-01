import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findRoles(user: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string | null;
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
        id: string;
        email: string;
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
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        deletedAt: Date | null;
        email: string;
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
    })[]>;
    findOne(id: string, user: any): Promise<any>;
    restore(id: string, user: any): Promise<{
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        deletedAt: Date | null;
        email: string;
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
    }>;
    update(id: string, dto: UpdateUserDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<void>;
    hardDelete(id: string, user: any): Promise<void>;
}
