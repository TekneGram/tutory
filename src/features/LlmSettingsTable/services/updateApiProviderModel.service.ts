import { settingsAdapter } from "@/app/adapters/settings.adapters";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
    UpdateApiProviderModelRequest,
    UpdateApiProviderModelResponse,
} from "@/app/ports/settings.ports";

export async function updateApiProviderModel(request: UpdateApiProviderModelRequest): Promise<UpdateApiProviderModelResponse> {
    const result = await settingsAdapter.updateApiProviderModel(request);

    if (!result.ok) {
        toastifyNotifier.error(result.error.userMessage, { id: `update-provider-model-${request.provider}` });
        throw new FrontAppError(result.error);
    }

    toastifyNotifier.success("Model selection updated.", { id: `update-provider-model-${request.provider}` });
    return result.value;
}
