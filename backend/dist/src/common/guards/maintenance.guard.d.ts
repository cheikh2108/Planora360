import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class MaintenanceGuard implements CanActivate {
    private prisma;
    private reflector;
    private jwtService;
    private config;
    constructor(prisma: PrismaService, reflector: Reflector, jwtService: JwtService, config: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getClientIP;
    private extractTokenFromHeader;
    private isSuperAdmin;
}
