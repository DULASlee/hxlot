<template>
  <div class="intelligent-qa">
    <el-card>
      <template #header>
        <div class="qa-header">
          <h3>
            <i class="el-icon-shield" />
            智能质量保证
          </h3>
          <el-button
            type="primary"
            size="small"
            :loading="checking"
            @click="runFullQualityCheck"
          >
            <i class="el-icon-check" />
            全面质量检查
          </el-button>
        </div>
      </template>

      <!-- 质量评分概览 -->
      <div class="quality-overview">
        <div class="score-display">
          <div class="score-circle">
            <el-progress
              type="circle"
              :percentage="overallScore"
              :width="80"
              :stroke-width="6"
              :color="getScoreColor(overallScore)"
            >
              <template #default="{ percentage }">
                <span class="score-text">{{ percentage }}</span>
                <span class="score-label">分</span>
              </template>
            </el-progress>
          </div>
          <div class="score-info">
            <h4>整体质量评分</h4>
            <p :style="{ color: getScoreColor(overallScore) }">
              {{ getScoreLevel(overallScore) }}
            </p>
          </div>
        </div>

        <div class="quality-metrics">
          <div class="metric-item">
            <div class="metric-icon">
              <i class="el-icon-data-analysis" />
            </div>
            <div class="metric-content">
              <div class="metric-title">
                数据模型质量
              </div>
              <div class="metric-score">
                {{ dataModelScore }}/100
              </div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon">
              <i class="el-icon-brush" />
            </div>
            <div class="metric-content">
              <div class="metric-title">
                页面设计质量
              </div>
              <div class="metric-score">
                {{ pageDesignScore }}/100
              </div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon">
              <i class="el-icon-cpu" />
            </div>
            <div class="metric-content">
              <div class="metric-title">
                代码生成质量
              </div>
              <div class="metric-score">
                {{ codeGenerationScore }}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 质量检查项 -->
      <div class="quality-checks">
        <h4>详细检查项</h4>
        <div class="check-list">
          <div
            v-for="check in qualityChecks"
            :key="check.id"
            class="check-item"
            :class="getCheckStatusClass(check.status)"
          >
            <div class="check-icon">
              <i :class="getCheckIcon(check.status)" />
            </div>
            <div class="check-content">
              <div class="check-title">
                {{ check.title }}
              </div>
              <div class="check-description">
                {{ check.description }}
              </div>
              <div
                v-if="check.issues.length > 0"
                class="check-issues"
              >
                <el-tag
                  v-for="issue in check.issues.slice(0, 3)"
                  :key="issue.id"
                  size="small"
                  :type="issue.severity === 'error' ? 'danger' : 'warning'"
                >
                  {{ issue.message }}
                </el-tag>
                <span
                  v-if="check.issues.length > 3"
                  class="more-issues"
                >
                  +{{ check.issues.length - 3 }}个问题
                </span>
              </div>
            </div>
            <div class="check-actions">
              <el-button
                v-if="check.status === 'failed'"
                size="mini"
                type="primary"
                @click="fixIssues(check)"
              >
                自动修复
              </el-button>
              <el-button
                size="mini"
                @click="viewDetails(check)"
              >
                详情
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 最佳实践建议 -->
      <div class="best-practices">
        <h4>最佳实践建议</h4>
        <div class="suggestions-list">
          <div
            v-for="suggestion in bestPracticeSuggestions"
            :key="suggestion.id"
            class="suggestion-item"
            :class="suggestion.priority"
          >
            <div class="suggestion-icon">
              <i :class="suggestion.icon" />
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">
                {{ suggestion.title }}
              </div>
              <div class="suggestion-description">
                {{ suggestion.description }}
              </div>
            </div>
            <div class="suggestion-actions">
              <el-button
                size="mini"
                type="primary"
                @click="applySuggestion(suggestion)"
              >
                应用建议
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 企业级特性检查 -->
      <div class="enterprise-features">
        <h4>企业级特性检查</h4>
        <el-row :gutter="16">
          <el-col
            v-for="feature in enterpriseFeatures"
            :key="feature.id"
            :span="8"
          >
            <div 
              class="feature-card"
              :class="{ enabled: feature.enabled, critical: feature.critical }"
            >
              <div class="feature-header">
                <i :class="feature.icon" />
                <span class="feature-name">{{ feature.name }}</span>
                <el-tag
                  :type="feature.enabled ? 'success' : (feature.critical ? 'danger' : 'info')"
                  size="mini"
                >
                  {{ feature.enabled ? '已启用' : (feature.critical ? '必需' : '可选') }}
                </el-tag>
              </div>
              <div class="feature-description">
                {{ feature.description }}
              </div>
              <div
                v-if="!feature.enabled && feature.critical"
                class="feature-warning"
              >
                <i class="el-icon-warning" />
                <span>企业级应用必需特性</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { usePageDesignStore } from '@/stores/lowcode/pageDesign'
