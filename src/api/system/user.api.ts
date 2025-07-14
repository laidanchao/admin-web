import request from "@/utils/request";
import { MenuVO } from "./menu.api";
import { RolePageVO } from "./role.api";
import { DeptVO } from "./dept.api";
import BaseApi from "../base.api";
import { GENDER_ENUM, USER_STATUS_ENUM } from "@/enums/system/user.enum";

const USER_BASE_URL = "/api/sys/user";

class UserAPI extends BaseApi {
  constructor() {
    super(USER_BASE_URL);
  }

  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  getMe() {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/me`,
      method: "get",
    });
  }

  getInfo(id: number) {
    return request<any, UserForm>({
      url: `${USER_BASE_URL}/info/${id}`,
      method: "get",
    });
  }

  getMenus() {
    return request<any, MenuVO[]>({
      url: `${USER_BASE_URL}/getMenus`,
      method: "get",
    });
  }

  create(data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/createUser`,
      method: "post",
      data,
    });
  }

  update(id: number, data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/updateUser/${id}`,
      method: "post",
      data,
    });
  }

  getUserNo() {
    return request<any, string>({
      url: `${USER_BASE_URL}/getUserNo`,
      method: "get",
    });
  }

  resetPassword(id: number, password: string) {
    return request<any, any>({
      url: `${USER_BASE_URL}/resetPassword/${id}`,
      method: "post",
      data: { password },
    });
  }
}

export default new UserAPI();

/** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  id: number;

  /** 用户名 */
  username: string;

  /** 工号 */
  userNo: string;

  /** 昵称 */
  nickname: string;

  /** 头像URL */
  avatar?: string;

  /** 角色 */
  roles: RolePageVO[];

  /** 权限 */
  perms: string[];
}

/**
 * 用户分页查询对象
 */
export interface UserPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;

  /** 用户状态 */
  status?: number;

  /** 部门ID */
  deptId?: number;

  /** 开始时间 */
  createdAt?: [string, string];
}

/** 用户分页对象 */
export interface UserPageVO {
  /** 用户ID */
  id: number;
  /** 用户头像URL */
  avatar?: string;
  /** 创建时间 */
  createdAt?: Date;
  /** 部门名称 */
  // deptName?: string;
  /** 用户邮箱 */
  email?: string;
  userNo?: string;
  /** 性别 */
  // gender?: number;
  /** 手机号 */
  phone?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;
  /** 用户状态(1:启用;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;

  dept: DeptVO;
  roles: RolePageVO[];
}

/** 用户表单类型 */
export interface UserForm {
  /** 用户头像 */
  avatar?: string;
  /** 部门ID */
  deptId?: string;
  /** 邮箱 */
  email?: string;
  /** 性别 */
  gender?: GENDER_ENUM;
  /** 用户ID */
  id?: number;
  /** 手机号 */
  phone?: string;
  /** 昵称 */
  nickname?: string;
  /** 角色ID集合 */
  roleIds?: number[];
  /** 用户状态(1:正常;0:禁用) */
  status?: USER_STATUS_ENUM;
  /** 用户名 */
  username?: string;
  /** 密码 */
  password?: string;
  /** 工号 */
  userNo?: string;
}

/** 个人中心用户信息 */
export interface UserProfileVO {
  /** 用户ID */
  id?: string;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 性别 */
  gender?: number;

  /** 手机号 */
  mobile?: string;

  /** 邮箱 */
  email?: string;

  /** 部门名称 */
  deptName?: string;

  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;

  /** 创建时间 */
  createTime?: Date;
}

/** 个人中心用户信息表单 */
export interface UserProfileForm {
  /** 用户ID */
  id?: string;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 性别 */
  gender?: number;

  /** 手机号 */
  mobile?: string;

  /** 邮箱 */
  email?: string;
}
