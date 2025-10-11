<template>
  <div class="business-rules-engine">
    <!-- 规则列表 -->
    <el-card
      class="rules-list"
      shadow="never"
    >
      <template #header>
        <div class="card-header">
          <span class="title">业务规则列表</span>
          <el-button 
            v-if="!readonly"
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAddRule"
          >
            新建规则
          </el-button>
        </div>
      </template>

      <el-table
        :data="rules"
        border
      >
        <el-table-column
          type="index"
          label="#"
          width="50"
        />
        <el-table-column
          prop="name"
          label="规则名称"
          min-width="200"
        />
        <el-table-column
          prop="description"
          label="描述"
          min-width="250"
        />
        <el-table-column
          label="优先级"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-switch 
              v-model="row.enabled"
              :disabled="readonly"
              @change="handleToggleRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="条件数"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ row.conditions.length }}
          </template>
        </el-table-column>
        <el-table-column
          label="动作数"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ row.actions.length }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="handleEditRule(row)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-view"
              @click="handleTestRule(row)"
            >
              测试
            </el-button>
            <el-button
              v-if="!readonly"
              type="text"
              size="small"
              icon="el-icon-delete"
              @click="handleDeleteRule(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 规则编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isCreating ? '新建规则' : '编辑规则'"
      width="80%"
      :fullscreen="isFullscreen"
    >
      <template #header>
        <div class="dialog-header">
          <span>{{ isCreating ? '新建规则' : '编辑规则' }}</span>
          <el-button
            text
            :icon="isFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"
            @click="isFullscreen = !isFullscreen"
          />
        </div>
      </template>

      <el-form
        v-if="currentRule"
        :model="currentRule"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="规则名称"
              required
            >
              <el-input v-model="currentRule.name" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              label="优先级"
              required
            >
              <el-input-number
                v-model="currentRule.priority"
                :min="1"
                :max="100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="启用">
              <el-switch v-model="currentRule.enabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input
            v-model="currentRule.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <!-- 条件配置 -->
        <el-divider content-position="left">
          <span>条件配置</span>
          <el-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            @click="handleAddCondition"
          >
            添加条件
          </el-button>
        </el-divider>

        <el-table
          :data="currentRule.conditions"
          border
        >
          <el-table-column
            type="index"
            label="#"
            width="50"
          />
          <el-table-column
            label="字段"
            width="150"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.field"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="操作符"
            width="150"
          >
            <template #default="{ row }">
              <el-select
                v-model="row.operator"
                size="small"
              >
                <el-option
                  label="等于"
                  value="equals"
                />
                <el-option
                  label="不等于"
                  value="notEquals"
                />
                <el-option
                  label="大于"
                  value="greaterThan"
                />
                <el-option
                  label="小于"
                  value="lessThan"
                />
                <el-option
                  label="包含"
                  value="contains"
                />
                <el-option
                  label="开始于"
                  value="startsWith"
                />
                <el-option
                  label="结束于"
                  value="endsWith"
                />
                <el-option
                  label="在列表中"
                  value="in"
                />
                <el-option
                  label="不在列表中"
                  value="notIn"
                />
                <el-option
                  label="为空"
                  value="isEmpty"
                />
                <el-option
                  label="不为空"
                  value="isNotEmpty"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column
            label="值"
            min-width="150"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.value"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="逻辑"
            width="100"
          >
            <template #default="{ row }">
              <el-select
                v-model="row.logicalOperator"
                size="small"
              >
                <el-option
                  label="AND"
                  value="and"
                />
                <el-option
                  label="OR"
                  value="or"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            align="center"
          >
            <template #default="{ $index }">
              <el-button
                type="text"
                size="small"
                icon="el-icon-delete"
                @click="handleDeleteCondition($index)"
              />
            </template>
          </el-table-column>
        </el-table>

        <!-- 动作配置 -->
        <el-divider content-position="left">
          <span>动作配置</span>
          <el-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            @click="handleAddAction"
          >
            添加动作
          </el-button>
        </el-divider>

        <el-table
          :data="currentRule.actions"
          border
        >
          <el-table-column
            type="index"
            label="#"
            width="50"
          />
          <el-table-column
            label="动作类型"
            width="150"
          >
            <template #default="{ row }">
              <el-select
                v-model="row.type"
                size="small"
              >
                <el-option
                  label="设置值"
                  value="setValue"
                />
                <el-option
                  label="显示字段"
                  value="showField"
                />
                <el-option
                  label="隐藏字段"
                  value="hideField"
                />
                <el-option
                  label="启用字段"
                  value="enableField"
                />
                <el-option
                  label="禁用字段"
                  value="disableField"
                />
                <el-option
                  label="显示消息"
                  value="showMessage"
                />
                <el-option
                  label="调用API"
                  value="callApi"
                />
                <el-option
                  label="执行脚本"
                  value="runScript"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column
            label="目标"
            width="150"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.target"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="值/消息/URL/脚本"
            min-width="200"
          >
            <template #default="{ row }">
              <el-input
                v-if="row.type === 'setValue'"
                v-model="row.value"
                size="small"
              />
              <el-input
                v-else-if="row.type === 'showMessage'"
                v-model="row.message"
                size="small"
              />
              <el-input
                v-else-if="row.type === 'callApi'"
                v-model="row.apiUrl"
                size="small"
              />
              <el-input
                v-else-if="row.type === 'runScript'"
                v-model="row.script"
                type="textarea"
                :rows="2"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            align="center"
          >
            <template #default="{ $index }">
              <el-button
                type="text"
                size="small"
                icon="el-icon-delete"
                @click="handleDeleteAction($index)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSaveRule"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';
