import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import LowCodeStudioView from "./LowCodeStudioView.vue"
import { useWorkspaceStore } from "@/stores/lowcode/workspace"
import { ElMessageBox } from "element-plus"
import { createRouter, createWebHistory } from "vue-router"

// Mock ElementPlus messages
vi.mock("element-plus", async () => {
  const actual = await vi.importActual("element-plus")
  return {
    ...actual,
    ElMessageBox: {
      prompt: vi.fn().mockResolvedValue({ value: "Test Project Name" }),
    },
  }
})

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [],
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
          "el-button": true,
          "el-message-box": true,
        },
      },
    })
  }

  it("should display a welcome message and action buttons when no project is loaded", () => {
    const wrapper = mountComponent()
    expect(wrapper.find("h1").text()).toBe("低代码工作室")
    expect(wrapper.find("p").text()).toContain(
      "欢迎来到低代码工作室",
    )
    expect(wrapper.find("[data-testid=new-project-btn]").exists()).toBe(
      true,
    )
  })

  it('should call workspaceStore.createProject when "New Project" button is clicked', async () => {
    const wrapper = mountComponent()
    const store = useWorkspaceStore()
    const createProjectSpy = vi.spyOn(store, "createProject")

    await wrapper.find("[data-testid=new-project-btn]").trigger("click")

    expect(ElMessageBox.prompt).toHaveBeenCalled()
    expect(createProjectSpy).toHaveBeenCalledWith({
      name: "Test Project Name",
      description: "这是一个新的低代码项目",
    })
  })

  it("should display project details and controls when a project is active", async () => {
    const wrapper = mountComponent()
    const store = useWorkspaceStore()

    // Manually set a project in the store to simulate it being active
    store.createProject({ name: "My Test Project" })
    await wrapper.vm.$nextTick() // Wait for Vue to update the DOM

    expect(wrapper.find("h2").text()).toContain("当前项目: My Test Project")
    expect(wrapper.find("[data-testid=save-project-btn]").exists()).toBe(true)
    expect(wrapper.find("[data-testid=close-project-btn]").exists()).toBe(true)
  })

  it('should call workspaceStore.saveProject when "Save Project" button is clicked', async () => {
    const wrapper = mountComponent()
    const store = useWorkspaceStore()
    store.createProject({ name: "My Test Project" })
    await wrapper.vm.$nextTick()

    const saveProjectSpy = vi.spyOn(store, "saveProject")
    await wrapper.find("[data-testid=save-project-btn]").trigger("click")

    expect(saveProjectSpy).toHaveBeenCalledOnce()
  })

  it('should call workspaceStore.closeProject when "Close Project" button is clicked', async () => {
    const wrapper = mountComponent()
    const store = useWorkspaceStore()
    store.createProject({ name: "My Test Project" })
    await wrapper.vm.$nextTick()

    const closeProjectSpy = vi.spyOn(store, "closeProject")
    await wrapper.find("[data-testid=close-project-btn]").trigger("click")

    expect(closeProjectSpy).toHaveBeenCalledOnce()
  })
})


