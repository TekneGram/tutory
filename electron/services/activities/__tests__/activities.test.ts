import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getUnitCycleIdentityRowById,
    listUnitCycleActivityRowsByUnitCycleId,
} from "@electron/db/repositories/activityRepositories";

import { listUnitCycleActivities } from "../listUnitCycleActivities";

function makeContext(correlationId: string): RequestContext {
    return {
        correlationId,
        sendEvent: vi.fn() as RequestContext["sendEvent"],
    };
}

vi.mock("@electron/db/appDatabase", () => ({
    createAppDatabase: vi.fn(),
}));

vi.mock("@electron/db/repositories/activityRepositories", () => ({
    getUnitCycleIdentityRowById: vi.fn(),
    listUnitCycleActivityRowsByUnitCycleId: vi.fn(),
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
    getRuntimeDbPath: vi.fn(() => "/tmp/app.sqlite"),
}));

vi.mock("@electron/utilities/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("activity services", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createAppDatabase).mockReturnValue({
            db: {},
            close: vi.fn(),
        } as unknown as ReturnType<typeof createAppDatabase>);
    });

    it("returns a cycle and ordered activities", async () => {
        vi.mocked(getUnitCycleIdentityRowById).mockReturnValue({
            unit_cycle_id: "cycle-1",
            unit_id: "unit-1",
            title: "Fau-Chan's Bad Day",
        });
        vi.mocked(listUnitCycleActivityRowsByUnitCycleId).mockReturnValue([
            {
                unit_cycle_activity_id: "activity-1",
                unit_cycle_id: "cycle-1",
                activity_type: "story",
                title: "Story",
                activity_order: 1,
                is_required: 1,
            },
            {
                unit_cycle_activity_id: "activity-2",
                unit_cycle_id: "cycle-1",
                activity_type: "multi-choice-quiz",
                title: "Quiz",
                activity_order: 2,
                is_required: 0,
            },
        ]);

        await expect(
            listUnitCycleActivities({ unitCycleId: "cycle-1" }, makeContext("ctx-1"))
        ).resolves.toEqual({
            cycle: {
                unitCycleId: "cycle-1",
                unitId: "unit-1",
                title: "Fau-Chan's Bad Day",
            },
            activities: [
                {
                    unitCycleActivityId: "activity-1",
                    unitCycleId: "cycle-1",
                    activityType: "story",
                    title: "Story",
                    activityOrder: 1,
                    isRequired: true,
                },
                {
                    unitCycleActivityId: "activity-2",
                    unitCycleId: "cycle-1",
                    activityType: "multi-choice-quiz",
                    title: "Quiz",
                    activityOrder: 2,
                    isRequired: false,
                },
            ],
        });
    });

    it("falls back to a generated title when the stored title is blank", async () => {
        vi.mocked(getUnitCycleIdentityRowById).mockReturnValue({
            unit_cycle_id: "cycle-1",
            unit_id: "unit-1",
            title: "Fau-Chan's Bad Day",
        });
        vi.mocked(listUnitCycleActivityRowsByUnitCycleId).mockReturnValue([
            {
                unit_cycle_activity_id: "activity-1",
                unit_cycle_id: "cycle-1",
                activity_type: "story",
                title: "   ",
                activity_order: 1,
                is_required: 1,
            },
        ]);

        await expect(
            listUnitCycleActivities({ unitCycleId: "cycle-1" }, makeContext("ctx-2"))
        ).resolves.toEqual({
            cycle: {
                unitCycleId: "cycle-1",
                unitId: "unit-1",
                title: "Fau-Chan's Bad Day",
            },
            activities: [
                {
                    unitCycleActivityId: "activity-1",
                    unitCycleId: "cycle-1",
                    activityType: "story",
                    title: "Activity 1",
                    activityOrder: 1,
                    isRequired: true,
                },
            ],
        });
    });

    it("throws when the unit cycle is missing", async () => {
        vi.mocked(getUnitCycleIdentityRowById).mockReturnValue(undefined);

        await expect(
            listUnitCycleActivities({ unitCycleId: "missing" }, makeContext("ctx-3"))
        ).rejects.toMatchObject({
            code: "RESOURCE_NOT_FOUND",
            message: 'Unit cycle "missing" was not found.',
        });
    });
});
