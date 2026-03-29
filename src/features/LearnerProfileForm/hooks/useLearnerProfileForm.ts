import { useEffect } from "react";
import type { FormEvent } from "react";
import type { UpsertLearnerProfileInput } from "@/app/ports/learners.ports";
import { useLearnerProfileQuery } from "./useLearnerProfileQuery";
import { useUpsertLearnerProfileMutation } from "./useUpsertLearnerProfileMutation";
import { useLearnerProfileFormState } from "./useLearnerProfileFormState";

type UseLearnerProfileFormArgs = {
  mode: "create" | "edit";
  learnerId?: string;
  onSubmitted: (learnerId: string) => void;
};

export function useLearnerProfileForm({ mode, learnerId, onSubmitted }: UseLearnerProfileFormArgs) {
  const profileQuery = useLearnerProfileQuery(mode === "edit" ? learnerId : undefined);
  const upsertMutation = useUpsertLearnerProfileMutation();
  const formState = useLearnerProfileFormState();
  const { resetForm, prefillForm } = formState;

  useEffect(() => {
    if (mode === "create") {
      resetForm();
      return;
    }

    if (profileQuery.data) {
      prefillForm({
        name: profileQuery.data.name,
        avatarId: profileQuery.data.avatarId,
        statusText: profileQuery.data.currentStatus,
      });
    }
  }, [mode, profileQuery.data, prefillForm, resetForm]);

  const submitLabel = mode === "create" ? "Create profile" : "Save profile";
  const currentStatusText = mode === "edit" ? profileQuery.data?.currentStatus ?? "" : "";
  const isLoading = mode === "edit" && profileQuery.isLoading;
  const isError = mode === "edit" && profileQuery.isError;
  const errorMessage = isError
    ? profileQuery.error instanceof Error
      ? profileQuery.error.message
      : "Unable to load learner profile."
    : null;
  const submitError = upsertMutation.isError
    ? upsertMutation.error instanceof Error
      ? upsertMutation.error.message
      : "Unable to save learner profile."
    : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.canSubmit) {
      return;
    }

    const request: UpsertLearnerProfileInput = {
      learnerId: mode === "edit" ? learnerId : undefined,
      name: formState.name,
      avatarId: formState.avatarId,
      statusText: formState.statusText,
    };

    try {
      const learner = await upsertMutation.mutateAsync(request);
      onSubmitted(learner.learnerId);
    } catch {
      return;
    }
  }

  return {
    name: formState.name,
    avatarId: formState.avatarId,
    statusText: formState.statusText,
    setName: formState.setName,
    setAvatarId: formState.setAvatarId,
    setStatusText: formState.setStatusText,
    canSubmit: formState.canSubmit && !upsertMutation.isPending,
    isLoading,
    isError,
    errorMessage,
    isSubmitting: upsertMutation.isPending,
    submitLabel,
    submitError,
    currentStatusText,
    handleSubmit,
  };
}
