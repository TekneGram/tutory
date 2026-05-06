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
  CheckVocabReviewWordRequest,
  CheckVocabReviewWordResponse,
  GetVocabReviewActivityRequest,
  GetVocabReviewActivityResponse,
  ResetVocabReviewActivityRequest,
  ResetVocabReviewActivityResponse,
  RetryVocabReviewWordRequest,
  RetryVocabReviewWordResponse,
} from "./activities/vocabreview.ports";
import type {
  GetStoryActivityRequest,
  GetStoryActivityResponse,
  SubmitStoryFeedbackRequest,
  SubmitStoryFeedbackResponse,
} from "./activities/story.ports";
import type {
  GetWriteExtraActivityRequest,
  GetWriteExtraActivityResponse,
  ResumeWriteExtraRequest,
  ResumeWriteExtraResponse,
  SubmitWriteExtraRequest,
  SubmitWriteExtraResponse,
} from "./activities/writeextra.ports";

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
  getVocabReviewActivity(request: GetVocabReviewActivityRequest): Promise<AppResult<GetVocabReviewActivityResponse>>;
  checkVocabReviewWord(request: CheckVocabReviewWordRequest): Promise<AppResult<CheckVocabReviewWordResponse>>;
  retryVocabReviewWord(request: RetryVocabReviewWordRequest): Promise<AppResult<RetryVocabReviewWordResponse>>;
  resetVocabReviewActivity(request: ResetVocabReviewActivityRequest): Promise<AppResult<ResetVocabReviewActivityResponse>>;
  getWriteExtraActivity(request: GetWriteExtraActivityRequest): Promise<AppResult<GetWriteExtraActivityResponse>>;
  submitWriteExtra(request: SubmitWriteExtraRequest): Promise<AppResult<SubmitWriteExtraResponse>>;
  resumeWriteExtra(request: ResumeWriteExtraRequest): Promise<AppResult<ResumeWriteExtraResponse>>;
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

export type {
  GetVocabReviewActivityRequest,
  GetVocabReviewActivityResponse,
  VocabReviewWordDto,
  VocabReviewLearnerWordStateDto,
  VocabReviewProgressDto,
  CheckVocabReviewWordRequest,
  CheckVocabReviewWordResponse,
  RetryVocabReviewWordRequest,
  RetryVocabReviewWordResponse,
  ResetVocabReviewActivityRequest,
  ResetVocabReviewActivityResponse,
} from "./activities/vocabreview.ports";

export type {
  GetWriteExtraActivityRequest,
  GetWriteExtraActivityResponse,
  SubmitWriteExtraRequest,
  SubmitWriteExtraResponse,
  ResumeWriteExtraRequest,
  ResumeWriteExtraResponse,
} from "./activities/writeextra.ports";
