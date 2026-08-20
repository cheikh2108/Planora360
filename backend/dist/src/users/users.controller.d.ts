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
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: {
            id: string;
            name: string;
        };
    }[]>;
    create(dto: CreateUserDto, user: any): Promise<any>;
    findAll(user: any, page?: string, limit?: string): Promise<{
        data: {
            role: {
                id: string;
                organizationId: string | null;
                name: string;
                permissions: import("@prisma/client/runtime/client").JsonValue;
            };
            id: string;
            email: string;
            organizationId: string;
            roleId: string;
            firstName: string;
            lastName: string;
            isTwoFactorEnabled: boolean;
            isActive: boolean;
            mustChangePassword: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, user: any): Promise<{
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
        id: string;
        email: string;
        organizationId: string;
        roleId: string;
        firstName: string;
        lastName: string;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, dto: UpdateUserDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<void>;
}
