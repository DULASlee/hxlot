<template>
  <div class="module-wizard">
    <div class="wizard-header">
      <h1>🚀 企业级模块向导</h1>
      <p>第一步：生成包含完整领域模型和默认UI的模块核心骨架</p>
      <el-steps :active="currentStep" align-center>
        <el-step title="核心定义" description="模块基础信息" />
        <el-step title="架构选型" description="技术栈与数据隔离" />
        <el-step title="企业特性" description="版本与依赖关系" />
        <el-step title="领域建模" description="设计实体、属性与关系" />
        <el-step title="预览与生成" description="确认并生成模块" />
      </el-steps>
    </div>

    <div class="wizard-body">
      <!-- Step 1-3 are the same as before -->
      <div v-show="currentStep === 0" class="step-panel">
        <el-card>
          <h3>第一步：核心定义</h3>
          <el-form :model="form" label-width="120px" style="max-width: 600px; margin-top: 20px;">
            <el-form-item label="系统名称">
              <el-input v-model="form.systemName" placeholder="如: SmartConstruction" />
            </el-form-item>
            <el-form-item label="模块名称 (Name)">
              <el-input v-model="form.name" placeholder="英文名, PascalCase, 如: ProjectManagement" />
            </el-form-item>
            <el-form-item label="显示名称">
              <el-input v-model="form.displayName" placeholder="中文名, 如: 项目管理" />
            </el-form-item>
            <el-form-item label="模块描述">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="详细描述模块的业务用途" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <div v-show="currentStep === 1" class="step-panel">
        <el-card>
          <h3>第二步：架构选型</h3>
          <el-form :model="form" label-width="120px" style="max-width: 600px; margin-top: 20px;">
            <el-form-item label="架构模式">
              <el-select v-model="form.architecturePattern" placeholder="请选择架构模式" style="width: 100%;">
                <el-option label="CRUD - 简单增删改查" value="Crud" />
                <el-option label="DDD - 领域驱动设计" value="DDD" />
                <el-option label="CQRS - 命令查询职责分离" value="CQRS" />
              </el-select>
            </el-form-item>
            <el-divider />
            <h4>数据库配置</h4>
            <el-form-item label="连接字符串名称">
              <el-input v-model="form.databaseInfo.connectionStringName" />
            </el-form-item>
            <el-form-item label="数据库 Schema">
              <el-input v-model="form.databaseInfo.schema" placeholder="留空则使用默认 Schema" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <div v-show="currentStep === 2" class="step-panel">
        <el-card>
          <h3>第三步：企业级特性</h3>
          <el-form :model="form" label-width="120px" style="max-width: 600px; margin-top: 20px;">
            <el-form-item label="初始版本">
              <el-input v-model="form.version" />
            </el-form-item>
            <el-form-item label="模块依赖">
              <el-select v-model="form.dependencies" multiple placeholder="选择此模块依赖的其他模块 (暂无)" style="width: 100%;" disabled />
            </el-form-item>
            <el-divider />
            <h4>特性管理</h4>
            <el-form-item label="启用特性管理">
              <el-switch v-model="form.featureManagement.isEnabled" />
            </el-form-item>
            <el-form-item v-if="form.featureManagement.isEnabled" label="默认授权策略">
              <el-input v-model="form.featureManagement.defaultPolicy" placeholder="如: MyModule.Default" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- Step 4: Domain Modeling -->
      <div v-show="currentStep === 3" class="step-panel">
        <el-card>
          <h3>第四步：领域建模</h3>
          <el-alert title="请在此定义模块内部的所有实体、属性和它们之间的关系。" type="info" :closable="false" show-icon />
          <div style="margin-top: 20px;">
             <!-- For this implementation, we will use the existing EntityDesigner component -->
             <!-- A more advanced implementation might integrate it directly -->
             <EntityDesigner :initial-entities="form.entities" @update:entities="(newEntities: EnhancedEntityModel[]) => form.entities = newEntities" />
          </div>
        </el-card>
      </div>

      <!-- Step 5: Preview & Generate -->
      <div v-show="currentStep === 4" class="step-panel">
        <el-card>
          <h3>第五步：预览与生成</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统名称">{{ form.systemName }}</el-descriptions-item>
            <el-descriptions-item label="模块名称">{{ form.name }}</el-descriptions-item>
            <el-descriptions-item label="架构模式">{{ form.architecturePattern }}</el-descriptions-item>
            <el-descriptions-item label="实体数量">{{ form.entities.length }}</el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <el-button type="primary" :loading="generating" @click="generate">
            🚀 确认并生成模块
          </el-button>

          <div v-if="generationResult" style="margin-top: 20px;">
            <el-divider />
            <h4>生成报告</h4>
            <el-alert type="success" :title="generationResult.generationReport" :closable="false" />
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;"><code>{{ generationResult.generatedFiles.join('\n') }}</code></pre>
          </div>
        </el-card>
      </div>
    </div>

    <div class="wizard-footer">
      <el-button :disabled="currentStep === 0" @click="prev">上一步</el-button>
      <el-button v-if="currentStep < 4" type="primary" @click="next">下一步</el-button>
      <el-button v-else type="success" :loading="generating" @click="generate">生成模块</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, defineAsyncComponent } from 'vue';
