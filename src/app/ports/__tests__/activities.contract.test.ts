import { describe, expectTypeOf, it } from "vitest";
import type {
  CheckMultiChoiceQuizAnswersRequest as FrontCheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse as FrontCheckMultiChoiceQuizAnswersResponse,
  CheckVocabReviewWordRequest as FrontCheckVocabReviewWordRequest,
  CheckVocabReviewWordResponse as FrontCheckVocabReviewWordResponse,
  GetVocabReviewActivityRequest as FrontGetVocabReviewActivityRequest,
  GetVocabReviewActivityResponse as FrontGetVocabReviewActivityResponse,
  ResetVocabReviewActivityRequest as FrontResetVocabReviewActivityRequest,
  ResetVocabReviewActivityResponse as FrontResetVocabReviewActivityResponse,
  RetryMultiChoiceQuizRequest as FrontRetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse as FrontRetryMultiChoiceQuizResponse,
  RetryVocabReviewWordRequest as FrontRetryVocabReviewWordRequest,
  RetryVocabReviewWordResponse as FrontRetryVocabReviewWordResponse,
} from "../activities.ports";
import type {
  CheckMultiChoiceQuizAnswersRequest as IpcCheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse as IpcCheckMultiChoiceQuizAnswersResponse,
  CheckVocabReviewWordRequest as IpcCheckVocabReviewWordRequest,
  CheckVocabReviewWordResponse as IpcCheckVocabReviewWordResponse,
  GetVocabReviewActivityRequest as IpcGetVocabReviewActivityRequest,
  GetVocabReviewActivityResponse as IpcGetVocabReviewActivityResponse,
  ResetVocabReviewActivityRequest as IpcResetVocabReviewActivityRequest,
  ResetVocabReviewActivityResponse as IpcResetVocabReviewActivityResponse,
  RetryMultiChoiceQuizRequest as IpcRetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse as IpcRetryMultiChoiceQuizResponse,
  RetryVocabReviewWordRequest as IpcRetryVocabReviewWordRequest,
  RetryVocabReviewWordResponse as IpcRetryVocabReviewWordResponse,
} from "../../../../electron/ipc/contracts/activities.contracts";

describe("activities boundary contracts", () => {
  it("keeps check multi choice quiz request DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontCheckMultiChoiceQuizAnswersRequest>().toEqualTypeOf<IpcCheckMultiChoiceQuizAnswersRequest>();
    expectTypeOf<IpcCheckMultiChoiceQuizAnswersRequest>().toEqualTypeOf<FrontCheckMultiChoiceQuizAnswersRequest>();
  });

  it("keeps check multi choice quiz response DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontCheckMultiChoiceQuizAnswersResponse>().toEqualTypeOf<IpcCheckMultiChoiceQuizAnswersResponse>();
    expectTypeOf<IpcCheckMultiChoiceQuizAnswersResponse>().toEqualTypeOf<FrontCheckMultiChoiceQuizAnswersResponse>();
  });

  it("keeps retry multi choice quiz DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontRetryMultiChoiceQuizRequest>().toEqualTypeOf<IpcRetryMultiChoiceQuizRequest>();
    expectTypeOf<IpcRetryMultiChoiceQuizRequest>().toEqualTypeOf<FrontRetryMultiChoiceQuizRequest>();
    expectTypeOf<FrontRetryMultiChoiceQuizResponse>().toEqualTypeOf<IpcRetryMultiChoiceQuizResponse>();
    expectTypeOf<IpcRetryMultiChoiceQuizResponse>().toEqualTypeOf<FrontRetryMultiChoiceQuizResponse>();
  });

  it("keeps get vocab review DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontGetVocabReviewActivityRequest>().toEqualTypeOf<IpcGetVocabReviewActivityRequest>();
    expectTypeOf<IpcGetVocabReviewActivityRequest>().toEqualTypeOf<FrontGetVocabReviewActivityRequest>();
    expectTypeOf<FrontGetVocabReviewActivityResponse>().toEqualTypeOf<IpcGetVocabReviewActivityResponse>();
    expectTypeOf<IpcGetVocabReviewActivityResponse>().toEqualTypeOf<FrontGetVocabReviewActivityResponse>();
  });

  it("keeps check vocab review word DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontCheckVocabReviewWordRequest>().toEqualTypeOf<IpcCheckVocabReviewWordRequest>();
    expectTypeOf<IpcCheckVocabReviewWordRequest>().toEqualTypeOf<FrontCheckVocabReviewWordRequest>();
    expectTypeOf<FrontCheckVocabReviewWordResponse>().toEqualTypeOf<IpcCheckVocabReviewWordResponse>();
    expectTypeOf<IpcCheckVocabReviewWordResponse>().toEqualTypeOf<FrontCheckVocabReviewWordResponse>();
  });

  it("keeps retry/reset vocab review DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontRetryVocabReviewWordRequest>().toEqualTypeOf<IpcRetryVocabReviewWordRequest>();
    expectTypeOf<IpcRetryVocabReviewWordRequest>().toEqualTypeOf<FrontRetryVocabReviewWordRequest>();
    expectTypeOf<FrontRetryVocabReviewWordResponse>().toEqualTypeOf<IpcRetryVocabReviewWordResponse>();
    expectTypeOf<IpcRetryVocabReviewWordResponse>().toEqualTypeOf<FrontRetryVocabReviewWordResponse>();
    expectTypeOf<FrontResetVocabReviewActivityRequest>().toEqualTypeOf<IpcResetVocabReviewActivityRequest>();
    expectTypeOf<IpcResetVocabReviewActivityRequest>().toEqualTypeOf<FrontResetVocabReviewActivityRequest>();
    expectTypeOf<FrontResetVocabReviewActivityResponse>().toEqualTypeOf<IpcResetVocabReviewActivityResponse>();
    expectTypeOf<IpcResetVocabReviewActivityResponse>().toEqualTypeOf<FrontResetVocabReviewActivityResponse>();
  });
});
