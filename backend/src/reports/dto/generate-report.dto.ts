import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export enum ReportType {
  ACTIVITES = 'activites',
  BUDGET = 'budget',
  PERFORMANCE = 'performance',
  RETARDS = 'retards',
  INDICATEURS = 'indicateurs',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
