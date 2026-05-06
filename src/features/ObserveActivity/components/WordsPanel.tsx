import WordCard from "./WordCard";

type WordsPanelWord = {
  wordId: string;
  word: string;
};

type WordsPanelProps = {
  words: WordsPanelWord[];
  incorrectWordIds: Set<string>;
  onDragStart?: (wordId: string) => void;
};

const WordsPanel = ({ words, incorrectWordIds, onDragStart }: WordsPanelProps) => {
  return (
    <section className="observe-words-panel" aria-labelledby="observe-words-title">
      <h3 id="observe-words-title">Words</h3>
      <div className="observe-words-panel__list" role="list" aria-label="Draggable words">
        {words.map((word) => (
          <div key={word.wordId} role="listitem">
            <WordCard
              wordId={word.wordId}
              word={word.word}
              tone={incorrectWordIds.has(word.wordId) ? "incorrect" : "default"}
              onDragStart={onDragStart}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WordsPanel;
