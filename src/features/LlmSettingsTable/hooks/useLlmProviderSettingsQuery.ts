import { useQuery } from "@tanstack/react-query";
import { listLlmProviderSettings } from "../services/listLlmProviderSettings.service";

export const llmProviderSettingsQueryKey = ["settings", "api-providers"] as const;

export function useLlmProviderSettingsQuery() {
    return useQuery({
        queryKey: llmProviderSettingsQueryKey,
        queryFn: listLlmProviderSettings,
    });
}
