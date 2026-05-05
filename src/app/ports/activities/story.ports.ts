export type StoryFeedbackDto = {
  question: string;
  answers: [string, string, string] | string[];
  comment: string;
};

export type StoryImageRefDto = {
  order: number;
  imageRef: string;
};

export type StoryAudioRefDto = {
  order: number;
  audioRef: string;
};

export type StoryVideoRefDto = {
  order: number;
  videoRef: string;
};

export type StoryPassagePageDto = {
  order: number;
  text: string;
};

export type StoryWordDto = {
  word: string;
  japanese: string;
  position: number;
};

export type GetStoryActivityRequest = {
  learnerId: string;
  unitCycleActivityId: string;
};

export type GetStoryActivityResponse = {
  story: {
    instructions: string;
    advice: string;
    title: string;
    assetBase: string | null;
    passage: {
      pages: StoryPassagePageDto[];
    };
    assets: {
      imageRefs: StoryImageRefDto[];
      audioRefs: StoryAudioRefDto[];
      videoRefs: StoryVideoRefDto[];
    };
    words: StoryWordDto[];
    feedback: StoryFeedbackDto;
    completion: {
      isCompleted: boolean;
    };
  };
};

export type SubmitStoryFeedbackRequest = {
  learnerId: string;
  unitCycleActivityId: string;
  selectedAnswer: string;
  comment: string;
};

export type SubmitStoryFeedbackResponse = {
  completion: {
    isCompleted: true;
  };
};
