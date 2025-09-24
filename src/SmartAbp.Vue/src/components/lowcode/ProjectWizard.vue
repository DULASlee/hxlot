<template>
  <div class="project-wizard">
    <el-dialog
      v-model="visible"
      title="🚀 智能项目向导 - 一次配置，完整可用"
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleClose"
    >
      <!-- 向导步骤指示器 -->
      <div class="wizard-steps">
        <el-steps
          :active="currentStep"
          align-center
        >
          <el-step
            title="选择项目类型"
            icon="el-icon-folder-opened"
          />
          <el-step
            title="项目配置"
            icon="el-icon-setting"
          />
          <el-step
            title="生成确认"
            icon="el-icon-check"
          />
        </el-steps>
      </div>

      <!-- 步骤1: 项目类型选择 -->
      <div
        v-if="currentStep === 0"
        class="step-content"
      >
        <div class="step-header">
          <h3>选择您要生成的项目类型</h3>
          <p>基于企业级模板，一键生成完整的数据模型、页面设计和代码</p>
        </div>
        
        <div class="project-templates">
          <div
            v-for="template in projectTemplates"
            :key="template.id"
            class="template-card"
            :class="{ selected: selectedTemplate?.id === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="template-header">
              <div class="template-icon">
                <i :class="template.icon" />
              </div>
              <div class="template-info">
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
              </div>
              <div class="template-badge">
                <el-tag type="success">
                  {{ template.entities.length }}个实体
                </el-tag>
              </div>
            </div>
            
            <div class="template-features">
              <div class="feature-list">
                <el-tag
                  v-for="feature in template.features"
                  :key="feature"
                  size="small"
                  effect="plain"
                >
                  {{ feature }}
                </el-tag>
              </div>
            </div>
            
            <div class="template-preview">
              <div class="preview-item">
                <i class="el-icon-data-analysis" />
                <span>{{ template.entities.length }}个核心实体</span>
              </div>
              <div class="preview-item">
                <i class="el-icon-document" />
                <span>{{ template.estimatedPages }}个管理页面</span>
              </div>
              <div class="preview-item">
                <i class="el-icon-cpu" />
                <span>{{ template.estimatedFiles }}个代码文件</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2: 项目配置 -->
      <div
        v-if="currentStep === 1"
        class="step-content"
      >
        <div class="step-header">
          <h3>配置项目信息</h3>
          <p>自定义项目名称、命名空间和功能特性</p>
        </div>
        
        <el-form
          ref="configFormRef"
          :model="projectConfig"
          :rules="configRules"
          label-width="120px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="项目名称"
                prop="projectName"
              >
                <el-input
                  v-model="projectConfig.projectName"
                  placeholder="例如：智慧工地管理系统"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="项目代码"
                prop="projectCode"
              >
                <el-input
                  v-model="projectConfig.projectCode"
                  placeholder="例如：SmartConstruction"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="命名空间"
                prop="namespace"
              >
                <el-input
                  v-model="projectConfig.namespace"
                  placeholder="例如：SmartAbp.SmartConstruction"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="数据库名"
                prop="databaseName"
              >
                <el-input
                  v-model="projectConfig.databaseName"
                  placeholder="例如：SmartConstructionDb"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="项目描述"
            prop="description"
          >
            <el-input
              v-model="projectConfig.description"
              type="textarea"
              :rows="3"
              placeholder="简要描述项目的主要功能和用途"
            />
          </el-form-item>

          <el-form-item label="企业级特性">
            <el-checkbox-group v-model="projectConfig.features">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-checkbox label="multiTenant">
                    多租户支持
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="auditLogging">
                    审计日志
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="permissionControl">
                    权限控制
                  </el-checkbox>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-checkbox label="dataValidation">
                    数据验证
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="caching">
                    缓存支持
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="apiDocumentation">
                    API文档
                  </el-checkbox>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-checkbox label="unitTests">
                    单元测试
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="localization">
                    国际化
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="monitoring">
                    监控指标
                  </el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item
            label="UI风格"
            prop="uiStyle"
          >
            <el-radio-group v-model="projectConfig.uiStyle">
              <el-radio label="modern">
                现代简约
              </el-radio>
              <el-radio label="enterprise">
                企业经典
              </el-radio>
              <el-radio label="dashboard">
                仪表盘风格
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <!-- 配置预览 -->
        <div class="config-preview">
          <h4>生成预览</h4>
          <div class="preview-summary">
            <div class="summary-item">
              <i class="el-icon-folder" />
              <span>项目：{{ projectConfig.projectName || '未命名项目' }}</span>
            </div>
            <div class="summary-item">
              <i class="el-icon-data-analysis" />
              <span>实体：{{ selectedTemplate?.entities.length || 0 }}个</span>
            </div>
            <div class="summary-item">
              <i class="el-icon-document" />
              <span>页面：约{{ selectedTemplate?.estimatedPages || 0 }}个</span>
            </div>
            <div class="summary-item">
              <i class="el-icon-cpu" />
              <span>代码：约{{ selectedTemplate?.estimatedFiles || 0 }}个文件</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3: 生成确认 -->
      <div
        v-if="currentStep === 2"
        class="step-content"
      >
        <div class="step-header">
          <h3>确认生成配置</h3>
          <p>即将生成完整的企业级应用，请确认配置信息</p>
        </div>
        
        <div class="generation-summary">
          <el-alert
            title="生成内容预览"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="generation-details">
                <div class="detail-section">
                  <h4>📊 数据建模</h4>
                  <ul>
                    <li
                      v-for="entity in selectedTemplate?.entities"
                      :key="entity.name"
                    >
                      <strong>{{ entity.displayName }}</strong> ({{ entity.name }})
                      - {{ entity.fields?.length || 0 }}个字段
                    </li>
                  </ul>
                </div>
                
                <div class="detail-section">
                  <h4>🎨 页面设计</h4>
                  <ul>
                    <li>列表管理页面 x {{ selectedTemplate?.entities.length || 0 }}个</li>
                    <li>表单编辑页面 x {{ selectedTemplate?.entities.length || 0 }}个</li>
                    <li>详情查看页面 x {{ selectedTemplate?.entities.length || 0 }}个</li>
                    <li>仪表盘概览页面 x 1个</li>
                  </ul>
                </div>
                
                <div class="detail-section">
                  <h4>⚙️ 代码生成</h4>
                  <ul>
                    <li>后端实体和服务 (.NET + ABP)</li>
                    <li>前端页面和组件 (Vue3 + TypeScript)</li>
                    <li>API接口和权限配置</li>
                    <li>数据库迁移和种子数据</li>
                    <li>单元测试和集成测试</li>
                  </ul>
                </div>

                <div class="detail-section">
                  <h4>🏆 企业级特性</h4>
                  <div class="features-grid">
                    <el-tag
                      v-for="feature in enabledFeatures"
                      :key="feature"
                      type="success"
                      size="small"
                    >
                      {{ getFeatureDisplayName(feature) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-alert>
        </div>

        <!-- 生成选项 -->
        <div class="generation-options">
          <h4>生成选项</h4>
          <el-checkbox-group v-model="generationOptions">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-checkbox label="generateEntities">
                  生成实体模型
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox label="generatePages">
                  生成页面设计
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox label="generateCode">
                  生成完整代码
                </el-checkbox>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-checkbox label="runQualityCheck">
                  自动质量检查
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox label="generateTests">
                  生成测试代码
                </el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox label="setupDeployment">
                  配置部署文件
                </el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </div>

        <!-- 预计时间 -->
        <div class="time-estimate">
          <el-alert
            :title="`预计生成时间：${estimatedTime}分钟`"
            type="success"
            :closable="false"
          >
            <template #default>
              基于{{ selectedTemplate?.entities.length }}个实体和选择的生成选项，
              预计需要{{ estimatedTime }}分钟完成整个项目的生成和配置。
            </template>
          </el-alert>
        </div>
      </div>

      <!-- 对话框底部操作 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">
            取消
          </el-button>
          <el-button
            v-if="currentStep > 0"
            @click="prevStep"
          >
            上一步
          </el-button>
          <el-button
            v-if="currentStep < 2"
            type="primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            下一步
          </el-button>
          <el-button
            v-if="currentStep === 2"
            type="success"
            :loading="generating"
            @click="startGeneration"
          >
            <i class="el-icon-magic-stick" />
            开始生成 ({{ estimatedTime }}分钟)
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 生成进度对话框 -->
    <el-dialog
      v-model="showProgress"
      title="🔄 正在生成企业级应用..."
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="generation-progress">
        <div class="progress-header">
          <h4>{{ currentGenerationStep }}</h4>
          <p>{{ currentGenerationMessage }}</p>
        </div>
        
        <el-progress
          :percentage="generationProgress"
          :stroke-width="8"
          :show-text="true"
          status="success"
        />
        
        <div class="progress-details">
          <div
            v-for="step in generationSteps"
            :key="step.id"
            class="detail-item"
          >
            <i 
              :class="getStepIcon(step.status)"
              :style="{ color: getStepColor(step.status) }"
            />
            <span>{{ step.name }}</span>
            <span
              v-if="step.status === 'completed'"
              class="step-time"
            >
              ({{ step.duration }}ms)
            </span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { usePageDesignStore } from '@/stores/lowcode/pageDesign'
import { useCodeGenerationStore } from '@/stores/lowcode/codeGeneration'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'generation-complete': [result: any]
}>()

// Stores
const entityStore = useEntityModelingStore()
const pageDesignStore = usePageDesignStore()
const codeGenerationStore = useCodeGenerationStore()

// 响应式数据
const visible = ref(false)
const currentStep = ref(0)
const selectedTemplate = ref(null)
const generating = ref(false)
const showProgress = ref(false)
const generationProgress = ref(0)
const currentGenerationStep = ref('')
const currentGenerationMessage = ref('')

// 项目配置
const projectConfig = ref({
  projectName: '',
  projectCode: '',
  namespace: '',
  databaseName: '',
  description: '',
  features: ['multiTenant', 'auditLogging', 'permissionControl', 'dataValidation'],
  uiStyle: 'modern'
})

// 配置验证规则
const configRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度在2到50个字符', trigger: 'blur' }
  ],
  projectCode: [
    { required: true, message: '请输入项目代码', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '项目代码必须以大写字母开头，只能包含字母和数字', trigger: 'blur' }
  ],
  namespace: [
    { required: true, message: '请输入命名空间', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)*$/, message: '命名空间格式不正确', trigger: 'blur' }
  ]
}

