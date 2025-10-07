/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useStudioStore } from "./workspace"

// Mockup of project.json structure
const MOCK_PROJECT = {
  name: "Test Project",
  description: "A test project for the low-code engine",
  version: "1.0.0",
  entities: [],
  pages: [],
}

vi.mock("@/utils/project-io", () => ({
  loadProjectFromFile: vi.fn(),
  saveProjectToFile: vi.fn(),
}))

describe("Low-code Workspace Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it("createProject should initialize a new project and set it as current", () => {
    const store = useStudioStore()
    expect(store.currentProject).toBeNull()

    store.createProject({
      name: "New Awesome Project",
      description: "My new project description",
    })

    expect(store.currentProject).not.toBeNull()
    expect(store.currentProject?.name).toBe("New Awesome Project")
    expect(store.currentProject?.id).toBeDefined()
    expect(store.currentProject?.createdAt).toBeDefined()
    expect(store.currentProject?.updatedAt).toBeDefined()
    expect(store.projects[store.currentProject!.id]).toBeDefined()
  })

  it("saveProject should call localStorage.setItem with the serialized project", () => {
    const store = useStudioStore()
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem")

    store.createProject({ name: "Project to Save" })
    const projectId = store.currentProject!.id
    store.saveProject()

    expect(setItemSpy).toHaveBeenCalledOnce()
    expect(setItemSpy).toHaveBeenCalledWith(
      `lowcode-project-${projectId}`,
      JSON.stringify(store.currentProject),
    )

    setItemSpy.mockRestore()
  })

  it("loadProject should retrieve a project from localStorage and set it as current", () => {
    // 1. Setup: Create a mock project and save it to localStorage
    const projectId = `project-${Date.now()}`
    const mockProject = {
      ...MOCK_PROJECT,
      id: projectId,
      name: "Loaded Project",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    localStorage.setItem(
      `lowcode-project-${projectId}`,
      JSON.stringify(mockProject),
    )

    // 2. Action: Load the project in a new store instance
    const store = useStudioStore()
    store.loadProject(projectId)

    // 3. Assertion: Verify the project is loaded correctly
    expect(store.currentProject).not.toBeNull()
    expect(store.currentProject?.id).toBe(projectId)
    expect(store.currentProject?.name).toBe("Loaded Project")
  })

  it("closeProject should clear the current project", () => {
    const store = useStudioStore()
    store.createProject({ name: "Project to Close" })
    expect(store.currentProject).not.toBeNull()

    store.closeProject()
    expect(store.currentProject).toBeNull()
  })
})


