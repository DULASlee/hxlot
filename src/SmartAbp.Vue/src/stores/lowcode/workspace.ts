import { defineStore } from "pinia"

export type StudioSection =
  | "project"
  | "models"
  | "pages"
  | "workflows"
  | "themes"
  | "integrations"
  | "codegen"
  | "preview"

export interface ProjectInfo {
  name: string
  version?: string
  description?: string
}

interface WorkspaceState {
  activeSection: StudioSection
  project: ProjectInfo | null
}

const STORAGE_KEY = "smartabp.lowcode.project"

export const useWorkspaceStore = defineStore("lowcode-workspace", {
  state: (): WorkspaceState => ({
    activeSection: "project",
    project: null,
  }),
  actions: {
    setActiveSection(s: StudioSection) {
      this.activeSection = s
    },
    newProject(partial?: Partial<ProjectInfo>) {
      this.project = {
        name: partial?.name || "Untitled Project",
        version: partial?.version || "0.1.0",
        description: partial?.description || "",
      }
    },
    saveProjectToLocalStorage() {
      if (!this.project) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.project))
      } catch (err) {
        console.error("[workspace] saveProject error", err)
      }
    },
    loadProjectFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          this.project = JSON.parse(raw)
        }
      } catch (err) {
        console.error("[workspace] loadProject error", err)
      }
    },
  },
})


