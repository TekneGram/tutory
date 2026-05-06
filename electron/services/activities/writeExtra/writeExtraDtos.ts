import { z } from "zod";
import type {
  WriteExtraAudioRefDto,
  WriteExtraImageRefDto,
} from "@electron/ipc/contracts/activities.contracts";

const writeExtraImageRefSchema = z
  .object({
    order: z.number(),
    imageRef: z.string(),
  })
  .strict();

const writeExtraAudioRefSchema = z
  .object({
    order: z.number(),
    audioRef: z.string(),
  })
  .strict();

export function toWriteExtraImageRefDtos(imageRefsJson: string): WriteExtraImageRefDto[] {
  const imageRefs = z.array(writeExtraImageRefSchema).parse(JSON.parse(imageRefsJson));

  return [...imageRefs]
    .sort((left, right) => left.order - right.order)
    .map((imageRef) => ({
      order: imageRef.order,
      imageRef: imageRef.imageRef,
    }));
}

export function toWriteExtraAudioRefDtos(audioRefsJson: string): WriteExtraAudioRefDto[] {
  const audioRefs = z.array(writeExtraAudioRefSchema).parse(JSON.parse(audioRefsJson));

  return [...audioRefs]
    .sort((left, right) => left.order - right.order)
    .map((audioRef) => ({
      order: audioRef.order,
      audioRef: audioRef.audioRef,
    }));
}
