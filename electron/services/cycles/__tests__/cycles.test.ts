import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getLearnerRowById } from "@electron/db/repositories/learnerRepositories";
import {
    getCycleProgressCountsRow,
    getUnitCycleIdentityRowById,
    getUnitIdentityForCyclesRowById,
    listUnitCycleRowsByUnitId,
} from "@electron/db/repositories/cycleRepositories";

import { getCycleProgress } from "../getCycleProgress";
import { listUnitCycles } from "../listUnitCycles";

function makeContext(correlationId: string): RequestContext {
    return {
        correlationId,
        sendEvent: vi.fn() as RequestContext["sendEvent"],
    };
}

vi.mock("@electron/db/appDatabase", () => ({
    createAppDatabase: vi.fn(),
}));

vi.mock("@electron/db/repositories/learnerRepositories", () => ({
    getLearnerRowById: vi.fn(),
}));

vi.mock("@electron/db/repositories/cycleRepositories", () => ({
    listUnitCycleRowsByUnitId: vi.fn(),
    getUnitIdentityForCyclesRowById: vi.fn(),
    getUnitCycleIdentityRowById: vi.fn(),
    getCycleProgressCountsRow: vi.fn(),
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

describe("cycle services", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createAppDatabase).mockReturnValue({
            db: {},
            close: vi.fn(),
        } as unknown as ReturnType<typeof createAppDatabase>);
    });

    it("maps cycle rows in listUnitCycles", async () => {
        vi.mocked(getUnitIdentityForCyclesRowById).mockReturnValue({
            unit_id: "unit-1",
            title: "Pets",
            learning_type: "english",
        });
        vi.mocked(listUnitCycleRowsByUnitId).mockReturnValue([
            {
                unit_cycle_id: "cycle-1",
                unit_id: "unit-1",
                cycle_type_id: 7,
                title: "Fau-Chan's Bad Day",
                description: "Study what happens when your pet gets sick.",
                asset_base: "english/unit_1/icons",
                icon_path: "cycle_1_icon.webp",
                sort_order: 0,
                total_activities: 4,
            },
        ]);

        await expect(listUnitCycles({ unitId: "unit-1" }, makeContext("ctx-1"))).resolves.toEqual({
            unit: {
                unitId: "unit-1",
                title: "Pets",
                learningType: "english",
            },
            cycles: [
                {
                    unitCycleId: "cycle-1",
                    unitId: "unit-1",
                    cycleTypeId: 7,
                    title: "Fau-Chan's Bad Day",
                    description: "Study what happens when your pet gets sick.",
                    iconPath: "app-asset://content/english/unit_1/icons/cycle_1_icon.webp",
                    sortOrder: 0,
                    totalActivities: 4,
                },
            ],
        });
    });

    it("throws when the unit for listUnitCycles is missing", async () => {
        vi.mocked(getUnitIdentityForCyclesRowById).mockReturnValue(undefined);

        await expect(listUnitCycles({ unitId: "missing" }, makeContext("ctx-2"))).rejects.toMatchObject({
            code: "RESOURCE_NOT_FOUND",
            message: 'Unit "missing" was not found.',
        });
    });

    it("computes cycle progress from repository counts", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue({
            learner_id: "learner-1",
            name: "Ava",
            avatar_id: null,
            current_status: "ready",
        });
        vi.mocked(getUnitCycleIdentityRowById).mockReturnValue({
            unit_cycle_id: "cycle-1",
            unit_id: "unit-1",
            title: "Fau-Chan's Bad Day",
        });
        vi.mocked(getCycleProgressCountsRow).mockReturnValue({
            total_activities: 12,
            started_activities: 3,
            completed_activities: 3,
        });

        await expect(
            getCycleProgress(
                {
                    learnerId: "learner-1",
                    unitCycleId: "cycle-1",
                },
                makeContext("ctx-3")
            )
        ).resolves.toEqual({
            cycle: {
                unitCycleId: "cycle-1",
                unitId: "unit-1",
                title: "Fau-Chan's Bad Day",
            },
            progress: {
                learnerId: "learner-1",
                unitCycleId: "cycle-1",
                totalActivities: 12,
                startedActivities: 3,
                completedActivities: 3,
                notStartedActivities: 9,
                completionPercent: 25,
            },
        });
    });

    it("returns zero completion for empty cycles", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue({
            learner_id: "learner-1",
            name: "Ava",
            avatar_id: null,
            current_status: "ready",
        });
        vi.mocked(getUnitCycleIdentityRowById).mockReturnValue({
            unit_cycle_id: "cycle-empty",
            unit_id: "unit-1",
            title: "Empty Cycle",
        });
        vi.mocked(getCycleProgressCountsRow).mockReturnValue({
            total_activities: 0,
            started_activities: 0,
            completed_activities: 0,
        });

        await expect(
            getCycleProgress(
                {
                    learnerId: "learner-1",
                    unitCycleId: "cycle-empty",
                },
                makeContext("ctx-4")
            )
        ).resolves.toEqual({
            cycle: {
                unitCycleId: "cycle-empty",
                unitId: "unit-1",
                title: "Empty Cycle",
            },
            progress: {
                learnerId: "learner-1",
                unitCycleId: "cycle-empty",
                totalActivities: 0,
                startedActivities: 0,
                completedActivities: 0,
                notStartedActivities: 0,
                completionPercent: 0,
            },
        });
    });

    it("throws when the learner for cycle progress is missing", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue(undefined);

        await expect(
            getCycleProgress(
                {
                    learnerId: "missing-learner",
                    unitCycleId: "cycle-1",
                },
                makeContext("ctx-5")
            )
        ).rejects.toMatchObject({
            code: "RESOURCE_NOT_FOUND",
            message: 'Learner "missing-learner" was not found.',
        });
    });
});