// 生成选项
const generationOptions = ref([
  'generateEntities',
  'generatePages', 
  'generateCode',
  'runQualityCheck',
  'generateTests'
])

// 生成步骤
const generationSteps = ref([
  { id: 'entities', name: '生成数据模型', status: 'pending', duration: 0 },
  { id: 'pages', name: '生成页面设计', status: 'pending', duration: 0 },
  { id: 'backend', name: '生成后端代码', status: 'pending', duration: 0 },
  { id: 'frontend', name: '生成前端代码', status: 'pending', duration: 0 },
  { id: 'tests', name: '生成测试代码', status: 'pending', duration: 0 },
  { id: 'quality', name: '执行质量检查', status: 'pending', duration: 0 },
])

// 项目模板定义
const projectTemplates = ref([
  {
    id: 'permission-management',
    name: '企业后台权限管理系统',
    description: '完整的用户、角色、权限、菜单管理系统，支持多租户和细粒度权限控制',
    icon: 'el-icon-lock',
    features: ['用户管理', '角色权限', '菜单管理', '多租户', '审计日志', '组织架构'],
    estimatedPages: 15,
    estimatedFiles: 85,
    entities: [
      {
        id: 'user-entity',
        name: 'User',
        displayName: '用户',
        tableName: 'AbpUsers',
        description: '系统用户信息管理',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'UserName', displayName: '用户名', type: 'string', length: 50, isRequired: true },
          { name: 'Email', displayName: '邮箱', type: 'string', length: 100, isRequired: true },
          { name: 'PhoneNumber', displayName: '手机号', type: 'string', length: 20 },
          { name: 'IsActive', displayName: '是否启用', type: 'bool', defaultValue: 'true', isRequired: true },
          { name: 'LastLoginTime', displayName: '最后登录时间', type: 'DateTime?', isRequired: false },
          { name: 'CreationTime', displayName: '创建时间', type: 'DateTime', isRequired: true },
          { name: 'CreatorId', displayName: '创建人ID', type: 'Guid?', isRequired: false },
        ],
        validationRules: [
          { fieldName: 'UserName', ruleType: 'unique', ruleValue: 'true', errorMessage: '用户名已存在' },
          { fieldName: 'Email', ruleType: 'regex', ruleValue: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', errorMessage: '邮箱格式不正确' },
          { fieldName: 'PhoneNumber', ruleType: 'regex', ruleValue: '^1[3-9]\\d{9}$', errorMessage: '手机号格式不正确' },
        ]
      },
      {
        id: 'role-entity',
        name: 'Role',
        displayName: '角色',
        tableName: 'AbpRoles',
        description: '系统角色定义和管理',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'Name', displayName: '角色名称', type: 'string', length: 50, isRequired: true },
          { name: 'DisplayName', displayName: '显示名称', type: 'string', length: 100, isRequired: true },
          { name: 'Description', displayName: '角色描述', type: 'string', length: 500 },
          { name: 'IsDefault', displayName: '是否默认', type: 'bool', defaultValue: 'false' },
          { name: 'IsStatic', displayName: '是否系统角色', type: 'bool', defaultValue: 'false' },
          { name: 'IsPublic', displayName: '是否公共角色', type: 'bool', defaultValue: 'false' },
        ],
        validationRules: [
          { fieldName: 'Name', ruleType: 'unique', ruleValue: 'true', errorMessage: '角色名称已存在' },
          { fieldName: 'DisplayName', ruleType: 'length', ruleValue: '2,100', errorMessage: '显示名称长度在2-100字符' },
        ]
      },
      {
        id: 'permission-entity',
        name: 'Permission',
        displayName: '权限',
        tableName: 'AbpPermissions',
        description: '系统权限定义和管理',
        category: 'core',
        enableSoftDelete: false,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'Name', displayName: '权限名称', type: 'string', length: 100, isRequired: true },
          { name: 'DisplayName', displayName: '显示名称', type: 'string', length: 200, isRequired: true },
          { name: 'GroupName', displayName: '权限组', type: 'string', length: 100 },
          { name: 'ParentName', displayName: '父权限', type: 'string', length: 100 },
          { name: 'IsEnabled', displayName: '是否启用', type: 'bool', defaultValue: 'true' },
          { name: 'MultiTenancySide', displayName: '多租户端', type: 'enum', defaultValue: 'Both' },
        ],
        validationRules: [
          { fieldName: 'Name', ruleType: 'unique', ruleValue: 'true', errorMessage: '权限名称已存在' },
          { fieldName: 'DisplayName', ruleType: 'length', ruleValue: '2,200', errorMessage: '显示名称长度在2-200字符' },
        ]
      },
      {
        id: 'organization-entity',
        name: 'OrganizationUnit',
        displayName: '组织单位',
        tableName: 'AbpOrganizationUnits',
        description: '组织架构管理',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'ParentId', displayName: '父级ID', type: 'Guid?', isRequired: false },
          { name: 'Code', displayName: '组织代码', type: 'string', length: 50, isRequired: true },
          { name: 'DisplayName', displayName: '组织名称', type: 'string', length: 200, isRequired: true },
          { name: 'Description', displayName: '组织描述', type: 'string', length: 500 },
          { name: 'SortOrder', displayName: '排序', type: 'int', defaultValue: '0' },
          { name: 'IsActive', displayName: '是否活跃', type: 'bool', defaultValue: 'true' },
        ],
        validationRules: [
          { fieldName: 'Code', ruleType: 'unique', ruleValue: 'true', errorMessage: '组织代码已存在' },
          { fieldName: 'DisplayName', ruleType: 'length', ruleValue: '2,200', errorMessage: '组织名称长度在2-200字符' },
        ]
      },
      {
        id: 'menu-entity',
        name: 'Menu',
        displayName: '菜单',
        tableName: 'AbpMenus',
        description: '系统菜单配置',
        category: 'config',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: false,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'ParentId', displayName: '父菜单ID', type: 'Guid?', isRequired: false },
          { name: 'Name', displayName: '菜单名称', type: 'string', length: 100, isRequired: true },
          { name: 'DisplayName', displayName: '显示名称', type: 'string', length: 200, isRequired: true },
          { name: 'Icon', displayName: '菜单图标', type: 'string', length: 50 },
          { name: 'Url', displayName: '菜单地址', type: 'string', length: 500 },
          { name: 'Permission', displayName: '所需权限', type: 'string', length: 100 },
          { name: 'SortOrder', displayName: '排序', type: 'int', defaultValue: '0' },
          { name: 'IsVisible', displayName: '是否可见', type: 'bool', defaultValue: 'true' },
        ],
        validationRules: [
          { fieldName: 'Name', ruleType: 'unique', ruleValue: 'true', errorMessage: '菜单名称已存在' },
          { fieldName: 'Url', ruleType: 'regex', ruleValue: '^[/a-zA-Z0-9-_]*$', errorMessage: 'URL格式不正确' },
        ]
      }
    ]
  },
  {
    id: 'smart-construction',
    name: '智慧工地管理系统',
    description: '工地项目管理、人员管控、设备监控、安全巡检的完整解决方案',
    icon: 'el-icon-office-building',
    features: ['项目管理', '人员管控', '设备监控', '安全巡检', 'AI监控', '数据大屏'],
    estimatedPages: 20,
    estimatedFiles: 120,
    entities: [
      {
        id: 'project-entity',
        name: 'Project',
        displayName: '工程项目',
        tableName: 'ConstructionProjects',
        description: '建设工程项目信息管理',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'ProjectCode', displayName: '项目编号', type: 'string', length: 50, isRequired: true },
          { name: 'ProjectName', displayName: '项目名称', type: 'string', length: 200, isRequired: true },
          { name: 'ProjectType', displayName: '项目类型', type: 'enum', defaultValue: 'Commercial' },
          { name: 'StartDate', displayName: '开工日期', type: 'DateTime', isRequired: true },
          { name: 'EndDate', displayName: '竣工日期', type: 'DateTime', isRequired: true },
          { name: 'TotalBudget', displayName: '总投资', type: 'decimal', isRequired: true },
          { name: 'Status', displayName: '项目状态', type: 'enum', defaultValue: 'Planning' },
          { name: 'Location', displayName: '项目地址', type: 'string', length: 500 },
          { name: 'Latitude', displayName: '纬度', type: 'decimal?' },
          { name: 'Longitude', displayName: '经度', type: 'decimal?' },
          { name: 'ContactPerson', displayName: '联系人', type: 'string', length: 100 },
          { name: 'ContactPhone', displayName: '联系电话', type: 'string', length: 20 },
        ],
        validationRules: [
          { fieldName: 'ProjectCode', ruleType: 'unique', ruleValue: 'true', errorMessage: '项目编号已存在' },
          { fieldName: 'EndDate', ruleType: 'custom', ruleValue: 'EndDate > StartDate', errorMessage: '竣工日期必须晚于开工日期' },
          { fieldName: 'TotalBudget', ruleType: 'range', ruleValue: '1,999999999', errorMessage: '总投资必须大于0' },
        ]
      },
      {
        id: 'worker-entity',
        name: 'Worker',
        displayName: '施工人员',
        tableName: 'ConstructionWorkers',
        description: '工地施工人员信息管理',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'WorkerCode', displayName: '工人编号', type: 'string', length: 50, isRequired: true },
          { name: 'Name', displayName: '姓名', type: 'string', length: 100, isRequired: true },
          { name: 'IdCard', displayName: '身份证号', type: 'string', length: 18, isRequired: true },
          { name: 'PhoneNumber', displayName: '手机号', type: 'string', length: 20, isRequired: true },
          { name: 'WorkType', displayName: '工种', type: 'enum', defaultValue: 'General' },
          { name: 'EntryDate', displayName: '入场日期', type: 'DateTime', isRequired: true },
          { name: 'ExitDate', displayName: '离场日期', type: 'DateTime?' },
          { name: 'CertificateNumber', displayName: '证书编号', type: 'string', length: 100 },
          { name: 'SafetyTrainingDate', displayName: '安全培训日期', type: 'DateTime?' },
          { name: 'IsActive', displayName: '是否在场', type: 'bool', defaultValue: 'true' },
          { name: 'ProjectId', displayName: '所属项目', type: 'Guid', isRequired: true },
        ],
        validationRules: [
          { fieldName: 'WorkerCode', ruleType: 'unique', ruleValue: 'true', errorMessage: '工人编号已存在' },
          { fieldName: 'IdCard', ruleType: 'regex', ruleValue: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$', errorMessage: '身份证号格式不正确' },
          { fieldName: 'PhoneNumber', ruleType: 'regex', ruleValue: '^1[3-9]\\d{9}$', errorMessage: '手机号格式不正确' },
        ]
      },
      {
        id: 'equipment-entity',
        name: 'Equipment',
        displayName: '设备设施',
        tableName: 'ConstructionEquipments',
        description: '工地设备和设施管理',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'EquipmentCode', displayName: '设备编号', type: 'string', length: 50, isRequired: true },
          { name: 'EquipmentName', displayName: '设备名称', type: 'string', length: 200, isRequired: true },
          { name: 'EquipmentType', displayName: '设备类型', type: 'enum', defaultValue: 'TowerCrane' },
          { name: 'Brand', displayName: '品牌', type: 'string', length: 100 },
          { name: 'Model', displayName: '型号', type: 'string', length: 100 },
          { name: 'SerialNumber', displayName: '序列号', type: 'string', length: 100 },
          { name: 'InstallDate', displayName: '安装日期', type: 'DateTime' },
          { name: 'LastMaintenanceDate', displayName: '最后维护日期', type: 'DateTime?' },
          { name: 'NextMaintenanceDate', displayName: '下次维护日期', type: 'DateTime?' },
          { name: 'Status', displayName: '设备状态', type: 'enum', defaultValue: 'Normal' },
          { name: 'Location', displayName: '安装位置', type: 'string', length: 200 },
          { name: 'ProjectId', displayName: '所属项目', type: 'Guid', isRequired: true },
        ],
        validationRules: [
          { fieldName: 'EquipmentCode', ruleType: 'unique', ruleValue: 'true', errorMessage: '设备编号已存在' },
          { fieldName: 'SerialNumber', ruleType: 'unique', ruleValue: 'true', errorMessage: '序列号已存在' },
        ]
      }
    ]
  },
  {
    id: 'mes-system',
    name: 'MES制造执行系统',
    description: '生产计划、工艺管理、质量控制、设备维护的智能制造解决方案',
    icon: 'el-icon-goods',
    features: ['生产计划', '工艺管理', '质量控制', '设备维护', '数据采集', 'KPI看板'],
    estimatedPages: 25,
    estimatedFiles: 150,
    entities: [
      {
        id: 'production-order-entity',
        name: 'ProductionOrder',
        displayName: '生产订单',
        tableName: 'ProductionOrders',
        description: '生产计划和订单管理',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'OrderNumber', displayName: '订单号', type: 'string', length: 50, isRequired: true },
          { name: 'ProductId', displayName: '产品ID', type: 'Guid', isRequired: true },
          { name: 'Quantity', displayName: '计划数量', type: 'int', isRequired: true },
          { name: 'PlannedStartTime', displayName: '计划开始时间', type: 'DateTime', isRequired: true },
          { name: 'PlannedEndTime', displayName: '计划结束时间', type: 'DateTime', isRequired: true },
          { name: 'ActualStartTime', displayName: '实际开始时间', type: 'DateTime?' },
          { name: 'ActualEndTime', displayName: '实际结束时间', type: 'DateTime?' },
          { name: 'Status', displayName: '订单状态', type: 'enum', defaultValue: 'Planned' },
          { name: 'Priority', displayName: '优先级', type: 'enum', defaultValue: 'Normal' },
          { name: 'WorkstationId', displayName: '工作站ID', type: 'Guid', isRequired: true },
          { name: 'ResponsiblePersonId', displayName: '负责人ID', type: 'Guid' },
        ],
        validationRules: [
          { fieldName: 'OrderNumber', ruleType: 'unique', ruleValue: 'true', errorMessage: '订单号已存在' },
          { fieldName: 'PlannedEndTime', ruleType: 'custom', ruleValue: 'PlannedEndTime > PlannedStartTime', errorMessage: '计划结束时间必须晚于开始时间' },
          { fieldName: 'Quantity', ruleType: 'range', ruleValue: '1,9999999', errorMessage: '计划数量必须大于0' },
        ]
      },
      {
        id: 'product-entity',
        name: 'Product',
        displayName: '产品',
        tableName: 'Products',
        description: '产品信息和工艺定义',
        category: 'core',
        enableSoftDelete: true,
        enableAudit: true,
        enableMultiTenant: true,
        isCompleted: false,
        fields: [
          { name: 'Id', displayName: 'ID', type: 'Guid', isRequired: true, isPrimaryKey: true },
          { name: 'ProductCode', displayName: '产品编号', type: 'string', length: 50, isRequired: true },
          { name: 'ProductName', displayName: '产品名称', type: 'string', length: 200, isRequired: true },
          { name: 'ProductType', displayName: '产品类型', type: 'string', length: 100 },
          { name: 'Version', displayName: '版本号', type: 'string', length: 20 },
          { name: 'StandardCycleTime', displayName: '标准工时(秒)', type: 'int' },
          { name: 'QualityStandard', displayName: '质量标准', type: 'string', length: 500 },
          { name: 'IsActive', displayName: '是否启用', type: 'bool', defaultValue: 'true' },
          { name: 'CategoryId', displayName: '产品分类ID', type: 'Guid?' },
        ],
        validationRules: [
          { fieldName: 'ProductCode', ruleType: 'unique', ruleValue: 'true', errorMessage: '产品编号已存在' },
          { fieldName: 'StandardCycleTime', ruleType: 'range', ruleValue: '1,86400', errorMessage: '标准工时应在1-86400秒之间' },
        ]
      }
    ]
  }
])

