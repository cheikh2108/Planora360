import { CanActivate, ExecutionContext } from '@nestjs/common';
import { CsrfService } from '../csrf/csrf.service';
export declare class CsrfGuard implements CanActivate {
    private csrfService;
    constructor(csrfService: CsrfService);
    canActivate(context: ExecutionContext): boolean;
}
