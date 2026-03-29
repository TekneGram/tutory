import { learnersAdapter } from "@/app/adapters/learners.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import { toastifyNotifier } from "@/app/adapters/notifications";
import type {
  LearnerProfileDto,
  UpdateLearnerProfileRequest,
} from "@/app/ports/learners.ports";

export async function updateLearnerProfile(request: UpdateLearnerProfileRequest): Promise<LearnerProfileDto> {
  const result = await learnersAdapter.updateLearnerProfile(request);

  if (!result.ok) {
    toastifyNotifier.error(result.error.userMessage, { id: `learner-profile-update-${request.learnerId}` });
    throw new FrontAppError(result.error);
  }

  return result.value.learner;
}
