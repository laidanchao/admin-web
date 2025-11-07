import { AUDIT_STATUS_ENUM } from "@/enums/bigong/feed.enum";
import BaseApi from "../base.api";
import request from "@/utils/request";

const FEED_BASE_URL = "/api/bigong/feed";

class FeedAPI extends BaseApi {
  constructor() {
    super(FEED_BASE_URL);
  }

  export(data: any) {
    return request<any, any>({
      url: `${FEED_BASE_URL}/export`,
      responseType: "blob",
      data,
      method: "post",
      timeout: 300000,
    });
  }

  getDetails(id) {
    return request<any, any>({
      url: `${FEED_BASE_URL}/details/${id}`,
      method: "get",
    });
  }
}

export default new FeedAPI();

/**
 * 客户查询参数
 */
export interface FeedPageQuery extends PageQuery {
  /**
   * 关键字(客户名称/手机号)
   */
  keywords?: string;

  auditStatus?: AUDIT_STATUS_ENUM;
  city?: string;
  serviceArea?: string;
}

/**
 * 客户分页对象
 */
export interface FeedPageVO {
  id: number;
  /**
   * 姓名
   */
  realName: string;
  /**
   * 身份证号
   */
  idNo: string;

  phone: string;

  city: string;

  serviceArea: string;

  direction: string;

  auditStatus: AUDIT_STATUS_ENUM;
}
