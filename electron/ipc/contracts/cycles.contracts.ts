import type { LearningType } from "./units.contracts";

export type LearningUnitCycleCardDto = {
    unitCycleId: string;
    unitId: string;
    cycleTypeId: number;
    title: string;
    description: string | null;
    iconPath: string | null;
    sortOrder: number;
    totalActivities: number;
};

export type CycleProgressSummaryDto = {
    learnerId: string;
    unitCycleId: string;
    completedActivities: number;
    totalActivities: number;
    completionPercent: number;
    startedActivities: number;
    notStartedActivities: number;
};

export type CycleProgressHoverDto = {
    cycle: {
        unitCycleId: string;
        unitId: string;
        title: string;
    };
    progress: CycleProgressSummaryDto;
};

export type ListUnitCyclesRequest = {
    unitId: string;
};

export type ListUnitCyclesResponse = {
    unit: {
        unitId: string;
        title: string;
        learningType: LearningType;
    };
    cycles: LearningUnitCycleCardDto[];
};

export type GetCycleProgressRequest = {
    learnerId: string;
    unitCycleId: string;
};

export type GetCycleProgressResponse = CycleProgressHoverDto;
