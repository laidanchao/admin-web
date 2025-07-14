import request from "@/utils/request";
import BaseApi from "../base.api";

const DEPT_BASE_URL = "/api/sys/dept";

class DeptAPI extends BaseApi {
  constructor() {
    super(DEPT_BASE_URL);
  }

  getChildren(id: number) {
    return request<any, DeptVO[]>({
      url: `${DEPT_BASE_URL}/getChildren/${id}`,
      method: "get",
    });
  }

  getFullTree() {
    return request<any, OptionType[]>({
      url: `${DEPT_BASE_URL}/getFullTree`,
      method: "get",
    });
  }

  getDeptList() {
    return request<any, DeptVO[]>({
      url: `${DEPT_BASE_URL}/getDeptList`,
      method: "get",
    });
  }
}

export default new DeptAPI();

/** 部门查询参数 */
export interface DeptQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 状态 */
  status?: number;
}

/** 部门类型 */
export interface DeptVO {
  /** 子部门 */
  children?: DeptVO[];
  /** 部门ID */
  id?: string;
  /** 部门名称 */
  name?: string;
  /** 部门编号 */
  // code?: string;
  /** 父部门ID */
  parentid?: number;
  /** 排序 */
  sort?: number;
  /** 创建时间 */
  createdAt?: Date;
  /** 修改时间 */
  updatedAt?: Date;
}

/** 部门表单类型 */
export interface DeptForm {
  /** 部门ID(新增不填) */
  id?: number;
  /** 部门名称 */
  name?: string;
  /** 父部门ID */
  parentId: number;
}
