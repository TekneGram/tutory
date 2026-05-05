import { describe, expectTypeOf, it } from "vitest";
import type {
  CheckMultiChoiceQuizAnswersRequest as FrontCheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse as FrontCheckMultiChoiceQuizAnswersResponse,
  RetryMultiChoiceQuizRequest as FrontRetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse as FrontRetryMultiChoiceQuizResponse,
} from "../activities.ports";
import type {
  CheckMultiChoiceQuizAnswersRequest as IpcCheckMultiChoiceQuizAnswersRequest,
  CheckMultiChoiceQuizAnswersResponse as IpcCheckMultiChoiceQuizAnswersResponse,
  RetryMultiChoiceQuizRequest as IpcRetryMultiChoiceQuizRequest,
  RetryMultiChoiceQuizResponse as IpcRetryMultiChoiceQuizResponse,
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
});
