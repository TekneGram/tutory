import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { queryAll, queryOne } from "../../sqlite";
import {
    getUnitRowById,
    getUnitProgressCountsRow,
    listUnitRowsByLearningType,
} from "../unitRepositories";

vi.mock("../../sqlite", () => ({
    queryAll: vi.fn(),
    queryOne: vi.fn(),
}));

describe("unitRepositories", () => {
    it("lists units by learning type in sort order", () => {
        vi.mocked(queryAll).mockReturnValue([]);

        listUnitRowsByLearningType({} as SqliteDatabase, "mathematics");

        expect(queryAll).toHaveBeenCalledTimes(1);
        expect(vi.mocked(queryAll).mock.calls[0][1]).toContain("lt.name = ?");
        expect(vi.mocked(queryAll).mock.calls[0][1]).toContain("u.asset_base AS asset_base");
        expect(vi.mocked(queryAll).mock.calls[0][1]).toContain("lt.name AS learning_type");
        expect(vi.mocked(queryAll).mock.calls[0][1]).toContain("ORDER BY u.sort_order ASC");
        expect(vi.mocked(queryAll).mock.calls[0][2]).toEqual(["mathematics"]);
    });

    it("loads a unit by id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getUnitRowById({} as SqliteDatabase, "unit-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("WHERE u.id = ?");
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("lt.name AS learning_type");
    });

    it("builds the unit progress aggregation query", () => {
        vi.mocked(queryOne).mockReturnValue({
            total_activities: 0,
            started_activities: 0,
            completed_activities: 0,
        });

        getUnitProgressCountsRow({} as SqliteDatabase, "learner-1", "unit-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(queryOne).mock.calls[0][1];
        expect(sql).toContain("COUNT(DISTINCT a.unit_cycle_activity_id)");
        expect(sql).toContain("a.status = 'completed'");
        expect(sql).toContain("uc.unit_id = ?");
    });
});
