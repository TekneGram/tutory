import type { LearnerProfileDto, UpsertLearnerProfileInput } from "@/app/ports/learners.ports";
import { createLearnerProfile } from "./createLearnerProfile.service";
import { updateLearnerProfile } from "./updateLearnerProfile.service";

export async function upsertLearnerProfile(request: UpsertLearnerProfileInput): Promise<LearnerProfileDto> {
  if (request.learnerId) {
    return updateLearnerProfile({
      learnerId: request.learnerId,
      name: request.name,
      avatarId: request.avatarId,
      statusText: request.statusText,
    });
  }

  return createLearnerProfile({
    name: request.name,
    avatarId: request.avatarId,
    statusText: request.statusText,
  });
}
