import { defineStore } from "pinia"
import { ref } from "vue"
import { ElMessage } from "element-plus"

export interface LowCodeProject {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
  entities: any[] // Placeholder for entity definitions
  pages: any[] // Placeholder for page definitions
  workflows: any[] // Placeholder for workflow definitions
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const currentProject = ref<LowCodeProject | null>(null)
  const projects = ref<Record<string, LowCodeProject>>({})

  function createProject(projectInfo: { name: string; description?: string }) {
    const now = Date.now()
    const newProject: LowCodeProject = {
      id: `project-${now}`,
      name: projectInfo.name,
      description: projectInfo.description || "",
      createdAt: now,
      updatedAt: now,
      entities: [],
      pages: [],
      workflows: [],
    }
    projects.value[newProject.id] = newProject
    currentProject.value = newProject
    ElMessage.success(`Project "${newProject.name}" has been created.`)
  }

  function saveProject() {
    if (!currentProject.value) {
      ElMessage.error("No active project to save.")
      return
    }
    try {
      currentProject.value.updatedAt = Date.now()
      projects.value[currentProject.value.id] = currentProject.value
      localStorage.setItem(
        `lowcode-project-${currentProject.value.id}`,
        JSON.stringify(currentProject.value),
      )
      ElMessage.success(`Project "${currentProject.value.name}" has been saved.`)
    } catch (error) {
      console.error("Failed to save project to localStorage", error)
      ElMessage.error("Failed to save project.")
    }
  }

  function loadProject(id: string): LowCodeProject | null {
    try {
      const savedProject = localStorage.getItem(`lowcode-project-${id}`)
      if (savedProject) {
        const project = JSON.parse(savedProject) as LowCodeProject
        projects.value[id] = project
        currentProject.value = project
        ElMessage.success(`Project "${project.name}" has been loaded.`)
        return project
      }
      ElMessage.warning(`Project with ID "${id}" not found in local storage.`)
      return null
    } catch (error) {
      console.error("Failed to load project from localStorage", error)
      ElMessage.error("Failed to load project.")
      return null
    }
  }

  function closeProject() {
    if (currentProject.value) {
      ElMessage.info(`Project "${currentProject.value.name}" has been closed.`)
      currentProject.value = null
    }
  }

  return {
    currentProject,
    projects,
    createProject,
    loadProject,
    saveProject,
    closeProject,
  }
})


