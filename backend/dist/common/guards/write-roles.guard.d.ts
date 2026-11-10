import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
interface WriteRolesOptions {
    roles: string[];
    permission?: string;
}
export declare function WriteRoles(options: WriteRolesOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare class WriteRolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
export declare const PASSATION_WRITERS: string[];
export declare const PLANNING_WRITERS: string[];
export declare const ZONE_WRITERS: string[];
export declare const FIELD_WRITERS: string[];
export {};
