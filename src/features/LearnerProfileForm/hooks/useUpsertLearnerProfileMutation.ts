import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpsertLearnerProfileInput } from "@/app/ports/learners.ports";
import { learnersQueryKey } from "@/features/LearnerCardDisplay/hooks/useLearnersQuery";
import { learnerProfileQueryKey } from "./useLearnerProfileQuery";
import { upsertLearnerProfile } from "../services/upsertLearnerProfile.service";

export function useUpsertLearnerProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertLearnerProfile,
    onSuccess: async (_value, variables: UpsertLearnerProfileInput) => {
      await queryClient.invalidateQueries({ queryKey: learnersQueryKey });

      if (variables.learnerId) {
        await queryClient.invalidateQueries({ queryKey: learnerProfileQueryKey(variables.learnerId) });
      }
    },
  });
}
