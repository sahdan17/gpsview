import { createRouter, createWebHistory } from "vue-router"
import DashboardView from "@/views/DashboardView.vue"
import HistoryView from "@/views/HistoryView.vue"

const routes = [
    {
        path: "/",
        redirect: "dashboard"
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: DashboardView,
    },
    {
        path: "/history",
        name: "history",
        component: HistoryView,
        props: true
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router