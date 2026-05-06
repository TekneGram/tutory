import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetVocabReviewActivityResponse,
  RetryVocabReviewWordRequest,
} from "@/app/ports/activities/vocabreview.ports";
import { retryVocabReviewWord } from "../services/retryVocabReviewWord.service";
import { vocabReviewActivityQueryKey } from "./useVocabReviewActivityQuery";

export function useRetryVocabReviewWordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryVocabReviewWord,
    onMutate: async (variables: RetryVocabReviewWordRequest) => {
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
