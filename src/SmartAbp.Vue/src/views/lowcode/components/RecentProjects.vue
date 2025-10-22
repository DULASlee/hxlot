<template>
  <el-card class="recent-projects" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="title">📋 最近访问的项目</span>
        <el-link type="primary" :underline="false" @click="viewAll">
          查看全部 →
        </el-link>
      </div>
    </template>

    <!-- 项目列表 -->
    <el-table
      v-if="projects.length > 0"
      :data="projects"
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="项目名称" width="200">
        <template #default="{ row }">
          <div class="project-name">
            <el-icon><Document /></el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="描述" show-overflow-tooltip />

      <el-table-column label="实体数量" width="100">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ getEntityCount(row) }} 个</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="lastModificationTime" label="最后访问" width="180">
        <template #default="{ row }">
          <span class="time-text">{{ formatTime(row.lastModificationTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            @click.stop="openProject(row)"
          >
            打开项目
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无最近访问的项目"
      :image-size="120"
    >
      <el-button type="primary" @click="createNewProject">
        创建新项目
      </el-button>
    </el-empty>
  </el-card>
</template>

<script setup lang="ts">
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto } from '@/api/generated'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

interface Props {
  projects: SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto[]
}

defineProps<Props>()

const router = useRouter()

/**
 * 获取实体数量
 */
const getEntityCount = (module: SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto): number => {
  return module.entities?.length ?? 0
}

/**
 * 格式化时间为相对时间（原生JS实现）
 */
const formatTime = (time: string | Date | undefined): string => {
  if (!time) return '未知'

  try {
    const now = new Date()
    const past = new Date(time)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
    return `${Math.floor(diffDays / 365)}年前`
  } catch {
    return '未知'
  }
}

/**
 * 处理行点击
 */
const handleRowClick = (row: SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto) => {
  openProject(row)
}

/**
 * 打开项目
 */
const openProject = (module: SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto) => {
  if (!module.id) return
  // ✅ 临时修复：跳转到Layer2配置模式
  router.push('/lowcode/layer2')
  ElMessage.info(`正在打开模块：${module.moduleName}`)
}

/**
 * 查看全部项目
 */
const viewAll = () => {
  // ✅ 临时修复：跳转到代码生成页面
  router.push('/lowcode/generation')
}

/**
 * 创建新项目
 */
const createNewProject = () => {
  // ✅ 临时修复：跳转到Layer2智能配置模式
  router.push('/lowcode/layer2')
  ElMessage.success('开始创建新项目')
}
</script>

<style scoped lang="scss">
.recent-projects {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .project-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;

    .el-icon {
      color: #409eff;
      font-size: 16px;
    }
  }

  .time-text {
    color: #909399;
    font-size: 13px;
  }

  :deep(.el-table__row) {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  :deep(.el-empty) {
    padding: 40px 0;
  }
}
</style>

