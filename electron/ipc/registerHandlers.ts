import type { CredentialProvider } from "@electron/llm/shared/llmProvider.dto";
import type { SecretStoragePort } from "@electron/infrastructure/ports/secretStorage.port";
import { RegisterActivitiesHandlers } from "./registerHandlers/register.activities";
import { RegisterCyclesHandlers } from "./registerHandlers/register.cycles";
import { RegisterUnitsHandlers } from "./registerHandlers/register.units";
import { RegisterLearnersHandlers } from "./registerHandlers/register.learners";
import { RegisterSettingsHandlers } from "./registerHandlers/register.settings";

export type IpcDependencies = {
    credentialProvider: CredentialProvider;
    secretStorage: SecretStoragePort;
};

export function registerHandlers(dependencies: IpcDependencies): void {
    RegisterSettingsHandlers(dependencies);
    RegisterCyclesHandlers(dependencies);
    RegisterActivitiesHandlers(dependencies);
    RegisterUnitsHandlers(dependencies);
    RegisterLearnersHandlers(dependencies);
}
