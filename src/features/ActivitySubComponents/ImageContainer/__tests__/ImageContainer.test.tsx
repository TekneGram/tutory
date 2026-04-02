import { cleanup, act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ImageContainer from "../ImageContainer";

describe("ImageContainer", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("sorts image refs by order before rendering", () => {
    render(
      <ImageContainer
        assetBase="english/unit_1/cycle_1"
        imageRefs={[
          { order: 2, imageRef: "second.webp" },
          { order: 1, imageRef: "first.webp" },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Story image 1" }).getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/first.webp",
    );
    expect(screen.getByText("1 of 2")).toBeTruthy();
  });

  it("navigates with the arrow controls", () => {
    render(
      <ImageContainer
        assetBase="english/unit_1/cycle_1"
        imageRefs={[
          { order: 1, imageRef: "first.webp" },
          { order: 2, imageRef: "second.webp" },
          { order: 3, imageRef: "third.webp" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));

    expect(screen.getByRole("img", { name: "Story image 2" }).getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/second.webp",
    );
    expect(screen.getByText("2 of 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Previous image" }));

    expect(screen.getByRole("img", { name: "Story image 1" }).getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/first.webp",
    );
  });

  it("auto-scrolls every 3 seconds when enabled", () => {
    vi.useFakeTimers();

    render(
      <ImageContainer
        autoScroll
        assetBase="english/unit_1/cycle_1"
        imageRefs={[
          { order: 1, imageRef: "first.webp" },
          { order: 2, imageRef: "second.webp" },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Story image 1" }).getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/first.webp",
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole("img", { name: "Story image 2" }).getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/second.webp",
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole("img", { name: "Story image 1" }).getAttribute("src")).toBe(
      "app-asset://content/english/unit_1/cycle_1/first.webp",
    );
  });
});
