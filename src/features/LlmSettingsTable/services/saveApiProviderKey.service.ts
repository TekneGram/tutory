import { settingsAdapter } from "@/app/adapters/settings.adapters";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
    SaveApiProviderKeyRequest,
    SaveApiProviderKeyResponse,
} from "@/app/ports/settings.ports";

export async function saveApiProviderKey(request: SaveApiProviderKeyRequest): Promise<SaveApiProviderKeyResponse> {
    const result = await settingsAdapter.saveApiProviderKey(request);

    if (!result.ok) {
        toastifyNotifier.error(result.error.userMessage, { id: `save-provider-key-${request.provider}` });
        throw new FrontAppError(result.error);
    }

    toastifyNotifier.success("API key saved.", { id: `save-provider-key-${request.provider}` });
    return result.value;
}
