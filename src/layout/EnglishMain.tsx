type EnglishMainProps = {
  learnerId: string;
  onBackToLearningEntry: (learnerId: string) => void;
};

const EnglishMain = ({ learnerId, onBackToLearningEntry }: EnglishMainProps) => {
  return (
    <section className="english-main-view" aria-labelledby="english-main-view-title">
      <header className="english-main-view-header">
        <p className="english-main-view-kicker">English</p>
        <h1 className="english-main-view-title" id="english-main-view-title">
          English main
        </h1>
        <p className="english-main-view-learner-id">Learner ID: {learnerId}</p>
      </header>

      <div className="english-main-view-body">
        <p className="english-main-view-placeholder">English learning content will render here.</p>
      </div>

      <footer className="english-main-view-footer">
        <button
          className="english-main-view-back-button"
          type="button"
          onClick={() => onBackToLearningEntry(learnerId)}
        >
          Back to learning entry
        </button>
      </footer>
    </section>
  );
};

export default EnglishMain;
