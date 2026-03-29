import { learnersAdapter } from "@/app/adapters/learners.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import { toastifyNotifier } from "@/app/adapters/notifications";
import type {
  CreateLearnerProfileRequest,
  LearnerProfileDto,
} from "@/app/ports/learners.ports";

export async function createLearnerProfile(request: CreateLearnerProfileRequest): Promise<LearnerProfileDto> {
  const result = await learnersAdapter.createLearnerProfile(request);

  if (!result.ok) {
    toastifyNotifier.error(result.error.userMessage, { id: "learner-profile-create-error" });
    throw new FrontAppError(result.error);
  }

  return result.value.learner;
}