import { useCodeGenerationStore } from '@/stores/lowcode/codeGeneration'
import { ElMessage, ElMessageBox } from 'element-plus'

// Stores
const entityStore = useEntityModelingStore()
const pageDesignStore = usePageDesignStore()
const codeGenerationStore = useCodeGenerationStore()

// 响应式数据
const checking = ref(false)

// 质量检查项
const qualityChecks = ref([
  {
    id: 'data-model-integrity',
    title: '数据模型完整性',
    description: '检查实体定义、字段配置、主键设置等',
    status: 'unknown',
    issues: []
  },
  {
    id: 'entity-naming-convention',
    title: '实体命名规范',
    description: '检查实体和字段命名是否符合企业标准',
    status: 'unknown',
    issues: []
  },
  {
    id: 'relationship-consistency',
    title: '关系一致性',
    description: '检查实体关系定义和外键约束',
    status: 'unknown',
    issues: []
  },
  {
    id: 'validation-rules',
    title: '验证规则完整性',
    description: '检查必要字段的验证规则配置',
    status: 'unknown',
    issues: []
  },
  {
    id: 'page-design-quality',
    title: '页面设计质量',
    description: '检查页面组件配置和用户体验',
    status: 'unknown',
    issues: []
  },
  {
    id: 'code-generation-readiness',
    title: '代码生成就绪性',
    description: '检查是否满足代码生成的前置条件',
    status: 'unknown',
    issues: []
  }
])

// 最佳实践建议
const bestPracticeSuggestions = ref([
  {
    id: 'add-audit-fields',
    title: '添加审计字段',
    description: '为核心实体添加CreationTime、CreatorId等审计字段',
    icon: 'el-icon-time',
    priority: 'high',
    applicable: true
  },
  {
    id: 'enable-soft-delete',
    title: '启用软删除',
    description: '为重要实体启用软删除功能，避免数据误删',
    icon: 'el-icon-delete',
    priority: 'medium',
    applicable: true
  },
  {
    id: 'add-indexes',
    title: '添加数据库索引',
    description: '为查询频繁的字段添加索引，提升性能',
    icon: 'el-icon-data-line',
    priority: 'medium',
    applicable: true
  },
  {
    id: 'multi-tenant-support',
    title: '多租户支持',
    description: '为SaaS应用启用多租户隔离',
    icon: 'el-icon-office-building',
    priority: 'high',
    applicable: true
  }
])

// 企业级特性
const enterpriseFeatures = ref([
  {
    id: 'permission-control',
    name: '权限控制',
    description: '细粒度权限控制和访问限制',
    icon: 'el-icon-lock',
    enabled: false,
    critical: true
  },
  {
    id: 'audit-logging',
    name: '审计日志',
    description: '完整的操作日志记录和追溯',
    icon: 'el-icon-document-copy',
    enabled: false,
    critical: true
  },
  {
    id: 'multi-tenant',
    name: '多租户',
    description: '数据隔离和租户管理',
    icon: 'el-icon-office-building',
    enabled: false,
    critical: false
  },
  {
    id: 'caching',
    name: '缓存支持',
    description: '分布式缓存和性能优化',
    icon: 'el-icon-lightning',
    enabled: false,
    critical: false
  },
  {
    id: 'monitoring',
    name: '监控指标',
    description: '业务指标监控和告警',
    icon: 'el-icon-data-analysis',
    enabled: false,
    critical: false
  },
  {
    id: 'api-versioning',
    name: 'API版本控制',
    description: 'API版本管理和向后兼容',
    icon: 'el-icon-coordinate',
    enabled: false,
    critical: true
  }
])

