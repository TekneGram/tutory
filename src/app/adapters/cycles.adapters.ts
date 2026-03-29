import { invokeRequest } from "./invokeRequest";
import type {
  CyclesPort,
  GetCycleProgressRequest,
  GetCycleProgressResponse,
  ListUnitCyclesRequest,
  ListUnitCyclesResponse,
} from "@/app/ports/cycles.ports";

export const cyclesAdapter: CyclesPort = {
  async listUnitCycles(request: ListUnitCyclesRequest) {
    return invokeRequest<ListUnitCyclesRequest, ListUnitCyclesResponse>("cycles:list-for-unit", request);
  },

  async getCycleProgress(request: GetCycleProgressRequest) {
    return invokeRequest<GetCycleProgressRequest, GetCycleProgressResponse>("cycles:get-progress", request);
  },
};

