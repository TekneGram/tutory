import type {
    VocabReviewAnswerRow,
    VocabReviewWordRow,
} from "@electron/db/repositories/activity.vocabreviewRepositories";
import type {
    VocabReviewLearnerWordStateDto,
    VocabReviewProgressDto,
    VocabReviewWordDto,
} from "./vocabReviewTypes";

export function toVocabReviewWordDtos(rows: VocabReviewWordRow[]): VocabReviewWordDto[] {
    return rows.map((row) => ({
        wordId: row.id,
        word: row.word_text,
        japanese: row.japanese_text,
        order: row.word_order,
    }));
}

export function toVocabReviewLearnerWordStateDtos(
    words: VocabReviewWordRow[],
    answers: VocabReviewAnswerRow[]
): VocabReviewLearnerWordStateDto[] {
    const answerMap = new Map(answers.map((answer) => [answer.word_id, answer]));

    return words.map((word) => {
        const answer = answerMap.get(word.id);

        return {
            wordId: word.id,
            learnerInput: answer?.learner_input ?? null,
            isChecked: Boolean(answer?.is_checked ?? 0),
            isCorrect: Boolean(answer?.is_correct ?? 0),
            checkedAt: answer?.checked_at ?? null,
        };
    });
}

export function toVocabReviewProgressDto(row: {
    checkedCount: number;
    correctCount: number;
    totalCount: number;
    isFinished: boolean;
    completedAt: string | null;
}): VocabReviewProgressDto {
    return {
        checkedCount: row.checkedCount,
        correctCount: row.correctCount,
        totalCount: row.totalCount,
        isFinished: row.isFinished,
        completedAt: row.completedAt,
    };
}
