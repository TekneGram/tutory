import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type { IpcDependencies } from "../registerHandlers";
import type {
    CreateLearnerProfileRequest,
    CreateLearnerProfileResponse,
    GetLearnerProfileRequest,
    GetLearnerProfileResponse,
    ListLearnersRequest,
    ListLearnersResponse,
    UpdateLearnerProfileRequest,
    UpdateLearnerProfileResponse,
} from "../contracts/learners.contracts";
import {
    createLearnerProfileSchema,
    getLearnerProfileSchema,
    listLearnersSchema,
    updateLearnerProfileSchema,
} from "../validationSchemas/learners.schemas";
import { listLearners } from "@electron/services/learners/listLearners";
import { getLearnerProfile } from "@electron/services/learners/getLearnerProfile";
import { createLearnerProfile } from "@electron/services/learners/createLearnerProfile";
import { updateLearnerProfile } from "@electron/services/learners/updateLearnerProfile";

export function RegisterLearnersHandlers(dependencies: IpcDependencies): void {
    void dependencies;

    safeHandle<ListLearnersRequest, ListLearnersResponse>(
        "learners:list",
        async (_event, rawArgs, ctx) => {
            validateOrThrow(listLearnersSchema, rawArgs);
            return listLearners(ctx);
        }
    );

    safeHandle<GetLearnerProfileRequest, GetLearnerProfileResponse>(
        "learners:get-profile",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(getLearnerProfileSchema, rawArgs);
            return getLearnerProfile(args, ctx);
        }
    );

    safeHandle<CreateLearnerProfileRequest, CreateLearnerProfileResponse>(
        "learners:create-profile",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(createLearnerProfileSchema, rawArgs);
            return createLearnerProfile(args, ctx);
        }
    );

    safeHandle<UpdateLearnerProfileRequest, UpdateLearnerProfileResponse>(
        "learners:update-profile",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(updateLearnerProfileSchema, rawArgs);
            return updateLearnerProfile(args, ctx);
        }
    );
}
