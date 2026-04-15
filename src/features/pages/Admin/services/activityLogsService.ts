import api from "@/features/shared/services/api";
import { extractApiData } from "@/features/shared/services/extractApiData";

export const activityLogsService = {

  async getLogs() {

    const res = await api.get("/activity-logs");

    return extractApiData(res.data).rows;

  }

};
