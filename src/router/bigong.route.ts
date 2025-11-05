import { RouteRecordRaw } from "vue-router";

export const bigongRoute: RouteRecordRaw = {
  path: "/bigong",
  component: () => import("@/layout/index.vue"),
  redirect: "/bigong/feed",
  name: "/bigong",
  meta: { title: "评价管理" },
  children: [
    {
      path: "feed",
      component: () => import("@/views/bigong/feed/index.vue"),
      name: "/bigong/feed",
      meta: { title: "评价列表", noCache: true },
    },
  ],
};
