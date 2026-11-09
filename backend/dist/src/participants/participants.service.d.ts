import { PrismaService } from '../common/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
export declare class ParticipantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateParticipantDto, organizationId: string, userId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        activityId: string;
        createdBy: string;
        phone: string;
        paymentMode: string;
        amount: number;
    }>;
    importFromExcel(file: Express.Multer.File, activityId: string, organizationId: string, userId: string): Promise<{
        success: boolean;
        errors: {
            line: number;
            error: string;
        }[];
        imported: number;
        total: number;
    }>;
    findByActivity(activityId: string, organizationId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        activityId: string;
        createdBy: string;
        phone: string;
        paymentMode: string;
        amount: number;
    }[]>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        activityId: string;
        createdBy: string;
        phone: string;
        paymentMode: string;
        amount: number;
    }>;
}
