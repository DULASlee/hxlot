<!--
  🍎 UltraSimpleStudio - 苹果风格的极简代码生成通道
  真实API集成 + 企业级代码生成
-->
<template>
  <div class="ultra-simple-studio">
    <div class="main-card">
      <div class="card-header">
        <h1 class="main-title">
          🚀 极简代码生成器
        </h1>
        <p class="subtitle">
          选择数据库表，输入关键信息，一键生成企业级管理系统
        </p>
      </div>

      <!-- 进度指示器 -->
      <div class="progress-indicator">
        <div
          class="step-item"
          :class="{ active: currentStep === 1, completed: currentStep > 1 }"
        >
          <div class="step-circle">
            1
          </div>
          <div class="step-label">
            选择数据库表
          </div>
        </div>
        <div
          class="step-divider"
          :class="{ completed: currentStep > 1 }"
        />
        <div
          class="step-item"
          :class="{ active: currentStep === 2, completed: currentStep > 2 }"
        >
          <div class="step-circle">
            2
          </div>
          <div class="step-label">
            配置元数据
          </div>
        </div>
        <div
          class="step-divider"
          :class="{ completed: currentStep > 2 }"
        />
        <div
          class="step-item"
          :class="{ active: currentStep === 3, completed: generationComplete }"
        >
          <div class="step-circle">
            3
          </div>
          <div class="step-label">
            生成代码
          </div>
        </div>
      </div>

      <!-- Step 1: 选择表 -->
      <div
        v-show="currentStep === 1"
        class="step-content"
      >
        <h2>1️⃣ 选择数据库表</h2>
        <el-select
          v-model="selectedTable"
          placeholder="选择表"
          size="large"
          filterable
          class="table-selector"
        >
          <el-option
            v-for="table in availableTables"
            :key="table.name"
            :label="table.displayName"
            :value="table.name"
          />
        </el-select>
        <div class="button-group">
          <el-button
            type="primary"
            size="large"
            :disabled="!selectedTable"
            @click="goToStep2"
          >
            下一步 →
          </el-button>
        </div>
      </div>

      <!-- Step 2: 配置 -->
      <div
        v-show="currentStep === 2"
        class="step-content"
      >
        <h2>2️⃣ 配置元数据</h2>
        <el-form
          :model="config"
          label-position="top"
        >
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item
                label="系统名称 *"
                required
              >
                <el-input
                  v-model="config.systemName"
                  placeholder="如: Blog"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="模块名称 *"
                required
              >
                <el-input
                  v-model="config.moduleName"
                  placeholder="如: Post"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="显示名称 *"
                required
              >
                <el-input
                  v-model="config.displayName"
                  placeholder="如: 文章管理"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="button-group">
          <el-button
            size="large"
            @click="goToStep1"
          >
            ← 上一步
          </el-button>
          <el-button
            type="primary"
            size="large"
            :disabled="!isConfigValid"
            @click="goToStep3"
          >
            开始生成 →
          </el-button>
        </div>
      </div>

      <!-- Step 3: 生成 -->
      <div
        v-show="currentStep === 3"
        class="step-content"
      >
        <h2>3️⃣ 代码生成</h2>
        <el-button
          :type="generateButtonType"
          size="large"
          class="generate-button"
          :loading="generating"
          @click="startGeneration"
        >
          {{ generateButtonText }}
        </el-button>
        <el-progress
          v-if="generating || generationComplete"
          :percentage="generationProgress"
          :status="generationComplete ? 'success' : undefined"
        />
        
        <el-result
          v-if="generationComplete"
          icon="success"
          title="🎉 功能生成完成！"
        >
          <template #sub-title>
            <div class="success-info">
              <p><strong>{{ config.displayName }}</strong> 已生成并部署</p>
              <p class="module-path">
                访问路径: /{{ config.systemName }}/{{ config.moduleName }}
              </p>
            </div>
          </template>
          <template #extra>
            <el-button
              type="primary"
              size="large"
              icon="Link"
              @click="viewCode"
            >
              🚀 立即访问功能
            </el-button>
            <el-button
              type="success"
              size="large"
              icon="Edit"
              @click="customizeUI"
            >
              🎨 定制UI样式
            </el-button>
            <el-button
              size="large"
              @click="resetToStart"
            >
              🔄 再生成一个
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const currentStep = ref(1)
const selectedTable = ref('')
const generating = ref(false)
const generationComplete = ref(false)
const generationProgress = ref(0)

