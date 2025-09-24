<template>
  <div class="intelligent-modeling-assistant">
    <el-card>
      <template #header>
        <div class="assistant-header">
          <h3>
            <i class="el-icon-magic-stick" />
            智能建模助手
          </h3>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-refresh"
            :loading="analyzing"
            @click="analyzeModel"
          >
            重新分析
          </el-button>
        </div>
      </template>

      <!-- 建模质量评估 -->
      <div class="quality-assessment">
        <div class="assessment-header">
          <h4>模型质量评估</h4>
          <el-tag
            :type="getQualityTagType(modelQuality.score)"
            size="small"
          >
            {{ getQualityLevel(modelQuality.score) }}
          </el-tag>
        </div>
        
        <div class="quality-metrics">
          <div class="metric-item">
            <div class="metric-name">
              实体完整性
            </div>
            <el-progress
              :percentage="modelQuality.entityCompleteness"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(modelQuality.entityCompleteness)"
            />
            <span class="metric-value">{{ modelQuality.entityCompleteness }}%</span>
          </div>
          <div class="metric-item">
            <div class="metric-name">
              关系合理性
            </div>
            <el-progress
              :percentage="modelQuality.relationshipQuality"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(modelQuality.relationshipQuality)"
            />
            <span class="metric-value">{{ modelQuality.relationshipQuality }}%</span>
          </div>
          <div class="metric-item">
            <div class="metric-name">
              命名规范性
            </div>
            <el-progress
              :percentage="modelQuality.namingConvention"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(modelQuality.namingConvention)"
            />
            <span class="metric-value">{{ modelQuality.namingConvention }}%</span>
          </div>
          <div class="metric-item">
            <div class="metric-name">
              业务合规性
            </div>
            <el-progress
              :percentage="modelQuality.businessCompliance"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(modelQuality.businessCompliance)"
            />
            <span class="metric-value">{{ modelQuality.businessCompliance }}%</span>
          </div>
        </div>
      </div>

      <!-- 智能建议 -->
      <div class="intelligent-suggestions">
        <div class="suggestions-header">
          <h4>智能建议 ({{ activeSuggestions.length }})</h4>
          <el-button-group size="mini">
            <el-button
              :type="suggestionFilter === 'all' ? 'primary' : 'default'"
              @click="suggestionFilter = 'all'"
            >
              全部
            </el-button>
            <el-button
              :type="suggestionFilter === 'critical' ? 'primary' : 'default'"
              @click="suggestionFilter = 'critical'"
            >
              重要
            </el-button>
            <el-button
              :type="suggestionFilter === 'optimization' ? 'primary' : 'default'"
              @click="suggestionFilter = 'optimization'"
            >
              优化
            </el-button>
          </el-button-group>
        </div>

        <div class="suggestions-list">
          <div
            v-for="suggestion in filteredSuggestions"
            :key="suggestion.id"
            class="suggestion-card"
            :class="suggestion.priority"
          >
            <div class="suggestion-header">
              <div class="suggestion-icon">
                <i :class="suggestion.icon" />
              </div>
              <div class="suggestion-info">
                <div class="suggestion-title">
                  {{ suggestion.title }}
                </div>
                <div class="suggestion-description">
                  {{ suggestion.description }}
                </div>
              </div>
              <div class="suggestion-priority">
                <el-tag
                  :type="getPriorityTagType(suggestion.priority)"
                  size="mini"
                >
                  {{ getPriorityLabel(suggestion.priority) }}
                </el-tag>
              </div>
            </div>
            
            <div class="suggestion-details">
              <div class="suggestion-reason">
                <strong>建议原因:</strong> {{ suggestion.reason }}
              </div>
              <div
                v-if="suggestion.benefits"
                class="suggestion-benefits"
              >
                <strong>预期收益:</strong>
                <ul>
                  <li
                    v-for="benefit in suggestion.benefits"
                    :key="benefit"
                  >
                    {{ benefit }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="suggestion-actions">
              <el-button
                v-if="suggestion.autoApplicable"
                size="mini"
                type="primary"
                @click="applySuggestion(suggestion)"
              >
                自动应用
              </el-button>
              <el-button
                size="mini"
                @click="viewSuggestionDetails(suggestion)"
              >
                查看详情
              </el-button>
              <el-button
                size="mini"
                type="info"
                @click="dismissSuggestion(suggestion)"
              >
                忽略
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型模式识别 -->
      <div class="pattern-recognition">
        <div class="pattern-header">
          <h4>
            <i class="el-icon-cpu" />
            模型模式识别
          </h4>
        </div>

        <div class="recognized-patterns">
          <div
            v-for="pattern in recognizedPatterns"
            :key="pattern.id"
            class="pattern-card"
            :class="pattern.confidence >= 0.8 ? 'high-confidence' : 'medium-confidence'"
          >
            <div class="pattern-info">
              <div class="pattern-name">
                {{ pattern.name }}
              </div>
              <div class="pattern-description">
                {{ pattern.description }}
              </div>
              <div class="pattern-confidence">
                置信度: {{ Math.round(pattern.confidence * 100) }}%
              </div>
            </div>
            <div class="pattern-entities">
              <span class="entities-label">涉及实体:</span>
              <el-tag
                v-for="entityName in pattern.entities"
                :key="entityName"
                size="mini"
                type="primary"
              >
                {{ entityName }}
              </el-tag>
            </div>
            <div class="pattern-recommendations">
              <div class="recommendations-label">
                建议:
              </div>
              <ul class="recommendations-list">
                <li
                  v-for="rec in pattern.recommendations"
                  :key="rec"
                >
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 最佳实践检查 -->
      <div class="best-practices-check">
        <div class="practices-header">
          <h4>
            <i class="el-icon-medal" />
            最佳实践检查
          </h4>
          <span class="practices-score">
            {{ passedPractices }}/{{ totalPractices }} 项通过
          </span>
        </div>

        <div class="practices-list">
          <div
            v-for="practice in bestPractices"
            :key="practice.id"
            class="practice-item"
            :class="practice.passed ? 'passed' : 'failed'"
          >
            <div class="practice-icon">
              <i :class="practice.passed ? 'el-icon-check' : 'el-icon-close'" />
            </div>
            <div class="practice-content">
              <div class="practice-name">
                {{ practice.name }}
              </div>
              <div class="practice-description">
                {{ practice.description }}
              </div>
              <div
                v-if="!practice.passed && practice.suggestion"
                class="practice-suggestion"
              >
                💡 建议: {{ practice.suggestion }}
              </div>
            </div>
            <div class="practice-action">
              <el-button
                v-if="!practice.passed && practice.autoFixable"
                size="mini"
                type="primary"
                @click="autoFixPractice(practice)"
              >
                自动修复
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 建议详情对话框 -->
    <el-dialog
      v-model="showSuggestionDetails"
      :title="selectedSuggestion?.title"
      width="700px"
    >
      <div
        v-if="selectedSuggestion"
        class="suggestion-details-content"
      >
        <div class="detail-section">
          <h4>建议描述</h4>
          <p>{{ selectedSuggestion.description }}</p>
        </div>

        <div class="detail-section">
          <h4>建议原因</h4>
          <p>{{ selectedSuggestion.reason }}</p>
        </div>

        <div
          v-if="selectedSuggestion.steps"
          class="detail-section"
        >
          <h4>实施步骤</h4>
          <ol>
            <li
              v-for="step in selectedSuggestion.steps"
              :key="step"
            >
              {{ step }}
            </li>
          </ol>
        </div>

        <div
          v-if="selectedSuggestion.impact"
          class="detail-section"
        >
          <h4>影响评估</h4>
          <div class="impact-grid">
            <div class="impact-item">
              <span class="impact-label">影响范围:</span>
              <span class="impact-value">{{ selectedSuggestion.impact.scope }}</span>
            </div>
            <div class="impact-item">
              <span class="impact-label">复杂度:</span>
              <span class="impact-value">{{ selectedSuggestion.impact.complexity }}</span>
            </div>
            <div class="impact-item">
              <span class="impact-label">预计时间:</span>
              <span class="impact-value">{{ selectedSuggestion.impact.estimatedTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSuggestionDetails = false">
            关闭
          </el-button>
          <el-button
            v-if="selectedSuggestion?.autoApplicable"
            type="primary"
            @click="applySuggestion(selectedSuggestion)"
          >
            应用建议
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { ElMessage } from 'element-plus'

// Store
const entityStore = useEntityModelingStore()

// 响应式数据
const analyzing = ref(false)
const suggestionFilter = ref('all')
const showSuggestionDetails = ref(false)
const selectedSuggestion = ref(null)

// 模型质量评估
const modelQuality = ref({
  score: 85,
  entityCompleteness: 90,
  relationshipQuality: 85,
  namingConvention: 80,
  businessCompliance: 85
})

// 智能建议
const suggestions = ref([
  {
    id: 'add-audit-fields',
    title: '添加审计字段',
    description: '为核心业务实体添加审计跟踪字段',
    reason: '检测到User、Role等核心实体缺少CreationTime、CreatorId等审计字段',
    priority: 'high',
    category: 'critical',
    icon: 'el-icon-time',
    autoApplicable: true,
    benefits: [
      '提供完整的数据变更追踪',
      '满足企业级审计要求',
      '便于问题排查和数据恢复'
    ],
    steps: [
      '为核心实体添加CreationTime字段',
      '添加CreatorId、LastModificationTime等字段',
      '配置审计字段的自动填充规则'
    ],
    impact: {
      scope: '影响3个核心实体',
      complexity: '低',
      estimatedTime: '5分钟'
    }
  },
  {
    id: 'optimize-relationships',
    title: '优化实体关系',
    description: '优化User和Role之间的多对多关系设计',
    reason: '检测到User和Role之间缺少中间表，建议使用标准的多对多关系模式',
    priority: 'medium',
    category: 'optimization',
    icon: 'el-icon-share',
    autoApplicable: true,
    benefits: [
      '提高查询性能',
      '简化权限管理逻辑',
      '便于扩展角色功能'
    ],
    steps: [
      '创建UserRole中间实体',
      '建立User和Role的多对多关系',
      '添加相关的导航属性'
    ],
    impact: {
      scope: '影响User和Role实体',
      complexity: '中',
      estimatedTime: '10分钟'
    }
  },
  {
    id: 'add-soft-delete',
    title: '启用软删除',
    description: '为重要实体启用软删除功能',
    reason: '核心业务实体建议使用软删除，避免数据误删',
    priority: 'medium',
    category: 'optimization',
    icon: 'el-icon-delete',
    autoApplicable: true,
    benefits: [
      '防止重要数据被误删',
      '支持数据恢复功能',
      '满足合规性要求'
    ]
  },
  {
    id: 'normalize-naming',
    title: '规范化命名',
    description: '统一实体和字段命名风格',
    reason: '检测到部分实体字段命名不符合PascalCase规范',
    priority: 'low',
    category: 'optimization',
    icon: 'el-icon-edit',
    autoApplicable: true
  },
  {
    id: 'add-indexes',
    title: '添加数据库索引建议',
    description: '为频繁查询的字段添加索引',
    reason: '根据字段类型和用途分析，建议为某些字段添加索引',
    priority: 'medium',
    category: 'optimization',
    icon: 'el-icon-data-line',
    autoApplicable: false,
    benefits: [
      '显著提升查询性能',
      '减少数据库负载',
      '改善用户体验'
    ]
  }
])

// 识别的模式
const recognizedPatterns = ref([
  {
    id: 'rbac-pattern',
    name: 'RBAC权限控制模式',
    description: '检测到标准的基于角色的访问控制(RBAC)模式',
    confidence: 0.95,
    entities: ['User', 'Role', 'Permission'],
    recommendations: [
      '建议添加UserRole和RolePermission中间表',
      '考虑添加组织架构支持',
      '建议实现权限继承机制'
    ]
  },
  {
    id: 'audit-trail-pattern',
    name: '审计追踪模式',
    description: '检测到审计追踪设计模式，但实现不完整',
    confidence: 0.75,
    entities: ['User', 'AuditLog'],
    recommendations: [
      '为所有核心实体添加审计字段',
      '实现自动审计日志记录',
      '添加审计日志查询和分析功能'
    ]
  },
  {
    id: 'hierarchical-data-pattern',
    name: '层次化数据模式',
    description: '检测到树形结构数据设计',
    confidence: 0.85,
    entities: ['OrganizationUnit', 'Menu'],
    recommendations: [
      '建议使用Path字段优化树形查询',
      '添加Level字段记录层级深度',
      '考虑实现左右值编码算法'
    ]
  }
])

// 最佳实践检查项
const bestPractices = ref([
  {
    id: 'primary-keys',
    name: '主键完整性',
    description: '所有实体都应该有明确的主键',
    passed: true,
    autoFixable: true,
    suggestion: '为缺少主键的实体添加Guid类型的Id字段'
  },
  {
    id: 'audit-fields',
    name: '审计字段',
    description: '核心实体应包含审计字段',
    passed: false,
    autoFixable: true,
    suggestion: '添加CreationTime、CreatorId、LastModificationTime等字段'
  },
  {
    id: 'soft-delete',
    name: '软删除支持',
    description: '重要实体应启用软删除',
    passed: false,
    autoFixable: true,
    suggestion: '为核心实体启用软删除功能'
  },
  {
    id: 'naming-convention',
    name: '命名规范',
    description: '实体和字段应遵循PascalCase命名规范',
    passed: true,
    autoFixable: true
  },
  {
    id: 'foreign-keys',
    name: '外键完整性',
    description: '关系应有对应的外键字段',
    passed: false,
    autoFixable: true,
    suggestion: '为关系添加对应的外键字段'
  },
  {
    id: 'validation-rules',
    name: '验证规则',
    description: '重要字段应配置验证规则',
    passed: false,
    autoFixable: false,
    suggestion: '为必填字段和特殊格式字段添加验证规则'
  },
  {
    id: 'multi-tenant',
    name: '多租户支持',
    description: '企业应用应考虑多租户设计',
    passed: false,
    autoFixable: true,
    suggestion: '为核心实体添加TenantId字段并启用多租户功能'
  }
])

// 计算属性
const entities = computed(() => entityStore.entities)
const relations = computed(() => entityStore.relations)

const activeSuggestions = computed(() => {
  return suggestions.value.filter(s => !s.dismissed)
})

const filteredSuggestions = computed(() => {
  if (suggestionFilter.value === 'all') {
    return activeSuggestions.value
  }
  return activeSuggestions.value.filter(s => s.category === suggestionFilter.value)
})

const passedPractices = computed(() => {
  return bestPractices.value.filter(p => p.passed).length
})

const totalPractices = computed(() => {
  return bestPractices.value.length
})

// 监听实体变化，自动重新分析
watch(
  [entities, relations],
  () => {
    analyzeModel()
  },
  { deep: true }
)

// 方法
const analyzeModel = async () => {
  analyzing.value = true

  try {
    // 分析实体完整性
    analyzeEntityCompleteness()
    
    // 分析关系质量
    analyzeRelationshipQuality()
    
    // 分析命名规范
    analyzeNamingConvention()
    
    // 分析业务合规性
    analyzeBusinessCompliance()
    
    // 识别设计模式
    identifyDesignPatterns()
    
    // 检查最佳实践
    checkBestPractices()
    
    // 生成智能建议
    generateIntelligentSuggestions()

    // 计算总体质量评分
    calculateOverallQuality()

  } catch (error) {
    ElMessage.error('模型分析失败：' + error.message)
  } finally {
    analyzing.value = false
  }
}

const analyzeEntityCompleteness = () => {
  const entitiesCount = entities.value.length
  if (entitiesCount === 0) {
    modelQuality.value.entityCompleteness = 0
    return
  }

  const completedEntities = entities.value.filter(entity => {
    const hasPrimaryKey = entity.fields.some(f => f.isPrimaryKey)
    const hasMinimumFields = entity.fields.length >= 2
    const hasDescription = Boolean(entity.description)
    
    return hasPrimaryKey && hasMinimumFields && hasDescription
  }).length

  modelQuality.value.entityCompleteness = Math.round((completedEntities / entitiesCount) * 100)
}

const analyzeRelationshipQuality = () => {
  const totalRelations = relations.value.length
  if (totalRelations === 0) {
    modelQuality.value.relationshipQuality = entities.value.length <= 1 ? 100 : 60
    return
  }

  let qualityScore = 0
  let maxScore = totalRelations * 100

  relations.value.forEach(relation => {
    // 检查关系是否有效
    const fromEntity = entities.value.find(e => e.name === relation.fromEntity)
    const toEntity = entities.value.find(e => e.name === relation.toEntity)
    
    if (fromEntity && toEntity) qualityScore += 40
    
    // 检查外键字段
    if (relation.foreignKey && fromEntity) {
      const hasForeignKey = fromEntity.fields.some(f => f.name === relation.foreignKey)
      if (hasForeignKey) qualityScore += 30
    }
    
    // 检查导航属性
    if (relation.navigationProperty) qualityScore += 30
  })

  modelQuality.value.relationshipQuality = Math.round((qualityScore / maxScore) * 100)
}

const analyzeNamingConvention = () => {
  let conformingItems = 0
  let totalItems = 0

  entities.value.forEach(entity => {
    totalItems++
    if (/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) conformingItems++
    
    entity.fields.forEach(field => {
      totalItems++
      if (/^[A-Z][a-zA-Z0-9]*$/.test(field.name)) conformingItems++
    })
  })

  modelQuality.value.namingConvention = totalItems > 0 ? 
    Math.round((conformingItems / totalItems) * 100) : 100
}

const analyzeBusinessCompliance = () => {
  let complianceScore = 100
  const issues = []

  // 检查是否有核心业务实体
  const hasCoreEntities = entities.value.some(e => 
    ['User', 'Role', 'Permission', 'Product', 'Order'].includes(e.name)
  )
  if (!hasCoreEntities) {
    complianceScore -= 20
    issues.push('缺少核心业务实体')
  }

  // 检查审计支持
  const hasAuditSupport = entities.value.some(e => e.enableAudit)
  if (!hasAuditSupport) {
    complianceScore -= 15
    issues.push('缺少审计支持')
  }

  // 检查多租户支持
  const hasMultiTenantSupport = entities.value.some(e => e.enableMultiTenant)
  if (!hasMultiTenantSupport) {
    complianceScore -= 10
    issues.push('缺少多租户支持')
  }

  modelQuality.value.businessCompliance = Math.max(complianceScore, 0)
}

const identifyDesignPatterns = () => {
  // 更新模式识别结果的置信度
  recognizedPatterns.value.forEach(pattern => {
    const matchingEntities = pattern.entities.filter(entityName => 
      entities.value.some(e => e.name === entityName)
    )
    
    pattern.confidence = matchingEntities.length / pattern.entities.length
  })
}

const checkBestPractices = () => {
  bestPractices.value.forEach(practice => {
    switch (practice.id) {
      case 'primary-keys':
        practice.passed = entities.value.every(e => 
          e.fields.some(f => f.isPrimaryKey)
        )
        break
      case 'audit-fields':
        practice.passed = entities.value.some(e => e.enableAudit)
        break
      case 'soft-delete':
        practice.passed = entities.value.some(e => e.enableSoftDelete)
        break
      case 'naming-convention':
        practice.passed = modelQuality.value.namingConvention >= 90
        break
      case 'foreign-keys':
        practice.passed = relations.value.every(r => {
          const entity = entities.value.find(e => e.name === r.fromEntity)
          return entity && entity.fields.some(f => f.name === r.foreignKey)
        })
        break
      case 'validation-rules':
        practice.passed = entities.value.some(e => 
          e.validationRules && e.validationRules.length > 0
        )
        break
      case 'multi-tenant':
        practice.passed = entities.value.some(e => e.enableMultiTenant)
        break
    }
  })
}

const generateIntelligentSuggestions = () => {
  // 基于分析结果生成新的建议
  const newSuggestions = []

  // 检查是否需要添加索引建议
  entities.value.forEach(entity => {
    const stringFields = entity.fields.filter(f => 
      f.type === 'string' && f.isRequired && !f.isPrimaryKey
    )
    
    if (stringFields.length > 0) {
      newSuggestions.push({
        id: `index-${entity.name}`,
        title: `为${entity.name}添加索引`,
        description: `为${entity.name}的查询字段添加数据库索引`,
        reason: `${entity.name}有${stringFields.length}个可能需要索引的字段`,
        priority: 'low',
        category: 'optimization',
        icon: 'el-icon-data-line',
        autoApplicable: false
      })
    }
  })

  // 合并新建议（避免重复）
  newSuggestions.forEach(newSuggestion => {
    if (!suggestions.value.some(s => s.id === newSuggestion.id)) {
      suggestions.value.push(newSuggestion)
    }
  })
}

const calculateOverallQuality = () => {
  const weights = {
    entityCompleteness: 0.3,
    relationshipQuality: 0.25,
    namingConvention: 0.2,
    businessCompliance: 0.25
  }

  modelQuality.value.score = Math.round(
    modelQuality.value.entityCompleteness * weights.entityCompleteness +
    modelQuality.value.relationshipQuality * weights.relationshipQuality +
    modelQuality.value.namingConvention * weights.namingConvention +
    modelQuality.value.businessCompliance * weights.businessCompliance
  )
}

const applySuggestion = async (suggestion) => {
  try {
    switch (suggestion.id) {
      case 'add-audit-fields':
        await applyAuditFieldsSuggestion()
        break
      case 'optimize-relationships':
        await applyRelationshipOptimization()
        break
      case 'add-soft-delete':
        await applySoftDeleteSuggestion()
        break
      case 'normalize-naming':
        await applyNamingNormalization()
        break
      default:
        ElMessage.info('此建议需要手动实施')
        return
    }

    // 标记建议为已应用
    suggestion.applied = true
    ElMessage.success(`建议"${suggestion.title}"应用成功`)
    
    // 重新分析模型
    await analyzeModel()

  } catch (error) {
    ElMessage.error('应用建议失败：' + error.message)
  }
}

const applyAuditFieldsSuggestion = async () => {
  const auditFields = [
    { name: 'CreationTime', displayName: '创建时间', type: 'DateTime', isRequired: true },
    { name: 'CreatorId', displayName: '创建人ID', type: 'Guid?', isRequired: false },
    { name: 'LastModificationTime', displayName: '最后修改时间', type: 'DateTime?', isRequired: false },
    { name: 'LastModifierId', displayName: '最后修改人ID', type: 'Guid?', isRequired: false }
  ]

  entities.value.forEach(entity => {
    if (['User', 'Role', 'Permission'].includes(entity.name)) {
      auditFields.forEach(auditField => {
        if (!entity.fields.some(f => f.name === auditField.name)) {
          entityStore.addField(entity.id, auditField)
        }
      })
      entityStore.updateEntity(entity.id, { enableAudit: true })
    }
  })
}

const applyRelationshipOptimization = async () => {
  // 检查是否已有UserRole实体
  const hasUserRole = entities.value.some(e => e.name === 'UserRole')
  if (!hasUserRole) {
    // 创建UserRole中间实体
    entityStore.addEntity({
      name: 'UserRole',
      tableName: 'AbpUserRoles',
      displayName: '用户角色关系',
      description: '用户和角色的多对多关系表',
      category: 'relation',
      fields: [
        { name: 'UserId', displayName: '用户ID', type: 'Guid', isRequired: true },
        { name: 'RoleId', displayName: '角色ID', type: 'Guid', isRequired: true }
      ],
      validationRules: [],
      enableSoftDelete: false,
      enableAudit: true,
      enableMultiTenant: true,
      isCompleted: true
    })
  }
}

const applySoftDeleteSuggestion = async () => {
  entities.value.forEach(entity => {
    if (['User', 'Role', 'Project'].includes(entity.name)) {
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

const applyNamingNormalization = async () => {
  entities.value.forEach(entity => {
    // 修复实体命名
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) {
      const normalizedName = toPascalCase(entity.name)
      entityStore.updateEntity(entity.id, { name: normalizedName })
    }

    // 修复字段命名
    entity.fields.forEach((field, index) => {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(field.name)) {
        const normalizedName = toPascalCase(field.name)
        entityStore.updateField(entity.id, index, { name: normalizedName })
      }
    })
  })
}

const toPascalCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, '')
}

const autoFixPractice = async (practice) => {
  try {
    switch (practice.id) {
      case 'audit-fields':
        await applyAuditFieldsSuggestion()
        break
      case 'soft-delete':
        await applySoftDeleteSuggestion()
        break
      case 'naming-convention':
        await applyNamingNormalization()
        break
      default:
        ElMessage.info('此项目需要手动修复')
        return
    }

    ElMessage.success(`最佳实践"${practice.name}"修复成功`)
    await analyzeModel()

  } catch (error) {
    ElMessage.error('自动修复失败：' + error.message)
  }
}

const viewSuggestionDetails = (suggestion) => {
  selectedSuggestion.value = suggestion
  showSuggestionDetails.value = true
}

const dismissSuggestion = (suggestion) => {
  suggestion.dismissed = true
  ElMessage.info(`已忽略建议"${suggestion.title}"`)
}

const getQualityTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'danger'
}

const getQualityLevel = (score) => {
  if (score >= 95) return '卓越'
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '合格'
  if (score >= 60) return '待改进'
  return '需重构'
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 80) return '#95d475'
  if (percentage >= 70) return '#e6a23c'
  if (percentage >= 60) return '#f78989'
  return '#f56c6c'
}

const getPriorityTagType = (priority) => {
  const types = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return types[priority] || 'default'
}

const getPriorityLabel = (priority) => {
  const labels = {
    'high': '重要',
    'medium': '中等',
    'low': '一般'
  }
  return labels[priority] || priority
}

// 初始化分析
analyzeModel()
</script>

<style scoped>
.intelligent-modeling-assistant {
  height: 100%;
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assistant-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 质量评估样式 */
.quality-assessment {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.assessment-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.quality-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-name {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-align: right;
}

/* 建议列表样式 */
.intelligent-suggestions {
  margin-bottom: 24px;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.suggestions-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.suggestion-card.high {
  border-left: 4px solid var(--el-color-danger);
}

.suggestion-card.medium {
  border-left: 4px solid var(--el-color-warning);
}

.suggestion-card.low {
  border-left: 4px solid var(--el-color-info);
}

.suggestion-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.suggestion-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-icon i {
  color: var(--el-color-primary);
}

.suggestion-info {
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

.suggestion-details {
  margin-bottom: 12px;
  font-size: 13px;
}

.suggestion-reason {
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.suggestion-benefits ul {
  margin: 4px 0;
  padding-left: 20px;
}

.suggestion-benefits li {
  margin: 2px 0;
  color: var(--el-text-color-secondary);
}

.suggestion-actions {
  display: flex;
  gap: 8px;
}

/* 模式识别样式 */
.pattern-recognition {
  margin-bottom: 24px;
}

.pattern-header h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.recognized-patterns {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pattern-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
}

.pattern-card.high-confidence {
  border-color: var(--el-color-success-light-5);
  background: var(--el-color-success-light-9);
}

.pattern-card.medium-confidence {
  border-color: var(--el-color-warning-light-5);
  background: var(--el-color-warning-light-9);
}

.pattern-info {
  margin-bottom: 12px;
}

.pattern-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.pattern-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.pattern-confidence {
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.pattern-entities {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.entities-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pattern-recommendations {
  font-size: 13px;
}

.recommendations-label {
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.recommendations-list {
  margin: 0;
  padding-left: 20px;
}

.recommendations-list li {
  margin: 2px 0;
  color: var(--el-text-color-regular);
}

/* 最佳实践样式 */
.best-practices-check {
  margin-bottom: 24px;
}

.practices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.practices-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.practices-score {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 600;
}

.practices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.practice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.practice-item.passed {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}

.practice-item.failed {
  background: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);
}

.practice-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.practice-item.passed .practice-icon {
  background: var(--el-color-success);
  color: white;
}

.practice-item.failed .practice-icon {
  background: var(--el-color-warning);
  color: white;
}

.practice-content {
  flex: 1;
}

.practice-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.practice-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.practice-suggestion {
  font-size: 12px;
  color: var(--el-color-primary);
}

.practice-action {
  flex-shrink: 0;
}

/* 建议详情样式 */
.suggestion-details-content {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.detail-section p {
  margin: 0 0 8px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.detail-section ol {
  margin: 0;
  padding-left: 20px;
}

.detail-section li {
  margin: 4px 0;
  color: var(--el-text-color-regular);
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.impact-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
}

.impact-label {
  color: var(--el-text-color-secondary);
}

.impact-value {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
