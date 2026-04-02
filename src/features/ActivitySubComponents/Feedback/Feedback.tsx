import { useEffect, useId, useState, type FormEvent } from "react";

import "./Feedback.css";

export type StoryFeedbackDto = {
  question: string;
  answers: [string, string, string] | string[];
  comment: string;
};

export type FeedbackSubmitValue = {
  selectedAnswer: string;
  comment: string;
};

export type FeedbackProps = {
  feedback: StoryFeedbackDto;
  disabled?: boolean;
  onSubmit: (value: FeedbackSubmitValue) => void | Promise<void>;
};

const Feedback = ({ feedback, disabled = false, onSubmit }: FeedbackProps) => {
  const questionId = useId();
  const commentId = useId();
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [comment, setComment] = useState(feedback.comment);

  useEffect(() => {
    setSelectedAnswer("");
    setComment(feedback.comment);
  }, [feedback.answers, feedback.comment, feedback.question]);

  const canSubmit = !disabled && selectedAnswer.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    void onSubmit({
      selectedAnswer,
      comment,
    });
  }

  return (
    <section className="feedback-card" aria-labelledby={questionId}>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="feedback-header">
          <p className="feedback-kicker">Feedback</p>
          <h3 className="feedback-question" id={questionId}>
            {feedback.question}
          </h3>
        </div>

        <fieldset className="feedback-options" disabled={disabled}>
          <legend className="feedback-legend">Choose one answer</legend>
          <div className="feedback-options-grid" role="radiogroup" aria-label={feedback.question}>
            {feedback.answers.map((answer, index) => {
              const answerId = `${questionId}-answer-${index}`;
              const isSelected = selectedAnswer === answer;

              return (
                <label
                  key={`${answer}-${index}`}
                  className={`feedback-option${isSelected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}`}
                  htmlFor={answerId}
                >
                  <input
                    className="feedback-option-input"
                    id={answerId}
                    type="radio"
                    name={questionId}
                    value={answer}
                    checked={isSelected}
                    onChange={() => setSelectedAnswer(answer)}
                    disabled={disabled}
                  />
                  <span className="feedback-option-label">{answer}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="feedback-comment-field" htmlFor={commentId}>
          <span className="feedback-comment-label">Comment</span>
          <textarea
            className="feedback-comment-input form-control"
            id={commentId}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            placeholder="Add a short comment"
            disabled={disabled}
          />
        </label>

        <div className="feedback-actions">
          <button className="feedback-submit button-primary button-size-sm" type="submit" disabled={!canSubmit}>
            Send
          </button>
        </div>
      </form>
    </section>
  );
};

export default Feedback;
