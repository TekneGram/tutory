import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SubmitStoryFeedbackRequest } from "@/app/ports/activities/story.ports";
import { storyActivityQueryKey } from "./useStoryActivityQuery";
import { submitStoryFeedback } from "../services/submitStoryFeedback.service";

export function useSubmitStoryFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStoryFeedback,
    onSuccess: async (_value, variables: SubmitStoryFeedbackRequest) => {
      await queryClient.invalidateQueries({
        queryKey: storyActivityQueryKey(variables.learnerId, variables.unitCycleActivityId),
      });
    },
  });
}
