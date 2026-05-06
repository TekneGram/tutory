import type { AudioRef } from "@/app/types/media";

export type GetMultiChoiceQuizActivityRequest = {
  learnerId: string;
  unitCycleActivityId: string;
};

export type MultiChoiceQuizImageRefDto = {
  order: number;
  imageRef: string;
};

export type MultiChoiceQuizAudioRefDto = AudioRef;

export type MultiChoiceQuizVideoRefDto = {
  order: number;
  videoRef: string;
};

export type MultiChoiceQuizAnswer = {
  optionId: string;
  option: string;
  answer: string;
  is_correct: boolean;
};

export type MultiChoiceQuizQuestion = {
  questionId: string;
  question: string;
  answers: MultiChoiceQuizAnswer[];
};

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
};

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
    };
    questions: MultiChoiceQuizQuestion[];
    learnerAnswers: MultiChoiceQuizLearnerAnswer[];
    quizState: {
      isChecked: boolean;
      finalScore: number;
      checkedAt: string | null;
    };
  };
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
