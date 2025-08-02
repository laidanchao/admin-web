import request from "@/utils/request";
import BaseApi from "../base.api";
import { TAG_TYPE_ENUM } from "@/enums";

const DICT_ITEM_BASE_URL = "/api/sys/dict-item";

class DictItemAPI extends BaseApi {
  constructor() {
    super(DICT_ITEM_BASE_URL);
  }

  getDictItems(dictCode: string) {
    return request<any, DictItemOption[]>({
      url: `${DICT_ITEM_BASE_URL}/options/${dictCode}`,
      method: "get",
    });
  }
}

export default new DictItemAPI();

/**
 * 字典查询参数
 */
export interface DictItemPageQuery extends PageQuery {
  /** 关键字(字典项名称/编码) */
  keywords?: string;

  /** 字典编码 */
  dictCode?: string;

  /** 是否激活 */
  isActive?: boolean;
}

/**
 * 字典分页对象
 */
export interface DictItemPageVO {
  /**
   * 字典ID
   */
  id: number;
  /**
   * 字典项名称
   */
  itemName: string;
  /**
   * 字典项编码
   */
  itemCode: string;
  /**
   * 字典项描述
   */
  itemDesc: string;
  /**
   * 是否激活
   */
  isActive: boolean;
  /**
   * 字典排序
   */
  sort?: number;
}

/**
 * 字典
 */
export interface DictItemForm {
  /**
   * 字典ID
   */
  id?: number;
  /**
   * 字典编码
   */
  dictCode?: string;
  /**
   * 字典项名称
   */
  itemName?: string;
  /**
   * 字典项编码
   */
  itemCode?: string;
  /**
   * 字典项描述
   */
  itemDesc?: string;
  /**
   * 是否激活
   */
  isActive: boolean;
  /**
   * 标签类型
   */
  tagType?: TAG_TYPE_ENUM | "";
}

/**
 * 字典项下拉选项
 */
export interface DictItemOption {
  /** 字典数据值 */
  value: string;

  /** 字典数据标签 */
  label: string;

  /** 标签类型 */
  tagType: string;
}
