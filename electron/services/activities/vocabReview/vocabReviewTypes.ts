export type GetVocabReviewActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type VocabReviewWordDto = {
    wordId: string;
    word: string;
    japanese: string;
    order: number;
};

export type VocabReviewLearnerWordStateDto = {
    wordId: string;
    learnerInput: string | null;
    isChecked: boolean;
    isCorrect: boolean;
    checkedAt: string | null;
};

export type VocabReviewProgressDto = {
    checkedCount: number;
    correctCount: number;
    totalCount: number;
    isFinished: boolean;
    completedAt: string | null;
};

export type GetVocabReviewActivityResponse = {
    vocabReview: {
        instructions: string;
        advice: string;
        title: string;
        assetBase: string | null;
        words: VocabReviewWordDto[];
        learnerWordStates: VocabReviewLearnerWordStateDto[];
        progress: VocabReviewProgressDto;
    };
};

export type CheckVocabReviewWordRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    wordId: string;
    learnerInput: string;
};

export type CheckVocabReviewWordResponse = {
    learnerWordState: VocabReviewLearnerWordStateDto;
    progress: VocabReviewProgressDto;
};

export type RetryVocabReviewWordRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    wordId: string;
};

export type RetryVocabReviewWordResponse = {
    learnerWordState: VocabReviewLearnerWordStateDto;
    progress: VocabReviewProgressDto;
};

export type ResetVocabReviewActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type ResetVocabReviewActivityResponse = {
    learnerWordStates: VocabReviewLearnerWordStateDto[];
    progress: VocabReviewProgressDto;
};
