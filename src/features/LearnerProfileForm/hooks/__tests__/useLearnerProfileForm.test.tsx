import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLearnerProfileForm } from "../useLearnerProfileForm";

const {
  useLearnerProfileQueryMock,
  useUpsertLearnerProfileMutationMock,
} = vi.hoisted(() => ({
  useLearnerProfileQueryMock: vi.fn(),
  useUpsertLearnerProfileMutationMock: vi.fn(),
}));

vi.mock("../useLearnerProfileQuery", () => ({
  useLearnerProfileQuery: useLearnerProfileQueryMock,
}));

vi.mock("../useUpsertLearnerProfileMutation", () => ({
  useUpsertLearnerProfileMutation: useUpsertLearnerProfileMutationMock,
}));

describe("useLearnerProfileForm", () => {
  beforeEach(() => {
    useLearnerProfileQueryMock.mockReset();
    useUpsertLearnerProfileMutationMock.mockReset();
  });

  it("prefills edit mode values and submits the upsert payload", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      learnerId: "learner-1",
      name: "Ada",
      avatarId: "girl_1.webp",
      currentStatus: "focused",
    });

    useLearnerProfileQueryMock.mockReturnValue({
      data: {
        learnerId: "learner-1",
        name: "Ada",
        avatarId: "girl_1.webp",
        currentStatus: "focused",
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    useUpsertLearnerProfileMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    const onSubmitted = vi.fn();
    const { result } = renderHook(() =>
      useLearnerProfileForm({
        mode: "edit",
        learnerId: "learner-1",
        onSubmitted,
      })
    );

    await waitFor(() => {
      expect(result.current.name).toBe("Ada");
    });

    expect(result.current.currentStatusText).toBe("focused");
    expect(result.current.submitLabel).toBe("Save profile");
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as never);
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      learnerId: "learner-1",
      name: "Ada",
      avatarId: "girl_1.webp",
      statusText: "focused",
    });
    expect(onSubmitted).toHaveBeenCalledWith("learner-1");
  });

  it("keeps create mode blank and labels the submit button accordingly", () => {
    useLearnerProfileQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    });

    useUpsertLearnerProfileMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useLearnerProfileForm({
        mode: "create",
        onSubmitted: vi.fn(),
      })
    );

    expect(result.current.name).toBe("");
    expect(result.current.avatarId).toBeNull();
    expect(result.current.statusText).toBe("");
    expect(result.current.currentStatusText).toBe("");
    expect(result.current.submitLabel).toBe("Create profile");
    expect(result.current.isLoading).toBe(false);
  });
});
