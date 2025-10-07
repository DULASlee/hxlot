<template>
  <div class="industry-template-config">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">{{ templateInfo?.name }} - 配置向导</span>
      </template>
    </el-page-header>

    <div class="config-container">
      <el-card
        shadow="never"
        class="template-info-card"
      >
        <template #header>
          <div class="card-header">
            <span>{{ templateInfo?.icon }} {{ templateInfo?.name }}</span>
            <el-tag type="success">
              行业模板
            </el-tag>
          </div>
        </template>
        <p class="template-description">
          {{ templateInfo?.description }}
        </p>
      </el-card>

      <!-- 配置步骤 -->
      <el-steps
        :active="currentStep"
        align-center
        class="config-steps"
      >
        <el-step
          title="基础信息"
          description="系统名称和描述"
        />
        <el-step
          title="模块选择"
          description="选择需要的功能模块"
        />
        <el-step
          title="硬件配置"
          description="IoT设备和硬件"
        />
        <el-step
          title="生成预览"
          description="确认并生成"
        />
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- Step 1: 基础信息 -->
        <div
          v-if="currentStep === 0"
          class="step-panel"
        >
          <el-form
            :model="configForm"
            label-width="120px"
          >
            <el-form-item label="系统名称">
              <el-input
                v-model="configForm.systemName"
                placeholder="如：华宇制造MES"
              />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="configForm.description"
                type="textarea"
                :rows="3"
                placeholder="简单描述系统用途"
              />
            </el-form-item>
            <el-form-item label="公司名称">
              <el-input
                v-model="configForm.companyName"
                placeholder="如：华宇科技有限公司"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 2: 模块选择 -->
        <div
          v-if="currentStep === 1"
          class="step-panel"
        >
          <p class="step-desc">
            请选择需要的功能模块（已根据行业预选核心模块）
          </p>
          <el-checkbox-group
            v-model="selectedModules"
            class="module-list"
          >
            <el-card
              v-for="module in availableModules"
              :key="module.id"
              shadow="hover"
              :class="['module-card', { selected: selectedModules.includes(module.id) }]"
            >
              <el-checkbox
                :label="module.id"
                :disabled="module.required"
              >
                <div class="module-info">
                  <div class="module-header">
                    <span class="module-icon">{{ module.icon }}</span>
                    <span class="module-name">{{ module.name }}</span>
                    <el-tag
                      v-if="module.required"
                      type="danger"
                      size="small"
                    >
                      必选
                    </el-tag>
                  </div>
                  <p class="module-desc">
                    {{ module.description }}
                  </p>
                </div>
              </el-checkbox>
            </el-card>
          </el-checkbox-group>
        </div>

        <!-- Step 3: 硬件配置 -->
        <div
          v-if="currentStep === 2"
          class="step-panel"
        >
          <p class="step-desc">
            配置需要集成的IoT设备和硬件
          </p>
          <el-alert
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 20px;"
          >
            系统将自动生成硬件驱动代码和数据采集脚本
          </el-alert>
          
          <div class="hardware-config">
            <h4>常用设备</h4>
            <el-checkbox-group v-model="selectedHardware">
              <el-checkbox
                v-for="hw in hardwareOptions"
                :key="hw.id"
                :label="hw.id"
                class="hardware-item"
              >
                <span class="hw-icon">{{ hw.icon }}</span>
                {{ hw.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- Step 4: 生成预览 -->
        <div
          v-if="currentStep === 3"
          class="step-panel"
        >
          <el-result
            icon="success"
            title="配置完成"
            sub-title="即将生成以下内容"
          >
            <template #extra>
              <div class="generation-preview">
                <h4>生成清单：</h4>
                <ul class="preview-list">
                  <li>✅ Web后台管理系统（{{ selectedModules.length }}个模块）</li>
                  <li>✅ 移动APP（UniApp，支持iOS/Android/小程序）</li>
                  <li>✅ 数字大屏（{{ templateInfo?.dashboardCount }}个大屏）</li>
                  <li>✅ IoT设备驱动（{{ selectedHardware.length }}个设备）</li>
                  <li>✅ 数据库脚本和初始数据</li>
                  <li>✅ 部署文档和使用手册</li>
                </ul>

                <el-button
                  type="primary"
                  size="large"
                  :loading="generating"
                  @click="startGeneration"
                >
                  {{ generating ? '生成中...' : '开始生成' }}
                </el-button>
              </div>
            </template>
          </el-result>
        </div>
      </div>

      <!-- 步骤导航 -->
      <div class="step-actions">
        <el-button
          v-if="currentStep > 0"
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="currentStep < 3"
          type="primary"
          @click="nextStep"
        >
          下一步
        </el-button>
      </div>
    </div>

    <!-- TODO提示 -->
    <el-alert
      type="warning"
      :closable="false"
      style="margin-top: 20px;"
    >
      <template #title>
        <strong>🚧 开发中</strong>
      </template>
      本页面为行业模板配置向导占位页面，完整功能将在Phase 2（Week 5-10）实现。
      <br />
      预计完成时间：2025年12月中旬
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import type { GenerationResult as GenerationResultDto, IndustryTemplateConfigDto } from '@smartabp/lowcode-api'
import { industryTemplateApi } from '@smartabp/lowcode-api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// ========== 接口定义 ==========

interface TemplateInfo {
  id: string
  name: string
  icon: string
  description: string
  dashboardCount: number
  industry?: string
  templateType?: string
}

interface Module {
  id: string
  name: string
  icon: string
  description: string
  required: boolean
}

interface Hardware {
  id: string
  name: string
  icon: string
}

// ========== 状态 ==========

const currentStep = ref(0)
const generating = ref(false)

const configForm = ref({
  systemName: '',
  description: '',
  companyName: ''
})

const selectedModules = ref<string[]>([])
const selectedHardware = ref<string[]>([])

// ========== 模板信息 ==========

const templateInfo = computed((): TemplateInfo | null => {
  const template = route.query.template as string
  
  if (template === 'saas-mes') {
    return {
      id: 'saas-mes',
      name: 'SaaS云MES系统',
      icon: '🏭',
      description: '面向小型制造企业的生产执行系统，包含生产管理、设备监控、质量追溯、物料管理等核心功能',
      dashboardCount: 4
    }
  }
  
  if (template === 'smart-construction') {
    return {
      id: 'smart-construction',
      name: '智慧工地管理系统',
      icon: '🏗️',
      description: '面向建筑施工项目的智能管理平台，包含人员管理、安全监控、进度管理、环境监测等功能',
      dashboardCount: 3
    }
  }
  
  return null
})

// ========== 可用模块 ==========

const availableModules = computed((): Module[] => {
  const template = route.query.template as string
  
  if (template === 'saas-mes') {
    return [
      { id: 'production', name: '生产管理', icon: '⚙️', description: '工单、排程、报工、完工', required: true },
      { id: 'quality', name: '质量管理', icon: '✓', description: '质检、不良品、质量分析', required: true },
      { id: 'equipment', name: '设备管理', icon: '🔧', description: '设备台账、保养、故障管理', required: true },
      { id: 'material', name: '物料管理', icon: '📦', description: '库存、领料、BOM管理', required: false },
      { id: 'warehouse', name: '仓储管理', icon: '🏬', description: '入库、出库、盘点', required: false },
      { id: 'iot', name: 'IoT数据采集', icon: '📡', description: 'PLC、传感器数据采集', required: false }
    ]
  }
  
  if (template === 'smart-construction') {
    return [
      { id: 'personnel', name: '人员管理', icon: '👷', description: '工人档案、考勤、工资', required: true },
      { id: 'safety', name: '安全管理', icon: '⚠️', description: '隐患上报、整改、检查', required: true },
      { id: 'progress', name: '进度管理', icon: '📊', description: '计划、填报、进度展示', required: true },
      { id: 'environment', name: '环境监测', icon: '🌡️', description: '扬尘、噪音、温湿度', required: false },
      { id: 'material-site', name: '材料管理', icon: '🧱', description: '进场、领料、盘点', required: false },
      { id: 'equipment-site', name: '设备管理', icon: '🏗️', description: '塔吊、施工机械管理', required: false }
    ]
  }
  
  return []
})

// ========== 硬件选项 ==========

const hardwareOptions = computed((): Hardware[] => {
  const template = route.query.template as string
  
  if (template === 'saas-mes') {
    return [
      { id: 'plc', name: 'PLC（西门子/三菱/欧姆龙）', icon: '🔌' },
      { id: 'scanner', name: '条码扫描枪', icon: '📷' },
      { id: 'rfid', name: 'RFID读写器', icon: '📡' },
      { id: 'sensor', name: '温度/压力传感器', icon: '🌡️' },
      { id: 'camera', name: '工业相机', icon: '📹' }
    ]
  }
  
  if (template === 'smart-construction') {
    return [
      { id: 'face-gate', name: '人脸识别闸机', icon: '🚪' },
      { id: 'env-monitor', name: '环境监测站', icon: '📊' },
      { id: 'ai-camera', name: 'AI摄像头（安全帽识别）', icon: '📹' },
      { id: 'gps-tracker', name: 'GPS/北斗定位手环', icon: '📍' },
      { id: 'tower-crane', name: '塔吊安全监测', icon: '🏗️' }
    ]
  }
  
  return []
})

// ========== 生命周期 ==========

onMounted(() => {
  // 预选必选模块
  selectedModules.value = availableModules.value
    .filter(m => m.required)
    .map(m => m.id)
    
  // 检查模板参数
  if (!templateInfo.value) {
    ElMessage.error('无效的模板类型')
    router.push('/codegen-entrance')
  }
})

// ========== 方法 ==========

const goBack = () => {
  router.push('/codegen-entrance')
}

const nextStep = () => {
  if (currentStep.value === 0) {
    if (!configForm.value.systemName) {
      ElMessage.warning('请填写系统名称')
      return
    }
  }
  
  if (currentStep.value === 1) {
    if (selectedModules.value.length === 0) {
      ElMessage.warning('请至少选择一个功能模块')
      return
    }
  }
  
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

/**
 * ✅ 下载生成的文件（打包为ZIP）
 */
const downloadGeneratedFiles = async (result: GenerationResultDto | any) => {
  try {
    // 动态导入JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // 将所有文件添加到ZIP
    result.files?.forEach((file: { path: string; content: string }) => {
      const folderPath = file.path.split('/').slice(0, -1).join('/');
      const fileName = file.path.split('/').pop() || 'unknown';
      const folder = folderPath ? zip.folder(folderPath) : zip;
      folder?.file(fileName, file.content);
    });

    // 生成ZIP文件
    const blob = await zip.generateAsync({ type: 'blob' });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${configForm.value.systemName || 'smartabp-project'}.zip`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('文件下载成功！');
  } catch (error) {
    console.error('下载文件失败:', error);
    ElMessage.error('下载文件失败');
  }
};

const startGeneration = async () => {
  try {
    await ElMessageBox.confirm(
      '确认使用当前配置生成系统吗？',
      '确认生成',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    generating.value = true
    
    // 检查模板信息
    if (!templateInfo.value) {
      ElMessage.error('模板信息未加载')
      generating.value = false
      return
    }
    
    // ✅ 调用真实的代码生成API
    const config: IndustryTemplateConfigDto = {
        industry: templateInfo.value.industry || 'Manufacturing',
        templateType: templateInfo.value.templateType || 'MES',
        projectName: configForm.value.systemName,
        namespace: `SmartAbp.${configForm.value.systemName}`,
        options: {
            description: configForm.value.description,
            companyName: configForm.value.companyName,
            selectedModules: selectedModules.value,
            selectedHardware: selectedHardware.value
        }
    };

    try {
        const result = await industryTemplateApi.generate(config);

        if (result.success) {
            ElMessage.success({
                message: `代码生成成功！共生成 ${result.files?.length || 0} 个文件。`,
                duration: 5000
            });
            
            // ✅ 真实实现：提供下载功能
            if (result.files && result.files.length > 0) {
                await downloadGeneratedFiles(result);
            }
        } else {
            const errorMsg = result.errors?.join(', ') || '未知错误';
            ElMessage.error({
                message: `代码生成失败: ${errorMsg}`,
                duration: 5000
            });
        }
    } catch (apiError) {
        ElMessage.error({
            message: `API调用失败: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
            duration: 5000
        });
    } finally {
        generating.value = false;
    }
    
  } catch {
    // 用户取消
    generating.value = false;
  }
}
</script>

