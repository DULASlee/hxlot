import type { RouteRecordRaw } from "vue-router"

const moduleName = "{{moduleName}}"

const routes: RouteRecordRaw[] = [
  {
    path: "/{{moduleName}}",
    name: "{{moduleName}}Root",
    meta: {
      title: "{{DisplayName}}",
      icon: "mdi:cube-outline",
    },
    children: [
      // Routes will be injected here by the generator
    ],
  },
]

export default routes
