import { useCallback, useMemo, useState } from "react";

export type LearnerProfileFormValues = {
  name: string;
  avatarId: string | null;
  statusText: string;
};

const emptyFormValues: LearnerProfileFormValues = {
  name: "",
  avatarId: null,
  statusText: "",
};

export function useLearnerProfileFormState() {
  const [name, setName] = useState(emptyFormValues.name);
  const [avatarId, setAvatarId] = useState<string | null>(emptyFormValues.avatarId);
  const [statusText, setStatusText] = useState(emptyFormValues.statusText);

  const resetForm = useCallback(() => {
    setName(emptyFormValues.name);
    setAvatarId(emptyFormValues.avatarId);
    setStatusText(emptyFormValues.statusText);
  }, []);

  const prefillForm = useCallback((values: LearnerProfileFormValues) => {
    setName(values.name);
    setAvatarId(values.avatarId);
    setStatusText(values.statusText);
  }, []);

  const values = useMemo<LearnerProfileFormValues>(
    () => ({
      name,
      avatarId,
      statusText,
    }),
    [name, avatarId, statusText]
  );

  const canSubmit = name.trim().length > 0;

  return {
    name,
    avatarId,
    statusText,
    values,
    setName,
    setAvatarId,
    setStatusText,
    resetForm,
    prefillForm,
    canSubmit,
  };
}
