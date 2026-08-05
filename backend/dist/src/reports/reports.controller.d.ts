import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    generate(dto: GenerateReportDto, user: any, res: Response): Promise<void>;
}
