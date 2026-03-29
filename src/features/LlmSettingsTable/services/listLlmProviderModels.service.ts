import { settingsAdapter } from "@/app/adapters/settings.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { ApiProviderModelItem } from "@/app/ports/settings.ports";

export async function listLlmProviderModels(): Promise<ApiProviderModelItem[]> {
    const result = await settingsAdapter.listApiProviderModels();

    if (!result.ok) {
        throw new FrontAppError(result.error);
    }

    return result.value.models;
}
