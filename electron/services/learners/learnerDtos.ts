import type { LearnerCardDto, LearnerProfileDto } from "@electron/ipc/contracts/learners.contracts";
import type { LearnerRow } from "@electron/db/repositories/learnerRepositories";

export function toLearnerCardDto(row: LearnerRow): LearnerCardDto {
    return {
        learnerId: row.learner_id,
        name: row.name,
        avatarId: row.avatar_id,
        currentStatus: row.current_status,
    };
}

export function toLearnerProfileDto(row: LearnerRow): LearnerProfileDto {
    return {
        learnerId: row.learner_id,
        name: row.name,
        avatarId: row.avatar_id,
        currentStatus: row.current_status,
    };
}
