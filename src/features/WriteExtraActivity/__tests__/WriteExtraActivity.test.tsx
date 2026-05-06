import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WriteExtraActivity from "../WriteExtraActivity";

const {
  writeExtraQueryMock,
  submitWriteExtraMutationMock,
  resumeWriteExtraMutationMock,
} = vi.hoisted(() => ({
  writeExtraQueryMock: vi.fn(),
  submitWriteExtraMutationMock: vi.fn(),
  resumeWriteExtraMutationMock: vi.fn(),
}));

vi.mock("../hooks/useWriteExtraActivityQuery", () => ({
  useWriteExtraActivityQuery: writeExtraQueryMock,
}));

vi.mock("../hooks/useSubmitWriteExtraMutation", () => ({
  useSubmitWriteExtraMutation: submitWriteExtraMutationMock,
}));

vi.mock("../hooks/useResumeWriteExtraMutation", () => ({
  useResumeWriteExtraMutation: resumeWriteExtraMutationMock,
}));

const response = {
  writeExtra: {
    instructions: "Read and write what happens next.",
    advice: "There is no wrong answer.",
    title: "Fau-chan's bad day - what happens next?",
    assetBase: "english/unit_1/cycle_1",
    assets: {
      imageRefs: [{ order: 1, imageRef: "caring_fau_chan.webp" }],
      audioRefs: [{ order: 1, audioRef: "cycle_1_summary.ogg" }],
    },
    storyText: "One afternoon, Fau-chan would not eat.",
    learnerText: "",
    completion: {
      isCompleted: false,
    },
  },
};

describe("WriteExtraActivity", () => {
  beforeEach(() => {
    writeExtraQueryMock.mockReset();
    submitWriteExtraMutationMock.mockReset();
    resumeWriteExtraMutationMock.mockReset();
  });

  afterEach(() => cleanup());

  it("renders loading, error, and success states", () => {
    submitWriteExtraMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    resumeWriteExtraMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    writeExtraQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null });
    const { rerender } = render(
      <WriteExtraActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Loading write extra activity...")).toBeTruthy();

    writeExtraQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Unable to load write extra."),
    });

    rerender(
      <WriteExtraActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByText("Unable to load write extra.")).toBeTruthy();

    writeExtraQueryMock.mockReturnValue({ data: response, isLoading: false, isError: false, error: null });

    rerender(
      <WriteExtraActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Fau-chan's bad day - what happens next?" })).toBeTruthy();
    expect(screen.getByText("Read and write what happens next.")).toBeTruthy();
  });

  it("submits when text reaches 25 words and shows completed state", async () => {
    const submitMutateAsync = vi.fn().mockResolvedValue({ completion: { isCompleted: true } });

    writeExtraQueryMock.mockReturnValue({ data: response, isLoading: false, isError: false, error: null });
    submitWriteExtraMutationMock.mockReturnValue({ mutateAsync: submitMutateAsync, isPending: false });
    resumeWriteExtraMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <WriteExtraActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Write what happens next..."), {
      target: {
        value:
          "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(submitMutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
        learnerText:
          "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive.",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Congratulations, you have completed this task.")).toBeTruthy();
    });
  });

  it("resumes writing from completed state", async () => {
    const resumeMutateAsync = vi.fn().mockResolvedValue({ completion: { isCompleted: false } });

    writeExtraQueryMock.mockReturnValue({
      data: {
        writeExtra: {
          ...response.writeExtra,
          learnerText: "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive.",
          completion: { isCompleted: true },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });
    submitWriteExtraMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    resumeWriteExtraMutationMock.mockReturnValue({ mutateAsync: resumeMutateAsync, isPending: false });

    render(
      <WriteExtraActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue writing" }));

    await waitFor(() => {
      expect(resumeMutateAsync).toHaveBeenCalledWith({
        learnerId: "learner-1",
        unitCycleActivityId: "activity-1",
      });
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Write what happens next...")).toBeTruthy();
    });
  });

  it("renders image and audio sources from assetBase", () => {
    writeExtraQueryMock.mockReturnValue({ data: response, isLoading: false, isError: false, error: null });
    submitWriteExtraMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    resumeWriteExtraMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(
      <WriteExtraActivity
        learnerId="learner-1"
        learningType="english"
        unitId="unit-1"
        unitCycleId="cycle-1"
        unitCycleActivityId="activity-1"
      />,
    );

    expect(screen.getByRole("img", { name: "Story image 1" }).getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/caring_fau_chan.webp",
    );
    expect(screen.getByText("1 of 1")).toBeTruthy();

    expect(screen.getByText("Listen to summary")).toBeTruthy();
    expect(screen.getByText("Listen to summary").nextElementSibling?.getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/cycle_1_summary.ogg",
    );
  });
});
