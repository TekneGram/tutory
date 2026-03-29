import "./UnitCycles.css";

import { useUnitCyclesQuery } from "@/features/CyclesCardDisplay/hooks/useUnitCyclesQuery";
import CyclesCardDisplay from "@/features/CyclesCardDisplay/CyclesCardDisplay";
import type { LearningType } from "@/app/types/learning";

type UnitCyclesProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  onEnterLearningMain: (learnerId: string, learningType: LearningType, unitId: string, unitCycleId: string) => void;
  onBackToUnitFront: (learnerId: string, learningType: LearningType) => void;
};

const unitCyclesCopy = {
  english: {
    kicker: "English",
    title: "Choose a cycle",
    body: "Select a cycle to continue working through this unit.",
    loading: "Loading cycles...",
    empty: "No cycles are available for this unit yet.",
    error: "Unable to load cycles for this unit.",
  },
  mathematics: {
    kicker: "Mathematics",
    title: "Choose a cycle",
    body: "Select a cycle to continue working through this unit.",
    loading: "Loading cycles...",
    empty: "No cycles are available for this unit yet.",
    error: "Unable to load cycles for this unit.",
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

const UnitCycles = ({
  learnerId,
  learningType,
  unitId,
  onEnterLearningMain,
  onBackToUnitFront,
}: UnitCyclesProps) => {
  const unitCyclesQuery = useUnitCyclesQuery(unitId);
  const unitCycles = unitCyclesQuery.data?.cycles ?? [];
  const copy = unitCyclesCopy[learningType];

  return (
    <section className="unit-cycles-view" aria-labelledby="unit-cycles-view-title">
      <header className="unit-cycles-view-header">
        <p className="unit-cycles-view-kicker">{copy.kicker}</p>
        <h1 className="unit-cycles-view-title" id="unit-cycles-view-title">
          {copy.title}
        </h1>
        <p className="unit-cycles-view-learner-id">Learner ID: {learnerId}</p>
        {unitCyclesQuery.data?.unit?.title ? (
          <p className="unit-cycles-view-unit-title">Unit: {unitCyclesQuery.data.unit.title}</p>
        ) : null}
        <p className="unit-cycles-view-copy">{copy.body}</p>
      </header>

      {unitCyclesQuery.isLoading ? (
        <div
          className="unit-cycles-view-state shell-panel shell-radius-4xl shell-surface-soft shell-shadow-md shell-highlight"
          aria-live="polite"
        >
          <span className="loading-spinner loading-spinner-lg" aria-hidden="true" />
          <p className="unit-cycles-view-copy">{copy.loading}</p>
        </div>
      ) : null}

      {unitCyclesQuery.isError ? (
        <div
          className="unit-cycles-view-state shell-panel shell-radius-4xl shell-surface-soft shell-shadow-md shell-highlight"
          aria-live="polite"
        >
          <p className="unit-cycles-view-copy">
            {unitCyclesQuery.error instanceof Error ? unitCyclesQuery.error.message : copy.error}
          </p>
        </div>
      ) : null}

      {!unitCyclesQuery.isLoading && !unitCyclesQuery.isError && unitCycles.length === 0 ? (
        <div
          className="unit-cycles-view-state shell-panel shell-radius-4xl shell-surface-soft shell-shadow-md shell-highlight"
          aria-live="polite"
        >
          <p className="unit-cycles-view-copy">{copy.empty}</p>
        </div>
      ) : null}

      {!unitCyclesQuery.isLoading && !unitCyclesQuery.isError && unitCycles.length > 0 ? (
        <div className="unit-cycles-view-shell shell-panel shell-radius-5xl shell-surface-soft shell-shadow-lg shell-highlight">
          <CyclesCardDisplay
            learnerId={learnerId}
            cycles={unitCycles}
            onSelectCycle={(unitCycleId) => onEnterLearningMain(learnerId, learningType, unitId, unitCycleId)}
          />
        </div>
      ) : null}

      <footer className="unit-cycles-view-footer">
        <button
          className="button-secondary button-size-sm unit-cycles-view-back-button"
          type="button"
          onClick={() => onBackToUnitFront(learnerId, learningType)}
        >
          Back to unit selection
        </button>
      </footer>
    </section>
  );
};

export default UnitCycles;

