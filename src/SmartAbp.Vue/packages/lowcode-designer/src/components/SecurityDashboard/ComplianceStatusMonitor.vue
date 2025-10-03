<template>
  <div class="compliance-monitor">
    <div class="compliance-overview">
      <div class="compliance-score">
        <div
          class="score-circle"
          :class="scoreClass"
        >
          {{ overallScore }}%
        </div>
        <div class="score-label">
          合规分数
        </div>
      </div>
      <div class="compliance-stats">
        <div class="stat-item">
          <span class="stat-value">{{ openIssues }}</span>
          <span class="stat-label">未解决问题</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ criticalIssues }}</span>
          <span class="stat-label">严重问题</span>
        </div>
      </div>
    </div>

    <div
      v-if="complianceData.length > 0"
      class="compliance-issues"
    >
      <div class="issues-header">
        <h4>合规问题列表</h4>
      </div>
      <div class="issues-list">
        <div
          v-for="issue in complianceData.slice(0, 5)"
          :key="issue.id"
          class="issue-item"
          @click="handleIssueClick(issue)"
        >
          <div class="issue-header">
            <el-tag
              :type="getSeverityType(issue.severity)"
              size="small"
            >
              {{ issue.severity }}
            </el-tag>
            <span class="issue-type">{{ issue.type }}</span>
          </div>
          <div class="issue-description">
            {{ issue.description }}
          </div>
          <div class="issue-meta">
            <span>影响用户: {{ issue.affectedUsers }}</span>
            <span>{{ formatDate(issue.detectedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="no-issues"
    >
      <el-icon
        size="48"
        color="#67c23a"
      >
        <CheckCircle />
      </el-icon>
      <p>所有合规检查均通过</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTag } from 'element-plus'
// import { Check } from '@element-plus/icons-vue'"

interface ComplianceIssue {
  id: string
  type: string
  severity: string
  description: string
  affectedUsers: number
  detectedAt: Date
  status: string
}

interface Props {
  complianceData: ComplianceIssue[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'compliance-issue': [issue: ComplianceIssue]
}>()

const overallScore = computed(() => {
  if (props.complianceData.length === 0) return 100

  const weightedScore = props.complianceData.reduce((score, issue) => {
    const severityWeight = getSeverityWeight(issue.severity)
    return score - (severityWeight * issue.affectedUsers)
  }, 100)

  return Math.max(0, Math.min(100, weightedScore))
})

const scoreClass = computed(() => {
  const score = overallScore.value
  if (score >= 90) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'warning'
  return 'critical'
})

const openIssues = computed(() => {
  return props.complianceData.filter(issue => issue.status === 'Open').length
})

const criticalIssues = computed(() => {
  return props.complianceData.filter(issue => issue.severity === 'Critical' || issue.severity === 'High').length
})

const getSeverityWeight = (severity: string) => {
  const weights: Record<string, number> = {
    'Low': 0.5,
    'Medium': 1,
    'High': 2,
    'Critical': 5
  }
  return weights[severity] || 1
}

const getSeverityType = (severity: string): 'success' | 'warning' | 'danger' | 'info' => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'Low': 'info',
    'Medium': 'warning',
    'High': 'danger',
    'Critical': 'danger'
  }
  return types[severity] || 'info'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const handleIssueClick = (issue: ComplianceIssue) => {
  emit('compliance-issue', issue)
}
</script>

<style scoped lang="scss">
.compliance-monitor {
  padding: 16px;
}

.compliance-overview {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.compliance-score {
  text-align: center;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 8px;

  &.excellent {
    background: linear-gradient(135deg, #67c23a, #85ce61);
    color: white;
  }

  &.good {
    background: linear-gradient(135deg, #e6a23c, #ebb563);
    color: white;
  }

  &.warning {
    background: linear-gradient(135deg, #f56c6c, #f78989);
    color: white;
  }

  &.critical {
    background: linear-gradient(135deg, #d81e06, #e64545);
    color: white;
  }
}

.score-label {
  font-size: 12px;
  color: #909399;
}

.compliance-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.issues-header {
  margin-bottom: 12px;

  h4 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
}

.issues-list {
  max-height: 300px;
  overflow-y: auto;
}

.issue-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #409eff;
  }
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.issue-type {
  font-weight: 500;
  color: #606266;
}

.issue-description {
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.4;
}

.issue-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.no-issues {
  text-align: center;
  padding: 40px 20px;
  color: #67c23a;

  p {
    margin: 12px 0 0 0;
    color: #606266;
  }
}
</style>
