<template>
  <div class="smart-studio-lite">
    <!-- 标题区 -->
    <div class="studio-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="studio-title">SmartStudio Lite - 智能配置向导</span>
        </template>
        <template #extra>
          <el-tag type="info">Layer 2 - 渐进式体验</el-tag>
        </template>
      </el-page-header>
    </div>

    <!-- 步骤条 -->
    <div class="studio-steps">
      <el-steps :active="currentStep" align-center>
        <el-step title="基本信息" description="配置模块和实体" />
        <el-step title="字段配置" description="可视化字段设计" />
        <el-step title="预览生成" description="确认并生成代码" />
      </el-steps>
    </div>

    <!-- 内容区 -->
    <div class="studio-content">
      <!-- 步骤1：基本信息 -->
      <div v-show="currentStep === 0" class="step-panel">
        <el-card shadow="never">
          <template #header>
            <span class="panel-title">📝 基本信息配置</span>
          </template>

          <el-form ref="basicFormRef" :model="formData" :rules="basicRules" label-width="120px" label-position="left">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="系统名称" prop="systemName">
                  <el-input v-model="formData.systemName" placeholder="例如：SmartConstruction">
                    <template #prepend>System</template>
                  </el-input>
                  <el-text class="form-tip">系统的根命名空间</el-text>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="模块名称" prop="moduleName">
                  <el-input v-model="formData.moduleName" placeholder="例如：ProjectManagement">
                    <template #prepend>Module</template>
                  </el-input>
                  <el-text class="form-tip">功能模块名称（PascalCase）</el-text>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="显示名称" prop="displayName">
              <el-input v-model="formData.displayName" placeholder="例如：项目管理">
                <template #prepend>📌</template>
              </el-input>
              <el-text class="form-tip">在UI中显示的中文名称</el-text>
            </el-form-item>

            <el-form-item label="描述" prop="description">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="简要描述模块的功能和用途" />
            </el-form-item>

            <el-divider content-position="left">实体配置</el-divider>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="实体名称" prop="entityName">
                  <el-input v-model="formData.entityName" placeholder="例如：Project">
                    <template #prepend>Entity</template>
                  </el-input>
                  <el-text class="form-tip">实体类名（单数，PascalCase）</el-text>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="实体显示名" prop="entityDisplayName">
                  <el-input v-model="formData.entityDisplayName" placeholder="例如：项目">
                    <template #prepend>🏷️</template>
                  </el-input>
                  <el-text class="form-tip">实体的中文名称</el-text>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">技术选项</el-divider>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="架构模式" prop="architecturePattern">
                  <el-select v-model="formData.architecturePattern" style="width: 100%">
                    <el-option label="CRUD (推荐)" value="Crud" />
                    <el-option label="DDD" value="DDD" />
                    <el-option label="CQRS" value="CQRS" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="数据库" prop="databaseProvider">
                  <el-select v-model="formData.databaseProvider" style="width: 100%">
                    <el-option label="SQL Server" value="SqlServer" />
                    <el-option label="MySQL" value="MySql" />
                    <el-option label="PostgreSQL" value="PostgreSql" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="父级菜单" prop="parentMenuId">
                  <el-select v-model="formData.parentMenuId" style="width: 100%">
                    <el-option label="业务功能" value="business" />
                    <el-option label="系统管理" value="system" />
                    <el-option label="工具" value="tools" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>

      <!-- 步骤2：字段配置 -->
      <div v-show="currentStep === 1" class="step-panel">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">🔧 字段配置</span>
              <el-button type="primary" text @click="addCommonFields">
                快速添加常用字段
              </el-button>
            </div>
          </template>

          <FieldConfigTable v-model="formData.fields!" />

          <el-alert v-if="!formData.fields || formData.fields.length === 0" title="提示：至少添加一个字段才能继续" type="warning"
            :closable="false" show-icon style="margin-top: 16px" />
        </el-card>
      </div>

      <!-- 步骤3：预览生成 -->
      <div v-show="currentStep === 2" class="step-panel">
        <el-card shadow="never">
          <template #header>
            <span class="panel-title">👁️ 预览和生成</span>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统名称">{{ formData.systemName }}</el-descriptions-item>
            <el-descriptions-item label="模块名称">{{ formData.moduleName }}</el-descriptions-item>
            <el-descriptions-item label="显示名称">{{ formData.displayName }}</el-descriptions-item>
            <el-descriptions-item label="实体名称">{{ formData.entityName }}</el-descriptions-item>
            <el-descriptions-item label="架构模式">{{ formData.architecturePattern }}</el-descriptions-item>
            <el-descriptions-item label="数据库">{{ formData.databaseProvider }}</el-descriptions-item>
            <el-descriptions-item label="字段数量">
              <el-tag type="success">{{ formData.fields?.length || 0 }} 个</el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">字段列表</el-divider>

          <el-table :data="formData.fields || []" border stripe style="width: 100%">
            <el-table-column type="index" width="50" label="#" />
            <el-table-column prop="name" label="字段名称" width="150" />
            <el-table-column prop="displayName" label="显示名称" width="150" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column label="必填" width="80">
              <template #default="{ row }">
                <el-tag v-if="row?.isRequired" type="danger" size="small">是</el-tag>
                <el-tag v-else type="info" size="small">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uiControl" label="UI控件" width="120" />
            <el-table-column prop="comment" label="备注" min-width="200" />
          </el-table>

          <el-divider content-position="left">将要生成的文件</el-divider>

          <el-skeleton v-if="generatingPreview" :rows="5" animated />
          <div v-else>
            <el-tag v-for="(file, index) in previewFiles" :key="index" type="success" size="small" style="margin: var(--spacing-1)">
              {{ file }}
            </el-tag>
          </div>

          <el-alert v-if="generationError" :title="generationError" type="error" :closable="false" show-icon
            style="margin-top: 16px" />
        </el-card>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="studio-footer">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
      <el-button v-if="currentStep === 2" type="success" :loading="generating" @click="handleGenerate">
        开始生成
      </el-button>
    </div>

    <!-- 生成进度对话框 -->
    <el-dialog v-model="progressDialogVisible" title="代码生成中..." width="600px" :close-on-click-modal="false">
      <el-progress :percentage="generationProgress" :status="progressStatus" />
      <el-text class="progress-message">{{ progressMessage }}</el-text>

      <template #footer>
        <el-button v-if="generationComplete" type="primary" @click="handleViewResult">
          查看结果
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// ✅ 临时修复：直接使用生成的API类型
import type { SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto } from '@/api/generated/models/SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto'
import { SmartStudioLiteService } from '@/api/generated/services/SmartStudioLiteService'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import FieldConfigTable from './components/FieldConfigTable.vue'

