type QuestionProps = {
  index: number;
  total: number;
  question: string;
};

const Question = ({ index, total, question }: QuestionProps) => {
  return (
    <>
      <p className="multi-choice-quiz__question-meta">
        Question {index + 1} of {total}
      </p>
      <h3 className="multi-choice-quiz__question-text">{question}</h3>
    </>
  );
};

export default Question;
