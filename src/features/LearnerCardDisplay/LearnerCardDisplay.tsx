import "./LearnerCardDisplay.css";
import LearnerCard from "./LearnerCard";
import { useLearnersQuery } from "./hooks/useLearnersQuery";
import type { LearnerCardDto } from "@/app/ports/learners.ports";

type LearnerCardDisplayProps = {
  onEnterLearner: (learnerId: string) => void;
  onEditLearner: (learnerId: string) => void;
};

const LearnerCardDisplay = ({ onEnterLearner, onEditLearner }: LearnerCardDisplayProps) => {
  const { data: learners = [], isLoading, isError, error } = useLearnersQuery();

  if (isLoading) {
    return (
      <section className="learner-card-display learner-card-display-loading" aria-live="polite">
        <div className="learner-card-display-state learner-card-display-state-loading">
          Loading learners...
        </div>
      </section>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Unable to load learners.";

    return (
      <section className="learner-card-display learner-card-display-error" aria-live="polite">
        <div className="learner-card-display-state learner-card-display-state-error">
          {message}
        </div>
      </section>
    );
  }

  if (learners.length === 0) {
    return (
      <section className="learner-card-display learner-card-display-empty" aria-live="polite">
        <div className="learner-card-display-state learner-card-display-state-empty">
          No learner profiles yet.
        </div>
      </section>
    );
  }

  return (
    <section className="learner-card-display" aria-label="Learner profiles">
      <div className="learner-card-display-grid">
        {learners.map((learner: LearnerCardDto) => (
          <LearnerCard
            key={learner.learnerId}
            learner={learner}
            onEnter={onEnterLearner}
            onEditProfile={onEditLearner}
          />
        ))}
      </div>
    </section>
  );
};

export default LearnerCardDisplay;
