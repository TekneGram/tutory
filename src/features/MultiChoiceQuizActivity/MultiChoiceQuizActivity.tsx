import type { ActivityComponentProps } from "@/features/ActivityDisplay/types/activityDisplay.types";
import Question from "./components/Question";
import Answer from "./components/Answer";
import ScoreDisplay from "./components/ScoreDisplay";
import QuestionCard from "./components/QuestionCard";

//import { useState } from "react";
import { useMultiChoiceQuizActivityQuery } from "./hooks/useMultiChoiceQuizActivityQuery";

const MultiChoiceQuizActivity = ({ learnerId, unitCycleActivityId }: ActivityComponentProps) => {

    const query = useMultiChoiceQuizActivityQuery(learnerId, unitCycleActivityId);

    if (query.isLoading) {
        return <section aria-live="polite">Loading quiz...</section>;
    }

    if (query.isError) {
        return <section aria-live="polite">{query.error.message}</section>;
    }

    if (!query.data) {
        return <section aria-live="polite">Multi choice quiz is strangely unavailable!</section>
    }

    const instructions = query.data.multiChoiceQuiz.instructions;
    const title = query.data.multiChoiceQuiz.title;
    const advice = query.data.multiChoiceQuiz.advice;
    const questions = query.data.multiChoiceQuiz.questions;
    const learnerAnswers = query.data.multiChoiceQuiz.learnerAnswers;

    // Match questions, answers and learnerAnswers together
    /**
     * {
     *  question: "...",
     *  answers: [{"option": "a", "answer", "...", "is_correct", "false"}, {...}, ...],
     *  is_answered: false,
     *  is_correct: false,
     *  selected_option: null,
     * }
     */

    // We need a question id for this
    // So it might be best to create tables for activities instead of using raw json files.
    // This should form part of the design of the app!
    const questionsStatus = questions.map(question => {
        question: question.question;
        answers: question.answers;
        is_answered: learnerAnswers.find((learnerAnswer) => learnerAnswer.question === question.question)?.isAnswered ?? false;
        is_correct: learnerAnswers.find((learnerAnswer) => learnerAnswer.question === question.question)?.isCorrect ?? false;
        selected_option: learnerAnswers.find((learnerAnswer) => learnerAnswer.question === question.question)?.selectedOption ?? null;
    });


    return (
        <>
        </>
    );
};

export default MultiChoiceQuizActivity;
