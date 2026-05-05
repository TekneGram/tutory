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

    

    return (
        <>
        </>
    );
};

export default MultiChoiceQuizActivity;
