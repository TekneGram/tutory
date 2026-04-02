import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { queryAll, queryOne } from "../../sqlite";
import {
    getUnitCycleIdentityRowById,
    listUnitCycleActivityRowsByUnitCycleId,
} from "../activityRepositories";

vi.mock("../../sqlite", () => ({
    queryAll: vi.fn(),
    queryOne: vi.fn(),
}));

describe("activityRepositories", () => {
    it("loads a cycle identity by id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getUnitCycleIdentityRowById({} as SqliteDatabase, "cycle-1");

        expect(queryOne).toHaveBeenCalledTimes(1);
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("WHERE uc.id = ?");
        expect(vi.mocked(queryOne).mock.calls[0][1]).toContain("uc.unit_id AS unit_id");
    });

    it("lists unit cycle activities ordered by activity order", () => {
        vi.mocked(queryAll).mockReturnValue([]);

        listUnitCycleActivityRowsByUnitCycleId({} as SqliteDatabase, "cycle-1");

        expect(queryAll).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(queryAll).mock.calls[0][1];
        expect(sql).toContain("FROM unit_cycle_activities uca");
        expect(sql).toContain("INNER JOIN cycle_type_activities cta");
        expect(sql).toContain("INNER JOIN activity_types at");
        expect(sql).toContain("at.name AS activity_type");
        expect(sql).toContain("uca.title AS title");
        expect(sql).toContain("ORDER BY uca.activity_order ASC");
        expect(vi.mocked(queryAll).mock.calls[0][2]).toEqual(["cycle-1"]);
    });
});
