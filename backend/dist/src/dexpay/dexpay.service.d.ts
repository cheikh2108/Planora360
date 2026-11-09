import { ConfigService } from '@nestjs/config';
export interface CreateCheckoutParams {
    amount: number;
    currency: string;
    customerEmail: string;
    customerName: string;
    description: string;
    plan: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    organizationId: string;
    successUrl: string;
    failureUrl: string;
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
    createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
    getCheckoutSession(reference: string): Promise<any>;
    verifyWebhookSignature(signature: string | undefined, rawBody: Buffer | string | undefined): boolean;
    getPlanPrice(plan: string, billingCycle?: 'MONTHLY' | 'YEARLY'): number;
}
