import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private rolesService;
    constructor(rolesService: RolesService);
    findAll(user: any): Promise<({
        _count: {
            users: number;
        };
    } & {
        organizationId: string | null;
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    })[]>;
    findOne(id: string, user: any): Promise<{
        _count: {
            users: number;
        };
    } & {
        organizationId: string | null;
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    create(dto: CreateRoleDto, user: any): Promise<{
        organizationId: string | null;
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    update(id: string, dto: UpdateRoleDto, user: any): Promise<{
        organizationId: string | null;
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    remove(id: string, user: any): Promise<void>;
}
