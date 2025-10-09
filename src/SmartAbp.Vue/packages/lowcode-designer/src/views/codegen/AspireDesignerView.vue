<template>
  <div class="aspire-designer-view">
    <!-- 顶部工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-icon class="title-icon">
          <Connection />
        </el-icon>
        <h2 class="view-title">
          .NET Aspire 微服务编排设计器
        </h2>
        <el-tag
          type="info"
          size="small"
        >
          Day 9: 企业级云原生架构
        </el-tag>
      </div>
      
      <div class="toolbar-right">
        <el-button-group>
          <el-button
            :icon="Edit"
            :type="editMode ? 'primary' : 'default'"
            @click="handleEditMode"
          >
            编辑模式
          </el-button>
          <el-button
            :icon="View"
            :type="!editMode ? 'primary' : 'default'"
            @click="handleViewMode"
          >
            预览模式
          </el-button>
        </el-button-group>
        
        <el-button
          type="success"
          :icon="Check"
          :loading="generating"
          @click="handleGenerate"
        >
          生成Aspire解决方案
        </el-button>
        
        <el-button
          :icon="Setting"
          circle
          @click="showSettingsDrawer = true"
        />
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="designer-content">
      <!-- 左侧：微服务配置面板 -->
      <div class="left-panel">
        <el-card
          class="panel-card"
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <span>解决方案配置</span>
              <el-button
                text
                :icon="Plus"
                @click="showSolutionDialog = true"
              >
                新建
              </el-button>
            </div>
          </template>
          
          <el-form
            :model="solutionConfig"
            label-width="120px"
            size="default"
          >
            <el-form-item
              label="解决方案名称"
              required
            >
              <el-input
                v-model="solutionConfig.solutionName"
                placeholder="例如: SmartAbp.Microservices"
              />
            </el-form-item>
            
            <el-form-item
              label="根命名空间"
              required
            >
              <el-input
                v-model="solutionConfig.rootNamespace"
                placeholder="例如: SmartAbp"
              />
            </el-form-item>
            
            <el-form-item label="描述">
              <el-input
                v-model="solutionConfig.description"
                type="textarea"
                :rows="2"
                placeholder="解决方案描述..."
              />
            </el-form-item>
            
            <el-form-item label="数据库名称">
              <el-input
                v-model="solutionConfig.databaseName"
                placeholder="AppDatabase"
              />
            </el-form-item>
            
            <el-divider>基础设施服务</el-divider>
            
            <el-form-item label="PostgreSQL">
              <el-switch v-model="solutionConfig.usePostgreSQL" />
            </el-form-item>
            
            <el-form-item label="Redis缓存">
              <el-switch v-model="solutionConfig.useRedis" />
            </el-form-item>
            
            <el-form-item label="RabbitMQ">
              <el-switch v-model="solutionConfig.useRabbitMQ" />
            </el-form-item>
            
            <el-form-item label="Elasticsearch">
              <el-switch v-model="solutionConfig.useElasticsearch" />
            </el-form-item>
            
            <el-form-item label="Seq日志">
              <el-switch v-model="solutionConfig.useSeq" />
            </el-form-item>
            
            <el-form-item label="API网关">
              <el-switch v-model="solutionConfig.includeApiGateway" />
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 微服务列表 -->
        <el-card
          class="panel-card mt-4"
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <span>微服务列表 ({{ microservices.length }})</span>
              <el-button
                text
                :icon="Plus"
                type="primary"
                @click="handleAddMicroservice"
              >
                添加微服务
              </el-button>
            </div>
          </template>
          
          <el-empty
            v-if="microservices.length === 0"
            description="暂无微服务，点击上方按钮添加"
          >
            <el-button
              type="primary"
              :icon="Plus"
              @click="handleAddMicroservice"
            >
              添加第一个微服务
            </el-button>
          </el-empty>
          
          <div
            v-else
            class="microservice-list"
          >
            <div
              v-for="service in microservices"
              :key="service.name"
              class="microservice-item"
              :class="{ active: selectedService?.name === service.name }"
              @click="handleSelectService(service)"
            >
              <div class="service-info">
                <el-icon class="service-icon">
                  <Box />
                </el-icon>
                <div class="service-details">
                  <div class="service-name">
                    {{ service.displayName }}
                  </div>
                  <div class="service-meta">
                    {{ service.projectName }} · {{ service.replicas }}副本
                  </div>
                </div>
              </div>
              
              <div class="service-actions">
                <el-button
                  text
                  :icon="Edit"
                  size="small"
                  @click.stop="handleEditService(service)"
                />
                <el-button
                  text
                  :icon="Delete"
                  size="small"
                  type="danger"
                  @click.stop="handleDeleteService(service)"
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间：服务拓扑可视化 -->
      <div class="center-panel">
        <ServiceTopologyCanvas
          :microservices="microservices"
          :solution-config="solutionConfig"
          :selected-service="selectedService"
          @select-service="handleSelectService"
          @add-service="handleAddMicroservice"
        />
      </div>

      <!-- 右侧：服务详情配置 -->
      <div
        v-if="selectedService"
        class="right-panel"
      >
        <ServiceConfigPanel
          :service="selectedService"
          :all-services="microservices"
          @update="handleUpdateService"
          @close="selectedService = null"
        />
      </div>
      
      <div
        v-else
        class="right-panel-empty"
      >
        <el-empty description="请从左侧选择一个微服务进行配置" />
      </div>
    </div>

    <!-- 微服务添加/编辑对话框 -->
    <el-dialog
      v-model="showServiceDialog"
      :title="editingService ? '编辑微服务' : '添加微服务'"
      width="600px"
      :close-on-click-modal="false"
    >
      <MicroserviceForm
        :model-value="currentServiceForm"
        :existing-services="microservices"
        @update:model-value="currentServiceForm = $event"
      />
      
      <template #footer>
        <el-button @click="showServiceDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSaveService"
        >
          {{ editingService ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 设置抽屉 -->
    <el-drawer
      v-model="showSettingsDrawer"
      title="Aspire 高级设置"
      size="400px"
    >
      <AdvancedSettingsPanel
        :config="solutionConfig"
        @update="handleUpdateConfig"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Connection, Edit, View, Check, Setting, Plus, Box, Delete 
} from '@element-plus/icons-vue'
import ServiceTopologyCanvas from './../components/aspire/ServiceTopologyCanvas.vue'
import ServiceConfigPanel from './../components/aspire/ServiceConfigPanel.vue'
import MicroserviceForm from './../components/aspire/MicroserviceForm.vue'
import AdvancedSettingsPanel from './../components/aspire/AdvancedSettingsPanel.vue'
import { useAspireCodeGen } from '@smartabp/lowcode-api'

// 类型定义
interface MicroserviceConfig {
  name: string
  projectName: string
  displayName: string
  description?: string
  replicas: number
  useDapr: boolean
  useServiceDiscovery: boolean
  useHealthChecks: boolean
  useOpenTelemetry: boolean
}

interface SolutionConfig {
  solutionName: string
  rootNamespace: string
  description?: string
  databaseName: string
  usePostgreSQL: boolean
  useRedis: boolean
  useRabbitMQ: boolean
  useElasticsearch: boolean
  useSeq: boolean
  includeApiGateway: boolean
}

// 状态管理
const editMode = ref(true)
const generating = ref(false)
const showServiceDialog = ref(false)
const showSolutionDialog = ref(false)
const showSettingsDrawer = ref(false)
const editingService = ref<MicroserviceConfig | null>(null)
const selectedService = ref<MicroserviceConfig | null>(null)

// 解决方案配置
const solutionConfig = reactive<SolutionConfig>({
  solutionName: '',
  rootNamespace: '',
  description: '',
  databaseName: 'AppDatabase',
  usePostgreSQL: true,
  useRedis: true,
  useRabbitMQ: true,
  useElasticsearch: false,
  useSeq: true,
  includeApiGateway: true
})

// 微服务列表
const microservices = ref<MicroserviceConfig[]>([])

// 当前编辑的服务表单
const currentServiceForm = ref<Partial<MicroserviceConfig>>({})

// API集成
const { generateAspireSolution } = useAspireCodeGen()

// 方法：编辑模式切换
const handleEditMode = () => {
  editMode.value = true
}

const handleViewMode = () => {
  editMode.value = false
}

// 方法：添加微服务
const handleAddMicroservice = () => {
  editingService.value = null
  currentServiceForm.value = {
    name: '',
    projectName: '',
    displayName: '',
    description: '',
    replicas: 1,
    useDapr: false,
    useServiceDiscovery: true,
    useHealthChecks: true,
    useOpenTelemetry: true
  }
  showServiceDialog.value = true
}

// 方法：编辑微服务
const handleEditService = (service: MicroserviceConfig) => {
  editingService.value = service
  currentServiceForm.value = { ...service }
  showServiceDialog.value = true
}

// 方法：保存微服务
const handleSaveService = () => {
  if (!currentServiceForm.value.name || !currentServiceForm.value.projectName) {
    ElMessage.warning('请填写必填字段')
    return
  }
  
  if (editingService.value) {
    // 更新现有服务
    const index = microservices.value.findIndex(s => s.name === editingService.value!.name)
    if (index !== -1) {
      microservices.value[index] = currentServiceForm.value as MicroserviceConfig
    }
  } else {
    // 添加新服务
    microservices.value.push(currentServiceForm.value as MicroserviceConfig)
  }
  
  showServiceDialog.value = false
  ElMessage.success(editingService.value ? '微服务已更新' : '微服务已添加')
}

// 方法：删除微服务
const handleDeleteService = async (service: MicroserviceConfig) => {
  try {
    await ElMessageBox.confirm(`确定要删除微服务 "${service.displayName}" 吗？`, '删除确认', {
      type: 'warning'
    })
    
    const index = microservices.value.findIndex(s => s.name === service.name)
    if (index !== -1) {
      microservices.value.splice(index, 1)
      if (selectedService.value?.name === service.name) {
        selectedService.value = null
      }
      ElMessage.success('微服务已删除')
    }
  } catch {
    // 用户取消
  }
}

// 方法：选择微服务
const handleSelectService = (service: MicroserviceConfig) => {
  selectedService.value = service
}

// 方法：更新服务配置
const handleUpdateService = (updated: MicroserviceConfig) => {
  const index = microservices.value.findIndex(s => s.name === updated.name)
  if (index !== -1) {
    microservices.value[index] = updated
    selectedService.value = updated
  }
}

// 方法：更新解决方案配置
const handleUpdateConfig = (config: Partial<SolutionConfig>) => {
  Object.assign(solutionConfig, config)
}

// 方法：生成Aspire解决方案
const handleGenerate = async () => {
  // 验证
  if (!solutionConfig.solutionName || !solutionConfig.rootNamespace) {
    ElMessage.warning('请填写解决方案名称和根命名空间')
    return
  }
  
  if (microservices.value.length === 0) {
    ElMessage.warning('请至少添加一个微服务')
    return
  }
  
  generating.value = true
  
  try {
    const result = await generateAspireSolution({
      solutionName: solutionConfig.solutionName,
      rootNamespace: solutionConfig.rootNamespace,
      description: solutionConfig.description,
      microservices: microservices.value.map(s => ({
        name: s.name,
        projectName: s.projectName,
        displayName: s.displayName,
        description: s.description,
        replicas: s.replicas,
        useDapr: s.useDapr,
        useServiceDiscovery: s.useServiceDiscovery,
        useHealthChecks: s.useHealthChecks,
        useOpenTelemetry: s.useOpenTelemetry
      })),
      includeApiGateway: solutionConfig.includeApiGateway,
      databaseName: solutionConfig.databaseName,
      usePostgreSQL: solutionConfig.usePostgreSQL,
      useRedis: solutionConfig.useRedis,
      useRabbitMQ: solutionConfig.useRabbitMQ,
      useElasticsearch: solutionConfig.useElasticsearch,
      useSeq: solutionConfig.useSeq
    })
    
    ElMessage.success(`生成成功！共生成 ${Object.keys(result.files).length} 个文件`)
    
    // 显示生成结果
    await ElMessageBox.alert(
      `解决方案名称: ${result.solutionName}\n` +
      `微服务数量: ${result.microserviceCount}\n` +
      `生成时间: ${new Date(result.generatedAt).toLocaleString()}\n` +
      `文件数量: ${Object.keys(result.files).length}`,
      '生成完成',
      { type: 'success' }
    )
  } catch (error: any) {
    ElMessage.error('生成失败: ' + (error.message || '未知错误'))
    console.error('Generation error:', error)
  } finally {
    generating.value = false
  }
}
</script>

<style scoped lang="scss">
.aspire-designer-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
  
  .designer-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .title-icon {
        font-size: 24px;
        color: #409eff;
      }
      
      .view-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .designer-content {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
    
    .left-panel {
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
      
      .panel-card {
        border: none;
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
      }
      
      .microservice-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .microservice-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f5f7fa;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          
          &:hover {
            background: #ecf5ff;
            border-color: #409eff;
          }
          
          &.active {
            background: #ecf5ff;
            border-color: #409eff;
          }
          
          .service-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            
            .service-icon {
              font-size: 20px;
              color: #409eff;
            }
            
            .service-details {
              .service-name {
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }
              
              .service-meta {
                font-size: 12px;
                color: #909399;
              }
            }
          }
          
          .service-actions {
            display: flex;
            gap: 4px;
          }
        }
      }
    }
    
    .center-panel {
      flex: 1;
      background: white;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      overflow: hidden;
    }
    
    .right-panel {
      width: 360px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      overflow-y: auto;
    }
    
    .right-panel-empty {
      width: 360px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.mt-4 {
  margin-top: 16px;
}
</style>