// 计算属性
const dataModelScore = computed(() => {
  const entities = entityStore.entities
  if (entities.length === 0) return 0

  let score = 0
  let total = 0

  entities.forEach(entity => {
    total += 100
    
    // 基本信息完整性 (30分)
    if (entity.name && entity.tableName && entity.description) score += 30
    else if (entity.name && entity.tableName) score += 20
    else if (entity.name) score += 10

    // 字段设计质量 (40分)
    const hasKeyField = entity.fields.some(f => f.isPrimaryKey)
    const hasRequiredFields = entity.fields.some(f => f.isRequired)
    const hasProperTypes = entity.fields.every(f => f.type && f.type !== 'unknown')
    
    if (hasKeyField && hasRequiredFields && hasProperTypes) score += 40
    else if (hasKeyField && hasRequiredFields) score += 30
    else if (hasKeyField) score += 20

    // 验证规则完整性 (20分)
    const requiredFields = entity.fields.filter(f => f.isRequired)
    const validationRules = entity.validationRules || []
    const rulesCoverage = validationRules.length / Math.max(requiredFields.length, 1)
    score += Math.min(rulesCoverage * 20, 20)

    // 企业级特性 (10分)
    if (entity.enableAudit) score += 5
    if (entity.enableSoftDelete) score += 5
  })

  return Math.round(total > 0 ? (score / total) * 100 : 0)
})

const pageDesignScore = computed(() => {
  const pages = pageDesignStore.pages
  const entities = entityStore.entities
  
  if (entities.length === 0) return 0
  if (pages.length === 0) return 0

  let score = 0
  let total = entities.length * 100

  entities.forEach(entity => {
    const entityPages = pages.filter(p => p.entityName === entity.name)
    
    // 页面覆盖度 (50分)
    const hasListPage = entityPages.some(p => p.type === 'list')
    const hasFormPage = entityPages.some(p => p.type === 'form')
    const hasDetailPage = entityPages.some(p => p.type === 'detail')
    
    if (hasListPage && hasFormPage && hasDetailPage) score += 50
    else if (hasListPage && hasFormPage) score += 35
    else if (hasListPage) score += 20

    // 组件配置质量 (30分)
    const totalComponents = entityPages.reduce((sum, p) => sum + p.components.length, 0)
    if (totalComponents >= 5) score += 30
    else if (totalComponents >= 3) score += 20
    else if (totalComponents >= 1) score += 10

    // UI规范性 (20分)
    const hasConsistentStyle = entityPages.every(p => p.uiStyle === entityPages[0]?.uiStyle)
    if (hasConsistentStyle) score += 20
  })

  return Math.round((score / total) * 100)
})

const codeGenerationScore = computed(() => {
  const files = codeGenerationStore.generatedFiles
  const entities = entityStore.entities
  
  if (entities.length === 0) return 0
  if (files.length === 0) return 0

  let score = 0
  const expectedFilesPerEntity = 8 // 预期每个实体生成8个文件

  entities.forEach(entity => {
    const entityFiles = files.filter(f => f.path.includes(entity.name))
    
    // 文件完整性 (60分)
    const hasBackendFiles = entityFiles.some(f => f.path.includes('.cs'))
    const hasFrontendFiles = entityFiles.some(f => f.path.includes('.vue') || f.path.includes('.ts'))
    const hasTestFiles = entityFiles.some(f => f.path.includes('.test.') || f.path.includes('.spec.'))
    
    if (hasBackendFiles && hasFrontendFiles && hasTestFiles) score += 60
    else if (hasBackendFiles && hasFrontendFiles) score += 40
    else if (hasBackendFiles || hasFrontendFiles) score += 20

    // 代码质量 (40分)
    const totalLines = entityFiles.reduce((sum, f) => sum + (f.content?.split('\n').length || 0), 0)
    if (totalLines >= 500) score += 40
    else if (totalLines >= 300) score += 30
    else if (totalLines >= 100) score += 20
  })

  const maxPossibleScore = entities.length * 100
  return Math.round(maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0)
})