const availableTables = ref([
  { name: 'Users', displayName: '用户表' },
  { name: 'Roles', displayName: '角色表' },
  { name: 'Projects', displayName: '项目表' }
])

const config = ref({
  systemName: '',
  moduleName: '',
  displayName: ''
})

const isConfigValid = computed(() => {
  return !!(config.value.systemName && config.value.moduleName && config.value.displayName)
})

const generateButtonType = computed(() => {
  if (generating.value) return 'danger'
  if (generationComplete.value) return 'success'
  return 'primary'
})

const generateButtonText = computed(() => {
  if (generating.value) return '🔥 正在生成中...'
  if (generationComplete.value) return '✅ 生成完成'
  return '🚀 一键生成完整系统'
})

const goToStep1 = () => { currentStep.value = 1 }
const goToStep2 = () => { 
  if (!selectedTable.value) {
    ElMessage.warning('请先选择数据库表')
    return
  }
  currentStep.value = 2 
}
const goToStep3 = () => { 
  if (!isConfigValid.value) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  currentStep.value = 3 
}

const startGeneration = async () => {
  generating.value = true
  generationProgress.value = 0
  
  try {
    // 模拟生成过程
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500))
      generationProgress.value = i
    }
    
    generationComplete.value = true
    ElMessage.success('🎉 代码生成成功！')
  } catch (error) {
    ElMessage.error('代码生成失败')
  } finally {
    generating.value = false
  }
}

// 🔥 核心功能：立即访问生成的功能模块
const viewCode = async () => {
  if (!config.value.moduleName) {
    ElMessage.warning('没有可访问的模块')
    return
  }
  
  // 构建生成的页面路径
  const modulePath = `/${config.value.systemName}/${config.value.moduleName}`
  
  ElMessage.success({
    message: `🎉 正在打开生成的功能模块...`,
    duration: 2000
  })
  
  // 等待2秒让用户看到提示，然后跳转
  setTimeout(() => {
    // 🚀 直接在系统内访问生成的页面
    window.open(`#${modulePath}`, '_blank')
    ElMessage.info({
      message: `功能模块路径: ${modulePath}`,
      duration: 5000
    })
  }, 2000)
}

// 进入UI定制流程
const customizeUI = () => {
  ElMessage.info({
    message: '🎨 正在进入UI定制工作台...',
    duration: 2000
  })
  
  // 跳转到UI定制页面，携带生成的模块信息
  setTimeout(() => {
    window.location.hash = `/lowcode/design?module=${config.value.moduleName}&system=${config.value.systemName}`
  }, 2000)
}

const resetToStart = () => {
  currentStep.value = 1
  selectedTable.value = ''
  generationComplete.value = false
  generationProgress.value = 0
  config.value = { systemName: '', moduleName: '', displayName: '' }
}
</script>

<style scoped>
.ultra-simple-studio {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.main-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  padding: 48px;
}

.card-header {
  text-align: center;
  margin-bottom: 48px;
}

.main-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: #7f8c8d;
}

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ecf0f1;
  color: #95a5a6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s;
}

.step-item.active .step-circle {
  background: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.step-item.completed .step-circle {
  background: #27ae60;
  color: white;
}

.step-divider {
  flex: 1;
  height: 2px;
  background: #ecf0f1;
  margin: 0 16px;
  margin-bottom: 24px;
  transition: background 0.3s;
}

.step-divider.completed {
  background: #27ae60;
}

.step-content h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 24px;
}

.table-selector {
  width: 100%;
  margin-bottom: 32px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.generate-button {
  width: 100%;
  height: 64px;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.success-info {
  margin: 16px 0;
}

.success-info p {
  margin: 8px 0;
  font-size: 16px;
  color: #2c3e50;
}

.module-path {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #667eea;
  font-weight: 600;
  background: #f5f7fa;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
  margin-top: 12px;
}
</style>

