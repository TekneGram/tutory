import type {
  ObserveAnswerRow,
  ObserveCategoryRow,
  ObserveWordRow,
} from "@electron/db/repositories/activity.observeRepositories";
import type {
  ObserveCategoryDto,
  ObserveImageRefDto,
  ObserveLearnerWordStateDto,
  ObserveProgressDto,
  ObserveWordDto,
} from "./observeTypes";

export function toObserveWordDtos(rows: ObserveWordRow[]): ObserveWordDto[] {
  return rows.map((row) => ({
    wordId: row.id,
    word: row.word_text,
    order: row.word_order,
  }));
}

export function toObserveCategoryDtos(rows: ObserveCategoryRow[]): ObserveCategoryDto[] {
  return rows.map((row) => ({
    categoryId: row.id,
    category: row.category_text,
    order: row.category_order,
  }));
}

export function toObserveLearnerWordStateDtos(
  words: ObserveWordRow[],
  answers: ObserveAnswerRow[],
): ObserveLearnerWordStateDto[] {
  const answerByWordId = new Map(answers.map((answer) => [answer.word_id, answer]));

  return words.map((word) => {
    const answer = answerByWordId.get(word.id);

    return {
      wordId: word.id,
      selectedCategoryId: answer?.selected_category_id ?? null,
      isPlaced: Boolean(answer?.is_placed ?? 0),
      isCorrect: Boolean(answer?.is_correct ?? 0),
      checkedAt: answer?.checked_at ?? null,
    };
  });
}

export function toObserveProgressDto(progress: {
  placedCount: number;
  correctCount: number;
  totalCount: number;
  isFinished: boolean;
  completedAt: string | null;
}): ObserveProgressDto {
  return {
    placedCount: progress.placedCount,
    correctCount: progress.correctCount,
    totalCount: progress.totalCount,
    isFinished: progress.isFinished,
    completedAt: progress.completedAt,
  };
}

export function toObserveImageRefDtos(imageRefsJson: string): ObserveImageRefDto[] {
  let parsed: unknown = [];

  try {
    parsed = JSON.parse(imageRefsJson);
  } catch {
    parsed = [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const rawOrder = (item as { order?: unknown }).order;
      const rawImageRef = (item as { imageRef?: unknown }).imageRef;
      const order = typeof rawOrder === "number" ? rawOrder : Number(rawOrder);

      if (!Number.isFinite(order) || typeof rawImageRef !== "string" || rawImageRef.trim().length === 0) {
        return null;
      }

      return {
        order,
        imageRef: rawImageRef,
      };
    })
    .filter((item): item is ObserveImageRefDto => item !== null)
    .sort((left, right) => left.order - right.order);
}
