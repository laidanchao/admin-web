import request from "@/utils/request";
import BaseApi from "../base.api";
import { MenuTypeEnum } from "@/enums";
// 菜单基础URL
const MENU_BASE_URL = "/api/sys/menu";

class MenuAPI extends BaseApi {
  constructor() {
    super(MENU_BASE_URL);
  }

  getFullTree() {
    return request<any, OptionType[]>({
      url: `${MENU_BASE_URL}/getFullTree`,
      method: "get",
    });
  }

  getMenuList(params: any) {
    return request<any, MenuVO[]>({
      url: `${MENU_BASE_URL}/getMenuList`,
      method: "get",
      params,
    });
  }

  create(data: any) {
    return request<any, any>({
      url: `${MENU_BASE_URL}/createMenu`,
      method: "post",
      data,
    });
  }

  update(id: number, data: any) {
    return request<any, any>({
      url: `${MENU_BASE_URL}/updateMenu/${id}`,
      method: "post",
      data,
    });
  }
}

export default new MenuAPI();

/** 菜单查询参数 */
export interface MenuQuery {
  /** 搜索关键字 */
  keywords?: string;
}

export interface MenuVO {
  /** 子菜单 */
  children?: MenuVO[];
  /** 组件路径 */
  component?: string;

  /** 菜单ID */
  id: number;
  createdAt: Date;
  updatedAt: Date;
  createBy: string;
  updateBy: string;
  /** 父菜单ID */
  parentId?: number;
  /** 菜单名称 */
  name: string;
  /** 菜单路径 */
  path: string;
  /** 菜单 */
  type: string;
  /** ICON */
  icon?: string;
  /** 菜单排序(数字越小排名越靠前) */
  sort: number;
}

/** 菜单表单对象 */
export interface MenuForm {
  /** 菜单ID */
  id?: number;
  /** 父菜单ID */
  parentId?: number;
  /** 菜单名称 */
  name?: string;
  /** ICON */
  icon?: string;
  /** 排序 */
  sort?: number;
  /** 路由名称/外链地址 */
  path?: string;
  /** 菜单 */
  type?: MenuTypeEnum;
  /** 权限标识 */
  permission?: string;
}

export interface MenuTreeNode {
  id: number;
  // 父级菜单id
  parentId?: number;
  // 菜单名
  name: string;
  // 菜单路径
  path: string;
  // 菜单类型
  type: MenuTypeEnum;
  // 图标url
  icon: string;
  // 排序，越小越前面
  sort: number;
  children: MenuTreeNode[];
}

/** RouteVO，路由对象 */
export interface RouteVO {
  /** 子路由列表 */
  children: RouteVO[];
  /** 组件路径 */
  component?: string;
  /** 路由属性 */
  meta?: Meta;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 跳转链接 */
  redirect?: string;
}

/** Meta，路由属性 */
export interface Meta {
  /** 【目录】只有一个子路由是否始终显示 */
  alwaysShow?: boolean;
  /** 是否隐藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【菜单】是否开启页面缓存 */
  keepAlive?: boolean;
  /** 路由title */
  title?: string;
}
