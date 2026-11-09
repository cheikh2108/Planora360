import { ConfigService } from '@nestjs/config';
export interface CreateCheckoutParams {
    reference: string;
    itemName: string;
    amount: number;
    currency: string;
    successUrl: string;
    failureUrl: string;
    webhookUrl?: string;
    metadata?: Record<string, string>;
}
export interface CheckoutSession {
    reference: string;
    payment_url: string;
    status: string;
}
export declare class DexpayService {
    private config;
    private readonly logger;
    private readonly apiUrl;
    private readonly publicKey;
    private readonly secretKey;
    constructor(config: ConfigService);
    isConfigured(): boolean;
    isTestMode(): boolean;
    createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
    getCheckoutSession(reference: string): Promise<{
        status?: string;
        amount?: number;
        currency?: string;
    } | null>;
    verifyWebhookSignature(signature: string | undefined, rawBody: Buffer | string | undefined): boolean;
}
