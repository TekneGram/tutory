import { useState } from "react";
import "./TextDisplay.css";

type WordCardProps = {
  token: string;
  japanese: string;
};

const WordCard = ({ token, japanese }: WordCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`word-card${isFlipped ? " is-flipped" : ""}`}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? japanese : token}
      onClick={() => setIsFlipped((current) => !current)}
    >
      <span className="word-card__inner">
        <span
          className="word-card__face word-card__face--front"
          aria-hidden={isFlipped}
        >
          {token}
        </span>
        <span
          className="word-card__face word-card__face--back"
          aria-hidden={!isFlipped}
        >
          {japanese}
        </span>
      </span>
    </button>
  );
};

export default WordCard;
