/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { ElMessage } from "element-plus"
import GenerationView from "./GenerationView.vue"
import { useWorkspaceStore } from "@/stores/lowcode/workspace"
import { codeGeneratorApi } from "@smartabp/lowcode-api"

// Mock ElementPlus
vi.mock("element-plus", async () => {
  const actual = await vi.importActual("element-plus")
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  }
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe("GenerationView E2E", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountComponent = () => {
    return mount(GenerationView, {
      global: {
        stubs: {
          "el-card": true,
          "el-tag": true,
          "el-button": true,
          "el-form": true,
          "el-form-item": true,
          "el-input": true,
          "el-select": true,
          "el-option": true,
          "TemplateSelector": {
            template: "<div data-testid='template-selector'></div>",
            emits: ["select"],
          },
          "SandboxPreview": {
            template: "<div data-testid='sandbox-preview'>{{ code }}</div>",
            props: ["code"],
          },
        },
      },
    })
  }

  it("should complete full generation workflow", async () => {
    const workspaceStore = useWorkspaceStore()

    // Step 1: Create a project first
    workspaceStore.createProject({
      name: "Test Project",
      description: "E2E test project",
    })

    // Step 2: Mount component after project is created
    const wrapper = mountComponent()
    await wrapper.vm.$nextTick()

    // Step 3: Verify project is accessible via store (simpler check)
    expect(workspaceStore.currentProject?.name).toBe("Test Project")

    // Step 4: Simulate template selection via direct store access
    const vm = wrapper.vm as any
    vm.selectedTemplate = {
      id: "crud",
      name: "CRUD Management",
      description: "Complete CRUD operations",
    }
    vm.generationParams.entityName = "Product"
    vm.generationParams.moduleName = "Catalog"

    await wrapper.vm.$nextTick()

    // Step 5: Trigger code generation via direct method call
    await vm.generateCode()

    // Step 6: Verify generation was called
    expect(ElMessage.success).toHaveBeenCalledWith("Code generated successfully!")

    // Step 7: Verify project was updated with generated page
    expect(workspaceStore.currentProject?.pages).toHaveLength(1)
    expect(workspaceStore.currentProject?.pages[0].name).toBe("Product")
    expect(workspaceStore.currentProject?.pages[0].template).toBe("crud")
  })

  it("should handle generation errors gracefully", async () => {
    const workspaceStore = useWorkspaceStore()

    // Create project but mock API failure
    workspaceStore.createProject({ name: "Test Project" })
    vi.spyOn(codeGeneratorApi, "generateModule").mockRejectedValueOnce(
      new Error("Generation failed")
    )

    const wrapper = mountComponent()
    await wrapper.vm.$nextTick()

    // Simulate template selection and trigger generation via direct access
    const vm = wrapper.vm as any
    vm.selectedTemplate = { id: "crud", name: "CRUD" }
    vm.generationParams.entityName = "Product"
    vm.generationParams.moduleName = "Catalog"

    await vm.generateCode()

    // Verify error handling
    expect(ElMessage.error).toHaveBeenCalledWith(
      "Code generation failed: Generation failed"
    )
  })

  it("should copy generated code to clipboard", async () => {
    const workspaceStore = useWorkspaceStore()

    // Setup: Create project and generate code
    workspaceStore.createProject({ name: "Test Project" })
    
    const wrapper = mountComponent()
    await wrapper.vm.$nextTick()

    // Setup generation via direct access
    const vm = wrapper.vm as any
    vm.selectedTemplate = { id: "crud", name: "CRUD" }
    vm.generationParams.entityName = "Product"
    vm.generationParams.moduleName = "Catalog"

    // Generate code first
    await vm.generateCode()
    await wrapper.vm.$nextTick()

    // Test copy functionality via direct method call
    await vm.copyCode()
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(ElMessage.success).toHaveBeenCalledWith("Code copied to clipboard!")
  })
})
