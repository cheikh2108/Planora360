export declare class CreateEvaluationDto {
    soumissionId: string;
    scoreAdmin?: number;
    scoreTechnique?: number;
    scoreFinancier?: number;
    scoreGlobal?: number;
    criteres: Record<string, unknown>;
    commentaires?: string;
}
