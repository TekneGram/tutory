import type { IpcDependencies } from "../registerHandlers";
import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type {
    GetMultiChoiceQuizActivityRequest,
    GetMultiChoiceQuizActivityResponse,
    GetStoryActivityRequest,
    GetStoryActivityResponse,
    ListUnitCycleActivitiesRequest,
    ListUnitCycleActivitiesResponse,
    SubmitStoryFeedbackRequest,
    SubmitStoryFeedbackResponse,
} from "../contracts/activities.contracts";
import {
    getStoryActivitySchema,
    listUnitCycleActivitiesSchema,
    submitStoryFeedbackSchema,
    getMultiChoiceQuizActivitySchema
} from "../validationSchemas/activities.schemas";
import { getStoryActivity } from "@electron/services/activities/getStoryActivity";
import { listUnitCycleActivities } from "@electron/services/activities/listUnitCycleActivities";
import { submitStoryFeedback } from "@electron/services/activities/submitStoryFeedback";
import { getMultiChoiceQuizActivity } from "@electron/services/activities/getMultiChoiceQuizActivity";

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
    )
}
