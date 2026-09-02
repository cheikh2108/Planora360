export declare class CreateActivityDto {
    title: string;
    description?: string;
    expectedResults?: string;
    axisId: string;
    parentActivityId?: string;
    responsibleId?: string;
    collaboratorIds?: string[];
    startDate?: string;
    dueDate?: string;
    priority?: string;
    budgetPlanned?: number;
    risks?: string;
    zoneIds?: string[];
}
