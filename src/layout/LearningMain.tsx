import type { LearningType } from "@/app/types/learning";
import ActivityDisplay from "@/features/ActivityDisplay/ActivityDisplay";
import Sidebar from "./Sidebar/Sidebar";
import HeaderBar from "./HeaderBar/HeaderBar";
import AssistantDisplay from "@/features/AssistantDisplay/AssistantDisplay";

type LearningMainProps = {
  learnerId: string;
  learningType: LearningType;
  unitId: string;
  unitCycleId: string;
  onBackToUnitCycles: (learnerId: string, learningType: LearningType, unitId: string) => void;
};

const learningMainCopy = {
  english: {
    kicker: "English",
    title: "English main",
    placeholder: "English learning content for this cycle will render here.",
  },
  mathematics: {
    kicker: "Mathematics",
    title: "Mathematics main",
    placeholder: "Mathematics learning content for this cycle will render here.",
  },
} satisfies Record<
  LearningType,
  {
    kicker: string;
    title: string;
    placeholder: string;
  }
>;

const LearningMain = ({
  learnerId,
  learningType,
  unitId,
  unitCycleId,
  onBackToUnitCycles,
}: LearningMainProps) => {
  const copy = learningMainCopy[learningType];

  return (
    <section className="learning-main-view" aria-labelledby="learning-main-view-title">
      <header className="learning-main-view-header">
        <p className="learning-main-view-kicker">{copy.kicker}</p>
        <h1 className="learning-main-view-title" id="learning-main-view-title">
          {copy.title}
        </h1>
        <p className="learning-main-view-learner-id">Learner ID: {learnerId}</p>
        <p className="learning-main-view-unit-id">Unit ID: {unitId}</p>
        <p className="learning-main-view-unit-cycle-id">Unit Cycle ID: {unitCycleId}</p>
      </header>

      <div className="learning-main-view-body">
        <HeaderBar />
        <Sidebar />
        <ActivityDisplay
          learnerId={learnerId}
          learningType={learningType}
          unitId={unitId}
          unitCycleId={unitCycleId}
        />
        <AssistantDisplay />
        <p className="learning-main-view-placeholder">{copy.placeholder}</p>
      </div>

      <footer className="learning-main-view-footer">
        <button
          className="button-secondary button-size-sm learning-main-view-back-button"
          type="button"
          onClick={() => onBackToUnitCycles(learnerId, learningType, unitId)}
        >
          Back to cycle selection
        </button>
      </footer>
    </section>
  );
};

export default LearningMain;
