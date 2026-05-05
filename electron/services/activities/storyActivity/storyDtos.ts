import { z } from "zod";
import type {
    StoryAudioRefDto,
    StoryFeedbackDto,
    StoryImageRefDto,
    StoryPassagePageDto,
    StoryVideoRefDto,
    StoryWordDto,
} from "@electron/ipc/contracts/activities.contracts";

const storyPassagePageSchema = z
    .object({
        order: z.number(),
        text: z.string(),
    })
    .strict();

const storyImageRefSchema = z
    .object({
        order: z.number(),
        imageRef: z.string(),
    })
    .strict();

const storyAudioRefSchema = z
    .object({
        order: z.number(),
        audioRef: z.string(),
    })
    .strict();

const storyVideoRefSchema = z
    .object({
        order: z.number(),
        videoRef: z.string(),
    })
    .strict();

const storyWordSchema = z
    .object({
        word: z.string(),
        japanese: z.string(),
        position: z.number(),
    })
    .strict();

const storyContentSchema = z
    .object({
        instructions: z.string(),
        advice: z.string(),
        title: z.string(),
        assetBase: z.string().trim().min(1).optional().nullable(),
        passage: z
            .object({
                pages: z.array(storyPassagePageSchema),
            })
            .strict(),
        assets: z
            .object({
                imageRefs: z.array(storyImageRefSchema),
                audioRefs: z.array(storyAudioRefSchema),
                videoRefs: z.array(storyVideoRefSchema),
            })
            .strict(),
        words: z.array(storyWordSchema),
    })
    .strict();

export type StoryContent = z.infer<typeof storyContentSchema>;

export const STORY_FEEDBACK_QUESTION = "Was it easy or tough?";
export const STORY_FEEDBACK_ANSWERS = ["🥰", "👌", "😓"] as const;

export function parseStoryContent(contentJson: string): StoryContent {
    return storyContentSchema.parse(JSON.parse(contentJson));
}

export function toStoryFeedbackDto(comment: string): StoryFeedbackDto {
    return {
        question: STORY_FEEDBACK_QUESTION,
        answers: [...STORY_FEEDBACK_ANSWERS] as [string, string, string],
        comment,
    };
}

export function toStoryPageDtos(
    pages: StoryContent["passage"]["pages"]
): StoryPassagePageDto[] {
    return [...pages]
        .sort((left, right) => left.order - right.order)
        .map((page) => ({
            order: page.order,
            text: page.text,
        }));
}

export function toStoryImageRefDtos(
    imageRefs: StoryContent["assets"]["imageRefs"]
): StoryImageRefDto[] {
    return [...imageRefs]
        .sort((left, right) => left.order - right.order)
        .map((imageRef) => ({
            order: imageRef.order,
            imageRef: imageRef.imageRef,
        }));
}

export function toStoryAudioRefDtos(
    audioRefs: StoryContent["assets"]["audioRefs"]
): StoryAudioRefDto[] {
    return [...audioRefs]
        .sort((left, right) => left.order - right.order)
        .map((audioRef) => ({
            order: audioRef.order,
            audioRef: audioRef.audioRef,
        }));
}

export function toStoryVideoRefDtos(
    videoRefs: StoryContent["assets"]["videoRefs"]
): StoryVideoRefDto[] {
    return [...videoRefs]
        .sort((left, right) => left.order - right.order)
        .map((videoRef) => ({
            order: videoRef.order,
            videoRef: videoRef.videoRef,
        }));
}

export function toStoryWordDtos(words: StoryContent["words"]): StoryWordDto[] {
    return [...words]
        .sort((left, right) => left.position - right.position)
        .map((word) => ({
            word: word.word,
            japanese: word.japanese,
            position: word.position,
        }));
}
