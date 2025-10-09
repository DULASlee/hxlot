import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
/**
 * 项目Store
 * 负责管理项目数据和状态
 */
export const useProjectStore = defineStore('project', () => {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 状态定义
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const projects = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const currentProject = ref(null);
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 计算属性
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /**
     * 活跃项目列表
     */
    const activeProjects = computed(() => projects.value.filter(project => project.status === 'active'));
    /**
     * 已完成项目列表
     */
    const completedProjects = computed(() => projects.value.filter(project => project.status === 'completed'));
    /**
     * 按优先级分组的项目
     */
    const projectsByPriority = computed(() => ({
        high: projects.value.filter(p => p.priority === 'high'),
        medium: projects.value.filter(p => p.priority === 'medium'),
        low: projects.value.filter(p => p.priority === 'low')
    }));
    /**
     * 项目总数
     */
    const projectCount = computed(() => projects.value.length);
    /**
     * 是否有项目
     */
    const hasProjects = computed(() => projects.value.length > 0);
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Actions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /**
     * 获取项目列表
     */
    const fetchProjects = async () => {
        loading.value = true;
        error.value = null;
        try {
            // TODO: 实现获取项目列表的API调用
            // const response = await projectApi.getProjects()
            // projects.value = response.data
        }
        catch (err) {
            error.value = '获取项目列表失败';
            throw err;
        }
        finally {
            loading.value = false;
        }
    };
    /**
     * 创建项目
     */
    const createProject = async (_projectData) => {
        try {
            // TODO: 实现创建项目的API调用
            // const response = await projectApi.createProject(_projectData)
            // projects.value.push(response.data)
            // return response.data
        }
        catch (err) {
            error.value = '创建项目失败';
            throw err;
        }
    };
    /**
     * 更新项目
     */
    const updateProject = async (_projectData) => {
        try {
            // TODO: 实现更新项目的API调用
            // const response = await projectApi.updateProject(_projectData)
            // const index = projects.value.findIndex(p => p.id === _projectData.id)
            // if (index !== -1) {
            //   projects.value[index] = response.data
            // }
            // return response.data
        }
        catch (err) {
            error.value = '更新项目失败';
            throw err;
        }
    };
    /**
     * 删除项目
     */
    const deleteProject = async (_projectId) => {
        try {
            // TODO: 实现删除项目的API调用
            // await projectApi.deleteProject(_projectId)
            // projects.value = projects.value.filter(p => p.id !== _projectId)
        }
        catch (err) {
            error.value = '删除项目失败';
            throw err;
        }
    };
    /**
     * 根据ID获取项目
     */
    const getProjectById = (projectId) => {
        return projects.value.find(project => project.id === projectId);
    };
    /**
     * 设置当前项目
     */
    const setCurrentProject = (project) => {
        currentProject.value = project;
    };
    /**
     * 清除错误信息
     */
    const clearError = () => {
        error.value = null;
    };
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 返回Store接口
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
        clearError
    };
});
