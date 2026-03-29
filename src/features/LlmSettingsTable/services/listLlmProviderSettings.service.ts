import { settingsAdapter } from "@/app/adapters/settings.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { ApiProviderSettingsItem } from "@/app/ports/settings.ports";

export async function listLlmProviderSettings(): Promise<ApiProviderSettingsItem[]> {
    const result = await settingsAdapter.listApiProviders();

    if (!result.ok) {
        throw new FrontAppError(result.error);
    }

    return result.value.providers;
}
