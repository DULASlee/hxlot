/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useTemplatesStore } from "./templates"
// Mock for code generator API
const mockCodeGeneratorApi = {
  generateModule: vi.fn(async () => ({ success: true })),
  getTemplates: vi.fn(),
}

describe("Templates Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it("should fetch templates and populate the store", async () => {
    const store = useTemplatesStore()
    const mockTemplates = [{ id: "test", name: "Test Template" }]
    mockCodeGeneratorApi.getTemplates.mockResolvedValue(mockTemplates)

    await store.fetchTemplates()

    expect(store.templates).toEqual(mockTemplates)
    expect(mockCodeGeneratorApi.getTemplates).toHaveBeenCalledOnce()
  })
})
