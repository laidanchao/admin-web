// 核心枚举定义
export enum MenuTypeEnum {
  "CATALOG" = "CATALOG", // 目录
  "MENU" = "MENU", // 菜单
  "BUTTON" = "BUTTON", // 按钮
  "LINK" = "LINK", // 外链
}

// 类型标签映射配置
export const MenuTypeConfig = {
  [MenuTypeEnum.CATALOG]: {
    label: "目录",
    type: "warning" as const,
    icon: "folder-opened",
    value: "CATALOG",
  },
  [MenuTypeEnum.MENU]: {
    label: "菜单",
    type: "success" as const,
    icon: "menu",
    value: "MENU",
  },
  [MenuTypeEnum.BUTTON]: {
    label: "按钮",
    type: "danger" as const,
    icon: "mouse",
    value: "BUTTON",
  },
  [MenuTypeEnum.LINK]: {
    label: "外链",
    type: "info" as const,
    icon: "link",
    value: "LINK",
  },
} as const;
