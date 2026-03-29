import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { queryAll, queryOne } from "../../sqlite";
import {
    getCycleProgressCountsRow,
    getUnitCycleIdentityRowById,
    getUnitIdentityForCyclesRowById,
    listUnitCycleRowsByUnitId,
} from "../cycleRepositories";

vi.mock("../../sqlite", () => ({
    queryAll: vi.fn(),
    queryOne: vi.fn(),
}));

describe("cycleRepositories", () => {
    it("lists cycles for a unit ordered by sort order", () => {
        vi.mocked(queryAll).mockReturnValue([]);

        listUnitCycleRowsByUnitId({} as SqliteDatabase, "unit-1");

        expect(queryAll).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(queryAll).mock.calls[0][1];
        expect(sql).toContain("FROM unit_cycles uc");
        expect(sql).toContain("INNER JOIN cycle_types ct");
        expect(sql).toContain("LEFT JOIN (");
        expect(sql).toContain("COUNT(*) AS total_activities");
        expect(sql).toContain("ORDER BY uc.sort_order ASC");
        expect(vi.mocked(queryAll).mock.calls[0][2]).toEqual(["unit-1"]);
    });

    it("loads unit identity for cycle lists", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getUnitIdentityForCyclesRowById({} as SqliteDatabase, "unit-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("lt.name AS learning_type");
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("WHERE u.id = ?");
    });

    it("loads a cycle identity by id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getUnitCycleIdentityRowById({} as SqliteDatabase, "cycle-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("WHERE uc.id = ?");
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("uc.unit_id AS unit_id");
    });

    it("builds the cycle progress aggregation query", () => {
        vi.mocked(queryOne).mockReturnValue({
            total_activities: 0,
            started_activities: 0,
            completed_activities: 0,
        });

        getCycleProgressCountsRow({} as SqliteDatabase, "learner-1", "cycle-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(queryOne).mock.calls[0][1];
        expect(sql).toContain("WHERE uca.unit_cycle_id = ?");
        expect(sql).toContain("COUNT(DISTINCT a.unit_cycle_activity_id)");
        expect(sql).toContain("a.status = 'completed'");
    });
});
