import { ConfigService } from '@nestjs/config';
export declare class CsrfService {
    private config;
    private readonly secret;
    constructor(config: ConfigService);
    generateToken(): string;
    validateToken(token: string): boolean;
    private sign;
}
