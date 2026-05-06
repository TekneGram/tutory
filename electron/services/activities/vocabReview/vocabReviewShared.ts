import { randomUUID } from "node:crypto";
import { raiseAppError } from "@electron/core/appException";
import type { ActivityAttemptRow } from "@electron/db/repositories/activityRepositories";
import {
    getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId,
    insertActivityAttemptRow,
} from "@electron/db/repositories/activityRepositories";
import {
    type VocabReviewAnswerRow,
    type VocabReviewStateRow,
    type VocabReviewWordRow,
} from "@electron/db/repositories/activity.vocabreviewRepositories";

export function ensureVocabReviewAttemptRow(
    db: Parameters<typeof getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId>[0],
    learnerId: string,
    unitCycleActivityId: string,
    activityTypeId: number
): ActivityAttemptRow {
    const existingAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );

    if (existingAttempt) {
        return existingAttempt;
    }

    const startedAt = new Date().toISOString();
    insertActivityAttemptRow(db, {
        id: randomUUID(),
        learner_id: learnerId,
        unit_cycle_activity_id: unitCycleActivityId,
        activity_type_id: activityTypeId,
        attempt_number: 1,
        status: "in_progress",
        score: null,
        started_at: startedAt,
        submitted_at: null,
        content_snapshot_json: null,
    });

    const createdAttempt = getLatestActivityAttemptRowByLearnerAndUnitCycleActivityId(
        db,
        learnerId,
        unitCycleActivityId
    );

    if (!createdAttempt) {
        raiseAppError(
            "DB_QUERY_FAILED",
            "Vocab review attempt could not be created or loaded."
        );
    }

    return createdAttempt;
}

export function normalizeForComparison(input: string): string {
    return input.trim().toLocaleLowerCase();
}

export function toProgressFromRows(
    words: VocabReviewWordRow[],
    answers: VocabReviewAnswerRow[]
): {
    checkedCount: number;
    correctCount: number;
    totalCount: number;
    isFinished: boolean;
    completedAt: string | null;
} {
    const totalCount = words.length;
    const checkedCount = answers.filter((answer) => answer.is_checked === 1).length;
    const correctCount = answers.filter((answer) => answer.is_checked === 1 && answer.is_correct === 1).length;
    const isFinished = totalCount > 0 && correctCount === totalCount;

    return {
        checkedCount,
        correctCount,
        totalCount,
        isFinished,
        completedAt: isFinished ? new Date().toISOString() : null,
    };
}

export function buildStateRow(
    state: {
        checkedCount: number;
        correctCount: number;
        totalCount: number;
        isFinished: boolean;
        completedAt: string | null;
    },
    identity: {
        attemptId: string;
        learnerId: string;
        unitCycleActivityId: string;
    },
    existingState: VocabReviewStateRow | undefined,
    updatedAt: string
): VocabReviewStateRow {
    return {
        attempt_id: identity.attemptId,
        learner_id: identity.learnerId,
        unit_cycle_activity_id: identity.unitCycleActivityId,
        checked_count: state.checkedCount,
        correct_count: state.correctCount,
        total_count: state.totalCount,
        is_finished: state.isFinished ? 1 : 0,
        completed_at: state.completedAt,
        created_at: existingState?.created_at ?? updatedAt,
        updated_at: updatedAt,
    };
}
