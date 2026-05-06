import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WriteExtra from "../components/WriteExtra";

describe("WriteExtra", () => {
  afterEach(() => cleanup());

  it("hides submit below 25 words and shows it at 25 words", () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <WriteExtra
        value="one two three"
        isCompleted={false}
        isSubmitting={false}
        isResuming={false}
        submitError={null}
        onChange={onChange}
        onSubmit={vi.fn()}
        onResume={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
    expect(screen.getByText("Word count: 3")).toBeTruthy();

    rerender(
      <WriteExtra
        value="One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive"
        isCompleted={false}
        isSubmitting={false}
        isResuming={false}
        submitError={null}
        onChange={onChange}
        onSubmit={vi.fn()}
        onResume={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
    expect(screen.getByText("Word count: 25")).toBeTruthy();
  });

  it("shows completed view and continue writing action", () => {
    const onResume = vi.fn();

    render(
      <WriteExtra
        value="My completed story text"
        isCompleted
        isSubmitting={false}
        isResuming={false}
        submitError={null}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onResume={onResume}
      />,
    );

    expect(screen.getByText("Congratulations, you have completed this task.")).toBeTruthy();
    expect(screen.getByText("My completed story text")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continue writing" }));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("renders markdown formatting in completed view", () => {
    render(
      <WriteExtra
        value={"# Main Title\n## Subtitle\nHello **bold** and *italic* plus <u>underlined</u> text."}
        isCompleted
        isSubmitting={false}
        isResuming={false}
        submitError={null}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onResume={vi.fn()}
      />,
    );

    expect(screen.getByText("Main Title").tagName).toBe("H1");
    expect(screen.getByText("Subtitle").tagName).toBe("H2");
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
    expect(screen.getByText("underlined").tagName).toBe("U");
  });

  it("triggers submit callback", () => {
    const onSubmit = vi.fn();

    render(
      <WriteExtra
        value="One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive"
        isCompleted={false}
        isSubmitting={false}
        isResuming={false}
        submitError={null}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        onResume={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("inserts underline tags from toolbar action", () => {
    const onChange = vi.fn();
    render(
      <WriteExtra
        value="underlined text"
        isCompleted={false}
        isSubmitting={false}
        isResuming={false}
        submitError={null}
        onChange={onChange}
        onSubmit={vi.fn()}
        onResume={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write what happens next...") as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 10);
    fireEvent.click(screen.getByRole("button", { name: "Underline" }));

    expect(onChange).toHaveBeenCalledWith("<u>underlined</u> text");
  });
});
