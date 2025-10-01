<template>
  <div class="alert-dashboard">
    <el-page-header
      content="告警管理"
      @back="goBack"
    >
      <template #extra>
        <el-button
          type="primary"
          @click="createAlertRule"
        >
          创建告警规则
        </el-button>
      </template>
    </el-page-header>

    <el-divider />

    <!-- 告警规则列表 -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>告警规则</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索规则..."
            clearable
            style="width: 300px"
          />
        </div>
      </template>

      <el-table
        :data="filteredAlertRules"
        stripe
      >
        <el-table-column
          prop="ruleName"
          label="规则名称"
          width="250"
        />
        <el-table-column
          prop="metricType"
          label="指标类型"
          width="150"
        />
        <el-table-column
          prop="condition"
          label="触发条件"
          width="200"
        >
          <template #default="{ row }">
            {{ row.operator }} {{ row.threshold }}
          </template>
        </el-table-column>
        <el-table-column
          prop="severity"
          label="严重级别"
          width="120"
        >
          <template #default="{ row }">
            <el-tag
              :type="getSeverityTagType(row.severity)"
              size="small"
            >
              {{ row.severity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="targetResource"
          label="目标资源"
          show-overflow-tooltip
        />
        <el-table-column
          prop="isEnabled"
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.isEnabled"
              active-text="启用"
              inactive-text="禁用"
              @change="toggleAlertRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="editAlertRule(row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="deleteAlertRule(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 告警历史 -->
    <el-card
      shadow="hover"
      class="alert-history-card"
    >
      <template #header>
        <span>告警历史</span>
      </template>

      <el-timeline>
        <el-timeline-item
          v-for="alert in alertHistory"
          :key="alert.id"
          :timestamp="alert.timestamp"
          :type="getAlertType(alert.severity)"
        >
          <el-card>
            <template #header>
              <div class="alert-header">
                <el-tag :type="getSeverityTagType(alert.severity)">
                  {{ alert.severity }}
                </el-tag>
                <span class="alert-title">{{ alert.title }}</span>
              </div>
            </template>
            <p>{{ alert.message }}</p>
            <div class="alert-footer">
              <span>来源: {{ alert.source }}</span>
              <el-button
                link
                type="primary"
                size="small"
                @click="viewAlertDetail(alert)"
              >
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 创建/编辑告警规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="isEditMode ? '编辑告警规则' : '创建告警规则'"
      width="600px"
    >
      <el-form
        :model="ruleForm"
        label-width="120px"
      >
        <el-form-item
          label="规则名称"
          required
        >
          <el-input
            v-model="ruleForm.ruleName"
            placeholder="请输入规则名称"
          />
        </el-form-item>

        <el-form-item
          label="指标类型"
          required
        >
          <el-select
            v-model="ruleForm.metricType"
            placeholder="请选择指标类型"
          >
            <el-option
              label="CPU使用率"
              value="CpuUsage"
            />
            <el-option
              label="内存使用率"
              value="MemoryUsage"
            />
            <el-option
              label="API响应时间"
              value="ApiResponseTime"
            />
            <el-option
              label="错误率"
              value="ErrorRate"
            />
            <el-option
              label="请求数"
              value="RequestCount"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="触发条件"
          required
        >
          <el-space>
            <el-select
              v-model="ruleForm.operator"
              style="width: 100px"
            >
              <el-option
                label=">"
                value=">"
              />
              <el-option
                label=">="
                value=">="
              />
              <el-option
                label="<"
                value="<"
              />
              <el-option
                label="<="
                value="<="
              />
              <el-option
                label="="
                value="="
              />
            </el-select>
            <el-input-number
              v-model="ruleForm.threshold"
              :precision="2"
              :step="1"
            />
          </el-space>
        </el-form-item>

        <el-form-item
          label="严重级别"
          required
        >
          <el-radio-group v-model="ruleForm.severity">
            <el-radio label="Info">
              提示
            </el-radio>
            <el-radio label="Warning">
              警告
            </el-radio>
            <el-radio label="Critical">
              严重
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="目标资源"
          required
        >
          <el-input
            v-model="ruleForm.targetResource"
            placeholder="如: SmartAbp.Web"
          />
        </el-form-item>

        <el-form-item label="通知渠道">
          <el-checkbox-group v-model="ruleForm.notificationChannels">
            <el-checkbox label="email">
              邮件
            </el-checkbox>
            <el-checkbox label="sms">
              短信
            </el-checkbox>
            <el-checkbox label="webhook">
              Webhook
            </el-checkbox>
            <el-checkbox label="dingtalk">
              钉钉
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ruleDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="saveAlertRule"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 告警管理面板
 * 提供告警规则配置、告警历史查看
 */

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 告警规则列表
const alertRules = ref([
  {
    id: '1',
    ruleName: 'CPU使用率过高',
    metricType: 'CpuUsage',
    operator: '>',
    threshold: 80,
    severity: 'Warning',
    targetResource: 'SmartAbp.Web',
    notificationChannels: ['email', 'dingtalk'],
    isEnabled: true,
  },
  {
    id: '2',
    ruleName: '内存使用率告警',
    metricType: 'MemoryUsage',
    operator: '>',
    threshold: 85,
    severity: 'Critical',
    targetResource: 'SmartAbp.CodeGenerator',
    notificationChannels: ['email', 'sms', 'webhook'],
    isEnabled: true,
  },
  {
    id: '3',
    ruleName: 'API响应时间过长',
    metricType: 'ApiResponseTime',
    operator: '>',
    threshold: 500,
    severity: 'Warning',
    targetResource: '*',
    notificationChannels: ['email'],
    isEnabled: false,
  },
])

// 告警历史
const alertHistory = ref([
  {
    id: '1',
    timestamp: '2025-10-01 14:35:00',
    severity: 'Critical',
    title: '内存使用率过高',
    message: 'SmartAbp.CodeGenerator 内存使用率达到 92%，超过阈值 85%',
    source: 'SmartAbp.CodeGenerator',
  },
  {
    id: '2',
    timestamp: '2025-10-01 14:20:00',
    severity: 'Warning',
    title: 'CPU使用率告警',
    message: 'SmartAbp.Web CPU使用率达到 85%，超过阈值 80%',
    source: 'SmartAbp.Web',
  },
  {
    id: '3',
    timestamp: '2025-10-01 13:45:00',
    severity: 'Info',
    title: '服务重启',
    message: 'SmartAbp.OpsManagement 服务已重启',
    source: 'SmartAbp.OpsManagement',
  },
])

// 过滤后的告警规则
const filteredAlertRules = computed(() => {
  if (!searchKeyword.value) return alertRules.value
  return alertRules.value.filter(rule =>
    rule.ruleName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 规则表单
const ruleDialogVisible = ref(false)
const isEditMode = ref(false)
const ruleForm = ref({
  id: '',
  ruleName: '',
  metricType: '',
  operator: '>',
  threshold: 0,
  severity: 'Warning',
  targetResource: '',
  notificationChannels: [] as string[],
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取严重级别标签类型
const getSeverityTagType = (severity: string) => {
  const typeMap: Record<string, any> = {
    Info: 'info',
    Warning: 'warning',
    Critical: 'danger',
  }
  return typeMap[severity] || ''
}

// 获取告警时间线类型
const getAlertType = (severity: string) => {
  const typeMap: Record<string, any> = {
    Info: 'primary',
    Warning: 'warning',
    Critical: 'danger',
  }
  return typeMap[severity] || 'primary'
}

// 创建告警规则
const createAlertRule = () => {
  isEditMode.value = false
  ruleForm.value = {
    id: '',
    ruleName: '',
    metricType: '',
    operator: '>',
    threshold: 0,
    severity: 'Warning',
    targetResource: '',
    notificationChannels: [],
  }
  ruleDialogVisible.value = true
}

// 编辑告警规则
const editAlertRule = (rule: any) => {
  isEditMode.value = true
  ruleForm.value = { ...rule }
  ruleDialogVisible.value = true
}

// 保存告警规则
const saveAlertRule = () => {
  if (!ruleForm.value.ruleName || !ruleForm.value.metricType || !ruleForm.value.targetResource) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (isEditMode.value) {
    const index = alertRules.value.findIndex(r => r.id === ruleForm.value.id)
    if (index !== -1) {
      alertRules.value[index] = { ...ruleForm.value, isEnabled: true }
      ElMessage.success('告警规则已更新')
    }
  } else {
    alertRules.value.push({
      ...ruleForm.value,
      id: Date.now().toString(),
      isEnabled: true,
    } as any)
    ElMessage.success('告警规则已创建')
  }

  ruleDialogVisible.value = false
}

// 切换告警规则状态
const toggleAlertRule = (rule: any) => {
  ElMessage.success(`告警规则已${rule.isEnabled ? '启用' : '禁用'}`)
  // TODO: 调用后端API
}

// 删除告警规则
const deleteAlertRule = (rule: any) => {
  ElMessageBox.confirm(`确定要删除告警规则 "${rule.ruleName}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = alertRules.value.findIndex(r => r.id === rule.id)
      if (index !== -1) {
        alertRules.value.splice(index, 1)
        ElMessage.success('告警规则已删除')
      }
    })
    .catch(() => {
      // 用户取消
    })
}

// 查看告警详情
const viewAlertDetail = (alert: any) => {
  ElMessage.info(`查看告警详情: ${alert.title}`)
  // TODO: 显示详情对话框
}
</script>

<style scoped>
.alert-dashboard {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-history-card {
  margin-top: 20px;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-title {
  font-weight: 600;
  font-size: 16px;
}

.alert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>

