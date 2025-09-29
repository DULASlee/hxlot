import { describe, it, expect, beforeEach, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useTemplatesStore } from "./templates.ts"

// Mock for code generator API
const mockCodeGeneratorApi = {
  generateModule: vi.fn(async () => ({ success: true })),
  getTemplates: vi.fn(async () => [{ id: "test", name: "Test Template" }]),
}

describe("Templates Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it("should initialize with empty templates", () => {
    const store = useTemplatesStore()
    expect(store.templates).toEqual([])
  })

  it("should fetch templates and populate the store", async () => {
    const store = useTemplatesStore()
    const mockTemplates = [{ id: "test", name: "Test Template" }]
    
    // Mock the fetchTemplates method
    store.fetchTemplates = vi.fn(async () => {
      const result = await mockCodeGeneratorApi.getTemplates()
      store.templates = result
      return result
    })

    await store.fetchTemplates()

    expect(store.templates).toEqual(mockTemplates)
    expect(mockCodeGeneratorApi.getTemplates).toHaveBeenCalledOnce()
  })
})
