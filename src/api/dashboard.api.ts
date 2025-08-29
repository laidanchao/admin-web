import request from "@/utils/request";

const DASHBOARD_BASE_URL = "/api/dashboard";

const DashboardAPI = {
  get() {
    return request<any, DashboardResponse>({
      url: `${DASHBOARD_BASE_URL}`,
      method: "get",
    });
  },
};

export default DashboardAPI;

/** 验证码响应 */
export interface DashboardResponse {
  /** 天气信息 */
  weather: string;
}
