import { useState } from "react";
import type { ActivityComponentProps } from "@/features/ActivityDisplay/types/activityDisplay.types";
import StoryContainer from "./StoryContainer";
import { useStoryActivityQuery } from "./hooks/useStoryActivityQuery";
import { useSubmitStoryFeedbackMutation } from "./hooks/useSubmitStoryFeedbackMutation";

const StoryActivity = ({ learnerId, unitCycleActivityId }: ActivityComponentProps) => {
  const [isCompletedOverride, setIsCompletedOverride] = useState(false);
  const query = useStoryActivityQuery(learnerId, unitCycleActivityId);
  const submitMutation = useSubmitStoryFeedbackMutation();

  async function handleSubmitFeedback(value: { selectedAnswer: string; comment: string }) {
    await submitMutation.mutateAsync({
      learnerId,
      unitCycleActivityId,
      selectedAnswer: value.selectedAnswer,
      comment: value.comment,
    });

    setIsCompletedOverride(true);
  }

  if (query.isLoading) {
    return <section aria-live="polite">Loading story...</section>;
  }

  if (query.isError) {
    return <section aria-live="polite">{query.error.message}</section>;
  }

  if (!query.data) {
    return <section aria-live="polite">Story activity is unavailable.</section>;
  }

  const isCompleted = query.data.story.completion.isCompleted || isCompletedOverride;

  return (
    <StoryContainer
      story={query.data.story}
      isCompleted={isCompleted}
      isSubmitting={submitMutation.isPending}
      onSubmitFeedback={handleSubmitFeedback}
    />
  );
};

export default StoryActivity;
