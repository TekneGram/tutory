import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetMultiChoiceQuizActivityResponse,
  RetryMultiChoiceQuizRequest,
} from "@/app/ports/activities.ports";
import { multiChoiceQuizActivityKey } from "./useMultiChoiceQuizActivityQuery";
import { retryMultiChoiceQuiz } from "../services/retryMultiChoiceQuiz.service";

export function useRetryMultiChoiceQuizMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryMultiChoiceQuiz,
    onMutate: async (variables: RetryMultiChoiceQuizRequest) => {
      const queryKey = multiChoiceQuizActivityKey(variables.learnerId, variables.unitCycleActivityId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GetMultiChoiceQuizActivityResponse>(queryKey);
      return { previous, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: async (_value, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: multiChoiceQuizActivityKey(variables.learnerId, variables.unitCycleActivityId),
      });
    },
  });
}
