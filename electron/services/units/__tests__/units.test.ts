import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getLearnerRowById } from "@electron/db/repositories/learnerRepositories";
import {
    getUnitProgressCountsRow,
    getUnitRowById,
    listUnitRowsByLearningType,
} from "@electron/db/repositories/unitRepositories";

import { getUnitProgress } from "../getUnitProgress";
import { listLearningUnits } from "../listLearningUnits";

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

vi.mock("@electron/db/repositories/unitRepositories", () => ({
    listUnitRowsByLearningType: vi.fn(),
    getUnitRowById: vi.fn(),
    getUnitProgressCountsRow: vi.fn(),
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

describe("units services", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createAppDatabase).mockReturnValue({
            db: {},
            close: vi.fn(),
        } as unknown as ReturnType<typeof createAppDatabase>);
    });

    it("maps learning unit rows in listLearningUnits", async () => {
        vi.mocked(listUnitRowsByLearningType).mockReturnValue([
            {
                unit_id: "unit-1",
                title: "Pets",
                description: "Learn about pets",
                asset_base: "english/unit_1/icons",
                icon_path: "unit_icon.webp",
                sort_order: 2,
                learning_type: "english",
            },
            {
                unit_id: "unit-2",
                title: "Animals",
                description: null,
                asset_base: null,
                icon_path: null,
                sort_order: 5,
                learning_type: "mathematics",
            },
        ]);

        await expect(
            listLearningUnits(
                {
                    learningType: "english",
                },
                makeContext("ctx-1")
            )
        ).resolves.toEqual({
            units: [
                {
                    unitId: "unit-1",
                    title: "Pets",
                    description: "Learn about pets",
                    iconPath: "app-asset://content/english/unit_1/icons/unit_icon.webp",
                    sortOrder: 2,
                    learningType: "english",
                },
                {
                    unitId: "unit-2",
                    title: "Animals",
                    description: null,
                    iconPath: null,
                    sortOrder: 5,
                    learningType: "mathematics",
                },
            ],
        });
    });

    it("computes hover progress from repository counts", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue({
            learner_id: "learner-1",
            name: "Ava",
            avatar_id: null,
            current_status: "ready",
        });
        vi.mocked(getUnitRowById).mockReturnValue({
            unit_id: "unit-1",
            title: "Pets",
            learning_type: "english",
        });
        vi.mocked(getUnitProgressCountsRow).mockReturnValue({
            total_activities: 12,
            started_activities: 3,
            completed_activities: 3,
        });

        await expect(
            getUnitProgress(
                {
                    learnerId: "learner-1",
                    unitId: "unit-1",
                },
                makeContext("ctx-2")
            )
        ).resolves.toEqual({
            unit: {
                unitId: "unit-1",
                title: "Pets",
            },
            progress: {
                learnerId: "learner-1",
                unitId: "unit-1",
                totalActivities: 12,
                startedActivities: 3,
                completedActivities: 3,
                notStartedActivities: 9,
                completionPercent: 25,
            },
        });
    });

    it("returns zero completion for empty units", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue({
            learner_id: "learner-1",
            name: "Ava",
            avatar_id: null,
            current_status: "ready",
        });
        vi.mocked(getUnitRowById).mockReturnValue({
            unit_id: "unit-empty",
            title: "Empty Unit",
            learning_type: "mathematics",
        });
        vi.mocked(getUnitProgressCountsRow).mockReturnValue({
            total_activities: 0,
            started_activities: 0,
            completed_activities: 0,
        });

        await expect(
            getUnitProgress(
                {
                    learnerId: "learner-1",
                    unitId: "unit-empty",
                },
                makeContext("ctx-3")
            )
        ).resolves.toEqual({
            unit: {
                unitId: "unit-empty",
                title: "Empty Unit",
            },
            progress: {
                learnerId: "learner-1",
                unitId: "unit-empty",
                totalActivities: 0,
                startedActivities: 0,
                completedActivities: 0,
                notStartedActivities: 0,
                completionPercent: 0,
            },
        });
    });
});
