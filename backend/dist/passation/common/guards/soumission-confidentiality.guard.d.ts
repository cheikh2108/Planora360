import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
export declare class SoumissionConfidentialityGuard implements CanActivate {
    private prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
