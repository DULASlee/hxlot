declare module "@smartabp/lowcode-designer" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<any, any, any>
  export default component
}

declare module "@smartabp/lowcode-designer/*" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<any, any, any>
  export default component
}

