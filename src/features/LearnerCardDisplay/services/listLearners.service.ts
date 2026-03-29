import { learnersAdapter } from "@/app/adapters/learners.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { LearnerCardDto } from "@/app/ports/learners.ports";

export async function listLearners(): Promise<LearnerCardDto[]> {
  const result = await learnersAdapter.listLearners({});

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value.learners;
}
