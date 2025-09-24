<template>
  <div class="one-click-solution">
    <el-card class="solution-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>
            <i class="el-icon-magic-stick" />
            一键生成完整企业级应用
          </h2>
          <p>基于最佳实践，零配置生成生产就绪的企业应用</p>
        </div>
      </template>

      <!-- 解决方案选择 -->
      <div class="solution-selector">
        <h3>选择解决方案</h3>
        <div class="solution-grid">
          <div
            v-for="solution in solutions"
            :key="solution.id"
            class="solution-item"
            :class="{ selected: selectedSolution?.id === solution.id }"
            @click="selectSolution(solution)"
          >
            <div class="solution-icon">
              <i :class="solution.icon" />
            </div>
            <div class="solution-content">
              <h4>{{ solution.name }}</h4>
              <p>{{ solution.description }}</p>
              <div class="solution-features">
                <el-tag
                  v-for="feature in solution.features"
                  :key="feature"
                  size="small"
                  type="success"
                >
                  {{ feature }}
                </el-tag>
              </div>
              <div class="solution-stats">
                <span>{{ solution.entities }}个实体</span>
                <span>{{ solution.pages }}个页面</span>  
                <span>{{ solution.apis }}个API</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速配置 -->
      <div v-if="selectedSolution" class="quick-config">
        <h3>快速配置</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="应用名称">
              <el-input
                v-model="config.appName"
                placeholder="例如：智慧工地管理系统"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公司名称">
              <el-input
                v-model="config.companyName"
                placeholder="例如：ABC建设集团"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="系统代码">
              <el-input
                v-model="config.systemCode"
                placeholder="例如：SMART_CONSTRUCTION"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 高级选项 -->
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="高级配置选项" name="advanced">
            <el-row :gutter="20">
              <el-col :span="12">
                <h4>企业级特性</h4>
                <el-checkbox-group v-model="config.enterpriseFeatures">
                  <el-checkbox label="multiTenant">多租户支持</el-checkbox>
                  <el-checkbox label="auditLogging">审计日志</el-checkbox>
                  <el-checkbox label="permissionControl">权限控制</el-checkbox>
                  <el-checkbox label="dataValidation">数据验证</el-checkbox>
                  <el-checkbox label="caching">分布式缓存</el-checkbox>
                  <el-checkbox label="monitoring">监控指标</el-checkbox>
                </el-checkbox-group>
              </el-col>
              <el-col :span="12">
                <h4>部署选项</h4>
                <el-checkbox-group v-model="config.deploymentOptions">
                  <el-checkbox label="docker">Docker容器化</el-checkbox>
                  <el-checkbox label="kubernetes">Kubernetes编排</el-checkbox>
                  <el-checkbox label="cicd">CI/CD流水线</el-checkbox>
                  <el-checkbox label="monitoring">监控配置</el-checkbox>
                  <el-checkbox label="backup">备份策略</el-checkbox>
                  <el-checkbox label="ssl">SSL证书</el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 生成预览 -->
      <div v-if="selectedSolution" class="generation-preview">
        <h3>将要生成的内容</h3>
        <div class="preview-sections">
          <div class="preview-section">
            <div class="section-header">
              <i class="el-icon-data-analysis" />
              <span>数据模型</span>
            </div>
            <div class="section-content">
              <el-tag
                v-for="entity in selectedSolution.entityTemplates"
                :key="entity.name"
                type="primary"
                size="small"
              >
                {{ entity.displayName }} ({{ entity.fields }}个字段)
              </el-tag>
            </div>
          </div>

          <div class="preview-section">
            <div class="section-header">
              <i class="el-icon-brush" />
              <span>页面设计</span>
            </div>
            <div class="section-content">
              <el-tag
                v-for="page in selectedSolution.pageTemplates"
                :key="page.name"
                type="success"
                size="small"
              >
                {{ page.displayName }}
              </el-tag>
            </div>
          </div>

          <div class="preview-section">
            <div class="section-header">
              <i class="el-icon-cpu" />
              <span>代码生成</span>
            </div>
            <div class="section-content">
              <el-tag
                v-for="codeTemplate in selectedSolution.codeTemplates"
                :key="codeTemplate.name"
                type="warning"
                size="small"
              >
                {{ codeTemplate.displayName }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 时间估算 -->
        <div class="time-estimate">
          <el-alert
            :title="`预计生成时间：${estimatedTime}分钟`"
            type="success"
            :closable="false"
          >
            <template #default>
              包含完整的数据模型、页面设计、前后端代码、单元测试、部署配置
            </template>
          </el-alert>
        </div>
      </div>

      <!-- 生成按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="!selectedSolution"
          size="large"
          disabled
        >
          请先选择解决方案
        </el-button>
        <el-button
          v-else
          type="primary"
          size="large"
          :loading="generating"
          @click="generateCompleteSolution"
        >
          <i class="el-icon-magic-stick" />
          一键生成完整应用 ({{ estimatedTime }}分钟)
        </el-button>
      </div>
    </el-card>

    <!-- 生成进度对话框 -->
    <el-dialog
      v-model="showProgress"
      title="🚀 正在生成企业级完整应用..."
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="generation-progress-detail">
        <div class="overall-progress">
          <h4>总体进度</h4>
          <el-progress
            :percentage="overallProgress"
            :stroke-width="12"
            :show-text="true"
            status="success"
          />
        </div>

        <div class="stage-progress">
          <div
            v-for="stage in generationStages"
            :key="stage.id"
            class="stage-item"
            :class="getStageClass(stage.status)"
          >
            <div class="stage-icon">
              <i :class="getStageIcon(stage.status)" />
            </div>
            <div class="stage-content">
              <div class="stage-title">{{ stage.title }}</div>
              <div class="stage-description">{{ stage.description }}</div>
              <div v-if="stage.files" class="stage-files">
                生成文件：{{ stage.files.length }}个
              </div>
            </div>
            <div class="stage-status">
              <span v-if="stage.duration" class="duration">
                {{ stage.duration }}ms
              </span>
              <el-tag
                :type="getStageTagType(stage.status)"
                size="small"
              >
                {{ getStageStatusText(stage.status) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="generation-summary">
          <h4>生成摘要</h4>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">生成实体：</span>
              <span class="stat-value">{{ generationResult.entities }}个</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">生成页面：</span>
              <span class="stat-value">{{ generationResult.pages }}个</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">生成文件：</span>
              <span class="stat-value">{{ generationResult.files }}个</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">代码行数：</span>
              <span class="stat-value">{{ generationResult.codeLines }}行</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="progress-footer">
          <el-button
            v-if="overallProgress >= 100"
            type="success"
            @click="handleGenerationComplete"
          >
            <i class="el-icon-check" />
            查看生成结果
          </el-button>
          <el-button
            v-else
            type="info"
            :disabled="overallProgress < 100"
          >
            生成中...
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { usePageDesignStore } from '@/stores/lowcode/pageDesign'
import { useCodeGenerationStore } from '@/stores/lowcode/codeGeneration'

// Stores
const entityStore = useEntityModelingStore()
const pageDesignStore = usePageDesignStore()
const codeGenerationStore = useCodeGenerationStore()

// 响应式数据
const selectedSolution = ref(null)
const generating = ref(false)
const showProgress = ref(false)
const overallProgress = ref(0)
const activeCollapse = ref([])

// 配置
const config = ref({
  appName: '',
  companyName: '',
  systemCode: '',
  enterpriseFeatures: ['multiTenant', 'auditLogging', 'permissionControl', 'dataValidation'],
  deploymentOptions: ['docker', 'kubernetes', 'cicd', 'monitoring']
})

// 生成结果
const generationResult = ref({
  entities: 0,
  pages: 0,
  files: 0,
  codeLines: 0
})

// 生成阶段
const generationStages = ref([
  {
    id: 'entities',
    title: '生成数据模型',
    description: '创建实体、字段、关系和验证规则',
    status: 'pending',
    files: [],
    duration: 0
  },
  {
    id: 'pages',
    title: '生成页面设计',
    description: '创建管理页面、表单和详情页',
    status: 'pending',
    files: [],
    duration: 0
  },
  {
    id: 'backend',
    title: '生成后端代码',
    description: '生成实体、服务、控制器和权限',
    status: 'pending',
    files: [],
    duration: 0
  },
  {
    id: 'frontend',
    title: '生成前端代码',
    description: '生成Vue组件、Store和路由',
    status: 'pending',
    files: [],
    duration: 0
  },
  {
    id: 'tests',
    title: '生成测试代码',
    description: '生成单元测试和集成测试',
    status: 'pending',
    files: [],
    duration: 0
  },
  {
    id: 'deployment',
    title: '生成部署配置',
    description: '生成Docker、K8s和CI/CD配置',
    status: 'pending',
    files: [],
    duration: 0
  },
  {
    id: 'docs',
    title: '生成项目文档',
    description: '生成API文档、部署文档和用户手册',
    status: 'pending',
    files: [],
    duration: 0
  }
])

// 解决方案定义
const solutions = ref([
  {
    id: 'enterprise-permission-system',
    name: '企业后台权限管理系统',
    description: '完整的企业级后台管理系统，包含用户、角色、权限、菜单、组织架构管理',
    icon: 'el-icon-lock',
    entities: 6,
    pages: 18,
    apis: 45,
    features: ['用户管理', '角色权限', '菜单管理', '组织架构', '审计日志', '多租户'],
    entityTemplates: [
      { name: 'User', displayName: '用户', fields: 8 },
      { name: 'Role', displayName: '角色', fields: 7 },
      { name: 'Permission', displayName: '权限', fields: 7 },
      { name: 'OrganizationUnit', displayName: '组织单位', fields: 7 },
      { name: 'Menu', displayName: '菜单', fields: 9 },
      { name: 'AuditLog', displayName: '审计日志', fields: 10 }
    ],
    pageTemplates: [
      { name: 'UserManagement', displayName: '用户管理' },
      { name: 'RoleManagement', displayName: '角色管理' },
      { name: 'PermissionManagement', displayName: '权限管理' },
      { name: 'OrganizationManagement', displayName: '组织管理' },
      { name: 'MenuManagement', displayName: '菜单管理' },
      { name: 'AuditLogViewer', displayName: '审计日志' },
      { name: 'Dashboard', displayName: '系统概览' },
      { name: 'UserProfile', displayName: '个人中心' },
      { name: 'SystemSettings', displayName: '系统设置' }
    ],
    codeTemplates: [
      { name: 'AppService', displayName: '应用服务' },
      { name: 'Controller', displayName: 'API控制器' },
      { name: 'DTO', displayName: '数据传输对象' },
      { name: 'Entity', displayName: '实体类' },
      { name: 'Repository', displayName: '仓储接口' },
      { name: 'VueComponent', displayName: 'Vue组件' },
      { name: 'PiniaStore', displayName: 'Pinia状态管理' },
      { name: 'UnitTest', displayName: '单元测试' }
    ],
    estimatedTime: 8
  },
  {
    id: 'smart-construction-system',
    name: '智慧工地管理系统',
    description: '智能化建筑工地管理平台，包含项目管理、人员管控、设备监控、安全巡检',
    icon: 'el-icon-office-building',
    entities: 8,
    pages: 24,
    apis: 60,
    features: ['项目管理', '人员管控', '设备监控', '安全巡检', 'AI监控', '数据大屏'],
    entityTemplates: [
      { name: 'Project', displayName: '工程项目', fields: 13 },
      { name: 'Worker', displayName: '施工人员', fields: 12 },
      { name: 'Equipment', displayName: '设备设施', fields: 12 },
      { name: 'SafetyInspection', displayName: '安全巡检', fields: 11 },
      { name: 'AttendanceRecord', displayName: '考勤记录', fields: 8 },
      { name: 'ProgressReport', displayName: '进度报告', fields: 10 },
      { name: 'QualityCheck', displayName: '质量检查', fields: 9 },
      { name: 'MaterialManagement', displayName: '材料管理', fields: 11 }
    ],
    pageTemplates: [
      { name: 'ProjectManagement', displayName: '项目管理' },
      { name: 'WorkerManagement', displayName: '人员管理' },
      { name: 'EquipmentMonitor', displayName: '设备监控' },
      { name: 'SafetyDashboard', displayName: '安全监控' },
      { name: 'AttendanceSystem', displayName: '考勤系统' },
      { name: 'ProgressTracking', displayName: '进度跟踪' },
      { name: 'QualityControl', displayName: '质量控制' },
      { name: 'MaterialInventory', displayName: '材料库存' },
      { name: 'ProjectDashboard', displayName: '项目看板' },
      { name: 'ReportCenter', displayName: '报表中心' }
    ],
    codeTemplates: [
      { name: 'AppService', displayName: '应用服务' },
      { name: 'Controller', displayName: 'API控制器' },
      { name: 'DTO', displayName: '数据传输对象' },
      { name: 'Entity', displayName: '实体类' },
      { name: 'VueComponent', displayName: 'Vue组件' },
      { name: 'PiniaStore', displayName: 'Pinia状态管理' },
      { name: 'IoTService', displayName: 'IoT设备服务' },
      { name: 'ReportService', displayName: '报表服务' }
    ],
    estimatedTime: 12
  },
  {
    id: 'mes-manufacturing-system',
    name: 'MES制造执行系统',
    description: '智能制造执行管理平台，包含生产计划、工艺管理、质量控制、设备维护',
    icon: 'el-icon-goods',
    entities: 10,
    pages: 30,
    apis: 75,
    features: ['生产计划', '工艺管理', '质量控制', '设备维护', '数据采集', 'KPI看板'],
    entityTemplates: [
      { name: 'ProductionOrder', displayName: '生产订单', fields: 12 },
      { name: 'Product', displayName: '产品', fields: 9 },
      { name: 'Workstation', displayName: '工作站', fields: 12 },
      { name: 'QualityInspection', displayName: '质量检验', fields: 10 },
      { name: 'Equipment', displayName: '设备', fields: 11 },
      { name: 'WorkOrder', displayName: '工单', fields: 13 },
      { name: 'ProcessRoute', displayName: '工艺路线', fields: 9 },
      { name: 'ProductionRecord', displayName: '生产记录', fields: 15 },
      { name: 'Maintenance', displayName: '设备维护', fields: 10 },
      { name: 'KPI', displayName: 'KPI指标', fields: 8 }
    ],
    pageTemplates: [
      { name: 'ProductionDashboard', displayName: '生产看板' },
      { name: 'OrderManagement', displayName: '订单管理' },
      { name: 'ProductionPlanning', displayName: '生产计划' },
      { name: 'QualityControl', displayName: '质量控制' },
      { name: 'EquipmentMonitor', displayName: '设备监控' },
      { name: 'WorkstationManagement', displayName: '工作站管理' },
      { name: 'ProcessManagement', displayName: '工艺管理' },
      { name: 'ProductionReport', displayName: '生产报表' },
      { name: 'KPIDashboard', displayName: 'KPI看板' },
      { name: 'MaintenanceManagement', displayName: '维护管理' }
    ],
    codeTemplates: [
      { name: 'AppService', displayName: '应用服务' },
      { name: 'Controller', displayName: 'API控制器' },
      { name: 'DTO', displayName: '数据传输对象' },
      { name: 'Entity', displayName: '实体类' },
      { name: 'VueComponent', displayName: 'Vue组件' },
      { name: 'PiniaStore', displayName: 'Pinia状态管理' },
      { name: 'ProductionService', displayName: '生产服务' },
      { name: 'QualityService', displayName: '质量服务' },
      { name: 'KPIService', displayName: 'KPI服务' },
      { name: 'RealtimeService', displayName: '实时数据服务' }
    ],
    estimatedTime: 15
  }
])

// 计算属性
const estimatedTime = computed(() => {
  if (!selectedSolution.value) return 0
  
  const baseTime = selectedSolution.value.estimatedTime
  const featureMultiplier = 1 + (config.value.enterpriseFeatures.length * 0.1)
  const deploymentMultiplier = 1 + (config.value.deploymentOptions.length * 0.05)
  
  return Math.ceil(baseTime * featureMultiplier * deploymentMultiplier)
})

// 方法
const selectSolution = (solution) => {
  selectedSolution.value = solution
  
  // 自动填充配置
  switch (solution.id) {
    case 'enterprise-permission-system':
      config.value.appName = '企业权限管理系统'
      config.value.systemCode = 'PERMISSION_MANAGEMENT'
      break
    case 'smart-construction-system':
      config.value.appName = '智慧工地管理系统'
      config.value.systemCode = 'SMART_CONSTRUCTION'
      break
    case 'mes-manufacturing-system':
      config.value.appName = 'MES制造执行系统'
      config.value.systemCode = 'MES_SYSTEM'
      break
  }
}

const generateCompleteSolution = async () => {
  if (!selectedSolution.value) return

  try {
    generating.value = true
    showProgress.value = true
    overallProgress.value = 0
    
    // 重置生成阶段状态
    generationStages.value.forEach(stage => {
      stage.status = 'pending'
      stage.files = []
      stage.duration = 0
    })

    // 执行完整的生成流程
    await executeCompleteGeneration()
    
    ElMessage.success('🎉 企业级应用生成完成！')
    
  } catch (error) {
    ElMessage.error('生成失败：' + error.message)
  } finally {
    generating.value = false
  }
}

const executeCompleteGeneration = async () => {
  const stages = generationStages.value
  const totalStages = stages.length

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    stage.status = 'running'
    
    const startTime = Date.now()
    
    try {
      switch (stage.id) {
        case 'entities':
          await generateEntitiesFromSolution()
          break
        case 'pages':
          await generatePagesFromSolution()
          break
        case 'backend':
          await generateBackendFromSolution()
          break
        case 'frontend':
          await generateFrontendFromSolution()
          break
        case 'tests':
          await generateTestsFromSolution()
          break
        case 'deployment':
          await generateDeploymentFromSolution()
          break
        case 'docs':
          await generateDocsFromSolution()
          break
      }
      
      const endTime = Date.now()
      stage.duration = endTime - startTime
      stage.status = 'completed'
      
      // 更新总体进度
      overallProgress.value = Math.round(((i + 1) / totalStages) * 100)
      
      // 短暂延迟让用户看到进度
      await new Promise(resolve => setTimeout(resolve, 300))
      
    } catch (error) {
      stage.status = 'failed'
      throw new Error(`${stage.title}失败: ${error.message}`)
    }
  }
  
  // 更新生成结果摘要
  updateGenerationResult()
}

const generateEntitiesFromSolution = async () => {
  const solution = selectedSolution.value
  const entities = solution.entityTemplates.map(template => ({
    id: `entity-${template.name.toLowerCase()}`,
    name: template.name,
    tableName: `${config.value.systemCode}_${template.name}s`,
    displayName: template.displayName,
    description: `${template.displayName}实体`,
    category: 'core',
    fields: generateFieldsForEntity(template),
    validationRules: [],
    enableSoftDelete: config.value.enterpriseFeatures.includes('auditLogging'),
    enableAudit: config.value.enterpriseFeatures.includes('auditLogging'),
    enableMultiTenant: config.value.enterpriseFeatures.includes('multiTenant'),
    isCompleted: true
  }))

  // 导入到实体建模Store
  await entityStore.importSchema({
    entities,
    relations: [],
    metadata: {
      solutionId: solution.id,
      config: config.value
    }
  })

  // 更新生成结果
  generationResult.value.entities = entities.length
}

const generatePagesFromSolution = async () => {
  const solution = selectedSolution.value
  
  // 为每个实体生成对应的管理页面
  for (const entityTemplate of solution.entityTemplates) {
    await pageDesignStore.generatePagesForEntity(entityTemplate.name, {
      generateList: true,
      generateForm: true,
      generateDetail: true,
      uiStyle: 'enterprise'
    })
  }

  generationResult.value.pages = solution.pages
}

const generateBackendFromSolution = async () => {
  const solution = selectedSolution.value
  
  // 生成后端代码
  await codeGenerationStore.generateBackend({
    entities: solution.entityTemplates,
    namespace: `${config.value.companyName}.${config.value.systemCode}`,
    features: config.value.enterpriseFeatures,
    domainType: solution.id
  })
}

const generateFrontendFromSolution = async () => {
  const solution = selectedSolution.value
  
  // 生成前端代码
  await codeGenerationStore.generateFrontend({
    entities: solution.entityTemplates,
    pages: solution.pageTemplates,
    appName: config.value.appName,
    domainType: solution.id
  })
}

const generateTestsFromSolution = async () => {
  // 生成测试代码
  await codeGenerationStore.generateTests({
    entities: selectedSolution.value.entityTemplates,
    coverage: 'comprehensive'
  })
}

const generateDeploymentFromSolution = async () => {
  if (config.value.deploymentOptions.length > 0) {
    // 生成部署配置文件
    await codeGenerationStore.generateDeployment({
      options: config.value.deploymentOptions,
      appName: config.value.appName,
      systemCode: config.value.systemCode
    })
  }
}

const generateDocsFromSolution = async () => {
  // 生成项目文档
  await codeGenerationStore.generateDocumentation({
    appName: config.value.appName,
    entities: selectedSolution.value.entityTemplates,
    features: config.value.enterpriseFeatures
  })
}

const generateFieldsForEntity = (entityTemplate) => {
  // 根据实体模板生成默认字段
  const baseFields = [
    { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true }
  ]

  // 根据实体类型添加特定字段
  switch (entityTemplate.name) {
    case 'User':
      return [
        ...baseFields,
        { name: 'UserName', displayName: '用户名', type: 'string', length: 50, isRequired: true },
        { name: 'Email', displayName: '邮箱', type: 'string', length: 100, isRequired: true },
        { name: 'PhoneNumber', displayName: '手机号', type: 'string', length: 20 },
        { name: 'IsActive', displayName: '是否启用', type: 'bool', defaultValue: 'true' },
        { name: 'LastLoginTime', displayName: '最后登录时间', type: 'DateTime?' },
        { name: 'CreationTime', displayName: '创建时间', type: 'DateTime', isRequired: true },
        { name: 'CreatorId', displayName: '创建人ID', type: 'Guid?' }
      ]
    // 其他实体类型的字段定义...
    default:
      return baseFields
  }
}

const updateGenerationResult = () => {
  const stages = generationStages.value
  const totalFiles = stages.reduce((sum, stage) => sum + stage.files.length, 0)
  
  generationResult.value = {
    entities: entityStore.entities.length,
    pages: pageDesignStore.pages.length,
    files: totalFiles,
    codeLines: totalFiles * 45 // 估算每个文件平均45行
  }
}

const getStageClass = (status) => {
  return `stage-${status}`
}

const getStageIcon = (status) => {
  switch (status) {
    case 'completed': return 'el-icon-check'
    case 'running': return 'el-icon-loading'
    case 'failed': return 'el-icon-close'
    default: return 'el-icon-time'
  }
}

const getStageTagType = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'running': return 'primary'
    case 'failed': return 'danger'
    default: return 'info'
  }
}

const getStageStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'running': return '进行中'
    case 'failed': return '失败'
    default: return '等待中'
  }
}

const handleGenerationComplete = () => {
  showProgress.value = false
  
  // 发送完成事件
  emit('generation-complete', {
    solution: selectedSolution.value,
    config: config.value,
    result: generationResult.value
  })
}

// Emits
const emit = defineEmits<{
  'generation-complete': [result: any]
}>()
</script>

<style scoped>
.one-click-solution {
  padding: 20px;
}

.solution-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.card-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 16px;
}

/* 解决方案选择器样式 */
.solution-selector {
  margin-bottom: 30px;
}

.solution-selector h3 {
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.solution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.solution-item {
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.solution-item:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.solution-item.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.solution-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.solution-icon i {
  font-size: 28px;
  color: var(--el-color-primary);
}

.solution-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.solution-content p {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.solution-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.solution-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 快速配置样式 */
.quick-config {
  margin-bottom: 30px;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.quick-config h3 {
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

/* 生成预览样式 */
.generation-preview {
  margin-bottom: 30px;
}

.preview-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.preview-section {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 操作按钮样式 */
.action-buttons {
  text-align: center;
  padding: 20px 0;
}

/* 生成进度样式 */
.generation-progress-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.overall-progress {
  margin-bottom: 20px;
  text-align: center;
}

.overall-progress h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.stage-progress {
  margin-bottom: 20px;
}

.stage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.stage-pending {
  background: var(--el-bg-color-page);
}

.stage-running {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
}

.stage-completed {
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
}

.stage-failed {
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-5);
}

.stage-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-info);
  color: white;
}

.stage-completed .stage-icon {
  background: var(--el-color-success);
}

.stage-running .stage-icon {
  background: var(--el-color-primary);
}

.stage-failed .stage-icon {
  background: var(--el-color-danger);
}

.stage-content {
  flex: 1;
}

.stage-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stage-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.stage-files {
  font-size: 12px;
  color: var(--el-color-primary);
  margin-top: 4px;
}

.stage-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.duration {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

/* 生成摘要样式 */
.generation-summary h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
}

.stat-label {
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--el-color-primary);
}

.progress-footer {
  text-align: center;
}
</style>
