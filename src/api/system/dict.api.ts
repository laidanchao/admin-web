import BaseApi from "../base.api";

const DICT_BASE_URL = "/api/sys/dict";

class DictAPI extends BaseApi {
  constructor() {
    super(DICT_BASE_URL);
  }
}

export default new DictAPI();

/**
 * 字典查询参数
 */
export interface DictPageQuery extends PageQuery {
  /**
   * 关键字(字典名称/编码)
   */
  keywords?: string;

  /**
   * 是否激活
   */
  isActive?: boolean;
}

/**
 * 字典分页对象
 */
export interface DictPageVO {
  /**
   * 字典ID
   */
  id: number;
  /**
   * 字典名称
   */
  name: string;
  /**
   * 字典编码
   */
  code: string;
  /**
   * 是否激活
   */
  isActive: boolean;
}

/**
 * 字典
 */
export interface DictForm {
  /**
   * 字典ID
   */
  id?: number;
  /**
   * 字典名称
   */
  name?: string;
  /**
   * 字典编码
   */
  code?: string;
  /**
   * 是否激活
   */
  isActive: boolean;
  /**
   * 描述
   */
  description?: string;
}
