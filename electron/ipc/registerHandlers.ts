import type { CredentialProvider } from "@electron/llm/shared/llmProvider.dto";
import type { SecretStoragePort } from "@electron/infrastructure/ports/secretStorage.port";
import { RegisterUnitsHandlers } from "./registerHandlers/register.units";
import { RegisterLearnersHandlers } from "./registerHandlers/register.learners";
import { RegisterSettingsHandlers } from "./registerHandlers/register.settings";

export type IpcDependencies = {
    credentialProvider: CredentialProvider;
    secretStorage: SecretStoragePort;
};

export function registerHandlers(dependencies: IpcDependencies): void {
    RegisterSettingsHandlers(dependencies);
    RegisterUnitsHandlers(dependencies);
    RegisterLearnersHandlers(dependencies);
}
