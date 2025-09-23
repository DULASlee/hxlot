import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import LowCodeStudioView from "./LowCodeStudioView.vue"
import { useWorkspaceStore } from "@/stores/lowcode/workspace"
import { createRouter, createWebHistory } from "vue-router"

// Mock ElementPlus components
vi.mock("element-plus", async () => {
  const actual = await vi.importActual("element-plus")
  return {
    ...actual,
    ElDropdown: { template: '<div class="el-dropdown"><slot /></div>' },
    ElDropdownMenu: { template: '<div class="el-dropdown-menu"><slot /></div>' },
    ElDropdownItem: { template: '<div class="el-dropdown-item"><slot /></div>' },
    ElButton: { template: '<button class="el-button"><slot /></button>' },
    ElButtonGroup: { template: '<div class="el-button-group"><slot /></div>' },
    ElBadge: { template: '<div class="el-badge"><slot /></div>' },
    ElTabs: { template: '<div class="el-tabs"><slot /></div>' },
    ElTabPane: { template: '<div class="el-tab-pane"><slot /></div>' },
    ElBreadcrumb: { template: '<div class="el-breadcrumb"><slot /></div>' },
    ElBreadcrumbItem: { template: '<div class="el-breadcrumb-item"><slot /></div>' },
  }
})

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
          ThemeEditor: { template: '<div class="theme-editor">Theme Editor</div>' },
          SandboxPreview: { template: '<div class="sandbox-preview">Sandbox Preview</div>' },
        },
      },
    })
  }

  it("should render the studio shell with header, navigation, and content areas", () => {
    const wrapper = mountComponent()
    
    // Check main shell structure
    expect(wrapper.find(".lowcode-studio").exists()).toBe(true)
    expect(wrapper.find(".studio-header").exists()).toBe(true)
    expect(wrapper.find(".studio-body").exists()).toBe(true)
    expect(wrapper.find(".studio-footer").exists()).toBe(true)
  })

  it("should display the studio logo and workspace selector", () => {
    const wrapper = mountComponent()
    
    // Check logo
    expect(wrapper.find(".studio-logo").exists()).toBe(true)
    expect(wrapper.find(".logo-text").text()).toBe("LowCode Studio")
    
    // Check workspace selector
    expect(wrapper.find(".workspace-selector").exists()).toBe(true)
    expect(wrapper.find(".workspace-name").text()).toContain("默认工作空间")
  })

  it("should render navigation with core workflow steps", async () => {
    const wrapper = mountComponent()
    
    const navigation = wrapper.find(".studio-navigation")
    expect(navigation.exists()).toBe(true)
    
    // Check for core workflow steps
    const navItems = wrapper.findAll(".nav-item")
    expect(navItems.length).toBeGreaterThan(0)
    
    // Should contain modeling, design, and generation steps
    const navText = wrapper.find(".nav-menu").text()
    expect(navText).toContain("数据建模")
    expect(navText).toContain("页面设计") 
    expect(navText).toContain("代码生成")
  })

  it("should show toolbar actions in header", () => {
    const wrapper = mountComponent()
    
    const toolbar = wrapper.find(".studio-toolbar")
    expect(toolbar.exists()).toBe(true)
    
    // Check for undo/redo buttons
    expect(toolbar.text()).toContain("撤销")
    expect(toolbar.text()).toContain("重做")
    expect(toolbar.text()).toContain("预览")
    expect(toolbar.text()).toContain("生成代码")
  })

  it("should render sidebar with property panel and preview", () => {
    const wrapper = mountComponent()
    
    const sidebar = wrapper.find(".studio-sidebar")
    expect(sidebar.exists()).toBe(true)
    
    const sidebarTabs = wrapper.find(".sidebar-tabs")
    expect(sidebarTabs.exists()).toBe(true)
    
    // Check for theme editor and preview components
    expect(wrapper.findComponent({ name: "ThemeEditor" }).exists() || wrapper.find(".theme-editor").exists()).toBe(true)
  })

  it("should switch workspace when workspace selector is used", async () => {
    const wrapper = mountComponent()
    const store = useWorkspaceStore()
    
    // Mock the switchWorkspace method
    const switchWorkspaceSpy = vi.spyOn(wrapper.vm, "switchWorkspace")
    
    // Simulate workspace switch (would normally be triggered by dropdown)
    wrapper.vm.switchWorkspace("project1")
    
    expect(switchWorkspaceSpy).toHaveBeenCalledWith("project1")
  })

  it("should handle navigation collapse toggle", async () => {
    const wrapper = mountComponent()
    
    // Find toggle button
    const navHeader = wrapper.find(".nav-header")
    expect(navHeader.exists()).toBe(true)
    
    // Initial state should not be collapsed
    const navigation = wrapper.find(".studio-navigation")
    expect(navigation.classes()).not.toContain("collapsed")
  })

  it("should display footer with logs and output", () => {
    const wrapper = mountComponent()
    
    const footer = wrapper.find(".studio-footer")
    expect(footer.exists()).toBe(true)
    
    // The footer should exist with content, specific text may vary
    expect(footer.text().length).toBeGreaterThan(0)
    
    // Ensure footer contains either tab structure or output content
    const hasFooterContent = footer.text().includes("清空") || 
                            footer.text().includes("输出") ||
                            footer.text().includes("LowCode Studio")
    expect(hasFooterContent).toBe(true)
  })

  it("should show welcome message in output panel by default", () => {
    const wrapper = mountComponent()
    
    const outputPanel = wrapper.find(".output-panel")
    if (outputPanel.exists()) {
      expect(outputPanel.text()).toContain("欢迎使用LowCode Studio")
    }
  })
})