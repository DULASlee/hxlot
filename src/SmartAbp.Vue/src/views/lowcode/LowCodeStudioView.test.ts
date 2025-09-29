import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import LowCodeStudioView from "./LowCodeStudioView.vue"
import { createRouter, createWebHistory } from "vue-router"

// Mock ElementPlus components
vi.mock("element-plus", async () => {
  const actual = await vi.importActual("element-plus")
  return {
    ...actual,
    ElDialog: { template: '<div class="el-dialog"><slot /></div>' },
    ElIcon: { template: '<div class="el-icon"><slot /></div>' },
  }
})

// Mock child components
vi.mock("@/components/layout/StudioHeader.vue", () => ({
  default: { template: '<div class="studio-header">Studio Header</div>' }
}))

vi.mock("@/components/layout/StudioSidebar.vue", () => ({
  default: { template: '<div class="studio-sidebar">Studio Sidebar</div>' }
}))

vi.mock("@/components/layout/StudioPropertyPanel.vue", () => ({
  default: { template: '<div class="studio-property-panel">Property Panel</div>' }
}))

vi.mock("@/components/layout/StudioFooter.vue", () => ({
  default: { template: '<div class="studio-footer">Studio Footer</div>' }
}))

vi.mock("@/components/common/ModuleLoadingState.vue", () => ({
  default: { template: '<div class="module-loading-state">Loading...</div>' }
}))

vi.mock("./templates/TemplateManager.vue", () => ({
  default: { template: '<div class="template-manager">Template Manager</div>' }
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/studio", name: "Studio", component: { template: "<div></div>" } },
  ],
})

describe("LowCodeStudioView.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountComponent = () => {
    return mount(LowCodeStudioView, {
      global: {
        plugins: [router],
        stubs: {
          "router-view": true,
          "el-dialog": true,
          "el-icon": true,
        },
      },
    })
  }

  it("should render the main studio container", () => {
    const wrapper = mountComponent()
    expect(wrapper.find(".lowcode-studio").exists()).toBe(true)
  })

  it("should contain all major layout components", () => {
    const wrapper = mountComponent()
    
    // Check for main layout components
    expect(wrapper.find(".studio-header").exists()).toBe(true)
    expect(wrapper.find(".studio-sidebar").exists()).toBe(true)
    expect(wrapper.find(".studio-footer").exists()).toBe(true)
  })

  it("should render the workspace area", () => {
    const wrapper = mountComponent()
    expect(wrapper.find(".studio-workspace").exists()).toBe(true)
  })

  it("should handle loading state", () => {
    const wrapper = mountComponent()
    // The loading overlay should not be visible by default
    expect(wrapper.find(".global-loading-overlay").exists()).toBe(false)
  })
})
