import type {
  StoryPassagePageDto,
  StoryToken,
  StoryWordDto,
  VocabPageDto,
} from "./TextDisplay.types";

const TOKEN_PATTERN =
  /[\p{L}\p{N}]+|\s|[^\s\p{L}\p{N}]/gu;

const WORD_PATTERN = /^[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*$/u;

export function tokenizeStoryText(text: string): StoryToken[] {
  return Array.from(text.matchAll(TOKEN_PATTERN)).map((match, position) => {
    const token = match[0];

    return {
      token,
      position,
      kind: token.trim().length === 0 ? "space" : WORD_PATTERN.test(token) ? "word" : "punctuation",
    };
  });
}

export function buildVocabPages(
  pages: StoryPassagePageDto[],
  words: StoryWordDto[],
): VocabPageDto[] {
  const sortedPages = [...pages].sort((left, right) => left.order - right.order);
  const wordsByPosition = new Map<number, StoryWordDto>();

  for (const word of words) {
    if (!wordsByPosition.has(word.position)) {
      wordsByPosition.set(word.position, word);
    }
  }

  let pageOffset = 0;

  return sortedPages.map((page, index) => {
    const tokens = tokenizeStoryText(page.text);

    const pageTokens = tokens.map((token) => {
      const absolutePosition = pageOffset + token.position;
      const wordData =
        token.kind === "word" ? wordsByPosition.get(absolutePosition) : undefined;

      return {
        token: token.token,
        position: absolutePosition,
        wordData,
      };
    });

    pageOffset += tokens.length + (index < sortedPages.length - 1 ? 1 : 0);

    return {
      page: page.order,
      words: pageTokens,
    };
  });
}