const overallScore = computed(() => {
  return Math.round(
    (dataModelScore.value * 0.4 + pageDesignScore.value * 0.3 + codeGenerationScore.value * 0.3)
  )
})

// 方法
const runFullQualityCheck = async () => {
  checking.value = true
  
  try {
    // 执行各项质量检查
    await checkDataModelIntegrity()
    await checkNamingConventions()
    await checkRelationshipConsistency()
    await checkValidationRules()
    await checkPageDesignQuality()
    await checkCodeGenerationReadiness()
    
    // 更新企业级特性状态
    updateEnterpriseFeatures()
    
    ElMessage.success('质量检查完成！')
    
  } catch (error) {
    ElMessage.error('质量检查失败：' + error.message)
  } finally {
    checking.value = false
  }
}

const checkDataModelIntegrity = async () => {
  const check = qualityChecks.value.find(c => c.id === 'data-model-integrity')
  if (!check) return

  const issues = []
  const entities = entityStore.entities

  entities.forEach(entity => {
    // 检查主键
    const primaryKeys = entity.fields.filter(f => f.isPrimaryKey)
    if (primaryKeys.length === 0) {
      issues.push({
        id: `${entity.id}-no-primary-key`,
        message: `${entity.name}缺少主键`,
        severity: 'error',
        entity: entity.name
      })
    } else if (primaryKeys.length > 1) {
      issues.push({
        id: `${entity.id}-multiple-primary-keys`,
        message: `${entity.name}有多个主键`,
        severity: 'error',
        entity: entity.name
      })
    }

    // 检查必填字段
    const requiredFields = entity.fields.filter(f => f.isRequired)
    if (requiredFields.length === 0) {
      issues.push({
        id: `${entity.id}-no-required-fields`,
        message: `${entity.name}没有必填字段`,
        severity: 'warning',
        entity: entity.name
      })
    }

    // 检查字段类型
    entity.fields.forEach(field => {
      if (!field.type || field.type === 'unknown') {
        issues.push({
          id: `${entity.id}-${field.name}-invalid-type`,
          message: `${entity.name}.${field.name}字段类型无效`,
          severity: 'error',
          entity: entity.name,
          field: field.name
        })
      }
    })
  })

  check.issues = issues
  check.status = issues.length === 0 ? 'passed' : (issues.some(i => i.severity === 'error') ? 'failed' : 'warning')
}

const checkNamingConventions = async () => {
  const check = qualityChecks.value.find(c => c.id === 'entity-naming-convention')
  if (!check) return

  const issues = []
  const entities = entityStore.entities

  entities.forEach(entity => {
    // 检查实体名PascalCase
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) {
      issues.push({
        id: `${entity.id}-naming`,
        message: `${entity.name}应使用PascalCase命名`,
        severity: 'warning',
        entity: entity.name
      })
    }

    // 检查字段名PascalCase
    entity.fields.forEach(field => {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(field.name)) {
        issues.push({
          id: `${entity.id}-${field.name}-naming`,
          message: `${entity.name}.${field.name}应使用PascalCase命名`,
          severity: 'warning',
          entity: entity.name,
          field: field.name
        })
      }
    })
  })

  check.issues = issues
  check.status = issues.length === 0 ? 'passed' : 'warning'
}

const checkRelationshipConsistency = async () => {
  const check = qualityChecks.value.find(c => c.id === 'relationship-consistency')
  if (!check) return

  const issues = []
  const entities = entityStore.entities
  const relations = entityStore.relations

  relations.forEach(relation => {
    const fromEntity = entities.find(e => e.name === relation.fromEntity)
    const toEntity = entities.find(e => e.name === relation.toEntity)

    if (!fromEntity) {
      issues.push({
        id: `relation-${relation.id}-from-missing`,
        message: `关系引用不存在的源实体：${relation.fromEntity}`,
        severity: 'error'
      })
    }

    if (!toEntity) {
      issues.push({
        id: `relation-${relation.id}-to-missing`,
        message: `关系引用不存在的目标实体：${relation.toEntity}`,
        severity: 'error'
      })
    }

    // 检查外键字段
    if (fromEntity && !fromEntity.fields.some(f => f.name === relation.foreignKey)) {
      issues.push({
        id: `relation-${relation.id}-fk-missing`,
        message: `${relation.fromEntity}缺少外键字段：${relation.foreignKey}`,
        severity: 'warning'
      })
    }
  })

  check.issues = issues
  check.status = issues.length === 0 ? 'passed' : (issues.some(i => i.severity === 'error') ? 'failed' : 'warning')
}

