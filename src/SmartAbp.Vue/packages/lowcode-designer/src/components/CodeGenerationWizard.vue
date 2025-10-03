<!--
  代码生成向导组件
  
  功能特性：
  - 5步向导流程（项目配置 → 实体设计 → 关系配置 → UI定制 → 代码生成）
  - 实时进度反馈
  - 错误自动恢复
  - 智能提示和最佳实践
  - 代码预览和一键导出
-->
<template>
  <div class="code-generation-wizard">
    <el-card shadow="never" class="wizard-card">
      <template #header>
        <div class="wizard-header">
          <div class="header-left">
            <el-icon><MagicStick /></el-icon>
            <span class="wizard-title">智能代码生成向导</span>
          </div>
          <div class="header-right">
            <el-tag type="success" size="small">企业级</el-tag>
            <el-button 
              v-if="currentStep > 0" 
              size="small" 
              @click="saveProgress"
            >
              保存进度
            </el-button>
          </div>
        </div>
      </template>

      <!-- 进度步骤条 -->
      <el-steps 
        :active="currentStep" 
        finish-status="success"
        process-status="process"
        class="wizard-steps"
      >
        <el-step title="项目配置" description="基础信息设置" />
        <el-step title="实体设计" description="数据模型定义" />
        <el-step title="关系配置" description="实体关联设置" />
        <el-step title="UI定制" description="界面风格配置" />
        <el-step title="代码生成" description="生成并导出" />
      </el-steps>

      <!-- 步骤内容区 -->
      <div class="step-content">
        <!-- 步骤1：项目配置 -->
        <div v-show="currentStep === 0" class="step-panel">
          <h3 class="step-title">
            <el-icon><Setting /></el-icon>
            项目基础配置
          </h3>
          
          <el-form 
            ref="projectFormRef"
            :model="projectConfig" 
            :rules="projectRules"
            label-width="140px"
            class="wizard-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="项目名称" prop="projectName">
                  <el-input 
                    v-model="projectConfig.projectName"
                    placeholder="例如：智慧工地管理系统"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="项目代码" prop="projectCode">
                  <el-input 
                    v-model="projectConfig.projectCode"
                    placeholder="例如：SmartConstruction"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="命名空间" prop="namespace">
                  <el-input 
                    v-model="projectConfig.namespace"
                    placeholder="例如：SmartConstruction"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="数据库类型" prop="databaseType">
                  <el-select 
                    v-model="projectConfig.databaseType"
                    placeholder="选择数据库"
                    style="width: 100%"
                  >
                    <el-option label="SQL Server" value="SqlServer" />
                    <el-option label="PostgreSQL" value="PostgreSQL" />
                    <el-option label="MySQL" value="MySQL" />
                    <el-option label="SQLite" value="SQLite" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="项目描述" prop="description">
              <el-input 
                v-model="projectConfig.description"
                type="textarea"
                :rows="3"
                placeholder="简要描述项目的业务场景和功能"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="技术栈选择">
              <el-checkbox-group v-model="projectConfig.techStack">
                <el-checkbox label="ABP vNext" disabled checked />
                <el-checkbox label="Vue3" disabled checked />
                <el-checkbox label="TypeScript" disabled checked />
                <el-checkbox label="Element Plus" disabled checked />
                <el-checkbox label="Pinia" />
                <el-checkbox label="Vue Router" />
                <el-checkbox label="Axios" />
              </el-checkbox-group>
            </el-form-item>
          </el-form>

          <div class="step-tips">
            <el-alert
              title="💡 最佳实践提示"
              type="info"
              :closable="false"
            >
              <template #default>
                <ul>
                  <li>项目名称建议使用中文，便于理解</li>
                  <li>项目代码和命名空间使用PascalCase命名</li>
                  <li>数据库类型根据实际部署环境选择</li>
                </ul>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 步骤2：实体设计 -->
        <div v-show="currentStep === 1" class="step-panel">
          <h3 class="step-title">
            <el-icon><Document /></el-icon>
            实体模型设计
          </h3>

          <div class="entity-designer">
            <div class="designer-toolbar">
              <el-button type="primary" @click="addEntity">
                <el-icon><Plus /></el-icon>
                添加实体
              </el-button>
              <el-button @click="importFromDatabase">
                <el-icon><Upload /></el-icon>
                从数据库导入
              </el-button>
              <el-button @click="useTemplate">
                <el-icon><DocumentCopy /></el-icon>
                使用模板
              </el-button>
            </div>

            <el-table 
              :data="entities" 
              border 
              stripe
              max-height="400"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="name" label="实体名称" min-width="150">
                <template #default="{ row }">
                  <el-input 
                    v-model="row.name" 
                    placeholder="例如：Project"
                    @blur="validateEntityName(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="displayName" label="显示名称" min-width="150">
                <template #default="{ row }">
                  <el-input 
                    v-model="row.displayName" 
                    placeholder="例如：项目"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="properties" label="属性数量" width="100" align="center">
                <template #default="{ row }">
                  <el-tag>{{ row.properties?.length || 0 }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row, $index }">
                  <el-button 
                    size="small" 
                    type="primary"
                    link
                    @click="editEntityProperties(row)"
                  >
                    编辑属性
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger"
                    link
                    @click="deleteEntity($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="step-tips">
            <el-alert
              title="💡 实体设计建议"
              type="info"
              :closable="false"
            >
              <template #default>
                <ul>
                  <li>实体名称使用英文单数形式，例如：User, Order</li>
                  <li>显示名称使用中文，便于界面展示</li>
                  <li>可以从现有数据库导入表结构</li>
                </ul>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 步骤3：关系配置 -->
        <div v-show="currentStep === 2" class="step-panel">
          <h3 class="step-title">
            <el-icon><Connection /></el-icon>
            实体关系配置
          </h3>

          <div class="relationship-designer">
            <div class="designer-toolbar">
              <el-button type="primary" @click="addRelationship">
                <el-icon><Plus /></el-icon>
                添加关系
              </el-button>
              <el-button @click="autoDetectRelationships">
                <el-icon><MagicStick /></el-icon>
                自动识别
              </el-button>
            </div>

            <el-table 
              :data="relationships" 
              border 
              stripe
              max-height="400"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column label="关系类型" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.type" placeholder="选择类型">
                    <el-option label="一对多" value="OneToMany" />
                    <el-option label="多对多" value="ManyToMany" />
                    <el-option label="一对一" value="OneToOne" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="源实体" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.sourceEntity" placeholder="选择">
                    <el-option 
                      v-for="entity in entities" 
                      :key="entity.name"
                      :label="entity.displayName"
                      :value="entity.name"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="目标实体" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.targetEntity" placeholder="选择">
                    <el-option 
                      v-for="entity in entities" 
                      :key="entity.name"
                      :label="entity.displayName"
                      :value="entity.name"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="foreignKey" label="外键" width="150">
                <template #default="{ row }">
                  <el-input v-model="row.foreignKey" placeholder="自动生成" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ $index }">
                  <el-button 
                    size="small" 
                    type="danger"
                    link
                    @click="deleteRelationship($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="step-tips">
            <el-alert
              title="💡 关系配置提示"
              type="info"
              :closable="false"
            >
              <template #default>
                <ul>
                  <li>一对多：例如部门和员工、订单和订单项</li>
                  <li>多对多：例如用户和角色、商品和标签</li>
                  <li>系统会自动生成外键字段和导航属性</li>
                </ul>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 步骤4：UI定制 -->
        <div v-show="currentStep === 3" class="step-panel">
          <h3 class="step-title">
            <el-icon><Brush /></el-icon>
            UI界面定制
          </h3>

          <el-form 
            :model="uiConfig" 
            label-width="140px"
            class="wizard-form"
          >
            <el-form-item label="主题风格">
              <el-radio-group v-model="uiConfig.theme">
                <el-radio label="light">浅色主题</el-radio>
                <el-radio label="dark">深色主题</el-radio>
                <el-radio label="auto">自动切换</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="主色调">
              <el-color-picker v-model="uiConfig.primaryColor" />
              <span class="color-preview" :style="{ background: uiConfig.primaryColor }">
                {{ uiConfig.primaryColor }}
              </span>
            </el-form-item>

            <el-form-item label="布局模式">
              <el-radio-group v-model="uiConfig.layout">
                <el-radio label="classic">经典布局</el-radio>
                <el-radio label="sidebar">侧边栏</el-radio>
                <el-radio label="top">顶部导航</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="表单组件">
              <el-checkbox-group v-model="uiConfig.components">
                <el-checkbox label="form">表单</el-checkbox>
                <el-checkbox label="table">表格</el-checkbox>
                <el-checkbox label="search">搜索</el-checkbox>
                <el-checkbox label="detail">详情</el-checkbox>
                <el-checkbox label="tree">树形</el-checkbox>
                <el-checkbox label="chart">图表</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>

          <div class="ui-preview">
            <h4>界面预览</h4>
            <div class="preview-box">
              <p>这里将显示实时UI预览</p>
            </div>
          </div>
        </div>

        <!-- 步骤5：代码生成 -->
        <div v-show="currentStep === 4" class="step-panel">
          <h3 class="step-title">
            <el-icon><Document /></el-icon>
            代码生成与导出
          </h3>

          <div v-if="!isGenerating && !generationComplete" class="generation-ready">
            <el-result
              icon="success"
              title="准备就绪"
              sub-title="所有配置已完成，点击下方按钮开始生成代码"
            >
              <template #extra>
                <el-button 
                  type="primary" 
                  size="large"
                  @click="startGeneration"
                >
                  <el-icon><MagicStick /></el-icon>
                  开始生成代码
                </el-button>
              </template>
            </el-result>
          </div>

          <div v-if="isGenerating" class="generation-progress">
            <el-progress 
              :percentage="generationProgress"
              :status="generationProgress === 100 ? 'success' : undefined"
            />
            <p class="current-task">{{ currentTask }}</p>
            
            <div class="generation-logs">
              <h4>生成日志</h4>
              <div class="log-list">
                <div 
                  v-for="(log, index) in generationLogs" 
                  :key="index"
                  class="log-item"
                  :class="log.level"
                >
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="generationComplete" class="generation-result">
            <el-result
              icon="success"
              title="代码生成成功！"
              :sub-title="`已生成 ${generatedFiles.length} 个文件`"
            >
              <template #extra>
                <el-button 
                  type="primary" 
                  @click="downloadCode"
                >
                  <el-icon><Download /></el-icon>
                  下载代码包
                </el-button>
                <el-button @click="previewCode">
                  <el-icon><View /></el-icon>
                  预览代码
                </el-button>
                <el-button @click="deployCode">
                  <el-icon><Upload /></el-icon>
                  一键部署
                </el-button>
              </template>
            </el-result>

            <div class="file-tree">
              <h4>生成的文件列表</h4>
              <el-tree 
                :data="fileTreeData"
                :props="{ label: 'name', children: 'children' }"
                default-expand-all
              >
                <template #default="{ node, data }">
                  <span class="tree-node">
                    <el-icon v-if="data.type === 'file'"><Document /></el-icon>
                    <el-icon v-else><Folder /></el-icon>
                    {{ node.label }}
                  </span>
                </template>
              </el-tree>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤导航按钮 -->
      <div class="step-actions">
        <el-button 
          v-if="currentStep > 0" 
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button 
          v-if="currentStep < 4" 
          type="primary"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 4 && generationComplete" 
          type="success"
          @click="finish"
        >
          完成
        </el-button>
      </div>
    </el-card>

    <!-- 实体属性编辑对话框 -->
    <el-dialog
      v-model="propertyDialogVisible"
      title="编辑实体属性"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentEditEntity" class="property-editor">
        <el-button 
          type="primary" 
          size="small"
          @click="addProperty"
        >
          添加属性
        </el-button>

        <el-table 
          :data="currentEditEntity.properties" 
          border 
          style="margin-top: 12px"
        >
          <el-table-column label="属性名" width="150">
            <template #default="{ row }">
              <el-input v-model="row.name" placeholder="Name" />
            </template>
          </el-table-column>
          <el-table-column label="显示名" width="150">
            <template #default="{ row }">
              <el-input v-model="row.displayName" placeholder="名称" />
            </template>
          </el-table-column>
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-select v-model="row.type">
                <el-option label="String" value="string" />
                <el-option label="Int" value="int" />
                <el-option label="Decimal" value="decimal" />
                <el-option label="DateTime" value="datetime" />
                <el-option label="Bool" value="bool" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="必填" width="80">
            <template #default="{ row }">
              <el-checkbox v-model="row.isRequired" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button 
                size="small" 
                type="danger"
                link
                @click="deleteProperty($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="propertyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProperties">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  MagicStick, Setting, Document, Connection, Brush, Plus,
  Upload, DocumentCopy, Download, View, Folder
} from '@element-plus/icons-vue'