<style scoped lang="scss">
.industry-template-config {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

.config-container {
  margin-top: 20px;
}

.template-info-card {
  margin-bottom: 30px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
  }
  
  .template-description {
    color: #606266;
    line-height: 1.6;
    margin: 0;
  }
}

.config-steps {
  margin-bottom: 40px;
}

.step-content {
  min-height: 400px;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 8px;
}

.step-panel {
  max-width: 800px;
  margin: 0 auto;
}

.step-desc {
  color: #606266;
  margin-bottom: 20px;
}

.module-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.module-card {
  cursor: pointer;
  transition: all 0.3s;
  
  &.selected {
    border-color: #409eff;
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
  }
  
  &:hover {
    border-color: #409eff;
  }
}

.module-info {
  .module-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .module-icon {
      font-size: 20px;
    }
    
    .module-name {
      font-weight: 600;
      flex: 1;
    }
  }
  
  .module-desc {
    color: #909399;
    font-size: 13px;
    margin: 0;
  }
}

.hardware-config {
  h4 {
    margin-bottom: 16px;
  }
}

.hardware-item {
  display: block;
  margin-bottom: 12px;
  
  .hw-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

.generation-preview {
  text-align: center;
  
  h4 {
    margin-bottom: 16px;
  }
  
  .preview-list {
    text-align: left;
    display: inline-block;
    margin-bottom: 30px;
    
    li {
      padding: 8px 0;
      font-size: 15px;
    }
  }
}

.step-actions {
  margin-top: 30px;
  text-align: center;
  
  .el-button {
    min-width: 120px;
  }
}
</style>

