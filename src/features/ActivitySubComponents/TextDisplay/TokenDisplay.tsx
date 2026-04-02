import "./TextDisplay.css";
import WordCard from "./WordCard";
import type { StoryWordDto } from "./TextDisplay.types";

type TokenDisplayProps = {
  token: string;
  position: number;
  wordData?: StoryWordDto;
};

const TokenDisplay = ({ token, position, wordData }: TokenDisplayProps) => {
  return (
    <span
      className={`token-display${wordData ? " has-vocab" : ""}`}
      data-position={position}
      data-token={token}
    >
      {wordData ? <WordCard token={token} japanese={wordData.japanese} /> : token}
    </span>
  );
};

export default TokenDisplay;
