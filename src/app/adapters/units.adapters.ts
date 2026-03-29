import { invokeRequest } from "./invokeRequest";
import type {
  GetUnitProgressRequest,
  GetUnitProgressResponse,
  ListLearningUnitsRequest,
  ListLearningUnitsResponse,
  UnitsPort,
} from "@/app/ports/units.ports";

export const unitsAdapter: UnitsPort = {
  async listLearningUnits(request: ListLearningUnitsRequest) {
    return invokeRequest<ListLearningUnitsRequest, ListLearningUnitsResponse>("units:list", request);
  },

  async getUnitProgress(request: GetUnitProgressRequest) {
    return invokeRequest<GetUnitProgressRequest, GetUnitProgressResponse>("units:get-progress", request);
  },
};
