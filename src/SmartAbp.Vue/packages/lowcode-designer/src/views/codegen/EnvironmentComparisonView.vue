<template>
  <div class="environment-comparison-view">
    <!-- 环境选择 -->
    <div class="comparison-header">
      <el-select v-model="selectedEnv1" placeholder="选择环境1" style="width: 200px">
        <el-option
          v-for="env in environments"
          :key="env"
          :label="env"
          :value="env"
        />
      </el-select>
      
      <el-icon class="comparison-icon"><Right /></el-icon>
      
      <el-select v-model="selectedEnv2" placeholder="选择环境2" style="width: 200px">
        <el-option
          v-for="env in environments"
          :key="env"
          :label="env"
          :value="env"
        />
      </el-select>
      
      <el-button type="primary" :icon="Search" @click="handleCompare" :loading="loading">
        对比
      </el-button>
    </div>

    <!-- 对比结果 -->
    <div v-if="comparison" class="comparison-results">
      <el-alert
        :title="`发现 ${comparison.totalDifferences} 个配置差异`"
        :type="comparison.totalDifferences > 0 ? 'warning' : 'success'"
        :closable="false"
        show-icon
        class="mb-4"
      />

      <el-table
        :data="comparison.differences"
        style="width: 100%"
        max-height="500"
        stripe
      >
        <el-table-column prop="property" label="配置项" width="200" />
        <el-table-column prop="path" label="路径" width="250" />
        <el-table-column :label="selectedEnv1" width="200">
          <template #default="{ row }">
            <el-tag :type="getDifferenceTagType(row.differenceType)">
              {{ row.value1 || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="selectedEnv2" width="200">
          <template #default="{ row }">
            <el-tag :type="getDifferenceTagType(row.differenceType)">
              {{ row.value2 || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="differenceType" label="差异类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getDifferenceTypeTag(row.differenceType)" size="small">
              {{ getDifferenceTypeLabel(row.differenceType) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else-if="!loading" class="empty-state">
      <el-empty description="请选择两个环境进行对比" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Right, Search } from '@element-plus/icons-vue'
import { useEnvironmentConfig, type EnvironmentComparison } from '@smartabp/lowcode-api'

// Props
interface Props {
  env1?: string
  env2?: string
}

const props = withDefaults(defineProps<Props>(), {
  env1: 'Development',
  env2: 'Production'
})

// Emits
const emit = defineEmits<{
  close: []
}>()

// Composables
const {
  loading,
  getEnvironments,
  compareEnvironments
} = useEnvironmentConfig()

// State
const environments = ref<string[]>([])
const selectedEnv1 = ref(props.env1)
const selectedEnv2 = ref(props.env2)
const comparison = ref<EnvironmentComparison | null>(null)

// Methods
const loadEnvironments = async () => {
  try {
    environments.value = await getEnvironments()
  } catch (err) {
    ElMessage.error('加载环境列表失败')
    console.error(err)
  }
}

const handleCompare = async () => {
  if (selectedEnv1.value === selectedEnv2.value) {
    ElMessage.warning('请选择两个不同的环境进行对比')
    return
  }

  try {
    comparison.value = await compareEnvironments(
      selectedEnv1.value,
      selectedEnv2.value
    )
    
    ElMessage.success('环境对比完成')
  } catch (err) {
    ElMessage.error('环境对比失败')
    console.error(err)
  }
}

const getDifferenceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    Added: '新增',
    Removed: '删除',
    Modified: '修改'
  }
  return labels[type] || type
}

const getDifferenceTypeTag = (type: string): string => {
  const tags: Record<string, string> = {
    Added: 'success',
    Removed: 'danger',
    Modified: 'warning'
  }
  return tags[type] || 'info'
}

const getDifferenceTagType = (type: string): string => {
  const tags: Record<string, string> = {
    Added: 'success',
    Removed: 'danger',
    Modified: 'warning'
  }
  return tags[type] || ''
}

// Lifecycle
onMounted(async () => {
  await loadEnvironments()
  await handleCompare()
})
</script>

<style scoped lang="scss">
.environment-comparison-view {
  padding: 20px;
}

.comparison-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.comparison-icon {
  font-size: 20px;
  color: var(--el-text-color-secondary);
}

.comparison-results {
  margin-top: 20px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>

