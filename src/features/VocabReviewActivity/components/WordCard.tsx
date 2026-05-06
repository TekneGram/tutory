import type { CardMode, VocabReviewWordWithState } from "../types/vocabReview.types";

type WordCardProps = {
  activeWord: VocabReviewWordWithState | null;
  mode: CardMode;
  inputValue: string;
  isChecking: boolean;
  isRetrying: boolean;
  submitError: string | null;
  onActivateInput: () => void;
  onInputChange: (value: string) => void;
  onCancelInput: () => void;
  onCheck: () => void;
  onRetry: () => void;
};

const WordCard = ({
  activeWord,
  mode,
  inputValue,
  isChecking,
  isRetrying,
  submitError,
  onActivateInput,
  onInputChange,
  onCancelInput,
  onCheck,
  onRetry,
}: WordCardProps) => {
  if (!activeWord) {
    return (
      <section className="vocab-review-card" aria-live="polite">
        <p>Select a word from the wheel to start practicing.</p>
      </section>
    );
  }

  const cardStateClass =
    mode === "correct"
      ? "vocab-review-card--correct"
      : mode === "incorrect"
        ? "vocab-review-card--incorrect"
        : "";

  return (
    <section className={["vocab-review-card", cardStateClass].join(" ")} aria-live="polite">
      <header className="vocab-review-card__header">
        {mode !== "selected" ? (
          <button
            type="button"
            className={mode === "initial" ? "vocab-review-card__word vocab-review-card__word--glow" : "vocab-review-card__word"}
            onClick={onActivateInput}
          >
            {activeWord.word.word}
            {mode === "correct" ? <span aria-hidden="true"> ✓</span> : null}
          </button>
        ) : null}
        <p className="vocab-review-card__japanese">{activeWord.word.japanese}</p>
      </header>

      {mode === "selected" || mode === "incorrect" ? (
        <form
          className="vocab-review-card__form"
          onSubmit={(event) => {
            event.preventDefault();
            onCheck();
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Type the spelling"
            aria-label="Spelling input"
          />
          <div className="vocab-review-card__actions">
            <button type="button" onClick={onCancelInput} disabled={isChecking || isRetrying}>
              Cancel
            </button>
            <button type="submit" disabled={isChecking || isRetrying || inputValue.trim().length === 0}>
              Check
            </button>
          </div>
        </form>
      ) : null}

      {mode === "incorrect" ? (
        <div className="vocab-review-card__feedback">
          <p>Correct spelling: <strong>{activeWord.word.word}</strong></p>
          <button type="button" onClick={onRetry} disabled={isRetrying || isChecking}>
            Try again
          </button>
        </div>
      ) : null}

      {submitError ? <p className="vocab-review-card__error">{submitError}</p> : null}
    </section>
  );
};

export default WordCard;
