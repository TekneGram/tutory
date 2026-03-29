export type LearningType = "english" | "mathematics";

export type LearningUnitCardDto = {
    unitId: string;
    title: string;
    description: string | null;
    iconPath: string | null;
    sortOrder: number;
    learningType: LearningType;
};

export type UnitProgressSummaryDto = {
    learnerId: string;
    unitId: string;
    completedActivities: number;
    totalActivities: number;
    completionPercent: number;
    startedActivities: number;
    notStartedActivities: number;
};

export type UnitProgressHoverDto = {
    unit: {
        unitId: string;
        title: string;
    };
    progress: UnitProgressSummaryDto;
};

export type ListLearningUnitsRequest = {
    learningType: LearningType;
};

export type ListLearningUnitsResponse = {
    units: LearningUnitCardDto[];
};

export type GetUnitProgressRequest = {
    learnerId: string;
    unitId: string;
};

export type GetUnitProgressResponse = UnitProgressHoverDto;
