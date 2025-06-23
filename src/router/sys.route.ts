import { RouteRecordRaw } from "vue-router";

export const sysRoute: RouteRecordRaw = {
  path: "/system",
  component: () => import("@/layout/index.vue"),
  redirect: "/system/user",
  name: "/sys",
  meta: { title: "系统管理" },
  children: [
    {
      path: "user",
      component: () => import("@/views/system/user/index.vue"),
      name: "/sys/user",
      meta: { title: "用户管理", noCache: true },
    },
    {
      path: "role",
      component: () => import("@/views/system/role/index.vue"),
      name: "/sys/role",
      meta: { title: "角色管理", noCache: true },
    },
    {
      path: "menu",
      component: () => import("@/views/system/menu/index.vue"),
      name: "/sys/menu",
      meta: { title: "菜单管理", noCache: true },
    },
    {
      path: "dept",
      component: () => import("@/views/system/dept/index.vue"),
      name: "/sys/dept",
      meta: { title: "部门管理", noCache: true },
    },
  ],
};
