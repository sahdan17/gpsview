import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;