// Props
interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

// Emits
const emit = defineEmits<{
  (e: 'complete', data: any): void
  (e: 'cancel'): void
}>()

// ==================== 状态管理 ====================

const currentStep = ref(0)

// 项目配置
const projectConfig = ref({
  projectName: '',
  projectCode: '',
  namespace: '',
  databaseType: 'SqlServer',
  description: '',
  techStack: ['ABP vNext', 'Vue3', 'TypeScript', 'Element Plus']
})

const projectFormRef = ref()
const projectRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  projectCode: [
    { required: true, message: '请输入项目代码', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '必须以大写字母开头', trigger: 'blur' }
  ],
  namespace: [
    { required: true, message: '请输入命名空间', trigger: 'blur' }
  ],
  databaseType: [
    { required: true, message: '请选择数据库类型', trigger: 'change' }
  ]
}

// 实体设计
const entities = ref<any[]>([])
const propertyDialogVisible = ref(false)
const currentEditEntity = ref<any>(null)

// 关系配置
const relationships = ref<any[]>([])

// UI配置
const uiConfig = ref({
  theme: 'light',
  primaryColor: '#409EFF',
  layout: 'classic',
  components: ['form', 'table', 'search', 'detail']
})

// 代码生成
const isGenerating = ref(false)
const generationComplete = ref(false)
const generationProgress = ref(0)
const currentTask = ref('')
const generationLogs = ref<any[]>([])
const generatedFiles = ref<any[]>([])
const fileTreeData = ref<any[]>([])

