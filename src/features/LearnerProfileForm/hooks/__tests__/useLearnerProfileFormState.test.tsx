import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLearnerProfileFormState } from "../useLearnerProfileFormState";

describe("useLearnerProfileFormState", () => {
  it("tracks local values, canSubmit, prefill, and reset", () => {
    const { result } = renderHook(() => useLearnerProfileFormState());

    expect(result.current.name).toBe("");
    expect(result.current.avatarId).toBeNull();
    expect(result.current.statusText).toBe("");
    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.setName("Ada");
      result.current.setAvatarId("girl_1.webp");
      result.current.setStatusText("focused");
    });

    expect(result.current.name).toBe("Ada");
    expect(result.current.avatarId).toBe("girl_1.webp");
    expect(result.current.statusText).toBe("focused");
    expect(result.current.canSubmit).toBe(true);

    act(() => {
      result.current.prefillForm({
        name: "Bea",
        avatarId: null,
        statusText: "ready",
      });
    });

    expect(result.current.name).toBe("Bea");
    expect(result.current.avatarId).toBeNull();
    expect(result.current.statusText).toBe("ready");

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.name).toBe("");
    expect(result.current.avatarId).toBeNull();
    expect(result.current.statusText).toBe("");
    expect(result.current.canSubmit).toBe(false);
  });
});
