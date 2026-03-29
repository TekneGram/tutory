import { settingsAdapter } from "@/app/adapters/settings.adapters";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
    SetDefaultApiProviderRequest,
    SetDefaultApiProviderResponse,
} from "@/app/ports/settings.ports";

export async function setDefaultApiProvider(request: SetDefaultApiProviderRequest): Promise<SetDefaultApiProviderResponse> {
    const result = await settingsAdapter.setDefaultApiProvider(request);

    if (!result.ok) {
        toastifyNotifier.error(result.error.userMessage, { id: `set-default-provider-${request.provider}` });
        throw new FrontAppError(result.error);
    }

    toastifyNotifier.success("Default provider updated.", { id: `set-default-provider-${request.provider}` });
    return result.value;
}
