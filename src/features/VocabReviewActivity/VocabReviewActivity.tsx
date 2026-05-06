import { useEffect, useMemo, useState } from "react";
import type { ActivityComponentProps } from "@/features/ActivityDisplay/types/activityDisplay.types";
import WordWheel from "./components/WordWheel";
import WordCard from "./components/WordCard";
import ScoreDisplay from "./components/ScoreDisplay";
import { useVocabReviewActivityQuery } from "./hooks/useVocabReviewActivityQuery";
import { useCheckVocabReviewWordMutation } from "./hooks/useCheckVocabReviewWordMutation";
import { useRetryVocabReviewWordMutation } from "./hooks/useRetryVocabReviewWordMutation";
import { useResetVocabReviewActivityMutation } from "./hooks/useResetVocabReviewActivityMutation";
import type { CardMode } from "./types/vocabReview.types";
import "./vocabReviewActivity.css";

const VocabReviewActivity = ({ learnerId, unitCycleActivityId }: ActivityComponentProps) => {
  const query = useVocabReviewActivityQuery(learnerId, unitCycleActivityId);
  const checkMutation = useCheckVocabReviewWordMutation();
  const retryMutation = useRetryVocabReviewWordMutation();
  const resetMutation = useResetVocabReviewActivityMutation();

  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [mode, setMode] = useState<CardMode>("initial");
  const [inputValue, setInputValue] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const wordsWithState = useMemo(() => {
    if (!query.data) {
      return [];
    }

    const stateByWordId = new Map(
      query.data.vocabReview.learnerWordStates.map((state) => [state.wordId, state]),
    );

    return query.data.vocabReview.words.map((word) => ({
      word,
      state: stateByWordId.get(word.wordId) ?? {
        wordId: word.wordId,
        learnerInput: null,
        isChecked: false,
        isCorrect: false,
        checkedAt: null,
      },
    }));
  }, [query.data]);

  const activeWord = useMemo(
    () => wordsWithState.find((entry) => entry.word.wordId === activeWordId) ?? null,
    [activeWordId, wordsWithState],
  );

  useEffect(() => {
    if (wordsWithState.length === 0) {
      setActiveWordId(null);
      return;
    }

    setActiveWordId((current) => current ?? wordsWithState[0].word.wordId);
  }, [wordsWithState]);

  useEffect(() => {
    if (!activeWord) {
      setMode("initial");
      setInputValue("");
      return;
    }

    if (!activeWord.state.isChecked) {
      setMode("initial");
      setInputValue("");
      return;
    }

    setMode(activeWord.state.isCorrect ? "correct" : "incorrect");
    setInputValue(activeWord.state.learnerInput ?? "");
  }, [activeWord?.state.checkedAt, activeWord?.state.isChecked, activeWord?.state.isCorrect, activeWord?.state.learnerInput]);

  if (query.isLoading) {
    return <section aria-live="polite">Loading vocabulary review...</section>;
  }

  if (query.isError) {
    return <section aria-live="polite">{query.error.message}</section>;
  }

  if (!query.data) {
    return <section aria-live="polite">Vocabulary review is unavailable.</section>;
  }

  const { vocabReview } = query.data;

  async function handleCheckWord() {
    if (!activeWord) {
      return;
    }

    setSubmitError(null);

    try {
      const result = await checkMutation.mutateAsync({
        learnerId,
        unitCycleActivityId,
        wordId: activeWord.word.wordId,
        learnerInput: inputValue,
      });

      setMode(result.learnerWordState.isCorrect ? "correct" : "incorrect");
    } catch {
      setSubmitError("Unable to check this spelling right now. Please try again.");
    }
  }

  async function handleRetryWord() {
    if (!activeWord) {
      return;
    }

    setSubmitError(null);

    try {
      await retryMutation.mutateAsync({
        learnerId,
        unitCycleActivityId,
        wordId: activeWord.word.wordId,
      });

      setMode("selected");
      setInputValue("");
    } catch {
      setSubmitError("Unable to reset this word right now. Please try again.");
    }
  }

  async function handleResetActivity() {
    setSubmitError(null);

    try {
      await resetMutation.mutateAsync({ learnerId, unitCycleActivityId });
      setMode("initial");
      setInputValue("");
    } catch {
      setSubmitError("Unable to reset the activity right now. Please try again.");
    }
  }

  return (
    <section className="vocab-review" aria-labelledby="vocab-review-title">
      <header className="vocab-review__header">
        <h2 id="vocab-review-title">{vocabReview.title}</h2>
        <p>{vocabReview.instructions}</p>
        <p className="vocab-review__advice">{vocabReview.advice}</p>
      </header>

      <WordWheel
        words={wordsWithState}
        activeWordId={activeWordId}
        onSelectWord={(wordId) => {
          setSubmitError(null);
          setActiveWordId(wordId);
          setMode("initial");
          setInputValue("");
        }}
      />

      {vocabReview.progress.isFinished ? (
        <div className="vocab-review__reset-wrap">
          <button
            type="button"
            onClick={() => void handleResetActivity()}
            disabled={resetMutation.isPending}
          >
            Reset
          </button>
        </div>
      ) : null}

      <WordCard
        activeWord={activeWord}
        mode={mode}
        inputValue={inputValue}
        isChecking={checkMutation.isPending}
        isRetrying={retryMutation.isPending}
        submitError={submitError}
        onActivateInput={() => {
          setSubmitError(null);
          setMode("selected");
        }}
        onInputChange={setInputValue}
        onCancelInput={() => {
          setMode("initial");
          setInputValue("");
        }}
        onCheck={() => void handleCheckWord()}
        onRetry={() => void handleRetryWord()}
      />

      <ScoreDisplay progress={vocabReview.progress} />
    </section>
  );
};

export default VocabReviewActivity;
