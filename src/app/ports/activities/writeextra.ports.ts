import type { AudioRef } from "@/app/types/media";

export type WriteExtraImageRefDto = {
  order: number;
  imageRef: string;
};

export type WriteExtraAudioRefDto = AudioRef;

export type GetWriteExtraActivityRequest = {
  learnerId: string;
  unitCycleActivityId: string;
};

export type GetWriteExtraActivityResponse = {
  writeExtra: {
    instructions: string;
    advice: string;
    title: string;
    assetBase: string | null;
    assets: {
      imageRefs: WriteExtraImageRefDto[];
      audioRefs: WriteExtraAudioRefDto[];
    };
    storyText: string;
    learnerText: string;
    completion: {
      isCompleted: boolean;
    };
  };
};

export type SubmitWriteExtraRequest = {
  learnerId: string;
  unitCycleActivityId: string;
  learnerText: string;
};

export type SubmitWriteExtraResponse = {
  completion: {
    isCompleted: true;
  };
};

export type ResumeWriteExtraRequest = {
  learnerId: string;
  unitCycleActivityId: string;
};

export type ResumeWriteExtraResponse = {
  completion: {
    isCompleted: false;
  };
};
