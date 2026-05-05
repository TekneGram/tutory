import { invokeRequest } from "./invokeRequest";
import type {
  ActivitiesPort,
  GetStoryActivityRequest,
  GetStoryActivityResponse,
  ListUnitCycleActivitiesRequest,
  ListUnitCycleActivitiesResponse,
  SubmitStoryFeedbackRequest,
  SubmitStoryFeedbackResponse,
  GetMultiChoiceQuizActivityRequest,
  GetMultiChoiceQuizActivityResponse,
  CheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse,
  RetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse,
} from "@/app/ports/activities.ports";

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
};
