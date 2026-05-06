import type { IpcDependencies } from "../registerHandlers";
import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type {
    CheckMultiChoiceQuizAnswersRequest,
    CheckMultiChoiceQuizAnswersResponse,
    CheckVocabReviewWordRequest,
    CheckVocabReviewWordResponse,
    GetMultiChoiceQuizActivityRequest,
    GetMultiChoiceQuizActivityResponse,
    GetStoryActivityRequest,
    GetStoryActivityResponse,
    GetVocabReviewActivityRequest,
    GetVocabReviewActivityResponse,
    ListUnitCycleActivitiesRequest,
    ListUnitCycleActivitiesResponse,
    ResetVocabReviewActivityRequest,
    ResetVocabReviewActivityResponse,
    RetryMultiChoiceQuizRequest,
    RetryMultiChoiceQuizResponse,
    RetryVocabReviewWordRequest,
    RetryVocabReviewWordResponse,
    SubmitStoryFeedbackRequest,
    SubmitStoryFeedbackResponse,
} from "../contracts/activities.contracts";
import {
    checkMultiChoiceQuizAnswersSchema,
    checkVocabReviewWordSchema,
    getVocabReviewActivitySchema,
    getStoryActivitySchema,
    listUnitCycleActivitiesSchema,
    resetVocabReviewActivitySchema,
    retryMultiChoiceQuizSchema,
    retryVocabReviewWordSchema,
    submitStoryFeedbackSchema,
    getMultiChoiceQuizActivitySchema,
} from "../validationSchemas/activities.schemas";
import { getStoryActivity } from "@electron/services/activities/storyActivity/getStoryActivity";
import { listUnitCycleActivities } from "@electron/services/activities/listUnitCycleActivities";
import { submitStoryFeedback } from "@electron/services/activities/storyActivity/submitStoryFeedback";
import { getMultiChoiceQuizActivity } from "@electron/services/activities/multiChoiceQuiz/getMultiChoiceQuizAnswers";
import { checkMultiChoiceQuizAnswers } from "@electron/services/activities/multiChoiceQuiz/checkMultiChoiceQuizAnswers";
import { retryMultiChoiceQuiz } from "@electron/services/activities/multiChoiceQuiz/retryMultiChoiceQuiz";
import { checkVocabReviewWord } from "@electron/services/activities/vocabReview/checkVocabReviewWord";
import { getVocabReviewActivity } from "@electron/services/activities/vocabReview/getVocabReviewActivity";
import { resetVocabReviewActivity } from "@electron/services/activities/vocabReview/resetVocabReviewActivity";
import { retryVocabReviewWord } from "@electron/services/activities/vocabReview/retryVocabReviewWord";

export function RegisterActivitiesHandlers(dependencies: IpcDependencies): void {
    void dependencies;

    safeHandle<ListUnitCycleActivitiesRequest, ListUnitCycleActivitiesResponse>(
        "activities:list-for-cycle",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(listUnitCycleActivitiesSchema, rawArgs);
            return listUnitCycleActivities(args, ctx);
        }
    );

    safeHandle<GetStoryActivityRequest, GetStoryActivityResponse>(
        "activities:story:get",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(getStoryActivitySchema, rawArgs);
            return getStoryActivity(args, ctx);
        }
    );

    safeHandle<SubmitStoryFeedbackRequest, SubmitStoryFeedbackResponse>(
        "activities:story:submit-feedback",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(submitStoryFeedbackSchema, rawArgs);
            return submitStoryFeedback(args, ctx);
        }
    );

    safeHandle<GetMultiChoiceQuizActivityRequest, GetMultiChoiceQuizActivityResponse>(
        "activities:multi-choice-quiz:get-quiz",
        async(_event, rawArgs, ctx) => {
            const args = validateOrThrow(getMultiChoiceQuizActivitySchema, rawArgs);
            return getMultiChoiceQuizActivity(args, ctx);
        }
    );

    safeHandle<CheckMultiChoiceQuizAnswersRequest, CheckMultiChoiceQuizAnswersResponse>(
        "activities:multi-choice-quiz:check-answers",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(checkMultiChoiceQuizAnswersSchema, rawArgs);
            return checkMultiChoiceQuizAnswers(args, ctx);
        }
    );

    safeHandle<RetryMultiChoiceQuizRequest, RetryMultiChoiceQuizResponse>(
        "activities:multi-choice-quiz:retry",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(retryMultiChoiceQuizSchema, rawArgs);
            return retryMultiChoiceQuiz(args, ctx);
        }
    );

    safeHandle<GetVocabReviewActivityRequest, GetVocabReviewActivityResponse>(
        "activities:vocab-review:get",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(getVocabReviewActivitySchema, rawArgs);
            return getVocabReviewActivity(args, ctx);
        }
    );

    safeHandle<CheckVocabReviewWordRequest, CheckVocabReviewWordResponse>(
        "activities:vocab-review:check-word",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(checkVocabReviewWordSchema, rawArgs);
            return checkVocabReviewWord(args, ctx);
        }
    );

    safeHandle<RetryVocabReviewWordRequest, RetryVocabReviewWordResponse>(
        "activities:vocab-review:retry-word",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(retryVocabReviewWordSchema, rawArgs);
            return retryVocabReviewWord(args, ctx);
        }
    );

    safeHandle<ResetVocabReviewActivityRequest, ResetVocabReviewActivityResponse>(
        "activities:vocab-review:reset",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(resetVocabReviewActivitySchema, rawArgs);
            return resetVocabReviewActivity(args, ctx);
        }
    );
}
