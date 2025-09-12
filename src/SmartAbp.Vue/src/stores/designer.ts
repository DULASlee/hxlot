import { defineStore } from "pinia"

export interface DesignerComponent {
  id: string
  type: string
  props: Record<string, unknown>
  parentId?: string
  position?: { x: number; y: number; index?: number; slot?: string }
}

export interface DesignerState {
  components: DesignerComponent[]
  selectedId?: string
}

export const useDesignerStore = defineStore("designer", {
  state: (): DesignerState => ({ components: [], selectedId: undefined }),
  actions: {
    addComponent(component: DesignerComponent) {
      this.components.push(component)
      this.selectedId = component.id
    },
    removeComponent(id: string) {
      const index = this.components.findIndex((c) => c.id === id)
      if (index > -1) {
        this.components.splice(index, 1)
        if (this.selectedId === id) {
          this.selectedId = undefined
        }
      }
    },
    updateComponent(id: string, updates: Partial<DesignerComponent>) {
      const comp = this.components.find((c) => c.id === id)
      if (comp) {
        Object.assign(comp, updates)
      }
    },
    moveComponent(id: string, position: { x: number; y: number }) {
      const comp = this.components.find((c) => c.id === id)
      if (comp) {
        comp.position = { ...comp.position, ...position }
      }
    },
    clear() {
      this.components = []
      this.selectedId = undefined
    },
    select(id?: string) {
      this.selectedId = id
    },
    updateProps(id: string, patches: Record<string, unknown>) {
      const comp = this.components.find((c) => c.id === id)
      if (!comp) return
      comp.props = { ...comp.props, ...patches }
    },
  },
  getters: {
    selectedComponent: (state) => {
      return state.selectedId ? state.components.find(c => c.id === state.selectedId) : null
    },
    componentCount: (state) => state.components.length,
  }
})
