import { defineStore } from "pinia";
import { ref, computed } from "vue";
export const useProjectStore = defineStore("project", () => {
    // 状态
    const projects = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const currentProject = ref(null);
    // 计算属性
    const activeProjects = computed(() => projects.value.filter((project) => project.status === "active"));
    const completedProjects = computed(() => projects.value.filter((project) => project.status === "completed"));
    const projectsByPriority = computed(() => {
        return {
            high: projects.value.filter((p) => p.priority === "high"),
            medium: projects.value.filter((p) => p.priority === "medium"),
            low: projects.value.filter((p) => p.priority === "low"),
        };
    });
    const projectCount = computed(() => projects.value.length);
    const hasProjects = computed(() => projects.value.length > 0);
    // 方法（占位符，待实现具体业务逻辑）
    const fetchProjects = async () => {
        loading.value = true;
        error.value = null;
        try {
            // TODO: 实现获取项目列表的API调用
            // const response = await projectApi.getProjects()
            // projects.value = response.data
        }
        catch (err) {
            error.value = "获取项目列表失败";
            throw err;
        }
        finally {
            loading.value = false;
        }
    };
    const createProject = async (_projectData) => {
        try {
            // TODO: 实现创建项目的API调用
            // const response = await projectApi.createProject(projectData)
            // projects.value.push(response.data)
            // return response.data
        }
        catch (err) {
            error.value = "创建项目失败";
            throw err;
        }
    };
    const updateProject = async (_projectData) => {
        try {
            // TODO: 实现更新项目的API调用
            // const response = await projectApi.updateProject(projectData)
            // const index = projects.value.findIndex(p => p.id === projectData.id)
            // if (index !== -1) {
            //   projects.value[index] = response.data
            // }
            // return response.data
        }
        catch (err) {
            error.value = "更新项目失败";
            throw err;
        }
    };
    const deleteProject = async (_projectId) => {
        try {
            // TODO: 实现删除项目的API调用
            // await projectApi.deleteProject(projectId)
            // projects.value = projects.value.filter(p => p.id !== projectId)
        }
        catch (err) {
            error.value = "删除项目失败";
            throw err;
        }
    };
    const getProjectById = (projectId) => {
        return projects.value.find((project) => project.id === projectId);
    };
    const setCurrentProject = (project) => {
        currentProject.value = project;
    };
    const clearError = () => {
        error.value = null;
    };
    return {
        // 状态
        projects,
        loading,
        error,
        currentProject,
        // 计算属性
        activeProjects,
        completedProjects,
        projectsByPriority,
        projectCount,
        hasProjects,
        // 方法
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        getProjectById,
        setCurrentProject,
        clearError,
    };
});
