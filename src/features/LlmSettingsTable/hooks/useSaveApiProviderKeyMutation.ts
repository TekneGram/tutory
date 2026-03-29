import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    SaveApiProviderKeyRequest,
    SaveApiProviderKeyResponse,
} from "@/app/ports/settings.ports";
import { saveApiProviderKey } from "../services/saveApiProviderKey.service";
import { llmProviderSettingsQueryKey } from "./useLlmProviderSettingsQuery";

export function useSaveApiProviderKeyMutation() {
    const queryClient = useQueryClient();

    return useMutation<SaveApiProviderKeyResponse, Error, SaveApiProviderKeyRequest>({
        mutationFn: saveApiProviderKey,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: llmProviderSettingsQueryKey });
        },
    });
}
