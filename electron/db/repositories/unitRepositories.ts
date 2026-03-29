import type { SqliteDatabase } from "../sqlite";
import { queryAll, queryOne } from "../sqlite";
import type { LearningType } from "@electron/ipc/contracts/units.contracts";

export type LearningUnitRow = {
    unit_id: string;
    title: string;
    description: string | null;
    asset_base: string | null;
    icon_path: string | null;
    sort_order: number;
    learning_type: LearningType;
};

export type UnitIdentityRow = {
    unit_id: string;
    title: string;
    learning_type: LearningType;
};

export type UnitProgressCountsRow = {
    total_activities: number;
    started_activities: number;
    completed_activities: number;
};

export function listUnitRowsByLearningType(
    db: SqliteDatabase,
    learningType: LearningType
): LearningUnitRow[] {
    return queryAll<LearningUnitRow>(
        db,
        `
            SELECT
                u.id AS unit_id,
                u.title AS title,
                u.description AS description,
                u.asset_base AS asset_base,
                u.icon_path AS icon_path,
                u.sort_order AS sort_order,
                lt.name AS learning_type
            FROM units u
            INNER JOIN learning_types lt
                ON lt.id = u.learning_type_id
            WHERE lt.name = ?
            ORDER BY u.sort_order ASC
        `,
        [learningType]
    );
}

export function getUnitRowById(
    db: SqliteDatabase,
    unitId: string
): UnitIdentityRow | undefined {
    return queryOne<UnitIdentityRow>(
        db,
        `
            SELECT
                u.id AS unit_id,
                u.title AS title,
                lt.name AS learning_type
            FROM units u
            INNER JOIN learning_types lt
                ON lt.id = u.learning_type_id
            WHERE u.id = ?
            LIMIT 1
        `,
        [unitId]
    );
}

export function getUnitProgressCountsRow(
    db: SqliteDatabase,
    learnerId: string,
    unitId: string
): UnitProgressCountsRow {
    return queryOne<UnitProgressCountsRow>(
        db,
        `
            SELECT
                COALESCE((
                    SELECT COUNT(*)
                    FROM unit_cycles uc
                    INNER JOIN unit_cycle_activities uca
                        ON uca.unit_cycle_id = uc.id
                    WHERE uc.unit_id = ?
                ), 0) AS total_activities,
                COALESCE((
                    SELECT COUNT(DISTINCT a.unit_cycle_activity_id)
                    FROM activity_attempts a
                    INNER JOIN unit_cycle_activities uca
                        ON uca.id = a.unit_cycle_activity_id
                    INNER JOIN unit_cycles uc
                        ON uc.id = uca.unit_cycle_id
                    WHERE a.learner_id = ?
                      AND uc.unit_id = ?
                ), 0) AS started_activities,
                COALESCE((
                    SELECT COUNT(DISTINCT a.unit_cycle_activity_id)
                    FROM activity_attempts a
                    INNER JOIN unit_cycle_activities uca
                        ON uca.id = a.unit_cycle_activity_id
                    INNER JOIN unit_cycles uc
                        ON uc.id = uca.unit_cycle_id
                    WHERE a.learner_id = ?
                      AND a.status = 'completed'
                      AND uc.unit_id = ?
                ), 0) AS completed_activities
        `,
        [unitId, learnerId, unitId, learnerId, unitId]
    ) ?? {
        total_activities: 0,
        started_activities: 0,
        completed_activities: 0,
    };
}
