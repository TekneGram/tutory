export type ActivityType =
    | "story"
    | "multi-choice-quiz"
    | "vocab-review"
    | "write-extra"
    | "observe"
    | "observe-describe"
    | "read-model"
    | "free-writing"
    | "topic-prediction"
    | "research"
    | "text-question-answer"
    | "writing-scaffold"
    | "reflection-survey";

export type UnitCycleActivityListItemDto = {
    unitCycleActivityId: string;
    unitCycleId: string;
    activityType: ActivityType;
    title: string;
    activityOrder: number;
    isRequired: boolean;
};

export type StoryFeedbackDto = {
    question: string;
    answers: [string, string, string] | string[];
    comment: string;
};

export type StoryImageRefDto = {
    order: number;
    imageRef: string;
};

export type StoryAudioRefDto = {
    order: number;
    audioRef: string;
};

export type StoryVideoRefDto = {
    order: number;
    videoRef: string;
};

export type StoryPassagePageDto = {
    order: number;
    text: string;
};

export type StoryWordDto = {
    word: string;
    japanese: string;
    position: number;
};

export type ListUnitCycleActivitiesRequest = {
    unitCycleId: string;
};

export type ListUnitCycleActivitiesResponse = {
    cycle: {
        unitCycleId: string;
        unitId: string;
        title: string;
    };
    activities: UnitCycleActivityListItemDto[];
};

export type GetStoryActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type GetStoryActivityResponse = {
    story: {
        instructions: string;
        advice: string;
        title: string;
        assetBase: string | null;
        passage: {
            pages: StoryPassagePageDto[];
        };
        assets: {
            imageRefs: StoryImageRefDto[];
            audioRefs: StoryAudioRefDto[];
            videoRefs: StoryVideoRefDto[];
        };
        words: StoryWordDto[];
        feedback: StoryFeedbackDto;
        completion: {
            isCompleted: boolean;
        };
    };
};

export type SubmitStoryFeedbackRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    selectedAnswer: string;
    comment: string;
};

export type SubmitStoryFeedbackResponse = {
    completion: {
        isCompleted: true;
    };
};

/**
 * Multi Choice Quiz Activity
 */
export type GetMultiChoiceQuizActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type MultiChoiceQuizImageRefDto = {
  order: number;
  imageRef: string;
};

export type MultiChoiceQuizAudioRefDto = {
  order: number;
  audioRef: string;
};

export type MultiChoiceQuizVideoRefDto = {
  order: number;
  videoRef: string;
};

export type MultiChoiceQuizAnswer = {
  optionId: string;
  option: string;
  answer: string;
  is_correct: boolean;
}

export type MultiChoiceQuizQuestion = {
  questionId: string;
  question: string;
  answers: MultiChoiceQuizAnswer[];
}

export type MultiChoiceQuizLearnerAnswer = {
    attemptId: string;
    learnerId: string;
    unitCycleActivityId: string;
    questionId: string;
    isAnswered: boolean;
    selectedOption: string | null;
    isCorrect: boolean;
    createdAt: string;
    updatedAt: string;
}

export type GetMultiChoiceQuizActivityResponse = {
  multiChoiceQuiz: {
    instructions: string;
    advice: string;
    title: string;
    assetBase: string | null;
    assets: {
      imageRefs: MultiChoiceQuizImageRefDto[];
      audioRefs: MultiChoiceQuizAudioRefDto[];
      videoRefs: MultiChoiceQuizVideoRefDto[];
    },
    questions: MultiChoiceQuizQuestion[];
    learnerAnswers: MultiChoiceQuizLearnerAnswer[];
    quizState: {
      isChecked: boolean;
      finalScore: number;
      checkedAt: string | null;
    };
  }
};

export type CheckMultiChoiceQuizAnswersRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    answers: Array<{
        questionId: string;
        selectedOption: string;
    }>;
};

export type CheckMultiChoiceQuizAnswersResponse = {
    learnerAnswers: MultiChoiceQuizLearnerAnswer[];
    quizState: {
        isChecked: true;
        finalScore: number;
        checkedAt: string;
    };
};

export type RetryMultiChoiceQuizRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type RetryMultiChoiceQuizResponse = {
    learnerAnswers: MultiChoiceQuizLearnerAnswer[];
    quizState: {
        isChecked: false;
        finalScore: 0;
        checkedAt: null;
    };
};

/**
 * Vocab Review Activity
 */
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

/**
 * Observe Activity
 */
export type ObserveImageRefDto = {
    order: number;
    imageRef: string;
};

export type ObserveWordDto = {
    wordId: string;
    word: string;
    order: number;
};

export type ObserveCategoryDto = {
    categoryId: string;
    category: string;
    order: number;
};

export type ObserveLearnerWordStateDto = {
    wordId: string;
    selectedCategoryId: string | null;
    isPlaced: boolean;
    isCorrect: boolean;
    checkedAt: string | null;
};

export type ObserveProgressDto = {
    placedCount: number;
    correctCount: number;
    totalCount: number;
    isFinished: boolean;
    completedAt: string | null;
};

export type GetObserveActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type GetObserveActivityResponse = {
    observe: {
        instructions: string;
        advice: string;
        title: string;
        assetBase: string | null;
        assets: {
            imageRefs: ObserveImageRefDto[];
        };
        words: ObserveWordDto[];
        categories: ObserveCategoryDto[];
        learnerWordStates: ObserveLearnerWordStateDto[];
        progress: ObserveProgressDto;
    };
};

export type PlaceObserveWordRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    wordId: string;
    categoryId: string;
};

export type PlaceObserveWordResponse = {
    learnerWordState: ObserveLearnerWordStateDto;
    progress: ObserveProgressDto;
};

export type ResetObserveActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type ResetObserveActivityResponse = {
    learnerWordStates: ObserveLearnerWordStateDto[];
    progress: ObserveProgressDto;
};

/**
 * Write Extra Activity
 */
export type WriteExtraImageRefDto = {
    order: number;
    imageRef: string;
};

export type WriteExtraAudioRefDto = {
    order: number;
    audioRef: string;
};

export type GetWriteExtraActivityRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type GetWriteExtraActivityResponse = {
    writeExtra: {
        instructions: string;
        advice: string;
        title: string;
        assetBase: string | null;
        assets: {
            imageRefs: WriteExtraImageRefDto[];
            audioRefs: WriteExtraAudioRefDto[];
        };
        storyText: string;
        learnerText: string;
        completion: {
            isCompleted: boolean;
        };
    };
};

export type SubmitWriteExtraRequest = {
    learnerId: string;
    unitCycleActivityId: string;
    learnerText: string;
};

export type SubmitWriteExtraResponse = {
    completion: {
        isCompleted: true;
    };
};

export type ResumeWriteExtraRequest = {
    learnerId: string;
    unitCycleActivityId: string;
};

export type ResumeWriteExtraResponse = {
    completion: {
        isCompleted: false;
    };
};