import { ElMessage, ElSteps, ElStep, ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDivider, ElSwitch, ElDescriptions, ElDescriptionsItem, ElButton, ElAlert } from 'element-plus';
import type { ModuleMetadata, EnhancedEntityModel } from '@smartabp/lowcode-api';

// Lazy load the EntityDesigner component for better performance
const EntityDesigner = defineAsyncComponent(() => import('../../components/CodeGenerator/EntityDesigner.vue'))


const currentStep = ref(0)
const generating = ref(false)
const generationResult = ref<any>(null)

const form = reactive<ModuleMetadata>({
  id: '',
  systemName: 'SmartConstruction',
  name: '',
  displayName: '',
  description: '',
  version: '1.0.0',
  architecturePattern: 'Crud',
  databaseInfo: {
    connectionStringName: 'Default',
    schema: '',
  },
  featureManagement: {
    isEnabled: true,
    defaultPolicy: '',
  },
  dependencies: [],
  entities: [],
  menuConfig: [],
  permissionConfig: {},
})

const next = () => {
  if (currentStep.value < 4) currentStep.value += 1
}
const prev = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const generate = async () => {
  generating.value = true
  generationResult.value = null

  if (form.featureManagement.isEnabled && !form.featureManagement.defaultPolicy) {
      form.featureManagement.defaultPolicy = `${form.systemName}.${form.name}`
  }

  try {
    const metadata = form;

    ElMessage.info('🏗️ 正在生成全栈模块代码...')

    const res = await fetch('/api/code-generator/generate-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(metadata)
    })

    if (res.ok) {
        const resultJson = await res.json()
        ElMessage.success(`✅ 全栈模块 "${resultJson.moduleName}" 生成成功！`);
        generationResult.value = resultJson
    } else {
        const errorJson = await res.json();
        const errorMessage = errorJson?.error?.message || '未知错误';
        ElMessage.error('后端代码生成失败: ' + errorMessage);
    }

  } catch (e: any) {
    ElMessage.error('API 请求失败: ' + (e?.message || '请检查网络连接和后端服务状态'))
    console.error('Generation error:', e)
  } finally {
    generating.value = false
  }
}

const getToken = () => {
  return localStorage.getItem('access_token') || ''
}
</script>

<style scoped>
.module-wizard { padding: 16px; max-width: 900px; margin: auto; }
.wizard-header { margin-bottom: 24px; text-align: center; }
.wizard-header h1 { font-size: 24px; font-weight: bold; }
.wizard-header p { color: #606266; margin-bottom: 20px; }
.wizard-body { margin-top: 16px; }
.step-panel { margin-bottom: 16px; }
.wizard-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
</style>