// 创建类型别名以保持代码可读性
type SimplifiedModuleCreationDto = SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto
type SimplifiedFieldConfigDto = {
  name: string
  displayName: string
  type: string
  isRequired: boolean
  maxLength?: number
  minLength?: number
  defaultValue?: string
  comment?: string
  order: number
  precision?: number
  scale?: number
  minValue?: number | null
  maxValue?: number | null
  pattern?: string
  uiControl: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Router
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const router = useRouter()

function goBack() {
  router.push('/lowcode/welcome')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const currentStep = ref(0)
const basicFormRef = ref<FormInstance>()

const formData = reactive<SimplifiedModuleCreationDto>({
  systemName: '',
  moduleName: '',
  displayName: '',
  description: '',
  entityName: '',
  entityDisplayName: '',
  fields: [],
  architecturePattern: 'Crud',
  databaseProvider: 'SqlServer',
  parentMenuId: 'business',
  menuIcon: 'document'
})

const generating = ref(false)
const generatingPreview = ref(false)
const generationError = ref('')
const previewFiles = ref<string[]>([])

const progressDialogVisible = ref(false)
const generationProgress = ref(0)
const progressMessage = ref('')
const progressStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const generationComplete = ref(false)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validation Rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const basicRules = computed<FormRules>(() => ({
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '必须是PascalCase格式', trigger: 'blur' }
  ],
  moduleName: [
    { required: true, message: '请输入模块名称', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '必须是PascalCase格式', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  entityName: [
    { required: true, message: '请输入实体名称', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '必须是PascalCase格式', trigger: 'blur' }
  ],
  entityDisplayName: [
    { required: true, message: '请输入实体显示名称', trigger: 'blur' }
  ]
}))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 下一步
 */
async function nextStep() {
  if (currentStep.value === 0) {
    // 验证基本信息表单
    const valid = await basicFormRef.value?.validate().catch(() => false)
    if (!valid) {
      ElMessage.warning('请完善基本信息')
      return
    }
  } else if (currentStep.value === 1) {
    // 验证字段配置
    if (!formData.fields || formData.fields.length === 0) {
      ElMessage.warning('请至少添加一个字段')
      return
    }

    // 加载文件预览
    await loadPreviewFiles()
  }

  currentStep.value++
}

/**
 * 上一步
 */
function prevStep() {
  currentStep.value--
}

/**
 * 添加常用字段
 */
function addCommonFields() {
  const commonFields: SimplifiedFieldConfigDto[] = [
    {
      name: 'Name',
      displayName: '名称',
      type: 'string',
      isRequired: true,
      maxLength: 200,
      uiControl: 'input',
      order: 0,
      comment: '通用名称字段'
    },
    {
      name: 'Code',
      displayName: '编码',
      type: 'string',
      isRequired: true,
      maxLength: 100,
      uiControl: 'input',
      order: 1,
      comment: '唯一编码'
    },
    {
      name: 'Description',
      displayName: '描述',
      type: 'text',
      isRequired: false,
      uiControl: 'textarea',
      order: 2,
      comment: '详细描述'
    },
    {
      name: 'Status',
      displayName: '状态',
      type: 'int',
      isRequired: true,
      defaultValue: 0,
      uiControl: 'select',
      order: 3,
      comment: '状态（0:草稿 1:启用 2:停用）'
    }
  ]

  if (!formData.fields) {
    formData.fields = []
  }
  formData.fields.push(...commonFields)
  ElMessage.success('已添加4个常用字段')
}

/**
 * 加载文件预览
 */
async function loadPreviewFiles() {
  generatingPreview.value = true
  generationError.value = ''

  try {
    // ✅ 调用真实的后端API
    const result = await SmartStudioLiteService.postApiLowcodeSmartStudioLitePreviewFiles({
      requestBody: formData as any  // 临时类型修复
    })

    previewFiles.value = (result.items || []).map(item => item.userName || item.name || 'unknown')

    ElMessage.success(`预览 ${previewFiles.value.length} 个文件`)
  } catch (error: any) {
    console.error('❌ 加载文件预览失败:', error)
    generationError.value = error.message || '加载文件预览失败'
    ElMessage.error(generationError.value)
  } finally {
    generatingPreview.value = false
  }
}

/**
 * 生成代码
 */
async function handleGenerate() {
  try {
    await ElMessageBox.confirm(
      `确认生成 ${formData.entityName} 实体及相关代码？`,
      '确认生成',
      {
        type: 'warning',
        confirmButtonText: '确认生成',
        cancelButtonText: '取消'
      }
    )

    generating.value = true
    progressDialogVisible.value = true
    generationProgress.value = 0
    progressMessage.value = '正在创建模块...'
    progressStatus.value = ''
    generationComplete.value = false

    try {
      // ✅ 调用真实的后端API
      progressMessage.value = '正在验证配置...'
      generationProgress.value = 20

      const result = await SmartStudioLiteService.postApiLowcodeSmartStudioLiteCreateModule({
        requestBody: formData as any  // 临时类型修复
      })

      progressMessage.value = '代码生成完成！'
      generationProgress.value = 100
      progressStatus.value = 'success'
      generationComplete.value = true

      ElMessage.success(`✅ ${result.message}`)

      // 显示生成的文件信息
      if (result.generatedFiles && result.generatedFiles.length > 0) {
        console.log('🎉 生成的文件:', result.generatedFiles)
      }

    } catch (error: any) {
      console.error('❌ 代码生成失败:', error)
      progressStatus.value = 'exception'
      progressMessage.value = `生成失败: ${error.message}`
      ElMessage.error(`代码生成失败: ${error.message}`)
      generationComplete.value = true
    }
  } catch {
    // 用户取消
    generating.value = false
    progressDialogVisible.value = false
  }
}

// ✅ simulateProgress函数已删除 - 现在使用真实的后端API

/**
 * 查看结果
 */
function handleViewResult() {
  progressDialogVisible.value = false
  // ✅ 临时修复：跳转到欢迎页而非不存在的modules页面
  router.push('/lowcode/welcome')
  ElMessage.success('代码生成完成！')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped lang="scss">
.smart-studio-lite {
  padding: var(--spacing-6);
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .studio-header {
    background-color: #fff;
    padding: var(--spacing-4) 24px;
    border-radius: 4px;
    margin-bottom: 24px;

    .studio-title {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }
  }

  .studio-steps {
    background-color: #fff;
    padding: var(--spacing-8) 24px;
    border-radius: 4px;
    margin-bottom: 24px;
  }

  .studio-content {
    margin-bottom: 24px;

    .step-panel {
      .panel-title {
        font-size: 16px;
        font-weight: 500;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .form-tip {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }

  .studio-footer {
    background-color: #fff;
    padding: var(--spacing-4) 24px;
    border-radius: 4px;
    text-align: center;

    .el-button {
      min-width: 120px;
    }
  }

  .progress-message {
    display: block;
    text-align: center;
    margin-top: 16px;
    color: #606266;
  }
}
</style>
