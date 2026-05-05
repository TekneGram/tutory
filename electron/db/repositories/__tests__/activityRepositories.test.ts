import { describe, expect, it, vi } from "vitest";

import type { SqliteDatabase } from "../../sqlite";
import { executeRun, queryAll, queryOne } from "../../sqlite";
import {
    getMultiChoiceQuizOptionRowByIdAndQuestionId,
    getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId,
    getUnitCycleIdentityRowById,
    upsertMultiChoiceQuizAnswerRow,
    listUnitCycleActivityRowsByUnitCycleId,
} from "../activityRepositories";

vi.mock("../../sqlite", () => ({
    executeRun: vi.fn(),
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

    it("loads a quiz question by question id and owning activity id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getMultiChoiceQuizQuestionRowByIdAndUnitCycleActivityId(
            {} as SqliteDatabase,
            "question-1",
            "activity-1"
        );

        expect(queryOne).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(queryOne).mock.calls[0][1];
        expect(sql).toContain("FROM multichoicequiz_questions mq");
        expect(sql).toContain("INNER JOIN activity_content ac");
        expect(sql).toContain("ac.unit_cycle_activity_id = ?");
        expect(vi.mocked(queryOne).mock.calls[0][2]).toEqual(["question-1", "activity-1"]);
    });

    it("loads a quiz option by option id and question id", () => {
        vi.mocked(queryOne).mockReturnValue(undefined);

        getMultiChoiceQuizOptionRowByIdAndQuestionId(
            {} as SqliteDatabase,
            "option-1",
            "question-1"
        );

        expect(queryOne).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(queryOne).mock.calls[0][1];
        expect(sql).toContain("FROM multichoicequiz_options mo");
        expect(sql).toContain("mo.id = ?");
        expect(sql).toContain("mo.question_id = ?");
        expect(vi.mocked(queryOne).mock.calls[0][2]).toEqual(["option-1", "question-1"]);
    });

    it("upserts a multi choice quiz answer row by attempt and question", () => {
        upsertMultiChoiceQuizAnswerRow({} as SqliteDatabase, {
            attempt_id: "attempt-1",
            learner_id: "learner-1",
            unit_cycle_activity_id: "activity-1",
            question_id: "question-1",
            question: "What is 2 + 2?",
            is_answered: true,
            selected_option: "option-2",
            is_correct: true,
            created_at: "2026-05-05T00:00:00.000Z",
            updated_at: "2026-05-05T00:00:01.000Z",
        });

        expect(executeRun).toHaveBeenCalledTimes(1);
        const sql = vi.mocked(executeRun).mock.calls[0][1];
        expect(sql).toContain("INSERT INTO multi_choice_quiz_answers");
        expect(sql).toContain("ON CONFLICT(attempt_id, question_id) DO UPDATE SET");
        expect(sql).toContain("selected_option = excluded.selected_option");
    });
});
