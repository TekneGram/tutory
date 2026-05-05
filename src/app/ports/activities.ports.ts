import type { AppResult } from "@/app/types/result";
import type {
  CheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse,
  GetMultiChoiceQuizActivityRequest,
  GetMultiChoiceQuizActivityResponse,
  RetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse,
} from "./activities/multichoicequiz.ports";
import type {
  GetStoryActivityRequest,
  GetStoryActivityResponse,
  SubmitStoryFeedbackRequest,
  SubmitStoryFeedbackResponse,
} from "./activities/story.ports";

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

export interface ActivitiesPort {
  listUnitCycleActivities(request: ListUnitCycleActivitiesRequest): Promise<AppResult<ListUnitCycleActivitiesResponse>>;
  getStoryActivity(request: GetStoryActivityRequest): Promise<AppResult<GetStoryActivityResponse>>;
  submitStoryFeedback(request: SubmitStoryFeedbackRequest): Promise<AppResult<SubmitStoryFeedbackResponse>>;
  getMultiChoiceQuizActivity(request: GetMultiChoiceQuizActivityRequest): Promise<AppResult<GetMultiChoiceQuizActivityResponse>>;
  checkMultiChoiceQuizAnswers(request: CheckMultiChoiceQuizAnswersRequest): Promise<AppResult<CheckMultiChoiceQuizAnswersResponse>>;
  retryMultiChoiceQuiz(request: RetryMultiChoiceQuizRequest): Promise<AppResult<RetryMultiChoiceQuizResponse>>;
}

export type {
  GetStoryActivityRequest,
  GetStoryActivityResponse,
  SubmitStoryFeedbackRequest,
  SubmitStoryFeedbackResponse,
} from "./activities/story.ports";

export type {
  GetMultiChoiceQuizActivityRequest,
  GetMultiChoiceQuizActivityResponse,
  MultiChoiceQuizQuestion,
  CheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse,
  RetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse,
} from "./activities/multichoicequiz.ports";
