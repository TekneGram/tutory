type ScoreDisplayProps = {
  score: number;
  answeredCount: number;
  totalQuestions: number;
};

const ScoreDisplay = ({ score, answeredCount, totalQuestions }: ScoreDisplayProps) => {
  return (
    <section className="multi-choice-quiz__score" aria-live="polite">
      <p>
        Score: {score}/{totalQuestions}
      </p>
      <p>
        Answered: {answeredCount}/{totalQuestions}
      </p>
    </section>
  );
};

export default ScoreDisplay;
