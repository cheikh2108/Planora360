import { PrismaService } from '../common/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
export declare class ParticipantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateParticipantDto, organizationId: string, userId: string): Promise<{
        id: string;
        organizationId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        phone: string;
        paymentMode: string;
        amount: number;
        createdBy: string;
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
        organizationId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        phone: string;
        paymentMode: string;
        amount: number;
        createdBy: string;
    }[]>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        phone: string;
        paymentMode: string;
        amount: number;
        createdBy: string;
    }>;
}