// 计算属性
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return selectedTemplate.value !== null
  }
  if (currentStep.value === 1) {
    return projectConfig.value.projectName && 
           projectConfig.value.projectCode && 
           projectConfig.value.namespace
  }
  return true
})

const enabledFeatures = computed(() => {
  return projectConfig.value.features
})

const estimatedTime = computed(() => {
  if (!selectedTemplate.value) return 0
  
  const baseTime = selectedTemplate.value.entities.length * 0.5 // 每个实体0.5分钟
  const featuresTime = enabledFeatures.value.length * 0.2 // 每个特性0.2分钟
  const optionsTime = generationOptions.value.length * 0.3 // 每个选项0.3分钟
  
  return Math.ceil(baseTime + featuresTime + optionsTime)
})

// 监听props变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
  },
  { immediate: true }
)

// 监听visible变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听项目代码变化，自动生成命名空间
watch(
  () => projectConfig.value.projectCode,
  (newVal) => {
    if (newVal) {
      projectConfig.value.namespace = `SmartAbp.${newVal}`
      projectConfig.value.databaseName = `${newVal}Db`
    }
  }
)

// 方法
const selectTemplate = (template) => {
  selectedTemplate.value = template
  
  // 自动填充项目配置
  if (template.id === 'permission-management') {
    projectConfig.value.projectName = '企业权限管理系统'
    projectConfig.value.projectCode = 'PermissionManagement'
  } else if (template.id === 'smart-construction') {
    projectConfig.value.projectName = '智慧工地管理系统'
    projectConfig.value.projectCode = 'SmartConstruction'
  } else if (template.id === 'mes-system') {
    projectConfig.value.projectName = 'MES制造执行系统'
    projectConfig.value.projectCode = 'MesSystem'
  }
}

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleClose = () => {
  visible.value = false
  // 重置状态
  currentStep.value = 0
  selectedTemplate.value = null
  projectConfig.value = {
    projectName: '',
    projectCode: '',
    namespace: '',
    databaseName: '',
    description: '',
    features: ['multiTenant', 'auditLogging', 'permissionControl', 'dataValidation'],
    uiStyle: 'modern'
  }
}