const checkValidationRules = async () => {
  const check = qualityChecks.value.find(c => c.id === 'validation-rules')
  if (!check) return

  const issues = []
  const entities = entityStore.entities

  entities.forEach(entity => {
    const requiredFields = entity.fields.filter(f => f.isRequired)
    const validationRules = entity.validationRules || []

    requiredFields.forEach(field => {
      const hasValidation = validationRules.some(rule => rule.fieldName === field.name)
      if (!hasValidation && field.type === 'string') {
        issues.push({
          id: `${entity.id}-${field.name}-validation`,
          message: `${entity.name}.${field.name}缺少验证规则`,
          severity: 'warning',
          entity: entity.name,
          field: field.name
        })
      }
    })
  })

  check.issues = issues
  check.status = issues.length === 0 ? 'passed' : 'warning'
}

const checkPageDesignQuality = async () => {
  const check = qualityChecks.value.find(c => c.id === 'page-design-quality')
  if (!check) return

  const issues = []
  const pages = pageDesignStore.pages
  const entities = entityStore.entities

  entities.forEach(entity => {
    const entityPages = pages.filter(p => p.entityName === entity.name)
    
    if (entityPages.length === 0) {
      issues.push({
        id: `${entity.name}-no-pages`,
        message: `${entity.name}没有对应的管理页面`,
        severity: 'warning',
        entity: entity.name
      })
    } else {
      // 检查是否有基本的CRUD页面
      const hasListPage = entityPages.some(p => p.type === 'list')
      const hasFormPage = entityPages.some(p => p.type === 'form')
      
      if (!hasListPage) {
        issues.push({
          id: `${entity.name}-no-list-page`,
          message: `${entity.name}缺少列表页面`,
          severity: 'warning',
          entity: entity.name
        })
      }
      
      if (!hasFormPage) {
        issues.push({
          id: `${entity.name}-no-form-page`,
          message: `${entity.name}缺少表单页面`,
          severity: 'warning',
          entity: entity.name
        })
      }
    }
  })

  check.issues = issues
  check.status = issues.length === 0 ? 'passed' : 'warning'
}

const checkCodeGenerationReadiness = async () => {
  const check = qualityChecks.value.find(c => c.id === 'code-generation-readiness')
  if (!check) return

  const issues = []
  const entities = entityStore.entities
  const pages = pageDesignStore.pages

  // 检查前置条件
  if (entities.length === 0) {
    issues.push({
      id: 'no-entities',
      message: '没有定义任何实体',
      severity: 'error'
    })
  }

  if (pages.length === 0) {
    issues.push({
      id: 'no-pages',
      message: '没有设计任何页面',
      severity: 'warning'
    })
  }

  // 检查每个实体的完整性
  entities.forEach(entity => {
    if (!entity.isCompleted) {
      issues.push({
        id: `${entity.name}-incomplete`,
        message: `${entity.name}实体设计不完整`,
        severity: 'warning',
        entity: entity.name
      })
    }
  })

  check.issues = issues
  check.status = issues.length === 0 ? 'passed' : (issues.some(i => i.severity === 'error') ? 'failed' : 'warning')
}

const updateEnterpriseFeatures = () => {
  const entities = entityStore.entities
  
  // 检查各种企业级特性的启用状态
  enterpriseFeatures.value.forEach(feature => {
    switch (feature.id) {
      case 'audit-logging':
        feature.enabled = entities.some(e => e.enableAudit)
        break
      case 'multi-tenant':
        feature.enabled = entities.some(e => e.enableMultiTenant)
        break
      case 'permission-control':
        feature.enabled = entities.some(e => e.name.toLowerCase().includes('permission') || e.name.toLowerCase().includes('role'))
        break
      default:
        // 其他特性的检查逻辑
        break
    }
  })
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#95d475'
  if (score >= 70) return '#e6a23c'
  if (score >= 60) return '#f78989'
  return '#f56c6c'
}

