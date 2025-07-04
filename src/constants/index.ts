import { mapKeys } from "lodash-es";

export const GENDER_OPTIONS: {
  value: string;
  label: string;
  tagType: "success" | "danger" | "primary" | "warning" | "info";
}[] = [
  {
    value: "MALE",
    label: "男",
    tagType: "success",
  },
  {
    value: "FEMALE",
    label: "女",
    tagType: "danger",
  },
];
export const GENDER_MAP = mapKeys(GENDER_OPTIONS, "value");

export const USER_STATUS_OPTIONS: {
  value: string;
  label: string;
  tagType: "success" | "danger" | "primary" | "warning" | "info";
}[] = [
  {
    value: "NORMAL",
    label: "正常",
    tagType: "success",
  },
  {
    value: "FROZEN",
    label: "冻结",
    tagType: "danger",
  },
];
export const USER_STATUS_MAP = mapKeys(USER_STATUS_OPTIONS, "value");
