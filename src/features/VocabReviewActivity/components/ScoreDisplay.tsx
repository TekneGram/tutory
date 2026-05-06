import type { VocabReviewProgressDto } from "@/app/ports/activities/vocabreview.ports";

type ScoreDisplayProps = {
  progress: VocabReviewProgressDto;
};

const ScoreDisplay = ({ progress }: ScoreDisplayProps) => {
  return (
    <section className="vocab-review-score" aria-label="Vocab review score">
      <p>
        Checked: <strong>{progress.checkedCount}</strong> / {progress.totalCount}
      </p>
      <p>
        Correct: <strong>{progress.correctCount}</strong> / {progress.totalCount}
      </p>
      {progress.isFinished ? (
        <p className="vocab-review-score__done" aria-live="polite">
          Congratulations! You completed every word.
        </p>
      ) : null}
    </section>
  );
};

export default ScoreDisplay;
