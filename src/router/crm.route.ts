import { RouteRecordRaw } from "vue-router";

export const crmRoute: RouteRecordRaw = {
  path: "/crm",
  component: () => import("@/layout/index.vue"),
  redirect: "/crm/client",
  name: "/crm",
  meta: { title: "客户管理" },
  children: [
    {
      path: "client",
      component: () => import("@/views/crm/client/index.vue"),
      name: "/crm/client",
      meta: { title: "客户列表", noCache: true },
    },
    {
      path: "myClient",
      component: () => import("@/views/crm/my-client/index.vue"),
      name: "/crm/myClient",
      meta: { title: "我的客户", noCache: true },
    },
  ],
};