const startGeneration = async () => {
  if (!selectedTemplate.value) return
  
  try {
    generating.value = true
    showProgress.value = true
    generationProgress.value = 0
    
    // 开始生成流程
    await executeGenerationPipeline()
    
    ElMessage.success('项目生成完成！请查看各个模块的生成结果。')
    emit('generation-complete', {
      template: selectedTemplate.value,
      config: projectConfig.value,
      options: generationOptions.value
    })
    
    visible.value = false
    showProgress.value = false
    
  } catch (error) {
    ElMessage.error('项目生成失败：' + error.message)
  } finally {
    generating.value = false
  }
}

const executeGenerationPipeline = async () => {
  const steps = generationSteps.value
  const totalSteps = steps.length
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    step.status = 'running'
    currentGenerationStep.value = step.name
    
    const startTime = Date.now()
    
    try {
      switch (step.id) {
        case 'entities':
          currentGenerationMessage.value = '正在生成数据模型...'
          await generateEntities()
          break
        case 'pages':
          currentGenerationMessage.value = '正在生成页面设计...'
          await generatePages()
          break
        case 'backend':
          currentGenerationMessage.value = '正在生成后端代码...'
          await generateBackendCode()
          break
        case 'frontend':
          currentGenerationMessage.value = '正在生成前端代码...'
          await generateFrontendCode()
          break
        case 'tests':
          currentGenerationMessage.value = '正在生成测试代码...'
          await generateTests()
          break
        case 'quality':
          currentGenerationMessage.value = '正在执行质量检查...'
          await runQualityCheck()
          break
      }
      
      const endTime = Date.now()
      step.duration = endTime - startTime
      step.status = 'completed'
      
      // 更新进度
      generationProgress.value = Math.round(((i + 1) / totalSteps) * 100)
      
      // 短暂延迟，让用户看到进度更新
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (error) {
      step.status = 'failed'
      throw new Error(`${step.name}执行失败: ${error.message}`)
    }
  }
}

