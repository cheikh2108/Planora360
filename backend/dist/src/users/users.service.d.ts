import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto, actorOrganizationId: string, actorRole: string): Promise<{
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
        id: string;
        organizationId: string;
        createdAt: Date;
        email: string;
        roleId: string;
        firstName: string;
        lastName: string;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
    }>;
    findAll(organizationId: string, page?: number, limit?: number): Promise<{
        data: {
            role: {
                id: string;
                organizationId: string | null;
                name: string;
                permissions: import("@prisma/client/runtime/client").JsonValue;
            };
            id: string;
            organizationId: string;
            createdAt: Date;
            email: string;
            roleId: string;
            firstName: string;
            lastName: string;
            isTwoFactorEnabled: boolean;
            isActive: boolean;
            mustChangePassword: boolean;
            lastLoginAt: Date | null;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, organizationId: string): Promise<{
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
        id: string;
        organizationId: string;
        createdAt: Date;
        email: string;
        roleId: string;
        firstName: string;
        lastName: string;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, organizationId: string): Promise<{
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
        id: string;
        organizationId: string;
        createdAt: Date;
        email: string;
        roleId: string;
        firstName: string;
        lastName: string;
        isTwoFactorEnabled: boolean;
        isActive: boolean;
        mustChangePassword: boolean;
        lastLoginAt: Date | null;
        updatedAt: Date;
    }>;
    remove(id: string, organizationId: string): Promise<void>;
    findRoles(organizationId?: string, callerRole?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string | null;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
}
