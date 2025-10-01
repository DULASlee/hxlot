/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useTemplatesStore } from "./templates"
import { codeGeneratorApi } from "@smartabp/lowcode-api"

vi.mock("@smartabp/lowcode-api", () => ({
  codeGeneratorApi: {
    generateModule: vi.fn(async () => ({ success: true })),
    getTemplates: vi.fn(),
  },
}))

describe("Templates Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it("should fetch templates and populate the store", async () => {
    const store = useTemplatesStore()
    const mockTemplates = [{ id: "test", name: "Test Template" }]
    vi.mocked(codeGeneratorApi.getTemplates!).mockResolvedValue(mockTemplates)

    await store.fetchTemplates()

    expect(store.templates).toEqual(mockTemplates)
    expect(codeGeneratorApi.getTemplates).toHaveBeenCalledOnce()
  })
})
