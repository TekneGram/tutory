import { invokeRequest } from "./invokeRequest";
import type {
  CreateLearnerProfileRequest,
  CreateLearnerProfileResponse,
  GetLearnerProfileRequest,
  GetLearnerProfileResponse,
  LearnersPort,
  ListLearnersRequest,
  ListLearnersResponse,
  UpdateLearnerProfileRequest,
  UpdateLearnerProfileResponse,
} from "@/app/ports/learners.ports";

export const learnersAdapter: LearnersPort = {
  async listLearners(request: ListLearnersRequest) {
    return invokeRequest<ListLearnersRequest, ListLearnersResponse>("learners:list", request);
  },

  async getLearnerProfile(request: GetLearnerProfileRequest) {
    return invokeRequest<GetLearnerProfileRequest, GetLearnerProfileResponse>("learners:get-profile", request);
  },

  async createLearnerProfile(request: CreateLearnerProfileRequest) {
    return invokeRequest<CreateLearnerProfileRequest, CreateLearnerProfileResponse>(
      "learners:create-profile",
      request,
    );
  },

  async updateLearnerProfile(request: UpdateLearnerProfileRequest) {
    return invokeRequest<UpdateLearnerProfileRequest, UpdateLearnerProfileResponse>(
      "learners:update-profile",
      request,
    );
  },
};
