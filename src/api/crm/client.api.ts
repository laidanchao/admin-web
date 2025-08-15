import { CLIENT_STAGE, CLIENT_TYPE_ENUM } from "@/enums/crm/client.enum";
import BaseApi from "../base.api";
import { UserInfo } from "../system/user.api";
import request from "@/utils/request";

const CLIENT_BASE_URL = "/api/crm/client";

class ClientAPI extends BaseApi {
  constructor() {
    super(CLIENT_BASE_URL);
  }

  import(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, any>({
      url: `${CLIENT_BASE_URL}/import`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default new ClientAPI();

/**
 * 客户查询参数
 */
export interface ClientPageQuery extends PageQuery {
  /**
   * 关键字(客户名称/手机号)
   */
  keywords?: string;

  clientType?: CLIENT_TYPE_ENUM;

  clientStage?: CLIENT_STAGE;
}

/**
 * 客户分页对象
 */
export interface ClientPageVO {
  id: number;
  /**
   * 客户名
   */
  clientName: string;
  /**
   * 用户名
   */
  username: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 客户类型
   */
  clientType: CLIENT_TYPE_ENUM;
  /**
   * 客户分级
   */
  clientStage: CLIENT_STAGE;
  /**
   * 客户电话
   */
  phone: string;
  qq: string;
  email: string;
  /**
   * 客户地址
   */
  address: string;
  /**
   * 销售员
   */
  saler?: UserInfo;
  /**
   * 销售员id
   */
  salerId?: number;
}

/**
 * 客户表单
 */
export interface ClientForm {
  id?: number;
  /**
   * 客户名
   */
  clientName?: string;
  /**
   * 用户名
   */
  username?: string;
  /**
   * 密码
   */
  password?: string;
  /**
   * 客户类型
   */
  clientType?: CLIENT_TYPE_ENUM;
  /**
   * 客户分级
   */
  clientStage?: CLIENT_STAGE;
  /**
   * 客户电话
   */
  phone?: string;
  qq?: string;
  email?: string;
  /**
   * 客户地址
   */
  address?: string;
  /** 销售员id */
  salerId?: number;
}
