export type LearnerCardDto = {
    learnerId: string;
    name: string;
    avatarId: string | null;
    currentStatus: string;
};

export type LearnerProfileDto = {
    learnerId: string;
    name: string;
    avatarId: string | null;
    currentStatus: string;
};

export type UpsertLearnerProfileInput = {
    learnerId?: string;
    name: string;
    avatarId: string | null;
    statusText: string;
};

export type ListLearnersRequest = Record<string, never>;

export type ListLearnersResponse = {
    learners: LearnerCardDto[];
};

export type GetLearnerProfileRequest = {
    learnerId: string;
};

export type GetLearnerProfileResponse = {
    learner: LearnerProfileDto;
};

export type CreateLearnerProfileRequest = {
    name: string;
    avatarId: string | null;
    statusText: string;
};

export type CreateLearnerProfileResponse = {
    learner: LearnerProfileDto;
};

export type UpdateLearnerProfileRequest = {
    learnerId: string;
    name: string;
    avatarId: string | null;
    statusText: string;
};

export type UpdateLearnerProfileResponse = {
    learner: LearnerProfileDto;
};
