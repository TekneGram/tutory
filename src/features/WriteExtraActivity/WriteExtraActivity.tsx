import { useEffect, useMemo, useState } from "react";
import type { ActivityComponentProps } from "@/features/ActivityDisplay/types/activityDisplay.types";
import PlayAudio from "@/features/AppWide/PlayAudio";
import Story from "./components/Story";
import ImageSummary from "./components/ImageSummary";
import WriteExtra from "./components/WriteExtra";
import { useWriteExtraActivityQuery } from "./hooks/useWriteExtraActivityQuery";
import { useSubmitWriteExtraMutation } from "./hooks/useSubmitWriteExtraMutation";
import { useResumeWriteExtraMutation } from "./hooks/useResumeWriteExtraMutation";
import "./writeExtraActivity.css";

const WriteExtraActivity = ({
  learnerId,
  learningType,
  unitId,
  unitCycleId,
  unitCycleActivityId,
}: ActivityComponentProps) => {
  const query = useWriteExtraActivityQuery(learnerId, unitCycleActivityId);
  const submitMutation = useSubmitWriteExtraMutation({
    learningType,
    unitId,
    unitCycleId,
  });
  const resumeMutation = useResumeWriteExtraMutation({
    learningType,
    unitId,
    unitCycleId,
  });

  const [draftText, setDraftText] = useState("");
  const [isCompletedOverride, setIsCompletedOverride] = useState<boolean | null>(null);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const writeExtra = query.data?.writeExtra;

  useEffect(() => {
    if (!writeExtra) {
      return;
    }

    setDraftText(writeExtra.learnerText);
    setIsCompletedOverride(null);
    setSubmitError(null);
  }, [writeExtra]);

  const isCompleted = useMemo(() => {
    if (!writeExtra) {
      return false;
    }

    if (isCompletedOverride !== null) {
      return isCompletedOverride;
    }

    return writeExtra.completion.isCompleted;
  }, [isCompletedOverride, writeExtra]);

  if (query.isLoading) {
    return <section aria-live="polite">Loading write extra activity...</section>;
  }

  if (query.isError) {
    return <section aria-live="polite">{query.error.message}</section>;
  }

  if (!writeExtra) {
    return <section aria-live="polite">Write extra activity is unavailable.</section>;
  }

  async function handleSubmit() {
    setSubmitError(null);

    try {
      await submitMutation.mutateAsync({
        learnerId,
        unitCycleActivityId,
        learnerText: draftText,
      });
      setIsCompletedOverride(true);
    } catch {
      setSubmitError("Unable to submit right now. Please try again.");
    }
  }

  async function handleResume() {
    setSubmitError(null);

    try {
      await resumeMutation.mutateAsync({
        learnerId,
        unitCycleActivityId,
      });
      setIsCompletedOverride(false);
    } catch {
      setSubmitError("Unable to continue writing right now. Please try again.");
    }
  }

  return (
    <section className="write-extra" aria-labelledby="write-extra-title">
      <header className="write-extra__header">
        <h2 id="write-extra-title">{writeExtra.title}</h2>
        <p>{writeExtra.instructions}</p>
      </header>

      <ImageSummary imageRefs={writeExtra.assets.imageRefs} assetBase={writeExtra.assetBase} />

      <Story text={writeExtra.storyText} />

      <div className="write-extra__hint">
        <button
          type="button"
          aria-describedby={isHintVisible ? "write-extra-advice" : undefined}
          onMouseEnter={() => setIsHintVisible(true)}
          onMouseLeave={() => setIsHintVisible(false)}
          onFocus={() => setIsHintVisible(true)}
          onBlur={() => setIsHintVisible(false)}
        >
          Hint
        </button>
        {isHintVisible ? (
          <p id="write-extra-advice" role="tooltip">
            {writeExtra.advice}
          </p>
        ) : null}
      </div>

      <PlayAudio audioRefs={writeExtra.assets.audioRefs} assetBase={writeExtra.assetBase} />

      <WriteExtra
        value={draftText}
        isCompleted={isCompleted}
        isSubmitting={submitMutation.isPending}
        isResuming={resumeMutation.isPending}
        submitError={submitError}
        onChange={setDraftText}
        onSubmit={() => void handleSubmit()}
        onResume={() => void handleResume()}
      />
    </section>
  );
};

export default WriteExtraActivity;
