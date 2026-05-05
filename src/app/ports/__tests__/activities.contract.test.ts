import { describe, expectTypeOf, it } from "vitest";
import type {
  SubmitMultiChoiceQuizAnswerRequest as FrontSubmitMultiChoiceQuizAnswerRequest,
  SubmitMultiChoiceQuizAnswerResponse as FrontSubmitMultiChoiceQuizAnswerResponse,
} from "../activities.ports";
import type {
  SubmitMultiChoiceQuizAnswerRequest as IpcSubmitMultiChoiceQuizAnswerRequest,
  SubmitMultiChoiceQuizAnswerResponse as IpcSubmitMultiChoiceQuizAnswerResponse,
} from "../../../../electron/ipc/contracts/activities.contracts";

describe("activities boundary contracts", () => {
  it("keeps submit multi choice quiz request DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontSubmitMultiChoiceQuizAnswerRequest>().toEqualTypeOf<IpcSubmitMultiChoiceQuizAnswerRequest>();
    expectTypeOf<IpcSubmitMultiChoiceQuizAnswerRequest>().toEqualTypeOf<FrontSubmitMultiChoiceQuizAnswerRequest>();
  });

  it("keeps submit multi choice quiz response DTO parity across frontend and IPC boundaries", () => {
    expectTypeOf<FrontSubmitMultiChoiceQuizAnswerResponse>().toEqualTypeOf<IpcSubmitMultiChoiceQuizAnswerResponse>();
    expectTypeOf<IpcSubmitMultiChoiceQuizAnswerResponse>().toEqualTypeOf<FrontSubmitMultiChoiceQuizAnswerResponse>();
  });
});
