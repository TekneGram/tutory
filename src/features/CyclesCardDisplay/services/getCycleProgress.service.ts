import { cyclesAdapter } from "@/app/adapters/cycles.adapters";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { CycleProgressHoverDto, GetCycleProgressRequest } from "@/app/ports/cycles.ports";

export async function getCycleProgress(request: GetCycleProgressRequest): Promise<CycleProgressHoverDto> {
  const result = await cyclesAdapter.getCycleProgress(request);

  if (!result.ok) {
    throw new FrontAppError(result.error);
  }

  return result.value;
}

