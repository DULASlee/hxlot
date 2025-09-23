import { describe, it, expect, beforeEach, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useTemplatesStore } from "@/stores/lowcode/templates"
import { codeGeneratorApi } from "@smartabp/lowcode-api"
import type { TemplateDefinition } from "@smartabp/lowcode-api/types"

// Mock the API module
vi.mock("@smartabp/lowcode-api", () => ({
  codeGeneratorApi: {
    getTemplates: vi.fn(),
  },
}))

const MOCK_TEMPLATES: TemplateDefinition[] = [
  { id: "crud", name: "CRUD Page", description: "Generates a full CRUD page.", type: "frontend" },
  { id: "service", name: "Application Service", description: "Generates a backend service.", type: "backend" },
]

describe("Templates Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it("should initialize with an empty list of templates", () => {
    const store = useTemplatesStore()
    expect(store.templates).toHaveLength(0)
    expect(store.isLoading).toBe(false)
  })

  it("should fetch templates and populate the store", async () => {
    const store = useTemplatesStore()
    // Mock the API response
    vi.mocked(codeGeneratorApi.getTemplates).mockResolvedValue(MOCK_TEMPLATES)

    await store.fetchTemplates()

    expect(store.isLoading).toBe(false)
    expect(store.templates).toHaveLength(2)
    expect(store.templates[0].name).toBe("CRUD Page")
    expect(codeGeneratorApi.getTemplates).toHaveBeenCalledOnce()
  })

  it("should handle API errors gracefully", async () => {
    const store = useTemplatesStore()
    const testError = new Error("Failed to fetch")
    // Mock the API rejection
    vi.mocked(codeGeneratorApi.getTemplates).mockRejectedValue(testError)

    await store.fetchTemplates()

    expect(store.isLoading).toBe(false)
    expect(store.templates).toHaveLength(0)
    expect(store.error).toBe(testError)
  })
})
