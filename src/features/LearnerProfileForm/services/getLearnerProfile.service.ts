import { learnersAdapter } from "@/app/adapters/learners.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { LearnerProfileDto } from "@/app/ports/learners.ports";

export async function getLearnerProfile(learnerId: string): Promise<LearnerProfileDto> {
  const result = await learnersAdapter.getLearnerProfile({ learnerId });

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value.learner;
}
