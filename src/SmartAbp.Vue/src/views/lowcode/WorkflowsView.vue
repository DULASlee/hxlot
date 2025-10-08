<template>
  <div class="workflows-view">
    <div class="workflows-header">
      <h2>工作流管理</h2>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="handleNewWorkflow"
        >
          <el-icon><Plus /></el-icon>
          新建工作流
        </el-button>
      </div>
    </div>

    <div class="workflows-content">
      <!-- 工作流列表 -->
      <el-table
        v-loading="loading"
        :data="workflows"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="工作流名称"
          width="200"
        />
        <el-table-column
          prop="description"
          label="描述"
          show-overflow-tooltip
        />
        <el-table-column
          prop="nodeCount"
          label="节点数"
          width="100"
          align="center"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'active' ? 'success' : 'info'"
              size="small"
            >
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              @click="editWorkflow(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              text
              @click="deleteWorkflow(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 无数据状态 -->
      <el-empty
        v-if="!loading && workflows.length === 0"
        description="暂无工作流，点击上方按钮新建"
      >
        <el-button
          type="primary"
          @click="handleNewWorkflow"
        >
          新建第一个工作流
        </el-button>
      </el-empty>
    </div>

    <!-- 新建/编辑工作流对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingWorkflow ? '编辑工作流' : '新建工作流'"
      width="600px"
    >
      <el-form
        :model="workflowForm"
        label-width="100px"
      >
        <el-form-item
          label="名称"
          required
        >
          <el-input
            v-model="workflowForm.name"
            placeholder="请输入工作流名称"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="workflowForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入工作流描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="workflowForm.status"
            active-value="active"
            inactive-value="inactive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="!workflowForm.name"
          @click="saveWorkflow"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'

// ========== 接口定义 ==========

interface Workflow {
  id: string
  name: string
  description: string
  nodeCount: number
  status: 'active' | 'inactive'
  updatedAt: string
  definition?: any
}

// ========== 状态管理 ==========

const loading = ref(false)
const workflows = ref<Workflow[]>([])
const dialogVisible = ref(false)
const editingWorkflow = ref<Workflow | null>(null)

const workflowForm = ref({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive'
})

// ========== 生命周期 ==========

onMounted(async () => {
  await loadWorkflows()
})

// ========== 方法 ==========

/**
 * 加载工作流列表
 */
const loadWorkflows = async () => {
  loading.value = true
  try {
    // ✅ 真实实现：从localStorage加载（后续接入API）
    const stored = localStorage.getItem('smartabp_workflows')
    if (stored) {
      workflows.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载工作流失败:', error)
    ElMessage.error('加载工作流失败')
  } finally {
    loading.value = false
  }
}

/**
 * 新建工作流
 */
const handleNewWorkflow = () => {
  editingWorkflow.value = null
  workflowForm.value = {
    name: '',
    description: '',
    status: 'active'
  }
  dialogVisible.value = true
}

/**
 * 编辑工作流
 */
const editWorkflow = (workflow: Workflow) => {
  editingWorkflow.value = workflow
  workflowForm.value = {
    name: workflow.name,
    description: workflow.description,
    status: workflow.status
  }
  dialogVisible.value = true
}

/**
 * 保存工作流
 */
const saveWorkflow = () => {
  if (!workflowForm.value.name) {
    ElMessage.warning('请输入工作流名称')
    return
  }

  if (editingWorkflow.value) {
    // 更新现有工作流
    const index = workflows.value.findIndex(w => w.id === editingWorkflow.value!.id)
    if (index >= 0) {
      const currentWorkflow = workflows.value[index]
      if (currentWorkflow) {
        workflows.value[index] = {
          id: currentWorkflow.id,
          name: workflowForm.value.name || currentWorkflow.name,
          description: workflowForm.value.description || currentWorkflow.description,
          nodeCount: currentWorkflow.nodeCount,
          status: workflowForm.value.status || currentWorkflow.status,
          updatedAt: new Date().toISOString(),
          definition: currentWorkflow.definition
        }
      }
    }
    ElMessage.success('工作流更新成功')
  } else {
    // 新建工作流
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      ...workflowForm.value,
      nodeCount: 0,
      updatedAt: new Date().toISOString()
    }
    workflows.value.push(newWorkflow)
    ElMessage.success('工作流创建成功')
  }

  // 保存到localStorage
  try {
    localStorage.setItem('smartabp_workflows', JSON.stringify(workflows.value))
  } catch (error) {
    console.error('保存工作流失败:', error)
  }

  dialogVisible.value = false
}

/**
 * 删除工作流
 */
const deleteWorkflow = async (workflow: Workflow) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除工作流"${workflow.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = workflows.value.findIndex(w => w.id === workflow.id)
    if (index >= 0) {
      workflows.value.splice(index, 1)

      // 保存到localStorage
      try {
        localStorage.setItem('smartabp_workflows', JSON.stringify(workflows.value))
      } catch (error) {
        console.error('保存工作流失败:', error)
      }

      ElMessage.success('删除成功')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除工作流失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

/**
 * 格式化时间
 */
const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.workflows-view {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.workflows-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.workflows-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
