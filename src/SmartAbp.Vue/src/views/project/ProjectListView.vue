<template>
  <div class="projects-view">
    <div class="page-header">
      <h1>项目列表</h1>
      <p>管理和监控所有项目</p>
    </div>

    <div class="page-content">
      <div class="toolbar">
        <div class="filters">
          <select
            v-model="statusFilter"
            class="filter-select"
          >
            <option value="">
              所有状态
            </option>
            <option value="active">
              进行中
            </option>
            <option value="completed">
              已完成
            </option>
            <option value="paused">
              已暂停
            </option>
          </select>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索项目..."
            class="search-input"
          >
        </div>
        <button
          class="btn-primary"
          @click="showAddProject = true"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          新建项目
        </button>
      </div>

      <div class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="viewProject(project)"
        >
          <div class="project-header">
            <h3>{{ project.name }}</h3>
            <span
              class="status-badge"
              :class="project.status"
            >
              {{ getStatusText(project.status) }}
            </span>
          </div>

          <p class="project-description">
            {{ project.description }}
          </p>

          <div class="project-meta">
            <div class="meta-item">
              <svg viewBox="0 0 24 24">
                <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 14c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z" />
              </svg>
              <span>{{ project.members }} 成员</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM4 4v2h16V4H4zm0 16h16v2H4v-2z" />
              </svg>
              <span>{{ project.tasks }} 任务</span>
            </div>
          </div>

          <div class="project-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: project.progress + '%' }"
              />
            </div>
            <span class="progress-text">{{ project.progress }}%</span>
          </div>

          <div class="project-footer">
            <div class="project-date">
              创建于 {{ project.createdAt }}
            </div>
            <div class="project-actions">
              <button
                class="action-btn"
                @click.stop="editProject(project)"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>
              <button
                class="action-btn danger"
                @click.stop="deleteProject(project)"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建项目模态框 -->
    <div
      v-if="showAddProject"
      class="modal-overlay"
      @click="showAddProject = false"
    >
      <div
        class="modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>新建项目</h3>
          <button @click="showAddProject = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>项目名称</label>
            <input
              v-model="newProject.name"
              type="text"
            >
          </div>
          <div class="form-group">
            <label>项目描述</label>
            <textarea
              v-model="newProject.description"
              rows="3"
            />
          </div>
          <div class="form-group">
            <label>项目状态</label>
            <select v-model="newProject.status">
              <option value="active">
                进行中
              </option>
              <option value="paused">
                已暂停
              </option>
              <option value="completed">
                已完成
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="btn-secondary"
            @click="showAddProject = false"
          >
            取消
          </button>
          <button
            class="btn-primary"
            @click="addProject"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Project {
  id: number
  name: string
  description: string
  status: string
  members: number
  tasks: number
  progress: number
  createdAt: string
}

const searchQuery = ref('')
const statusFilter = ref('')
const showAddProject = ref(false)
const newProject = ref({
  name: '',
  description: '',
  status: 'active'
})

const projects = ref<Project[]>([
  {
    id: 1,
    name: 'SmartAbp 核心开发',
    description: '开发 SmartAbp 框架的核心功能模块，包括用户管理、权限控制等基础功能。',
    status: 'active',
    members: 5,
    tasks: 24,
    progress: 75,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: '前端界面优化',
    description: '优化用户界面设计，提升用户体验，实现响应式布局。',
    status: 'active',
    members: 3,
    tasks: 18,
    progress: 60,
    createdAt: '2024-02-01'
  },
  {
    id: 3,
    name: '数据库迁移',
    description: '将现有数据库迁移到新的架构，优化查询性能。',
    status: 'completed',
    members: 2,
    tasks: 12,
    progress: 100,
    createdAt: '2024-01-01'
  },
  {
    id: 4,
    name: 'API 文档编写',
    description: '编写完整的 API 文档，包括接口说明和使用示例。',
    status: 'paused',
    members: 1,
    tasks: 8,
    progress: 30,
    createdAt: '2024-02-10'
  }
])

const filteredProjects = computed(() => {
  let filtered = projects.value

  if (statusFilter.value) {
    filtered = filtered.filter(project => project.status === statusFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(project =>
      project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return statusMap[status] || status
}

const addProject = () => {
  const project: Project = {
    id: Date.now(),
    name: newProject.value.name,
    description: newProject.value.description,
    status: newProject.value.status,
    members: 1,
    tasks: 0,
    progress: 0,
    createdAt: new Date().toISOString().split('T')[0]
  }
  projects.value.push(project)
  showAddProject.value = false
  newProject.value = { name: '', description: '', status: 'active' }
}

const viewProject = (project: Project) => {
  console.log('查看项目:', project)
}

const editProject = (project: Project) => {
  console.log('编辑项目:', project)
}

const deleteProject = (project: Project) => {
  if (confirm(`确定要删除项目 ${project.name} 吗？`)) {
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index > -1) {
      projects.value.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.projects-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

.page-content {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.filters {
  display: flex;
  gap: 12px;
}

.filter-select,
.search-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.search-input {
  width: 250px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-primary svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: var(--color-success-50);
  color: var(--color-success-500);
}

.status-badge.completed {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.status-badge.paused {
  background: var(--color-warning-50);
  color: var(--color-warning-500);
}

.project-description {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.project-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.meta-item svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-date {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.project-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.action-btn.danger {
  color: var(--color-error-500);
  border-color: var(--color-error-500);
}

.action-btn.danger:hover {
  background: var(--color-error-50);
}

.action-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 500px;
  background: var(--color-bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--color-border-primary);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-header button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-header button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--color-border-primary);
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--color-bg-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
