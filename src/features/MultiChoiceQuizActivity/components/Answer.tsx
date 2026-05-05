import type { MultiChoiceQuizQuestion } from "@/app/ports/activities.ports";

type AnswerProps = {
  answers: MultiChoiceQuizQuestion["answers"];
  selectedOption: string | null;
  isChecked: boolean;
  onSelect: (optionId: string) => void;
};

const Answer = ({ answers, selectedOption, isChecked, onSelect }: AnswerProps) => {
  return (
    <div className="multi-choice-quiz__answers" role="radiogroup" aria-label="Answer choices">
      {answers.map((choice) => {
        const isSelected = selectedOption === choice.optionId;
        const gradeClass = isChecked && isSelected
          ? (choice.is_correct ? " is-correct" : " is-incorrect")
          : "";
        const selectedClass = isSelected ? " is-selected" : "";

        return (
          <button
            key={choice.optionId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`multi-choice-quiz__answer-button${selectedClass}${gradeClass}`}
            onClick={() => onSelect(choice.optionId)}
            disabled={isChecked}
          >
            {choice.option}. {choice.answer}
          </button>
        );
      })}
    </div>
  );
};

export default Answer;
