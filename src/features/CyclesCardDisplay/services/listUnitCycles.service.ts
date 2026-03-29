import { cyclesAdapter } from "@/app/adapters/cycles.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { ListUnitCyclesRequest, ListUnitCyclesResponse } from "@/app/ports/cycles.ports";

export async function listUnitCycles(request: ListUnitCyclesRequest): Promise<ListUnitCyclesResponse> {
  const result = await cyclesAdapter.listUnitCycles(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return {
    unit: result.value.unit,
    cycles: [...result.value.cycles].sort((left, right) => left.sortOrder - right.sortOrder),
  };
}

