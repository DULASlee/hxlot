<template>
  <div class="project-analysis-view">
    <div class="page-header">
      <h1>项目分析</h1>
      <p>项目数据统计和分析报告</p>
    </div>

    <div class="analysis-content">
      <!-- 统计概览 -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalProjects }}</div>
            <div class="stat-label">总项目数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ completedProjects }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ activeProjects }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pausedProjects }}</div>
            <div class="stat-label">已暂停</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>项目状态分布</h3>
          <div class="chart-container">
            <div class="pie-chart">
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color active"></div>
                  <span>进行中 ({{ activeProjects }})</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color completed"></div>
                  <span>已完成 ({{ completedProjects }})</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color paused"></div>
                  <span>已暂停 ({{ pausedProjects }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>项目进度趋势</h3>
          <div class="chart-container">
            <div class="progress-chart">
              <div v-for="month in progressData" :key="month.name" class="progress-bar-item">
                <div class="month-label">{{ month.name }}</div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: month.progress + '%' }"
                  ></div>
                </div>
                <div class="progress-value">{{ month.progress }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目列表 -->
      <div class="projects-table-section">
        <h3>项目详情</h3>
        <div class="table-container">
          <table class="projects-table">
            <thead>
              <tr>
                <th>项目名称</th>
                <th>状态</th>
                <th>进度</th>
                <th>团队成员</th>
                <th>开始时间</th>
                <th>预计完成</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projectDetails" :key="project.id">
                <td>
                  <div class="project-name">
                    <strong>{{ project.name }}</strong>
                    <small>{{ project.description }}</small>
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="project.status">
                    {{ getStatusText(project.status) }}
                  </span>
                </td>
                <td>
                  <div class="progress-cell">
                    <div class="progress-bar small">
                      <div
                        class="progress-fill"
                        :style="{ width: project.progress + '%' }"
                      ></div>
                    </div>
                    <span>{{ project.progress }}%</span>
                  </div>
                </td>
                <td>{{ project.members }}</td>
                <td>{{ project.startDate }}</td>
                <td>{{ project.endDate }}</td>
              </tr>
            </tbody>
          </table>
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
  progress: number
  members: number
  startDate: string
  endDate: string
}

const projectDetails = ref<Project[]>([
  {
    id: 1,
    name: 'SmartAbp 核心开发',
    description: '开发框架核心功能',
    status: 'active',
    progress: 75,
    members: 5,
    startDate: '2024-01-15',
    endDate: '2024-06-30'
  },
  {
    id: 2,
    name: '前端界面优化',
    description: '优化用户界面设计',
    status: 'active',
    progress: 60,
    members: 3,
    startDate: '2024-02-01',
    endDate: '2024-05-15'
  },
  {
    id: 3,
    name: '数据库迁移',
    description: '数据库架构升级',
    status: 'completed',
    progress: 100,
    members: 2,
    startDate: '2024-01-01',
    endDate: '2024-03-31'
  },
  {
    id: 4,
    name: 'API 文档编写',
    description: '编写完整的API文档',
    status: 'paused',
    progress: 30,
    members: 1,
    startDate: '2024-02-10',
    endDate: '2024-04-30'
  }
])

const progressData = ref([
  { name: '1月', progress: 20 },
  { name: '2月', progress: 35 },
  { name: '3月', progress: 50 },
  { name: '4月', progress: 65 },
  { name: '5月', progress: 75 },
  { name: '6月', progress: 85 }
])

// 计算统计数据
const totalProjects = computed(() => projectDetails.value.length)
const activeProjects = computed(() => projectDetails.value.filter(p => p.status === 'active').length)
const completedProjects = computed(() => projectDetails.value.filter(p => p.status === 'completed').length)
const pausedProjects = computed(() => projectDetails.value.filter(p => p.status === 'paused').length)

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.project-analysis-view {
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

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: 8px;
  color: var(--color-primary);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.chart-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.active {
  background: var(--color-success-500);
}

.legend-color.completed {
  background: var(--color-primary);
}

.legend-color.paused {
  background: var(--color-warning-500);
}

.progress-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-label {
  width: 40px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar.small {
  height: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 项目表格 */
.projects-table-section {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.projects-table-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
}

.projects-table th,
.projects-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-primary);
}

.projects-table th {
  background: var(--color-bg-secondary);
  font-weight: 600;
  color: var(--color-text-primary);
}

.projects-table td {
  color: var(--color-text-secondary);
}

.project-name strong {
  display: block;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.project-name small {
  color: var(--color-text-tertiary);
  font-size: 12px;
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

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-cell .progress-bar {
  width: 60px;
}

.progress-cell span {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 150px;
  }

  .projects-table {
    font-size: 14px;
  }

  .projects-table th,
  .projects-table td {
    padding: 8px;
  }
}
</style>
