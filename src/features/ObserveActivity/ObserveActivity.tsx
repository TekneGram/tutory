import { useEffect, useMemo, useState } from "react";
import type { ActivityComponentProps } from "@/features/ActivityDisplay/types/activityDisplay.types";
import MultipleImageDisplay from "../AppWide/MultipleImageDisplay";
import CategoriesPanel from "./components/CategoriesPanel";
import WordsPanel from "./components/WordsPanel";
import { useObserveActivityQuery } from "./hooks/useObserveActivityQuery";
import { usePlaceObserveWordMutation } from "./hooks/usePlaceObserveWordMutation";
import { useResetObserveActivityMutation } from "./hooks/useResetObserveActivityMutation";
import "./observeActivity.css";

function createShuffledWordOrder(wordIds: string[]): string[] {
  const next = [...wordIds];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

const ObserveActivity = ({
  learnerId,
  learningType,
  unitId,
  unitCycleId,
  unitCycleActivityId,
}: ActivityComponentProps) => {
  const query = useObserveActivityQuery(learnerId, unitCycleActivityId);
  const placeMutation = usePlaceObserveWordMutation({
    learningType,
    unitId,
    unitCycleId,
  });
  const resetMutation = useResetObserveActivityMutation({
    learningType,
    unitId,
    unitCycleId,
  });

  const [activeDropCategoryId, setActiveDropCategoryId] = useState<string | null>(null);
  const [incorrectWordIds, setIncorrectWordIds] = useState<Set<string>>(new Set());
  const [wordOrder, setWordOrder] = useState<string[]>([]);
  const [wordOrderActivityId, setWordOrderActivityId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const observe = query.data?.observe;

  useEffect(() => {
    setIncorrectWordIds(new Set());
    setSubmitError(null);
  }, [observe?.title]);

  const stateByWordId = useMemo(() => {
    if (!observe) {
      return new Map();
    }

    return new Map(observe.learnerWordStates.map((state) => [state.wordId, state]));
  }, [observe]);

  const correctWordIds = useMemo(() => {
    if (!observe) {
      return new Set<string>();
    }

    return new Set(
      observe.learnerWordStates
        .filter((state) => state.isPlaced && state.isCorrect && state.selectedCategoryId !== null)
        .map((state) => state.wordId),
    );
  }, [observe]);

  useEffect(() => {
    if (!observe) {
      return;
    }

    if (wordOrderActivityId !== unitCycleActivityId || wordOrder.length !== observe.words.length) {
      setWordOrder(createShuffledWordOrder(observe.words.map((word) => word.wordId)));
      setWordOrderActivityId(unitCycleActivityId);
    }
  }, [observe, unitCycleActivityId, wordOrder.length, wordOrderActivityId]);

  const availableWords = useMemo(() => {
    if (!observe) {
      return [];
    }

    const wordById = new Map(observe.words.map((word) => [word.wordId, word]));

    return wordOrder.flatMap((wordId) => {
      const word = wordById.get(wordId);

      if (!word || correctWordIds.has(word.wordId)) {
        return [];
      }

      return [{ wordId: word.wordId, word: word.word }];
    });
  }, [observe, correctWordIds, wordOrder]);

  const categoriesWithWords = useMemo(() => {
    if (!observe) {
      return [];
    }

    return observe.categories.map((category) => {
      const words = observe.words
        .filter((word) => {
          const state = stateByWordId.get(word.wordId);
          return state?.isCorrect && state.selectedCategoryId === category.categoryId;
        })
        .map((word) => ({ wordId: word.wordId, word: word.word }));

      return {
        categoryId: category.categoryId,
        category: category.category,
        words,
      };
    });
  }, [observe, stateByWordId]);

  const hasStarted = useMemo(() => {
    if (!observe) {
      return false;
    }

    return observe.learnerWordStates.some((state) => state.isPlaced) || observe.progress.placedCount > 0;
  }, [observe]);

  if (query.isLoading) {
    return <section aria-live="polite">Loading observe activity...</section>;
  }

  if (query.isError) {
    return <section aria-live="polite">{query.error.message}</section>;
  }

  if (!observe) {
    return <section aria-live="polite">Observe activity is unavailable.</section>;
  }

  const observeData = observe;
  const isComplete = observeData.progress.isFinished;

  async function handleDropWord(wordId: string, categoryId: string) {
    setSubmitError(null);

    try {
      const result = await placeMutation.mutateAsync({
        learnerId,
        unitCycleActivityId,
        wordId,
        categoryId,
      });

      if (!result.learnerWordState.isCorrect) {
        setIncorrectWordIds((current) => {
          const next = new Set(current);
          next.add(wordId);
          return next;
        });

        window.setTimeout(() => {
          setIncorrectWordIds((current) => {
            const next = new Set(current);
            next.delete(wordId);
            return next;
          });
        }, 900);
      }
    } catch {
      setSubmitError("Unable to place that word right now. Please try again.");
    }
  }

  async function handleReset() {
    setSubmitError(null);

    try {
      await resetMutation.mutateAsync({
        learnerId,
        unitCycleActivityId,
      });
      setWordOrder(createShuffledWordOrder(observeData.words.map((word) => word.wordId)));
      setWordOrderActivityId(unitCycleActivityId);
      setIncorrectWordIds(new Set());
      setActiveDropCategoryId(null);
    } catch {
      setSubmitError("Unable to reset this activity right now. Please try again.");
    }
  }

  return (
    <section className="observe-activity" aria-labelledby="observe-activity-title">
      <header className="observe-activity__header">
        <h2 id="observe-activity-title">{observeData.title}</h2>
        <p>{observeData.instructions}</p>
      </header>

      <p className="observe-activity__hint">{observeData.advice}</p>

      <MultipleImageDisplay imageRefs={observeData.assets.imageRefs} assetBase={observeData.assetBase} />

      <div className="observe-activity__panels">
        <WordsPanel words={availableWords} incorrectWordIds={incorrectWordIds} />
        <CategoriesPanel
          categories={categoriesWithWords}
          activeDropCategoryId={activeDropCategoryId}
          onDropWord={(wordId, categoryId) => void handleDropWord(wordId, categoryId)}
          onDragEnterCategory={setActiveDropCategoryId}
          onDragLeaveCategory={(categoryId) => {
            setActiveDropCategoryId((current) => (current === categoryId ? null : current));
          }}
        />
      </div>

      {hasStarted && isComplete ? (
        <p className="observe-activity__completion">
          Congratulations, you have successfully completed this activity.
        </p>
      ) : null}

      {isComplete ? (
        <div className="observe-activity__actions">
          <button type="button" onClick={() => void handleReset()} disabled={resetMutation.isPending}>
            Reset
          </button>
        </div>
      ) : null}

      {submitError ? <p className="observe-activity__error">{submitError}</p> : null}
    </section>
  );
};

export default ObserveActivity;
