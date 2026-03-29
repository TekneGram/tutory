type MathematicsMainProps = {
  learnerId: string;
  onBackToLearningEntry: (learnerId: string) => void;
};

const MathematicsMain = ({ learnerId, onBackToLearningEntry }: MathematicsMainProps) => {
  return (
    <section className="mathematics-main-view" aria-labelledby="mathematics-main-view-title">
      <header className="mathematics-main-view-header">
        <p className="mathematics-main-view-kicker">Mathematics</p>
        <h1 className="mathematics-main-view-title" id="mathematics-main-view-title">
          Mathematics main
        </h1>
        <p className="mathematics-main-view-learner-id">Learner ID: {learnerId}</p>
      </header>

      <div className="mathematics-main-view-body">
        <p className="mathematics-main-view-placeholder">Mathematics learning content will render here.</p>
      </div>

      <footer className="mathematics-main-view-footer">
        <button
          className="mathematics-main-view-back-button"
          type="button"
          onClick={() => onBackToLearningEntry(learnerId)}
        >
          Back to learning entry
        </button>
      </footer>
    </section>
  );
};

export default MathematicsMain;