import type {
    BusinessRule,
    BusinessRulesEngineProps,
    RuleAction,
    RuleCondition
} from '../types/designer';

// Props
const props = withDefaults(defineProps<BusinessRulesEngineProps>(), {
  readonly: false
})

// 状态
const editDialogVisible = ref(false)
const isFullscreen = ref(false)
const isCreating = ref(false)
const currentRule = ref<BusinessRule | null>(null)

// 规则列表
const rules = ref<BusinessRule[]>([])

// 添加规则
const handleAddRule = () => {
  isCreating.value = true
  currentRule.value = {
    id: `rule_${Date.now()}`,
  name: '',
  description: '',
    enabled: true,
  priority: 50,
  conditions: [],
  actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  editDialogVisible.value = true
}

// 编辑规则
const handleEditRule = (rule: BusinessRule) => {
  isCreating.value = false
  currentRule.value = JSON.parse(JSON.stringify(rule))
  editDialogVisible.value = true
}

// 保存规则
const handleSaveRule = () => {
  if (!currentRule.value) return

  if (isCreating.value) {
    rules.value.push(currentRule.value)
    ElMessage.success('规则创建成功')
  } else {
    const index = rules.value.findIndex(r => r.id === currentRule.value!.id)
    if (index >= 0) {
      rules.value[index] = currentRule.value
      ElMessage.success('规则更新成功')
    }
  }

  editDialogVisible.value = false
}

// 删除规则
const handleDeleteRule = async (rule: BusinessRule) => {
  try {
    await ElMessageBox.confirm('确定要删除该规则吗？', '提示', { type: 'warning' })
    const index = rules.value.findIndex(r => r.id === rule.id)
    if (index >= 0) {
      rules.value.splice(index, 1)
      ElMessage.success('规则已删除')
    }
  } catch {
    // 用户取消
  }
}

// 切换规则状态
const handleToggleRule = (rule: BusinessRule) => {
  ElMessage.success(rule.enabled ? '规则已启用' : '规则已禁用')
}

// 测试规则
const handleTestRule = (rule: BusinessRule) => {
  ElMessage.info(`测试规则：${rule.name}`)
}

// 添加条件
const handleAddCondition = () => {
  if (!currentRule.value) return
  const condition: RuleCondition = {
    id: `cond_${Date.now()}`,
    field: '',
    operator: 'equals',
    value: '',
    logicalOperator: 'and'
  }
  currentRule.value.conditions.push(condition)
}

// 删除条件
const handleDeleteCondition = (index: number) => {
  if (!currentRule.value) return
  currentRule.value.conditions.splice(index, 1)
}

// 添加动作
const handleAddAction = () => {
  if (!currentRule.value) return
  const action: RuleAction = {
    id: `action_${Date.now()}`,
    type: 'setValue',
    target: '',
    value: ''
  }
  currentRule.value.actions.push(action)
}

// 删除动作
const handleDeleteAction = (index: number) => {
  if (!currentRule.value) return
  currentRule.value.actions.splice(index, 1)
}

// 获取优先级类型
const getPriorityType = (priority: number): string => {
  if (priority >= 80) return 'danger'
  if (priority >= 50) return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.business-rules-engine {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

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

  .dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
    width: 100%;
  }
}
</style>
