import { PrismaService } from '../common/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
export declare class ParticipantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateParticipantDto, organizationId: string, userId: string): Promise<{
        organizationId: string;
        activityId: string;
        id: string;
        createdAt: Date;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        createdBy: string;
        amount: number;
        phone: string;
        paymentMode: string;
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
        organizationId: string;
        activityId: string;
        id: string;
        createdAt: Date;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        createdBy: string;
        amount: number;
        phone: string;
        paymentMode: string;
    }[]>;
    remove(id: string, organizationId: string): Promise<{
        organizationId: string;
        activityId: string;
        id: string;
        createdAt: Date;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        createdBy: string;
        amount: number;
        phone: string;
        paymentMode: string;
    }>;
}
