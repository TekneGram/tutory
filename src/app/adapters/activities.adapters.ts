import { invokeRequest } from "./invokeRequest";
import type {
  ActivitiesPort,
  ListUnitCycleActivitiesRequest,
  ListUnitCycleActivitiesResponse,
} from "@/app/ports/activities.ports";
import type {
  GetStoryActivityRequest,
  GetStoryActivityResponse,
  SubmitStoryFeedbackRequest,
  SubmitStoryFeedbackResponse,
} from "@/app/ports/activities/story.ports";
import type {
  GetMultiChoiceQuizActivityRequest,
  GetMultiChoiceQuizActivityResponse,
  CheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse,
  RetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse,
} from "@/app/ports/activities/multichoicequiz.ports";
import type {
  CheckVocabReviewWordRequest,
  CheckVocabReviewWordResponse,
  GetVocabReviewActivityRequest,
  GetVocabReviewActivityResponse,
  ResetVocabReviewActivityRequest,
  ResetVocabReviewActivityResponse,
  RetryVocabReviewWordRequest,
  RetryVocabReviewWordResponse,
} from "@/app/ports/activities/vocabreview.ports";
import type {
  GetWriteExtraActivityRequest,
  GetWriteExtraActivityResponse,
  ResumeWriteExtraRequest,
  ResumeWriteExtraResponse,
  SubmitWriteExtraRequest,
  SubmitWriteExtraResponse,
} from "@/app/ports/activities/writeextra.ports";

export const activitiesAdapter: ActivitiesPort = {
  async listUnitCycleActivities(request: ListUnitCycleActivitiesRequest) {
    return invokeRequest<ListUnitCycleActivitiesRequest, ListUnitCycleActivitiesResponse>(
      "activities:list-for-cycle",
      request,
    );
  },
  async getStoryActivity(request: GetStoryActivityRequest) {
    return invokeRequest<GetStoryActivityRequest, GetStoryActivityResponse>(
      "activities:story:get",
      request,
    );
  },
  async submitStoryFeedback(request: SubmitStoryFeedbackRequest) {
    return invokeRequest<SubmitStoryFeedbackRequest, SubmitStoryFeedbackResponse>(
      "activities:story:submit-feedback",
      request,
    );
  },
  async getMultiChoiceQuizActivity(request: GetMultiChoiceQuizActivityRequest) {
    return invokeRequest<GetMultiChoiceQuizActivityRequest, GetMultiChoiceQuizActivityResponse>(
      "activities:multi-choice-quiz:get-quiz",
      request,
    )
  },
  async checkMultiChoiceQuizAnswers(request: CheckMultiChoiceQuizAnswersRequest) {
    return invokeRequest<CheckMultiChoiceQuizAnswersRequest, CheckMultiChoiceQuizAnswersResponse>(
      "activities:multi-choice-quiz:check-answers",
      request,
    );
  },
  async retryMultiChoiceQuiz(request: RetryMultiChoiceQuizRequest) {
    return invokeRequest<RetryMultiChoiceQuizRequest, RetryMultiChoiceQuizResponse>(
      "activities:multi-choice-quiz:retry",
      request,
    );
  },
  async getVocabReviewActivity(request: GetVocabReviewActivityRequest) {
    return invokeRequest<GetVocabReviewActivityRequest, GetVocabReviewActivityResponse>(
      "activities:vocab-review:get",
      request,
    );
  },
  async checkVocabReviewWord(request: CheckVocabReviewWordRequest) {
    return invokeRequest<CheckVocabReviewWordRequest, CheckVocabReviewWordResponse>(
      "activities:vocab-review:check-word",
      request,
    );
  },
  async retryVocabReviewWord(request: RetryVocabReviewWordRequest) {
    return invokeRequest<RetryVocabReviewWordRequest, RetryVocabReviewWordResponse>(
      "activities:vocab-review:retry-word",
      request,
    );
  },
  async resetVocabReviewActivity(request: ResetVocabReviewActivityRequest) {
    return invokeRequest<ResetVocabReviewActivityRequest, ResetVocabReviewActivityResponse>(
      "activities:vocab-review:reset",
      request,
    );
  },
  async getWriteExtraActivity(request: GetWriteExtraActivityRequest) {
    return invokeRequest<GetWriteExtraActivityRequest, GetWriteExtraActivityResponse>(
      "activities:write-extra:get",
      request,
    );
  },
  async submitWriteExtra(request: SubmitWriteExtraRequest) {
    return invokeRequest<SubmitWriteExtraRequest, SubmitWriteExtraResponse>(
      "activities:write-extra:submit",
      request,
    );
  },
  async resumeWriteExtra(request: ResumeWriteExtraRequest) {
    return invokeRequest<ResumeWriteExtraRequest, ResumeWriteExtraResponse>(
      "activities:write-extra:resume",
      request,
    );
  },
};
