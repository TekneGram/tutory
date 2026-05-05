import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetMultiChoiceQuizActivityResponse,
  SubmitMultiChoiceQuizAnswerRequest,
} from "@/app/ports/activities.ports";
import { multiChoiceQuizActivityKey } from "./useMultiChoiceQuizActivityQuery";
import { submitMultiChoiceQuizAnswer } from "../services/submitMultiChoiceQuizAnswer.service";

export function useSubmitMultiChoiceQuizAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMultiChoiceQuizAnswer,
    onMutate: async (variables: SubmitMultiChoiceQuizAnswerRequest) => {
      const queryKey = multiChoiceQuizActivityKey(variables.learnerId, variables.unitCycleActivityId);
      await queryClient.cancelQueries({ queryKey });

      const previous =
        queryClient.getQueryData<GetMultiChoiceQuizActivityResponse>(queryKey);

      queryClient.setQueryData<GetMultiChoiceQuizActivityResponse>(
        queryKey,
        (current) => {
          if (!current) {
            return current;
          }

          const nextLearnerAnswers = current.multiChoiceQuiz.learnerAnswers.map((answer) =>
            answer.questionId === variables.questionId
              ? {
                  ...answer,
                  isAnswered: true,
                  selectedOption: variables.selectedOption,
                  isCorrect: variables.isCorrect,
                }
              : answer
          );

          return {
            ...current,
            multiChoiceQuiz: {
              ...current.multiChoiceQuiz,
              learnerAnswers: nextLearnerAnswers,
            },
          };
        }
      );

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