// ==================== 步骤导航 ====================

const nextStep = async () => {
  // 验证当前步骤
  if (currentStep.value === 0) {
    await projectFormRef.value.validate()
  } else if (currentStep.value === 1 && entities.value.length === 0) {
    ElMessage.warning('请至少添加一个实体')
    return
  }
  
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

// ==================== 实体操作 ====================

const addEntity = () => {
  entities.value.push({
    name: '',
    displayName: '',
    properties: []
  })
}

const deleteEntity = (index: number) => {
  entities.value.splice(index, 1)
}

const validateEntityName = (entity: any) => {
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) {
    ElMessage.warning('实体名称必须以大写字母开头')
  }
}

const editEntityProperties = (entity: any) => {
  currentEditEntity.value = entity
  propertyDialogVisible.value = true
}

const addProperty = () => {
  if (!currentEditEntity.value.properties) {
    currentEditEntity.value.properties = []
  }
  currentEditEntity.value.properties.push({
    name: '',
    displayName: '',
    type: 'string',
    isRequired: false
  })
}

const deleteProperty = (index: number) => {
  currentEditEntity.value.properties.splice(index, 1)
}

const saveProperties = () => {
  propertyDialogVisible.value = false
  ElMessage.success('属性保存成功')
}

const importFromDatabase = () => {
  ElMessage.info('数据库导入功能开发中...')
}

