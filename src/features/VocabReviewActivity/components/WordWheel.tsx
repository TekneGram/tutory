import type { CardMode } from "../types/vocabReview.types";
import type { VocabReviewWordWithState } from "../types/vocabReview.types";

type WordWheelProps = {
  words: VocabReviewWordWithState[];
  activeWordId: string | null;
  cardMode: CardMode;
  onSelectWord: (wordId: string) => void;
};

function statusClass(word: VocabReviewWordWithState): string {
  if (!word.state.isChecked) {
    return "vocab-review-wheel__word--neutral";
  }

  return word.state.isCorrect
    ? "vocab-review-wheel__word--correct"
    : "vocab-review-wheel__word--incorrect";
}

const WordWheel = ({ words, activeWordId, cardMode, onSelectWord }: WordWheelProps) => {
  const radius = 140;

  return (
    <section className="vocab-review-wheel" aria-label="Vocabulary wheel">
      <div className="vocab-review-wheel__ring" role="list">
        {words.map((entry, index) => {
          const angle = (index / words.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const showJapanese = cardMode === "selected" && activeWordId === entry.word.wordId;
          return (
            <button
              key={entry.word.wordId}
              type="button"
              role="listitem"
              className={[
                "vocab-review-wheel__word",
                statusClass(entry),
                activeWordId === entry.word.wordId ? "vocab-review-wheel__word--active" : "",
              ].join(" ")}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              onClick={() => onSelectWord(entry.word.wordId)}
            >
              {showJapanese ? entry.word.japanese : entry.word.word}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default WordWheel;
