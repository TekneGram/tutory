type WordCardTone = "default" | "incorrect";

type WordCardProps = {
  wordId: string;
  word: string;
  tone?: WordCardTone;
  draggable?: boolean;
  onDragStart?: (wordId: string) => void;
};

const WordCard = ({
  wordId,
  word,
  tone = "default",
  draggable = true,
  onDragStart,
}: WordCardProps) => {
  const className = `observe-word-card observe-word-card--${tone}`;

  return (
    <button
      type="button"
      className={className}
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", wordId);
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(wordId);
      }}
      aria-label={word}
    >
      {word}
    </button>
  );
};

export default WordCard;
