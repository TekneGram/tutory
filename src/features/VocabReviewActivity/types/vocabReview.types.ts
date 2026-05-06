import type {
  VocabReviewLearnerWordStateDto,
  VocabReviewWordDto,
} from "@/app/ports/activities/vocabreview.ports";

export type CardMode = "initial" | "selected" | "correct" | "incorrect";

export type VocabReviewWordWithState = {
  word: VocabReviewWordDto;
  state: VocabReviewLearnerWordStateDto;
};
