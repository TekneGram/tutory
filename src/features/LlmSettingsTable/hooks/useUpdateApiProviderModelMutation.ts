import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    UpdateApiProviderModelRequest,
    UpdateApiProviderModelResponse,
} from "@/app/ports/settings.ports";
import { updateApiProviderModel } from "../services/updateApiProviderModel.service";
import { llmProviderSettingsQueryKey } from "./useLlmProviderSettingsQuery";

export function useUpdateApiProviderModelMutation() {
    const queryClient = useQueryClient();

    return useMutation<UpdateApiProviderModelResponse, Error, UpdateApiProviderModelRequest>({
        mutationFn: updateApiProviderModel,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: llmProviderSettingsQueryKey });
        },
    });
}
