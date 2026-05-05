import type {
    MultiChoiceQuizAnswer,
    MultiChoiceQuizAudioRefDto,
    MultiChoiceQuizImageRefDto,
    MultiChoiceQuizQuestion,
    MultiChoiceQuizLearnerAnswer,
    MultiChoiceQuizVideoRefDto,
} from "@electron/ipc/contracts/activities.contracts";
import type {
    ActivityContentAssetRow,
    ActivityMultiChoiceQuizAnswerRow,
    MultiChoiceQuizOptionRow,
    MultiChoiceQuizQuestionRow,
} from "@electron/db/repositories/activityRepositories";

export function toMultiChoiceQuizImageRefDtos(
    assets: ActivityContentAssetRow[]
): MultiChoiceQuizImageRefDto[] {
    return assets
        .filter((asset) => asset.asset_kind === "image")
        .sort((left, right) => left.asset_order - right.asset_order)
        .map((asset) => ({
            order: asset.asset_order,
            imageRef: asset.asset_ref,
        }));
}

export function toMultiChoiceQuizAudioRefDtos(
    assets: ActivityContentAssetRow[]
): MultiChoiceQuizAudioRefDto[] {
    return assets
        .filter((asset) => asset.asset_kind === "audio")
        .sort((left, right) => left.asset_order - right.asset_order)
        .map((asset) => ({
            order: asset.asset_order,
            audioRef: asset.asset_ref,
        }));
}

export function toMultiChoiceQuizVideoRefDtos(
    assets: ActivityContentAssetRow[]
): MultiChoiceQuizVideoRefDto[] {
    return assets
        .filter((asset) => asset.asset_kind === "video")
        .sort((left, right) => left.asset_order - right.asset_order)
        .map((asset) => ({
            order: asset.asset_order,
            videoRef: asset.asset_ref,
        }));
}

export function toMultiChoiceQuizQuestions(
    questions: MultiChoiceQuizQuestionRow[],
    options: MultiChoiceQuizOptionRow[]
): MultiChoiceQuizQuestion[] {
    const optionsByQuestionId = new Map<string, MultiChoiceQuizAnswer[]>();

    for (const option of options) {
        const mapped: MultiChoiceQuizAnswer = {
            optionId: option.id,
            option: option.option_key,
            answer: option.answer_text,
            is_correct: Boolean(option.is_correct),
        };

        const group = optionsByQuestionId.get(option.question_id) ?? [];
        group.push(mapped);
        optionsByQuestionId.set(option.question_id, group);
    }

    return questions
        .sort((left, right) => left.question_order - right.question_order)
        .map((question) => ({
            questionId: question.id,
            question: question.question_text,
            answers: optionsByQuestionId.get(question.id) ?? [],
        }));
}

export function toMultiChoiceQuizLearnerAnswers(
    answers: ActivityMultiChoiceQuizAnswerRow[]
): MultiChoiceQuizLearnerAnswer[] {
    const learnerAnswer = answers.map((answer) => ({
        attemptId: answer.attempt_id,
        learnerId: answer.learner_id,
        unitCycleActivityId: answer.unit_cycle_activity_id,
        questionId: answer.question_id,
        isAnswered: Boolean(answer.is_answered),
        selectedOption: answer.selected_option,
        isCorrect: Boolean(answer.is_correct),
        createdAt: answer.created_at,
        updatedAt: answer.updated_at,
    }));
    return learnerAnswer;
}
