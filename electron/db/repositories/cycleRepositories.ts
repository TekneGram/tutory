import type { LearningType } from "@electron/ipc/contracts/units.contracts";
import type { SqliteDatabase } from "../sqlite";
import { queryAll, queryOne } from "../sqlite";

export type LearningUnitCycleRow = {
    unit_cycle_id: string;
    unit_id: string;
    cycle_type_id: number;
    title: string;
    description: string | null;
    asset_base: string | null;
    icon_path: string | null;
    sort_order: number;
    total_activities: number;
};

export type UnitCycleIdentityRow = {
    unit_cycle_id: string;
    unit_id: string;
    title: string;
};

export type CycleProgressCountsRow = {
    total_activities: number;
    started_activities: number;
    completed_activities: number;
};

export type UnitIdentityForCyclesRow = {
    unit_id: string;
    title: string;
    learning_type: LearningType;
};

export function listUnitCycleRowsByUnitId(
    db: SqliteDatabase,
    unitId: string
): LearningUnitCycleRow[] {
    return queryAll<LearningUnitCycleRow>(
        db,
        `
            SELECT
                uc.id AS unit_cycle_id,
                uc.unit_id AS unit_id,
                uc.cycle_type_id AS cycle_type_id,
                uc.title AS title,
                uc.description AS description,
                ct.asset_base AS asset_base,
                ct.icon_path AS icon_path,
                uc.sort_order AS sort_order,
                COALESCE(activity_counts.total_activities, 0) AS total_activities
            FROM unit_cycles uc
            INNER JOIN cycle_types ct
                ON ct.id = uc.cycle_type_id
            LEFT JOIN (
                SELECT
                    unit_cycle_id,
                    COUNT(*) AS total_activities
                FROM unit_cycle_activities
                GROUP BY unit_cycle_id
            ) AS activity_counts
                ON activity_counts.unit_cycle_id = uc.id
            WHERE uc.unit_id = ?
            ORDER BY uc.sort_order ASC
        `,
        [unitId]
    );
}

export function getUnitIdentityForCyclesRowById(
    db: SqliteDatabase,
    unitId: string
): UnitIdentityForCyclesRow | undefined {
    return queryOne<UnitIdentityForCyclesRow>(
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

export function getUnitCycleIdentityRowById(
    db: SqliteDatabase,
    unitCycleId: string
): UnitCycleIdentityRow | undefined {
    return queryOne<UnitCycleIdentityRow>(
        db,
        `
            SELECT
                uc.id AS unit_cycle_id,
                uc.unit_id AS unit_id,
                uc.title AS title
            FROM unit_cycles uc
            WHERE uc.id = ?
            LIMIT 1
        `,
        [unitCycleId]
    );
}

export function getCycleProgressCountsRow(
    db: SqliteDatabase,
    learnerId: string,
    unitCycleId: string
): CycleProgressCountsRow {
    return queryOne<CycleProgressCountsRow>(
        db,
        `
            SELECT
                COALESCE((
                    SELECT COUNT(*)
                    FROM unit_cycle_activities uca
                    WHERE uca.unit_cycle_id = ?
                ), 0) AS total_activities,
                COALESCE((
                    SELECT COUNT(DISTINCT a.unit_cycle_activity_id)
                    FROM activity_attempts a
                    INNER JOIN unit_cycle_activities uca
                        ON uca.id = a.unit_cycle_activity_id
                    WHERE a.learner_id = ?
                      AND uca.unit_cycle_id = ?
                ), 0) AS started_activities,
                COALESCE((
                    SELECT COUNT(DISTINCT a.unit_cycle_activity_id)
                    FROM activity_attempts a
                    INNER JOIN unit_cycle_activities uca
                        ON uca.id = a.unit_cycle_activity_id
                    WHERE a.learner_id = ?
                      AND a.status = 'completed'
                      AND uca.unit_cycle_id = ?
                ), 0) AS completed_activities
        `,
        [unitCycleId, learnerId, unitCycleId, learnerId, unitCycleId]
    ) ?? {
        total_activities: 0,
        started_activities: 0,
        completed_activities: 0,
    };
}
