import type { IpcDependencies } from "../registerHandlers";
import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type {
    CheckMultiChoiceQuizAnswersRequest,
    CheckMultiChoiceQuizAnswersResponse,
    GetMultiChoiceQuizActivityRequest,
    GetMultiChoiceQuizActivityResponse,
    GetStoryActivityRequest,
    GetStoryActivityResponse,
    ListUnitCycleActivitiesRequest,
    ListUnitCycleActivitiesResponse,
    RetryMultiChoiceQuizRequest,
    RetryMultiChoiceQuizResponse,
    SubmitStoryFeedbackRequest,
    SubmitStoryFeedbackResponse,
} from "../contracts/activities.contracts";
import {
    checkMultiChoiceQuizAnswersSchema,
    getStoryActivitySchema,
    listUnitCycleActivitiesSchema,
    retryMultiChoiceQuizSchema,
    submitStoryFeedbackSchema,
    getMultiChoiceQuizActivitySchema,
} from "../validationSchemas/activities.schemas";
import { getStoryActivity } from "@electron/services/activities/storyActivity/getStoryActivity";
import { listUnitCycleActivities } from "@electron/services/activities/listUnitCycleActivities";
import { submitStoryFeedback } from "@electron/services/activities/storyActivity/submitStoryFeedback";
import { getMultiChoiceQuizActivity } from "@electron/services/activities/multiChoiceQuiz/getMultiChoiceQuizAnswers";
import { checkMultiChoiceQuizAnswers } from "@electron/services/activities/multiChoiceQuiz/checkMultiChoiceQuizAnswers";
import { retryMultiChoiceQuiz } from "@electron/services/activities/multiChoiceQuiz/retryMultiChoiceQuiz";

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
}
