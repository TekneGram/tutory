import { describe, expect, it } from "vitest";

import { getCycleProgressSchema, listUnitCyclesSchema } from "../cycles.schemas";

describe("cycles schemas", () => {
    it("accepts a unit id for listUnitCycles", () => {
        expect(listUnitCyclesSchema.parse({ unitId: "unit-1" })).toEqual({
            unitId: "unit-1",
        });
    });

    it("rejects extra keys for listUnitCycles", () => {
        expect(() =>
            listUnitCyclesSchema.parse({ unitId: "unit-1", extra: true })
        ).toThrow();
    });

    it("accepts learner and cycle ids for getCycleProgress", () => {
        expect(
            getCycleProgressSchema.parse({
                learnerId: "learner-1",
                unitCycleId: "cycle-1",
            })
        ).toEqual({
            learnerId: "learner-1",
            unitCycleId: "cycle-1",
        });
    });

    it("rejects blank ids for getCycleProgress", () => {
        expect(() =>
            getCycleProgressSchema.parse({
                learnerId: "",
                unitCycleId: "cycle-1",
            })
        ).toThrow();
    });
});
