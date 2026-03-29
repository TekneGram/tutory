import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getLearnerRowById,
    insertLearner,
    insertLearnerStatus,
    listLearnerRows,
    updateLearner,
    updateLearnerStatus,
} from "@electron/db/repositories/learnerRepositories";

import { createLearnerProfile } from "../createLearnerProfile";
import { getLearnerProfile } from "../getLearnerProfile";
import { listLearners } from "../listLearners";
import { updateLearnerProfile } from "../updateLearnerProfile";

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
    listLearnerRows: vi.fn(),
    getLearnerRowById: vi.fn(),
    insertLearner: vi.fn(),
    insertLearnerStatus: vi.fn(),
    updateLearner: vi.fn(),
    updateLearnerStatus: vi.fn(),
}));

vi.mock("@electron/db/sqlite", () => ({
    runInTransaction: vi.fn((_, work) => work()),
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
    getRuntimeDbPath: vi.fn(() => "/tmp/app.sqlite"),
}));

vi.mock("node:crypto", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:crypto")>();

    return {
        ...actual,
        randomUUID: vi.fn(() => "learner-1"),
    };
});

vi.mock("@electron/utilities/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("learner services", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createAppDatabase).mockReturnValue({
            db: {},
            close: vi.fn(),
        } as unknown as ReturnType<typeof createAppDatabase>);
    });

    it("maps learner rows for listLearners", async () => {
        vi.mocked(listLearnerRows).mockReturnValue([
            {
                learner_id: "learner-1",
                name: "Ava",
                avatar_id: "avatar-a",
                current_status: "ready",
            },
        ]);

        await expect(listLearners(makeContext("ctx-1"))).resolves.toEqual({
            learners: [
                {
                    learnerId: "learner-1",
                    name: "Ava",
                    avatarId: "avatar-a",
                    currentStatus: "ready",
                },
            ],
        });
    });

    it("loads one learner profile", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue({
            learner_id: "learner-1",
            name: "Ava",
            avatar_id: null,
            current_status: "ready",
        });

        await expect(
            getLearnerProfile({ learnerId: "learner-1" }, makeContext("ctx-2"))
        ).resolves.toEqual({
            learner: {
                learnerId: "learner-1",
                name: "Ava",
                avatarId: null,
                currentStatus: "ready",
            },
        });
    });

    it("creates a learner profile in a transaction", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue({
            learner_id: "learner-1",
            name: "Ava",
            avatar_id: "avatar-a",
            current_status: "starting",
        });

        await expect(
            createLearnerProfile(
                { name: " Ava ", avatarId: "avatar-a", statusText: " starting " },
                makeContext("ctx-3")
            )
        ).resolves.toEqual({
            learner: {
                learnerId: "learner-1",
                name: "Ava",
                avatarId: "avatar-a",
                currentStatus: "starting",
            },
        });

        expect(insertLearner).toHaveBeenCalledTimes(1);
        expect(insertLearnerStatus).toHaveBeenCalledTimes(1);
    });

    it("updates a learner profile in a transaction", async () => {
        vi.mocked(getLearnerRowById).mockReturnValue({
            learner_id: "learner-1",
            name: "Ava New",
            avatar_id: null,
            current_status: "almost done",
        });

        await expect(
            updateLearnerProfile(
                {
                    learnerId: "learner-1",
                    name: " Ava New ",
                    avatarId: null,
                    statusText: " almost done ",
                },
                makeContext("ctx-4")
            )
        ).resolves.toEqual({
            learner: {
                learnerId: "learner-1",
                name: "Ava New",
                avatarId: null,
                currentStatus: "almost done",
            },
        });

        expect(updateLearner).toHaveBeenCalledTimes(1);
        expect(updateLearnerStatus).toHaveBeenCalledTimes(1);
    });
});