const generateEntities = async () => {
  // 基于现有entityStore，导入模板实体
  await entityStore.importSchema({
    entities: selectedTemplate.value.entities,
    relations: [], // 这里可以添加模板关系
    metadata: {
      templateId: selectedTemplate.value.id,
      projectConfig: projectConfig.value
    }
  })
}

const generatePages = async () => {
  // 基于现有pageDesignStore，批量生成页面
  const entities = selectedTemplate.value.entities
  for (const entity of entities) {
    await pageDesignStore.generatePagesForEntity(entity.name, {
      generateList: true,
      generateForm: true,
      generateDetail: true,
      uiStyle: projectConfig.value.uiStyle
    })
  }
}

const generateBackendCode = async () => {
  // 基于现有codeGenerationStore，生成后端代码
  await codeGenerationStore.generateBackend({
    entities: selectedTemplate.value.entities,
    namespace: projectConfig.value.namespace,
    features: enabledFeatures.value
  })
}

const generateFrontendCode = async () => {
  // 基于现有codeGenerationStore，生成前端代码
  await codeGenerationStore.generateFrontend({
    entities: selectedTemplate.value.entities,
    projectName: projectConfig.value.projectName,
    uiStyle: projectConfig.value.uiStyle
  })
}

const generateTests = async () => {
  // 生成测试代码
  if (generationOptions.value.includes('generateTests')) {
    await codeGenerationStore.generateTests({
      entities: selectedTemplate.value.entities
    })
  }
}

