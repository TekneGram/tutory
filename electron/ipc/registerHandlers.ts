import type { CredentialProvider } from "@electron/llm/shared/llmProvider.dto";
import type { SecretStoragePort } from "@electron/infrastructure/ports/secretStorage.port";
import { RegisterSettingsHandlers } from "./registerHandlers/register.settings";

export type IpcDependencies = {
    credentialProvider: CredentialProvider;
    secretStorage: SecretStoragePort;
};

export function registerHandlers(dependencies: IpcDependencies): void {
    RegisterSettingsHandlers(dependencies);
}
