import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type {
    GetMultiChoiceQuizActivityRequest,
    GetMultiChoiceQuizActivityResponse,
} from "@/app/ports/activities.ports";

export async function getMultiChoiceQuizActivity(
    request: GetMultiChoiceQuizActivityRequest,
): Promise<GetMultiChoiceQuizActivityResponse> {
    const result = await activitiesAdapter.getMultiChoiceQuizActivity(request);

    if (!result.ok) {
        throw new FrontAppError(result.error);
    }

    return result.value;
}