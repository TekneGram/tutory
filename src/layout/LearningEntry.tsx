type LearningEntryProps = {
  learnerId: string;
  onEnterEnglish: (learnerId: string) => void;
  onEnterMathematics: (learnerId: string) => void;
  onGoHome: () => void;
};

const LearningEntry = ({
  learnerId,
  onEnterEnglish,
  onEnterMathematics,
  onGoHome,
}: LearningEntryProps) => {
  return (
    <section className="learning-entry-view" aria-labelledby="learning-entry-view-title">
      <header className="learning-entry-view-header">
        <p className="learning-entry-view-kicker">Learning entry</p>
        <h1 className="learning-entry-view-title" id="learning-entry-view-title">
          Choose a learning path
        </h1>
        <p className="learning-entry-view-learner-id">Learner ID: {learnerId}</p>
      </header>

      <div className="learning-entry-view-cards">
        <button className="learning-entry-view-card" type="button" onClick={() => onEnterEnglish(learnerId)}>
          <span className="learning-entry-view-card-title">English</span>
          <span className="learning-entry-view-card-copy">Continue into the English path.</span>
        </button>

        <button className="learning-entry-view-card" type="button" onClick={() => onEnterMathematics(learnerId)}>
          <span className="learning-entry-view-card-title">Mathematics</span>
          <span className="learning-entry-view-card-copy">Continue into the Mathematics path.</span>
        </button>
      </div>

      <footer className="learning-entry-view-footer">
        <button className="learning-entry-view-home-button" type="button" onClick={onGoHome}>
          Back to home
        </button>
      </footer>
    </section>
  );
};

export default LearningEntry;
