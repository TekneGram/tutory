import "./UnitFront.css";

import UnitCardDisplay from "@/features/UnitCardDisplay/UnitCardDisplay";
import { useLearningUnitsQuery } from "@/features/UnitCardDisplay/hooks/useLearningUnitsQuery";
import type { LearningType } from "@/app/types/learning";

type UnitFrontProps = {
  learnerId: string;
  learningType: LearningType;
  onEnterLearningMain: (learnerId: string, learningType: LearningType, unitId: string) => void;
  onBackToLearningEntry: (learnerId: string) => void;
};

const unitFrontCopy = {
  english: {
    kicker: "English",
    title: "Choose a unit",
    body: "Select a unit to open the English learning workspace.",
    loading: "Loading English units...",
    empty: "No English units are available yet.",
    error: "Unable to load English units.",
  },
  mathematics: {
    kicker: "Mathematics",
    title: "Choose a unit",
    body: "Select a unit to open the Mathematics learning workspace.",
    loading: "Loading Mathematics units...",
    empty: "No Mathematics units are available yet.",
    error: "Unable to load Mathematics units.",
  },
} satisfies Record<
  LearningType,
  {
    kicker: string;
    title: string;
    body: string;
    loading: string;
    empty: string;
    error: string;
  }
>;

const UnitFront = ({
  learnerId,
  learningType,
  onEnterLearningMain,
  onBackToLearningEntry,
}: UnitFrontProps) => {
  const learningUnitsQuery = useLearningUnitsQuery(learningType);
  const units = learningUnitsQuery.data ?? [];
  const copy = unitFrontCopy[learningType];

  return (
    <section className="unit-front-view" aria-labelledby="unit-front-view-title">
      <header className="unit-front-view-header">
        <p className="unit-front-view-kicker">{copy.kicker}</p>
        <h1 className="unit-front-view-title" id="unit-front-view-title">
          {copy.title}
        </h1>
        <p className="unit-front-view-learner-id">Learner ID: {learnerId}</p>
        <p className="unit-front-view-copy">{copy.body}</p>
      </header>

      {learningUnitsQuery.isLoading ? (
        <div
          className="unit-front-view-state shell-panel shell-radius-4xl shell-surface-soft shell-shadow-md shell-highlight"
          aria-live="polite"
        >
          <span className="loading-spinner loading-spinner-lg" aria-hidden="true" />
          <p className="unit-front-view-copy">{copy.loading}</p>
        </div>
      ) : null}

      {learningUnitsQuery.isError ? (
        <div
          className="unit-front-view-state shell-panel shell-radius-4xl shell-surface-soft shell-shadow-md shell-highlight"
          aria-live="polite"
        >
          <p className="unit-front-view-copy">
            {learningUnitsQuery.error instanceof Error ? learningUnitsQuery.error.message : copy.error}
          </p>
        </div>
      ) : null}

      {!learningUnitsQuery.isLoading && !learningUnitsQuery.isError && units.length === 0 ? (
        <div
          className="unit-front-view-state shell-panel shell-radius-4xl shell-surface-soft shell-shadow-md shell-highlight"
          aria-live="polite"
        >
          <p className="unit-front-view-copy">{copy.empty}</p>
        </div>
      ) : null}

      {!learningUnitsQuery.isLoading && !learningUnitsQuery.isError && units.length > 0 ? (
        <div className="unit-front-view-shell shell-panel shell-radius-5xl shell-surface-soft shell-shadow-lg shell-highlight">
          <UnitCardDisplay
            learnerId={learnerId}
            units={units}
            onSelectUnit={(unitId) => onEnterLearningMain(learnerId, learningType, unitId)}
          />
        </div>
      ) : null}

      <footer className="unit-front-view-footer">
        <button
          className="button-secondary button-size-sm unit-front-view-back-button"
          type="button"
          onClick={() => onBackToLearningEntry(learnerId)}
        >
          Back to learning entry
        </button>
      </footer>
    </section>
  );
};

export default UnitFront;
