import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    SetDefaultApiProviderRequest,
    SetDefaultApiProviderResponse,
} from "@/app/ports/settings.ports";
import { setDefaultApiProvider } from "../services/setDefaultApiProvider.service";
import { llmProviderSettingsQueryKey } from "./useLlmProviderSettingsQuery";

export function useSetDefaultApiProviderMutation() {
    const queryClient = useQueryClient();

    return useMutation<SetDefaultApiProviderResponse, Error, SetDefaultApiProviderRequest>({
        mutationFn: setDefaultApiProvider,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: llmProviderSettingsQueryKey });
        },
    });
}