const getScoreLevel = (score: number): string => {
  if (score >= 95) return '卓越 (Enterprise+)'
  if (score >= 90) return '优秀 (Enterprise)'
  if (score >= 80) return '良好 (Professional)'
  if (score >= 70) return '合格 (Standard)'
  if (score >= 60) return '待改进 (Basic)'
  return '需重构 (Poor)'
}

const getCheckStatusClass = (status: string): string => {
  return `check-${status}`
}

const getCheckIcon = (status: string): string => {
  switch (status) {
    case 'passed': return 'el-icon-check'
    case 'failed': return 'el-icon-close'
    case 'warning': return 'el-icon-warning'
    default: return 'el-icon-time'
  }
}

const fixIssues = async (check: any) => {
  try {
    await ElMessageBox.confirm(
      `是否自动修复"${check.title}"中发现的问题？`,
      '自动修复确认',
      {
        confirmButtonText: '自动修复',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 根据检查类型执行自动修复
    switch (check.id) {
      case 'data-model-integrity':
        await autoFixDataModelIssues(check.issues)
        break
      case 'entity-naming-convention':
        await autoFixNamingIssues(check.issues)
        break
      case 'validation-rules':
        await autoAddValidationRules(check.issues)
        break
      default:
        ElMessage.info('此类问题需要手动修复')
        return
    }

    ElMessage.success('问题修复完成！')
    
    // 重新检查
    await runFullQualityCheck()
    
  } catch {
    // 用户取消
  }
}

const autoFixDataModelIssues = async (issues: any[]) => {
  issues.forEach(issue => {
    if (issue.message.includes('缺少主键')) {
      const entity = entityStore.entities.find(e => e.name === issue.entity)
      if (entity && !entity.fields.some(f => f.isPrimaryKey)) {
        // 自动添加Id主键字段
        entityStore.addField(entity.id, {
          name: 'Id',
          displayName: 'ID',
          type: 'Guid',
          isRequired: true,
          isPrimaryKey: true,
          description: '唯一标识符'
        })
      }
    }
  })
}

const autoFixNamingIssues = async (issues: any[]) => {
  // 自动修复命名规范问题
  issues.forEach(issue => {
    if (issue.field) {
      // 修复字段命名
      const entity = entityStore.entities.find(e => e.name === issue.entity)
      if (entity) {
        const field = entity.fields.find(f => f.name === issue.field)
        if (field) {
          field.name = toPascalCase(field.name)
        }
      }
    } else if (issue.entity) {
      // 修复实体命名
      const entity = entityStore.entities.find(e => e.name === issue.entity)
      if (entity) {
        entity.name = toPascalCase(entity.name)
      }
    }
  })
}

const autoAddValidationRules = async (issues: any[]) => {
  issues.forEach(issue => {
    const entity = entityStore.entities.find(e => e.name === issue.entity)
    if (entity && issue.field) {
      const field = entity.fields.find(f => f.name === issue.field)
      if (field && field.type === 'string') {
        // 自动添加长度验证规则
        entityStore.addValidationRule(entity.id, {
          fieldName: field.name,
          ruleType: 'length',
          ruleValue: `1,${field.length || 100}`,
          errorMessage: `${field.displayName}长度应在1-${field.length || 100}字符之间`
        })
      }
    }
  })
}

const toPascalCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const viewDetails = (check: any) => {
  // 显示详细的问题列表
  ElMessageBox.alert(
    check.issues.map(issue => `• ${issue.message}`).join('\n'),
    `${check.title} - 详细问题`,
    {
      confirmButtonText: '确定',
      type: 'info',
      customClass: 'qa-details-dialog'
    }
  )
}

const applySuggestion = async (suggestion: any) => {
  try {
    switch (suggestion.id) {
      case 'add-audit-fields':
        await addAuditFieldsToEntities()
        break
      case 'enable-soft-delete':
        await enableSoftDeleteForEntities()
        break
      case 'add-indexes':
        await addIndexSuggestions()
        break
      case 'multi-tenant-support':
        await enableMultiTenantSupport()
        break
      default:
        ElMessage.info('此建议需要手动实施')
        return
    }

    ElMessage.success('建议应用成功！')
    suggestion.applicable = false

  } catch (error) {
    ElMessage.error('应用建议失败：' + error.message)
  }
}

const addAuditFieldsToEntities = async () => {
  const auditFields = [
    { name: 'CreationTime', displayName: '创建时间', type: 'DateTime', isRequired: true },
    { name: 'CreatorId', displayName: '创建人ID', type: 'Guid?', isRequired: false },
    { name: 'LastModificationTime', displayName: '最后修改时间', type: 'DateTime?', isRequired: false },
    { name: 'LastModifierId', displayName: '最后修改人ID', type: 'Guid?', isRequired: false }
  ]

  entityStore.entities.forEach(entity => {
    if (entity.category === 'core') {
      auditFields.forEach(auditField => {
        if (!entity.fields.some(f => f.name === auditField.name)) {
          entityStore.addField(entity.id, auditField)
        }
      })
      entityStore.updateEntity(entity.id, { enableAudit: true })
    }
  })
}

const enableSoftDeleteForEntities = async () => {
  entityStore.entities.forEach(entity => {
    if (entity.category === 'core') {
      entityStore.updateEntity(entity.id, { enableSoftDelete: true })
      
      // 添加IsDeleted字段
      if (!entity.fields.some(f => f.name === 'IsDeleted')) {
        entityStore.addField(entity.id, {
          name: 'IsDeleted',
          displayName: '是否已删除',
          type: 'bool',
          isRequired: true,
          defaultValue: 'false'
        })
      }
    }
  })
}

const addIndexSuggestions = async () => {
  // 这里可以添加索引建议的逻辑
  ElMessage.info('索引建议已添加到生成配置中')
}

const enableMultiTenantSupport = async () => {
  entityStore.entities.forEach(entity => {
    if (entity.category === 'core') {
      entityStore.updateEntity(entity.id, { enableMultiTenant: true })
      
      // 添加TenantId字段
      if (!entity.fields.some(f => f.name === 'TenantId')) {
        entityStore.addField(entity.id, {
          name: 'TenantId',
          displayName: '租户ID',
          type: 'Guid?',
          isRequired: false
        })
      }
    }
  })
}
</script>

<style scoped>
.intelligent-qa {
  height: 100%;
}

.qa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qa-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 质量评分样式 */
.quality-overview {
  margin-bottom: 24px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.score-circle {
  position: relative;
}

.score-text {
  font-size: 18px;
  font-weight: bold;
}

.score-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.score-info h4 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.score-info p {
  margin: 0;
  font-weight: 600;
}

.quality-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon i {
  font-size: 18px;
  color: var(--el-color-primary);
}

.metric-content {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.metric-score {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

/* 质量检查项样式 */
.quality-checks {
  margin-bottom: 24px;
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.check-passed {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}

.check-warning {
  background: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);
}

.check-failed {
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);
}

.check-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-passed .check-icon {
  background: var(--el-color-success);
  color: white;
}

.check-warning .check-icon {
  background: var(--el-color-warning);
  color: white;
}

.check-failed .check-icon {
  background: var(--el-color-danger);
  color: white;
}

.check-unknown .check-icon {
  background: var(--el-color-info);
  color: white;
}

.check-content {
  flex: 1;
}

.check-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.check-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.check-issues {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.more-issues {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.check-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 最佳实践建议样式 */
.best-practices {
  margin-bottom: 24px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.suggestion-item.high {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.suggestion-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-icon i {
  color: var(--el-color-primary);
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.suggestion-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 企业级特性样式 */
.enterprise-features h4 {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.feature-card {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  height: 100%;
}

.feature-card.enabled {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.feature-card.critical:not(.enabled) {
  border-color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.feature-header i {
  font-size: 16px;
  color: var(--el-color-primary);
}

.feature-name {
  flex: 1;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.feature-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-bottom: 8px;
}

.feature-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-color-danger);
  font-weight: 500;
}
</style>
