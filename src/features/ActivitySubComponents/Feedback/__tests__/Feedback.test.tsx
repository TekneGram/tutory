import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Feedback from "../Feedback";

describe("Feedback", () => {
  const feedback = {
    question: "Was it easy or tough?",
    answers: ["🥰", "👌", "😓"] as [string, string, string],
    comment: "",
  };

  afterEach(() => {
    cleanup();
  });

  it("allows selecting a single answer", () => {
    render(<Feedback feedback={feedback} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("🥰"));
    expect((screen.getByLabelText("🥰") as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByLabelText("😓"));
    expect((screen.getByLabelText("🥰") as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText("😓") as HTMLInputElement).checked).toBe(true);
  });

  it("lets the user edit the comment", () => {
    render(<Feedback feedback={feedback} onSubmit={vi.fn()} />);

    const commentBox = screen.getByLabelText("Comment");
    fireEvent.change(commentBox, { target: { value: "It was manageable." } });

    expect((commentBox as HTMLTextAreaElement).value).toBe("It was manageable.");
  });

  it("submits the selected answer and comment", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<Feedback feedback={feedback} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByLabelText("👌"));
    fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Good pacing." } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenCalledWith({
      selectedAnswer: "👌",
      comment: "Good pacing.",
    });
  });
});
