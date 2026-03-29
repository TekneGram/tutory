import { describe, expect, it } from "vitest";
import { navigationReducer } from "../navigation-state";

describe("navigationReducer", () => {
  it("navigates to create profile mode", () => {
    expect(
      navigationReducer({ kind: "home" }, { type: "go-profile-create" })
    ).toEqual({
      kind: "profile",
      mode: "create",
    });
  });

  it("carries learnerId into profile edit mode", () => {
    expect(
      navigationReducer({ kind: "home" }, { type: "go-profile-edit", learnerId: "learner-1" })
    ).toEqual({
      kind: "profile",
      mode: "edit",
      learnerId: "learner-1",
    });
  });

  it("carries learnerId into learning entry and child learning screens", () => {
    expect(
      navigationReducer({ kind: "home" }, { type: "go-learning-entry", learnerId: "learner-2" })
    ).toEqual({
      kind: "learning-entry",
      learnerId: "learner-2",
    });

    expect(
      navigationReducer({ kind: "home" }, { type: "go-english-main", learnerId: "learner-3" })
    ).toEqual({
      kind: "english-main",
      learnerId: "learner-3",
    });

    expect(
      navigationReducer({ kind: "home" }, { type: "go-mathematics-main", learnerId: "learner-4" })
    ).toEqual({
      kind: "mathematics-main",
      learnerId: "learner-4",
    });
  });
});
