import { z } from "zod";
import type {
    MultiChoiceQuizAudioRefDto,
    MultiChoiceQuizVideoRefDto,
    MultiChoiceQuizImageRefDto,
    MultiChoiceQuizLearnerAnswer,

} from "@electron/ipc/contracts/activities.contracts";
import { ActivityMultiChoiceQuizAnswerRow } from "@electron/db/repositories/activityRepositories";

const multiChoiceQuizImageRefSchema = z.object({
    order: z.number(),
    imageRef: z.string(),
}).strict();

const multiChoiceQuizAudioRefSchema = z.object({
    order: z.number(),
    audioRef: z.string(),
}).strict();

const multiChoiceQuizVideoRefSchema = z.object({
    order: z.number(),
    videoRef: z.string(),
}).strict();

const isCorrectSchema = z.union([z.boolean(), z.string()]).transform((value, ctx) => {
    if (typeof value === "boolean") return value;

    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;

    ctx.addIssue({
        code: "custom",
        message: "is_correct must be true/false or \"true\"/\"false\"",
    });

    return z.NEVER;
});

const multiChoiceQuizAnswerSchema = z.object({
    option: z.string(),
    answer: z.string(),
    is_correct: isCorrectSchema,
}).strict();

const multiChoiceQuizContentSchema = z.object({
    instructions: z.string(),
    advice: z.string(),
    title: z.string(),
    assetBase: z.string().trim().min(1).optional().nullable(),
    assets: z.object({
        imageRefs: z.array(multiChoiceQuizImageRefSchema),
        audioRefs: z.array(multiChoiceQuizAudioRefSchema),
        videoRefs: z.array(multiChoiceQuizVideoRefSchema)
    }).strict(),
    questions: z.array(
        z.object({
            question: z.string(),
            answers: z.array(multiChoiceQuizAnswerSchema)
        })
    )
})

export type MultiChoiceQuizContent = z.infer<typeof multiChoiceQuizContentSchema>

export function parseMultiChoiceQuizContent(contentJson: string): MultiChoiceQuizContent {
    return multiChoiceQuizContentSchema.parse(JSON.parse(contentJson));
}

export function toMultiChoiceQuizImageRefDtos(
    imageRefs: MultiChoiceQuizContent["assets"]["imageRefs"]
): MultiChoiceQuizImageRefDto[] {
    return [...imageRefs]
        .sort((left, right) => left.order - right.order)
        .map((imageRef) => ({
            order: imageRef.order,
            imageRef: imageRef.imageRef,
        }));
}

export function toMultiChoiceQuizAudioRefDtos(
    audioRefs: MultiChoiceQuizContent["assets"]["audioRefs"]
): MultiChoiceQuizAudioRefDto[] {
    return [...audioRefs]
        .sort((left, right) => left.order - right.order)
        .map((audioRef) => ({
            order: audioRef.order,
            audioRef: audioRef.audioRef,
        }));
}

export function toMultiChoiceQuizVideoRefDtos(
    videoRefs: MultiChoiceQuizContent["assets"]["videoRefs"]
): MultiChoiceQuizVideoRefDto[] {
    return [...videoRefs]
        .sort((left, right) => left.order - right.order)
        .map((videoRef) => ({
            order: videoRef.order,
            videoRef: videoRef.videoRef,
        }));
}

export function toMultiChoiceQuizLearnerAnswers(
    answers: ActivityMultiChoiceQuizAnswerRow[]
): MultiChoiceQuizLearnerAnswer[] {
    const learnerAnswer = answers.map(answer => ({
        attemptId: answer.attempt_id,
        learnerId: answer.learner_id,
        unitCycleActivityId: answer.unit_cycle_activity_id,
        question: answer.question,
        isAnswered: answer.is_answered,
        selectedOption: answer.selected_option,
        isCorrect: answer.is_correct,
        createdAt: answer.created_at,
        updatedAt: answer.updated_at,
    }));
    return learnerAnswer;
}
