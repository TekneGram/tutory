import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type { IpcDependencies } from "../registerHandlers";

import { deleteApiProviderKey } from "@electron/services/settings/deleteApiProviderKey";
import { listApiProviderModels } from "@electron/services/settings/listApiProviderModels";
import { listApiProviders } from "@electron/services/settings/listApiProviders";
import { saveApiProviderKey } from "@electron/services/settings/saveApiProviderKey";
import { setDefaultApiProvider } from "@electron/services/settings/setDefaultApiProvider";
import { updateApiProviderModel } from "@electron/services/settings/updateApiProviderModel";
import type {
    ListApiProviderModelsResponse,
    ApiProvidersResponse,
    DeleteApiProviderKeyRequest,
    DeleteApiProviderKeyResponse,
    SaveApiProviderKeyRequest,
    SaveApiProviderKeyResponse,
    SetDefaultApiProviderRequest,
    SetDefaultApiProviderResponse,
    UpdateApiProviderModelRequest,
    UpdateApiProviderModelResponse,
} from "../contracts/settings.contracts";
import {
    deleteApiProviderKeySchema,
    saveApiProviderKeySchema,
    setDefaultApiProviderSchema,
    updateApiProviderModelSchema,
} from "../validationSchemas/settings.schemas";

export function RegisterSettingsHandlers({
    credentialProvider,
    secretStorage,
}: IpcDependencies): void {
    safeHandle<null, ApiProvidersResponse>(
        "settings:api-providers:list",
        async (_event, _rawArgs, ctx) => {
            return listApiProviders(ctx, credentialProvider);
        }
    );

    safeHandle<null, ListApiProviderModelsResponse>(
        "settings:api-providers:list-models",
        async (_event, _rawArgs, ctx) => {
            return listApiProviderModels(ctx);
        }
    );

    safeHandle<SaveApiProviderKeyRequest, SaveApiProviderKeyResponse>(
        "settings:api-providers:save-key",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(saveApiProviderKeySchema, rawArgs);
            return saveApiProviderKey(args, ctx, secretStorage);
        }
    );

    safeHandle<DeleteApiProviderKeyRequest, DeleteApiProviderKeyResponse>(
        "settings:api-providers:delete-key",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(deleteApiProviderKeySchema, rawArgs);
            return deleteApiProviderKey(args, ctx, secretStorage);
        }
    );

    safeHandle<SetDefaultApiProviderRequest, SetDefaultApiProviderResponse>(
        "settings:api-providers:set-default",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(setDefaultApiProviderSchema, rawArgs);
            return setDefaultApiProvider(args, ctx);
        }
    );

    safeHandle<UpdateApiProviderModelRequest, UpdateApiProviderModelResponse>(
        "settings:api-providers:update-model",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(updateApiProviderModelSchema, rawArgs);
            return updateApiProviderModel(args, ctx);
        }
    );
}
