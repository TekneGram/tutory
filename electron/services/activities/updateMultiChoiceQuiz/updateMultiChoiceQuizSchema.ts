import type {
    MultiChoiceQuizLearnerAnswer,
    SubmitMultiChoiceQuizAnswerResponse,
} from "@electron/ipc/contracts/activities.contracts";
import type { ActivityMultiChoiceQuizAnswerRow } from "@electron/db/repositories/activityRepositories";

export function toSubmitMultiChoiceQuizAnswerResponse(
    answerRow: ActivityMultiChoiceQuizAnswerRow
): SubmitMultiChoiceQuizAnswerResponse {
    const learnerAnswer: MultiChoiceQuizLearnerAnswer = {
        attemptId: answerRow.attempt_id,
        learnerId: answerRow.learner_id,
        unitCycleActivityId: answerRow.unit_cycle_activity_id,
        questionId: answerRow.question_id,
        isAnswered: answerRow.is_answered,
        selectedOption: answerRow.selected_option,
        isCorrect: answerRow.is_correct,
        createdAt: answerRow.created_at,
        updatedAt: answerRow.updated_at,
    };

    return { learnerAnswer };
}
