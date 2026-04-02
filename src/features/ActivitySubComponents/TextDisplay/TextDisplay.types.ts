export type StoryPassagePageDto = {
  order: number;
  text: string;
};

export type StoryWordDto = {
  word: string;
  japanese: string;
  position: number;
};

export type TokenKind = "word" | "punctuation" | "space";

export type StoryToken = {
  token: string;
  position: number;
  kind: TokenKind;
};

export type PageTokenDto = {
  token: string;
  position: number;
  wordData?: StoryWordDto;
};

export type VocabPageDto = {
  page: number;
  words: PageTokenDto[];
};

export type TextDisplayProps = {
  passage: {
    pages: StoryPassagePageDto[];
  };
  words: StoryWordDto[];
};
