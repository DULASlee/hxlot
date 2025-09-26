<!-- 
AI_TEMPLATE_INFO:
模板类型: Vue 多对多CRUD管理组件 (极简版)
适用场景: 多对多关系管理，如用户-角色、商品-分类
基于模板: CrudManagement.template.vue (极简版)
关系类型: ManyToMany (M:N)
依赖组件: Element Plus (el-transfer, el-table, el-form)
技术路线: 极简实现，使用el-transfer穿梭框
生成规则:
  - SourceEntityName: 源实体名称
  - TargetEntityName: 目标实体名称
  - JunctionTable: 中间表名称
-->

<template>
  <div class="many-to-many-management">
    <el-row :gutter="20">
      <!-- 左侧：源实体列表 -->
      <el-col :span="10">
        <el-card header="{{SourceEntityName}}管理">
          <!-- 搜索 -->
          <el-input
            v-model="sourceSearchKeyword"
            placeholder="搜索{{SourceEntityName}}"
            clearable
            class="search-input"
          />
          
          <!-- 源实体表格 -->
          <el-table
            :data="filteredSourceList"
            v-loading="sourceLoading"
            highlight-current-row
            @current-change="handleSourceSelect"
          >
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="code" label="编码" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：关系管理 -->
      <el-col :span="14">
        <el-card header="{{TargetEntityName}}分配" v-if="selectedSource">
          <template #header>
            <div class="relation-header">
              <span>{{TargetEntityName}}分配 - {{ selectedSource.name }}</span>
              <el-button type="primary" size="small" @click="handleBatchAssign">
                批量分配
              </el-button>
            </div>
          </template>

          <!-- Element Plus穿梭框 -->
          <el-transfer
            v-model="assignedTargets"
            :data="availableTargets"
            :titles="['可选{{TargetEntityName}}', '已分配{{TargetEntityName}}']"
            :button-texts="['移除', '添加']"
            filterable
            filter-placeholder="搜索{{TargetEntityName}}"
            @change="handleRelationshipChange"
          />

          <!-- 关系详情 -->
          <div class="relation-details" v-if="assignedTargets.length > 0">
            <h4>分配详情</h4>
            <el-table :data="relationshipDetails" size="small">
              <el-table-column prop="targetName" label="{{TargetEntityName}}" />
              <el-table-column prop="assignTime" label="分配时间" width="160" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'warning'" size="small">
                    {{ row.status === 'active' ? '生效' : '待生效' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 无选择提示 -->
        <el-card v-else>
          <el-empty description="请先选择{{SourceEntityName}}" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 批量分配对话框 -->
    <el-dialog v-model="batchAssignVisible" title="批量分配{{TargetEntityName}}" width="600px">
      <el-form :model="batchAssignForm" label-width="100px">
        <el-form-item label="选择{{SourceEntityName}}">
          <el-select
            v-model="batchAssignForm.sourceIds"
            placeholder="选择{{SourceEntityName}}"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="source in sourceList"
              :key="source.id"
              :label="source.name"
              :value="source.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="选择{{TargetEntityName}}">
          <el-select
            v-model="batchAssignForm.targetIds"
            placeholder="选择{{TargetEntityName}}"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="target in allTargets"
              :key="target.id"
              :label="target.name"
              :value="target.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="batchAssignVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchAssignSubmit">确定分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 源实体状态
const sourceList = ref([])
const sourceLoading = ref(false)
const selectedSource = ref(null)
const sourceSearchKeyword = ref('')

// 目标实体状态
const allTargets = ref([])
const assignedTargets = ref([])
const availableTargets = ref([])

// 关系详情
const relationshipDetails = ref([])

// 批量分配
const batchAssignVisible = ref(false)
const batchAssignForm = ref({
  sourceIds: [],
  targetIds: []
})

// 计算属性
const filteredSourceList = computed(() => {
  if (!sourceSearchKeyword.value) return sourceList.value
  
  return sourceList.value.filter(item =>
    item.name?.toLowerCase().includes(sourceSearchKeyword.value.toLowerCase()) ||
    item.code?.toLowerCase().includes(sourceSearchKeyword.value.toLowerCase())
  )
})

// 方法
const fetchSourceData = async () => {
  sourceLoading.value = true
  try {
    // TODO: 调用API获取源实体数据
    console.log('获取源实体数据')
    sourceList.value = [
      { id: '1', name: '示例{{SourceEntityName}}1', code: 'DEMO001' },
      { id: '2', name: '示例{{SourceEntityName}}2', code: 'DEMO002' }
    ]
  } finally {
    sourceLoading.value = false
  }
}

const fetchTargetData = async () => {
  try {
    // TODO: 调用API获取目标实体数据
    console.log('获取目标实体数据')
    allTargets.value = [
      { key: '1', label: '示例{{TargetEntityName}}1' },
      { key: '2', label: '示例{{TargetEntityName}}2' },
      { key: '3', label: '示例{{TargetEntityName}}3' }
    ]
    
    // 设置可选项
    availableTargets.value = [...allTargets.value]
  } catch (error) {
    ElMessage.error('获取{{TargetEntityName}}数据失败')
  }
}

const fetchRelationshipData = async () => {
  if (!selectedSource.value) return
  
  try {
    // TODO: 调用API获取关系数据
    console.log('获取关系数据', selectedSource.value.id)
    
    // 模拟已分配的关系
    assignedTargets.value = ['1']
    
    // 更新关系详情
    relationshipDetails.value = assignedTargets.value.map(targetId => {
      const target = allTargets.value.find(t => t.key === targetId)
      return {
        targetId,
        targetName: target?.label || '',
        assignTime: '2024-01-01 10:00:00',
        status: 'active'
      }
    })
  } catch (error) {
    ElMessage.error('获取关系数据失败')
  }
}

const handleSourceSelect = (currentRow) => {
  selectedSource.value = currentRow
  if (currentRow) {
    fetchRelationshipData()
  } else {
    assignedTargets.value = []
    relationshipDetails.value = []
  }
}

const handleRelationshipChange = async (value, direction, movedKeys) => {
  try {
    // TODO: 调用API保存关系变化
    console.log('关系变化', {
      sourceId: selectedSource.value?.id,
      assignedTargets: value,
      direction,
      movedKeys
    })
    
    // 更新关系详情
    relationshipDetails.value = value.map(targetId => {
      const target = allTargets.value.find(t => t.key === targetId)
      const existingDetail = relationshipDetails.value.find(d => d.targetId === targetId)
      
      return existingDetail || {
        targetId,
        targetName: target?.label || '',
        assignTime: new Date().toLocaleString(),
        status: 'active'
      }
    })
    
    ElMessage.success('关系更新成功')
  } catch (error) {
    ElMessage.error('更新关系失败')
    // 回滚操作
    fetchRelationshipData()
  }
}

const handleBatchAssign = () => {
  batchAssignForm.value = {
    sourceIds: [],
    targetIds: []
  }
  batchAssignVisible.value = true
}

const handleBatchAssignSubmit = async () => {
  try {
    if (batchAssignForm.value.sourceIds.length === 0 || batchAssignForm.value.targetIds.length === 0) {
      ElMessage.warning('请选择要分配的{{SourceEntityName}}和{{TargetEntityName}}')
      return
    }
    
    // TODO: 调用API批量分配
    console.log('批量分配', batchAssignForm.value)
    
    ElMessage.success(`批量分配成功：${batchAssignForm.value.sourceIds.length}个{{SourceEntityName}} × ${batchAssignForm.value.targetIds.length}个{{TargetEntityName}}`)
    batchAssignVisible.value = false
    
    // 刷新当前选中的关系数据
    if (selectedSource.value) {
      fetchRelationshipData()
    }
  } catch (error) {
    ElMessage.error('批量分配失败')
  }
}

// 监听源实体选择变化
watch(selectedSource, (newSource) => {
  if (newSource) {
    fetchRelationshipData()
  }
})

// 初始化
onMounted(async () => {
  await fetchSourceData()
  await fetchTargetData()
})
</script>

<style scoped>
.many-to-many-management {
  padding: 20px;
}

.search-input {
  margin-bottom: 16px;
}

.relation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.relation-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.relation-details h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
}

:deep(.el-transfer-panel) {
  width: 200px;
}

:deep(.el-transfer-panel__header) {
  padding: 12px 15px;
  background-color: #f5f7fa;
}
</style>
