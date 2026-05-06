import CategoryCard from "./CategoryCard";

type CategoriesPanelCategory = {
  categoryId: string;
  category: string;
  words: Array<{
    wordId: string;
    word: string;
  }>;
};

type CategoriesPanelProps = {
  categories: CategoriesPanelCategory[];
  activeDropCategoryId: string | null;
  onDropWord: (wordId: string, categoryId: string) => void;
  onDragEnterCategory: (categoryId: string) => void;
  onDragLeaveCategory: (categoryId: string) => void;
};

const CategoriesPanel = ({
  categories,
  activeDropCategoryId,
  onDropWord,
  onDragEnterCategory,
  onDragLeaveCategory,
}: CategoriesPanelProps) => {
  return (
    <section className="observe-categories-panel" aria-labelledby="observe-categories-title">
      <h3 id="observe-categories-title">Categories</h3>
      <div className="observe-categories-panel__list">
        {categories.map((category) => (
          <CategoryCard
            key={category.categoryId}
            categoryId={category.categoryId}
            category={category.category}
            words={category.words}
            isDropActive={activeDropCategoryId === category.categoryId}
            onDropWord={onDropWord}
            onDragEnter={onDragEnterCategory}
            onDragLeave={onDragLeaveCategory}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoriesPanel;
