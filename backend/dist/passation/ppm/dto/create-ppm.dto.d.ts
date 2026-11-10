import { StatusPPM } from '@prisma/client';
export declare class CreatePpmDto {
    year: number;
    title: string;
    projectId?: string;
    status?: StatusPPM;
}
