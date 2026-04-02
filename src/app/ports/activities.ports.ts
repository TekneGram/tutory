import type { AppResult } from "@/app/types/result";

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

export interface ActivitiesPort {
  listUnitCycleActivities(
    request: ListUnitCycleActivitiesRequest,
  ): Promise<AppResult<ListUnitCycleActivitiesResponse>>;
  getStoryActivity(request: GetStoryActivityRequest): Promise<AppResult<GetStoryActivityResponse>>;
  submitStoryFeedback(
    request: SubmitStoryFeedbackRequest,
  ): Promise<AppResult<SubmitStoryFeedbackResponse>>;
}
