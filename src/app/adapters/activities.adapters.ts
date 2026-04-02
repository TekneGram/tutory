import { invokeRequest } from "./invokeRequest";
import type {
  ActivitiesPort,
  GetStoryActivityRequest,
  GetStoryActivityResponse,
  ListUnitCycleActivitiesRequest,
  ListUnitCycleActivitiesResponse,
  SubmitStoryFeedbackRequest,
  SubmitStoryFeedbackResponse,
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
};
