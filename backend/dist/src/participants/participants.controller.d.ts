import { ParticipantsService } from './participants.service';
import { ImportParticipantsDto } from './dto/import-participants.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
export declare class ParticipantsController {
    private readonly participantsService;
    constructor(participantsService: ParticipantsService);
    create(dto: CreateParticipantDto, req: any): Promise<{
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
    import(file: Express.Multer.File, dto: ImportParticipantsDto, req: any): Promise<{
        success: boolean;
        errors: {
            line: number;
            error: string;
        }[];
        imported: number;
        total: number;
    }>;
    findByActivity(activityId: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
