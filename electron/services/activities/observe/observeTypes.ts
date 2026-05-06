export type GetObserveActivityRequest = {
  learnerId: string;
  unitCycleActivityId: string;
};

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
