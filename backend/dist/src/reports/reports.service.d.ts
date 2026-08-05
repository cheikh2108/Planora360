import { PrismaService } from '../common/prisma/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    generate(dto: GenerateReportDto, organizationId: string): Promise<Buffer>;
    private fetchData;
    private generateExcel;
    private generatePdf;
}
