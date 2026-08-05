export declare enum ReportType {
    ACTIVITES = "activites",
    BUDGET = "budget",
    PERFORMANCE = "performance",
    RETARDS = "retards",
    INDICATEURS = "indicateurs"
}
export declare enum ReportFormat {
    PDF = "pdf",
    EXCEL = "excel"
}
export declare class GenerateReportDto {
    type: ReportType;
    format: ReportFormat;
    planId?: string;
    dateFrom?: string;
    dateTo?: string;
}
