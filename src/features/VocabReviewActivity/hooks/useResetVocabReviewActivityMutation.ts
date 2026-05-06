import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetVocabReviewActivityResponse,
  ResetVocabReviewActivityRequest,
} from "@/app/ports/activities/vocabreview.ports";
import { resetVocabReviewActivity } from "../services/resetVocabReviewActivity.service";
import { vocabReviewActivityQueryKey } from "./useVocabReviewActivityQuery";

export function useResetVocabReviewActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetVocabReviewActivity,
    onMutate: async (variables: ResetVocabReviewActivityRequest) => {
      const queryKey = vocabReviewActivityQueryKey(variables.learnerId, variables.unitCycleActivityId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GetVocabReviewActivityResponse>(queryKey);
      return { previous, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: async (_value, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: vocabReviewActivityQueryKey(variables.learnerId, variables.unitCycleActivityId),
      });
    },
  });
}
