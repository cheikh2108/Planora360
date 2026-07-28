import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto, ReportFormat } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Responsable financier', 'Auditeur')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post('generate')
  async generate(
    @Body() dto: GenerateReportDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generate(dto, user.organizationId);

    if (dto.format === ReportFormat.PDF) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-${dto.type}-${Date.now()}.pdf"`,
        'Content-Length': buffer.length,
      });
    } else {
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="rapport-${dto.type}-${Date.now()}.xlsx"`,
        'Content-Length': buffer.length,
      });
    }

    res.end(buffer);
  }
}
