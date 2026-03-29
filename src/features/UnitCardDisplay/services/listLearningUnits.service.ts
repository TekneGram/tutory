import { unitsAdapter } from "@/app/adapters/units.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { ListLearningUnitsRequest, LearningUnitCardDto } from "@/app/ports/units.ports";

export async function listLearningUnits(
  request: ListLearningUnitsRequest,
): Promise<LearningUnitCardDto[]> {
  const result = await unitsAdapter.listLearningUnits(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return [...result.value.units].sort((left, right) => left.sortOrder - right.sortOrder);
}
