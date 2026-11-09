import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string, callerRole?: string | null): Promise<({
        _count: {
            users: number;
        };
    } & {
        id: string;
        organizationId: string | null;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        _count: {
            users: number;
        };
    } & {
        id: string;
        organizationId: string | null;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    private assertNotSystemName;
    create(dto: CreateRoleDto, organizationId: string): Promise<{
        id: string;
        organizationId: string | null;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    update(id: string, dto: UpdateRoleDto, organizationId: string): Promise<{
        id: string;
        organizationId: string | null;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    remove(id: string, organizationId: string): Promise<void>;
}
