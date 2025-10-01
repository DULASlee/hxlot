import { type Ref, type ComputedRef } from 'vue';
/**
 * 项目状态枚举
 */
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'draft';
/**
 * 项目优先级枚举
 */
export type ProjectPriority = 'high' | 'medium' | 'low';
/**
 * 项目接口
 */
export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: any;
}
/**
 * 按优先级分组的项目
 */
export interface ProjectsByPriority {
    high: Project[];
    medium: Project[];
    low: Project[];
}
/**
 * 项目Store
 * 负责管理项目数据和状态
 */
export declare const useProjectStore: import("pinia").StoreDefinition<"project", Pick<{
    projects: Ref<Project[], Project[]>;
    loading: Ref<boolean, boolean>;
    error: Ref<string | null, string | null>;
    currentProject: Ref<Project | null, Project | null>;
    activeProjects: ComputedRef<Project[]>;
    completedProjects: ComputedRef<Project[]>;
    projectsByPriority: ComputedRef<ProjectsByPriority>;
    projectCount: ComputedRef<number>;
    hasProjects: ComputedRef<boolean>;
    fetchProjects: () => Promise<void>;
    createProject: (_projectData: Partial<Project>) => Promise<void>;
    updateProject: (_projectData: Partial<Project>) => Promise<void>;
    deleteProject: (_projectId: string) => Promise<void>;
    getProjectById: (projectId: string) => Project | undefined;
    setCurrentProject: (project: Project | null) => void;
    clearError: () => void;
}, "currentProject" | "projects" | "error" | "loading">, Pick<{
    projects: Ref<Project[], Project[]>;
    loading: Ref<boolean, boolean>;
    error: Ref<string | null, string | null>;
    currentProject: Ref<Project | null, Project | null>;
    activeProjects: ComputedRef<Project[]>;
    completedProjects: ComputedRef<Project[]>;
    projectsByPriority: ComputedRef<ProjectsByPriority>;
    projectCount: ComputedRef<number>;
    hasProjects: ComputedRef<boolean>;
    fetchProjects: () => Promise<void>;
    createProject: (_projectData: Partial<Project>) => Promise<void>;
    updateProject: (_projectData: Partial<Project>) => Promise<void>;
    deleteProject: (_projectId: string) => Promise<void>;
    getProjectById: (projectId: string) => Project | undefined;
    setCurrentProject: (project: Project | null) => void;
    clearError: () => void;
}, "activeProjects" | "completedProjects" | "projectsByPriority" | "projectCount" | "hasProjects">, Pick<{
    projects: Ref<Project[], Project[]>;
    loading: Ref<boolean, boolean>;
    error: Ref<string | null, string | null>;
    currentProject: Ref<Project | null, Project | null>;
    activeProjects: ComputedRef<Project[]>;
    completedProjects: ComputedRef<Project[]>;
    projectsByPriority: ComputedRef<ProjectsByPriority>;
    projectCount: ComputedRef<number>;
    hasProjects: ComputedRef<boolean>;
    fetchProjects: () => Promise<void>;
    createProject: (_projectData: Partial<Project>) => Promise<void>;
    updateProject: (_projectData: Partial<Project>) => Promise<void>;
    deleteProject: (_projectId: string) => Promise<void>;
    getProjectById: (projectId: string) => Project | undefined;
    setCurrentProject: (project: Project | null) => void;
    clearError: () => void;
}, "createProject" | "fetchProjects" | "updateProject" | "deleteProject" | "getProjectById" | "setCurrentProject" | "clearError">>;
//# sourceMappingURL=project.d.ts.map