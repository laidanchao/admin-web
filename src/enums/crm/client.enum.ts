/** 客户类型 */
export enum CLIENT_TYPE_ENUM {
  "PERSONAL" = "PERSONAL", // 个人
  "COMPANY" = "COMPANY", // 企业
}
/**
 * 客户分级
 */
export enum CLIENT_STAGE {
  "DEFAULT" = "DEFAULT", // 未开发的客户
  "NOT_INTERESTED" = "NOT_INTERESTED", // 没有意向的客户
  "INTERESTING" = "INTERESTING", // 有意向的客户
  "COOPERATING" = "COOPERATING", // 合作中的客户
}
