import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TextDisplay from "../TextDisplay";
import { buildVocabPages, tokenizeStoryText } from "../TextDisplay.utils";
import WordCard from "../WordCard";

afterEach(() => {
  cleanup();
});

describe("tokenizeStoryText", () => {
  it("splits words, spaces, and punctuation with stable positions", () => {
    const tokens = tokenizeStoryText("Fau-chan would not eat.");

    expect(
      tokens.map(({ token, position }) => `${token}:${position}`),
    ).toEqual([
      "Fau:0",
      "-:1",
      "chan:2",
      " :3",
      "would:4",
      " :5",
      "not:6",
      " :7",
      "eat:8",
      ".:9",
    ]);
  });
});

describe("buildVocabPages", () => {
  it("maps vocab entries to the matching global token position across pages", () => {
    const pages = buildVocabPages(
      [
        { order: 1, text: "This is a story." },
        { order: 2, text: "Here it is." },
      ],
      [
        { word: "story", japanese: "物語", position: 6 },
        { word: "Here", japanese: "ここ", position: 9 },
      ],
    );

    expect(pages).toHaveLength(2);
    expect(
      pages[0].words.find(({ token }) => token === "story")?.wordData,
    ).toEqual({
      word: "story",
      japanese: "物語",
      position: 6,
    });
    expect(
      pages[1].words.find(({ token }) => token === "Here")?.wordData,
    ).toEqual({
      word: "Here",
      japanese: "ここ",
      position: 9,
    });
    expect(
      pages[1].words.find(({ token }) => token === "it")?.wordData,
    ).toBeUndefined();
  });

  it("keeps page offsets aligned with token counts rather than character counts", () => {
    const pages = buildVocabPages(
      [
        { order: 1, text: "Fau-chan would not eat." },
        { order: 2, text: "He lay." },
      ],
      [{ word: "He", japanese: "彼", position: 11 }],
    );

    expect(pages[1].words.find(({ token }) => token === "He")?.position).toBe(11);
  });
});

describe("TextDisplay", () => {
  it("renders pages as tabs and switches the active page", () => {
    render(
      <TextDisplay
        passage={{
          pages: [
            { order: 1, text: "This is a story." },
            { order: 2, text: "Here it is." },
          ],
        }}
        words={[
          { word: "story", japanese: "物語", position: 6 },
          { word: "Here", japanese: "ここ", position: 9 },
        ]}
      />,
    );

    const pageOneTab = screen.getByRole("tab", { name: "Page 1" });
    const pageTwoTab = screen.getByRole("tab", { name: "Page 2" });

    expect(screen.getByRole("tabpanel", { name: "Page 1" })).toBeTruthy();
    expect(
      within(screen.getByRole("tabpanel", { name: "Page 1" })).getByText("This"),
    ).toBeTruthy();

    fireEvent.click(pageTwoTab);

    expect(screen.getByRole("tabpanel", { name: "Page 2" })).toBeTruthy();
    expect(
      within(screen.getByRole("tabpanel", { name: "Page 2" })).getByText("Here"),
    ).toBeTruthy();
    expect(screen.queryByRole("tabpanel", { name: "Page 1" })).toBeNull();
    expect(pageOneTab.getAttribute("aria-selected")).toBe("false");
    expect(pageTwoTab.getAttribute("aria-selected")).toBe("true");
  });

  it("renders a word card for matching vocab entries", () => {
    render(
      <TextDisplay
        passage={{
          pages: [{ order: 1, text: "This is a story." }],
        }}
        words={[{ word: "story", japanese: "物語", position: 6 }]}
      />,
    );

    expect(screen.getByRole("button", { name: "story" })).toBeTruthy();
  });
});

describe("WordCard", () => {
  it("flips between the token and the Japanese meaning", () => {
    render(<WordCard token="story" japanese="物語" />);

    const card = screen.getByRole("button", { name: "story" });

    expect(screen.getByText("story")).toBeTruthy();
    expect(card.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(card);

    expect(screen.getByRole("button", { name: "物語" })).toBeTruthy();
    expect(card.getAttribute("aria-pressed")).toBe("true");
  });
});
