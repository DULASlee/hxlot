import type { RouteRecordRaw } from "vue-router"
import { t } from "@/hooks/useI18n"

const moduleName = "{{moduleName}}"

const routes: RouteRecordRaw[] = [
  {
    path: "/{{moduleName}}",
    name: "{{moduleName}}Root",
    meta: {
      title: t("routes.{{moduleName}}.title"),
      icon: "mdi:cube-outline", // Default icon
    },
    children: [
      // Routes will be injected here by the generator
    ],
  },
]

export default routes
