import { unitsAdapter } from "@/app/adapters/units.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { GetUnitProgressRequest, UnitProgressHoverDto } from "@/app/ports/units.ports";

export async function getUnitProgress(request: GetUnitProgressRequest): Promise<UnitProgressHoverDto> {
  const result = await unitsAdapter.getUnitProgress(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}
