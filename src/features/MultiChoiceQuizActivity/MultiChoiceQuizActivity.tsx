import { useState } from "react";
import type { ActivityComponentProps } from "@/features/ActivityDisplay/types/activityDisplay.types";
import { useMultiChoiceQuizActivityQuery } from "./hooks/useMultiChoiceQuizActivityQuery";
import { useSubmitMultiChoiceQuizAnswerMutation } from "./hooks/useSubmitMultiChoiceQuizAnswerMutation";
import QuestionCard from "./components/QuestionCard";
import ScoreDisplay from "./components/ScoreDisplay";
import "./multiChoiceQuizActivity.css";

const MultiChoiceQuizActivity = ({ learnerId, unitCycleActivityId }: ActivityComponentProps) => {
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedByQuestionId, setSelectedByQuestionId] = useState<Record<string, string | null>>({});
  const [isChecked, setIsChecked] = useState(false);

  const query = useMultiChoiceQuizActivityQuery(learnerId, unitCycleActivityId);
  const submitMutation = useSubmitMultiChoiceQuizAnswerMutation();

  if (query.isLoading) {
    return <section aria-live="polite">Loading quiz...</section>;
  }

  if (query.isError) {
    return <section aria-live="polite">{query.error.message}</section>;
  }

  if (!query.data) {
    return <section aria-live="polite">Multi choice quiz is strangely unavailable!</section>;
  }

  const quiz = query.data.multiChoiceQuiz;
  const questions = quiz.questions;
  const learnerAnswersByQuestionId = new Map(
    quiz.learnerAnswers.map((answer) => [answer.questionId, answer])
  );

  const questionsStatus = questions.map((question) => {
    const learnerAnswer = learnerAnswersByQuestionId.get(question.questionId);
    const uiSelectedOption = selectedByQuestionId[question.questionId];
    const selectedOption = uiSelectedOption ?? learnerAnswer?.selectedOption ?? null;
    const selectedAnswer = question.answers.find((choice) => choice.optionId === selectedOption);

    return {
      questionId: question.questionId,
      question: question.question,
      answers: question.answers,
      isAnswered: isChecked ? selectedOption !== null : (learnerAnswer?.isAnswered ?? false),
      isCorrect: isChecked ? (selectedAnswer?.is_correct ?? false) : (learnerAnswer?.isCorrect ?? false),
      selectedOption,
    };
  });

  const activeQuestion = questionsStatus[activeQuestionIndex];
  const answeredCount = questionsStatus.filter((status) => status.selectedOption !== null).length;
  const score = isChecked
    ? questionsStatus.filter((status) => status.selectedOption !== null && status.isCorrect).length
    : 0;
  const canCheckAnswers = !isChecked && questions.length > 0 && answeredCount === questions.length;

  async function handleCheckAnswers() {
    if (!canCheckAnswers) {
      return;
    }

    const selectedAnswers = questionsStatus.filter((status) => status.selectedOption !== null);

    await Promise.all(
      selectedAnswers.map((status) => {
        const choice = status.answers.find((answer) => answer.optionId === status.selectedOption);
        if (!choice || !status.selectedOption) {
          return Promise.resolve();
        }

        return submitMutation.mutateAsync({
          learnerId,
          unitCycleActivityId,
          questionId: status.questionId,
          selectedOption: status.selectedOption,
          isCorrect: choice.is_correct,
        });
      })
    );

    setIsChecked(true);
  }

  function handleRetry() {
    setIsChecked(false);
    setActiveQuestionIndex(0);
    setSelectedByQuestionId({});
  }

  return (
    <section className="multi-choice-quiz" aria-labelledby="multi-choice-quiz-title">
      <header className="multi-choice-quiz__header">
        <h2 id="multi-choice-quiz-title">{quiz.title}</h2>
        <p>{quiz.instructions}</p>
      </header>

      <div className="multi-choice-quiz__hint">
        <button
          type="button"
          className="multi-choice-quiz__hint-button"
          aria-describedby={isHintVisible ? "multi-choice-quiz-hint-text" : undefined}
          onMouseEnter={() => setIsHintVisible(true)}
          onMouseLeave={() => setIsHintVisible(false)}
          onFocus={() => setIsHintVisible(true)}
          onBlur={() => setIsHintVisible(false)}
        >
          Hint
        </button>
        {isHintVisible ? (
          <p id="multi-choice-quiz-hint-text" className="multi-choice-quiz__hint-text" role="tooltip">
            {quiz.advice}
          </p>
        ) : null}
      </div>

      <ScoreDisplay
        score={score}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
      />

      {activeQuestion ? (
        <QuestionCard
          question={{
            questionId: activeQuestion.questionId,
            question: activeQuestion.question,
            answers: activeQuestion.answers,
          }}
          index={activeQuestionIndex}
          total={questions.length}
          selectedOption={activeQuestion.selectedOption}
          isChecked={isChecked}
          onSelectOption={(optionId) => {
            setSelectedByQuestionId((current) => ({
              ...current,
              [activeQuestion.questionId]: optionId,
            }));
          }}
          canGoPrevious={activeQuestionIndex > 0}
          canGoNext={activeQuestionIndex < questions.length - 1}
          onPrevious={() => setActiveQuestionIndex((index) => index - 1)}
          onNext={() => setActiveQuestionIndex((index) => index + 1)}
        />
      ) : null}

      <div className="multi-choice-quiz__actions">
        <button type="button" onClick={handleCheckAnswers} disabled={!canCheckAnswers || submitMutation.isPending}>
          Check answers
        </button>
        {isChecked ? (
          <button type="button" onClick={handleRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default MultiChoiceQuizActivity;
