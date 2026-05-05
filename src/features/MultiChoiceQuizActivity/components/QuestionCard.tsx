
import type { MultiChoiceQuizQuestion } from "@/app/ports/activities/multichoicequiz.ports";
import Question from "./Question";
import Answer from "./Answer";

type QuestionCardProps = {
  question: MultiChoiceQuizQuestion;
  index: number;
  total: number;
  selectedOption: string | null;
  isChecked: boolean;
  onSelectOption: (optionId: string) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const QuestionCard = ({
  question,
  index,
  total,
  selectedOption,
  isChecked,
  onSelectOption,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: QuestionCardProps) => {
  return (
    <section className="multi-choice-quiz__question-card">
      <Question index={index} total={total} question={question.question} />
      <Answer
        answers={question.answers}
        selectedOption={selectedOption}
        isChecked={isChecked}
        onSelect={onSelectOption}
      />
      <div className="multi-choice-quiz__nav">
        <button type="button" onClick={onPrevious} disabled={!canGoPrevious}>
          Previous
        </button>
        <button type="button" onClick={onNext} disabled={!canGoNext}>
          Next
        </button>
      </div>
    </section>
  );
};

export default QuestionCard;