const runQualityCheck = async () => {
  // 执行质量检查
  if (generationOptions.value.includes('runQualityCheck')) {
    // 这里可以调用生产就绪验证系统
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

const getStepIcon = (status) => {
  switch (status) {
    case 'completed': return 'el-icon-check'
    case 'running': return 'el-icon-loading'
    case 'failed': return 'el-icon-close'
    default: return 'el-icon-time'
  }
}

const getStepColor = (status) => {
  switch (status) {
    case 'completed': return '#67c23a'
    case 'running': return '#409eff'
    case 'failed': return '#f56c6c'
    default: return '#909399'
  }
}

const getFeatureDisplayName = (feature) => {
  const featureNames = {
    multiTenant: '多租户',
    auditLogging: '审计日志',
    permissionControl: '权限控制',
    dataValidation: '数据验证',
    caching: '缓存支持',
    apiDocumentation: 'API文档',
    unitTests: '单元测试',
    localization: '国际化',
    monitoring: '监控指标'
  }
  return featureNames[feature] || feature
}
</script>

<style scoped>
.project-wizard {
  max-height: 80vh;
}

.wizard-steps {
  margin-bottom: 30px;
}

.step-content {
  max-height: 60vh;
  overflow-y: auto;
}

.step-header {
  text-align: center;
  margin-bottom: 30px;
}

.step-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.step-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

/* 项目模板样式 */
.project-templates {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.template-card {
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.template-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.template-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.template-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.template-icon i {
  font-size: 24px;
  color: var(--el-color-primary);
}

.template-info {
  flex: 1;
}

.template-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.template-info p {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.template-badge {
  flex-shrink: 0;
}

.template-features {
  margin-bottom: 16px;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.template-preview {
  display: flex;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 配置预览样式 */
.config-preview {
  margin-top: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.config-preview h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

/* 生成确认样式 */
.generation-summary {
  margin-bottom: 20px;
}

.generation-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.detail-section ul {
  margin: 0;
  padding-left: 20px;
}

.detail-section li {
  margin: 6px 0;
  color: var(--el-text-color-regular);
}

.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.generation-options {
  margin: 20px 0;
}

.generation-options h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.time-estimate {
  margin-top: 20px;
}

/* 生成进度样式 */
.generation-progress {
  text-align: center;
}

.progress-header {
  margin-bottom: 20px;
}

.progress-header h4 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.progress-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.progress-details {
  margin-top: 20px;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-item:last-child {
  border-bottom: none;
}

.step-time {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
