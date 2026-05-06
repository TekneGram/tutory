type CategoryWord = {
  wordId: string;
  word: string;
};

type CategoryCardProps = {
  categoryId: string;
  category: string;
  words: CategoryWord[];
  isDropActive: boolean;
  onDropWord: (wordId: string, categoryId: string) => void;
  onDragEnter: (categoryId: string) => void;
  onDragLeave: (categoryId: string) => void;
};

const CategoryCard = ({
  categoryId,
  category,
  words,
  isDropActive,
  onDropWord,
  onDragEnter,
  onDragLeave,
}: CategoryCardProps) => {
  return (
    <section
      className={`observe-category-card${isDropActive ? " observe-category-card--active" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter(categoryId);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        onDragLeave(categoryId);
      }}
      onDrop={(event) => {
        event.preventDefault();
        const wordId = event.dataTransfer.getData("text/plain");
        if (wordId) {
          onDropWord(wordId, categoryId);
        }
        onDragLeave(categoryId);
      }}
      aria-label={`Category ${category}`}
    >
      <header className="observe-category-card__header">
        <h4>{category}</h4>
      </header>
      <div className="observe-category-card__words" role="list" aria-label={`${category} matched words`}>
        {words.map((word) => (
          <p key={word.wordId} role="listitem" className="observe-category-card__word-pill">
            {word.word}
          </p>
        ))}
      </div>
    </section>
  );
};

export default CategoryCard;