const useTemplate = () => {
  ElMessage.info('模板选择功能开发中...')
}

// ==================== 关系操作 ====================

const addRelationship = () => {
  relationships.value.push({
    type: 'OneToMany',
    sourceEntity: '',
    targetEntity: '',
    foreignKey: ''
  })
}

const deleteRelationship = (index: number) => {
  relationships.value.splice(index, 1)
}

const autoDetectRelationships = () => {
  ElMessage.info('自动识别功能开发中...')
}

// ==================== 代码生成 ====================

const startGeneration = async () => {
  isGenerating.value = true
  generationProgress.value = 0
  generationLogs.value = []
  
  // 模拟生成过程
  const tasks = [
    { message: '正在生成后端实体...', progress: 20 },
    { message: '正在生成应用服务...', progress: 40 },
    { message: '正在生成数据库迁移...', progress: 60 },
    { message: '正在生成前端页面...', progress: 80 },
    { message: '正在生成API接口...', progress: 90 },
    { message: '生成完成！', progress: 100 }
  ]
  
  for (const task of tasks) {
    currentTask.value = task.message
    generationProgress.value = task.progress
    
    generationLogs.value.push({
      time: new Date().toLocaleTimeString(),
      message: task.message,
      level: 'info'
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  isGenerating.value = false
  generationComplete.value = true
  
  // 模拟生成的文件
  generatedFiles.value = [
    'Backend/Entities/Project.cs',
    'Backend/AppServices/ProjectAppService.cs',
    'Frontend/views/ProjectList.vue',
    'Frontend/views/ProjectDetail.vue'
  ]
  
  fileTreeData.value = [
    {
      name: 'Backend',
      type: 'folder',
      children: [
        { name: 'Entities', type: 'folder', children: [{ name: 'Project.cs', type: 'file' }] },
        { name: 'AppServices', type: 'folder', children: [{ name: 'ProjectAppService.cs', type: 'file' }] }
      ]
    },
    {
      name: 'Frontend',
      type: 'folder',
      children: [
        { name: 'views', type: 'folder', children: [
          { name: 'ProjectList.vue', type: 'file' },
          { name: 'ProjectDetail.vue', type: 'file' }
        ]}
      ]
    }
  ]
  
  ElMessage.success('代码生成完成！')
}

const downloadCode = () => {
  ElMessage.success('正在下载代码包...')
}

const previewCode = () => {
  ElMessage.info('代码预览功能开发中...')
}

const deployCode = () => {
  ElMessage.info('一键部署功能开发中...')
}

const finish = () => {
  emit('complete', {
    projectConfig: projectConfig.value,
    entities: entities.value,
    relationships: relationships.value,
    uiConfig: uiConfig.value
  })
}

const saveProgress = () => {
  ElMessage.success('进度已保存')
}
</script>

<style scoped lang="scss">
.code-generation-wizard {
  .wizard-card {
    .wizard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .wizard-title {
          font-size: 18px;
          font-weight: 600;
        }
      }
      
      .header-right {
        display: flex;
        gap: 12px;
      }
    }
  }
  
  .wizard-steps {
    margin: 24px 0;
  }
  
  .step-content {
    min-height: 400px;
    padding: 24px 0;
  }
  
  .step-panel {
    .step-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 24px;
    }
  }
  
  .wizard-form {
    :deep(.el-form-item__label) {
      font-weight: 500;
    }
  }
  
  .step-tips {
    margin-top: 24px;
    
    ul {
      margin: 8px 0 0 20px;
      
      li {
        margin: 4px 0;
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .designer-toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
  }
  
  .ui-preview {
    margin-top: 24px;
    
    h4 {
      margin-bottom: 12px;
    }
    
    .preview-box {
      border: 1px dashed var(--el-border-color);
      border-radius: 4px;
      padding: 40px;
      text-align: center;
      color: var(--el-text-color-placeholder);
    }
  }
  
  .color-preview {
    display: inline-block;
    margin-left: 12px;
    padding: 2px 12px;
    border-radius: 4px;
    color: white;
    font-size: 12px;
  }
  
  .generation-progress {
    .current-task {
      text-align: center;
      margin: 16px 0;
      font-weight: 500;
    }
    
    .generation-logs {
      margin-top: 24px;
      
      h4 {
        margin-bottom: 12px;
      }
      
      .log-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        padding: 12px;
        
        .log-item {
          display: flex;
          gap: 12px;
          padding: 4px 0;
          font-size: 14px;
          
          .log-time {
            color: var(--el-text-color-secondary);
            min-width: 100px;
          }
          
          &.info {
            color: var(--el-color-info);
          }
          
          &.success {
            color: var(--el-color-success);
          }
        }
      }
    }
  }
  
  .file-tree {
    margin-top: 24px;
    
    h4 {
      margin-bottom: 12px;
    }
    
    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
  
  .step-actions {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color);
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}
</style>

