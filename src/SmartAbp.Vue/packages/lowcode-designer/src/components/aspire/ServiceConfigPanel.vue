<template>
  <div class="service-config-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        {{ service.displayName }}
      </h3>
      <el-button
        text
        :icon="Close"
        @click="$emit('close')"
      />
    </div>
    
    <el-scrollbar class="panel-body">
      <el-form
        :model="formData"
        label-width="120px"
        size="default"
      >
        <el-divider content-position="left">
          基本信息
        </el-divider>
        
        <el-form-item label="服务名称">
          <el-input
            v-model="formData.name"
            placeholder="例如: user-service"
          />
        </el-form-item>
        
        <el-form-item label="项目名称">
          <el-input
            v-model="formData.projectName"
            placeholder="例如: UserService"
          />
        </el-form-item>
        
        <el-form-item label="显示名称">
          <el-input
            v-model="formData.displayName"
            placeholder="例如: 用户服务"
          />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="服务功能描述..."
          />
        </el-form-item>
        
        <el-divider content-position="left">
          部署配置
        </el-divider>
        
        <el-form-item label="副本数量">
          <el-input-number
            v-model="formData.replicas"
            :min="1"
            :max="10"
          />
        </el-form-item>
        
        <el-divider content-position="left">
          功能特性
        </el-divider>
        
        <el-form-item label="Dapr支持">
          <el-switch v-model="formData.useDapr" />
          <span class="form-hint">启用Dapr边车模式</span>
        </el-form-item>
        
        <el-form-item label="服务发现">
          <el-switch v-model="formData.useServiceDiscovery" />
          <span class="form-hint">自动服务注册和发现</span>
        </el-form-item>
        
        <el-form-item label="健康检查">
          <el-switch v-model="formData.useHealthChecks" />
          <span class="form-hint">启用/health端点</span>
        </el-form-item>
        
        <el-form-item label="遥测追踪">
          <el-switch v-model="formData.useOpenTelemetry" />
          <span class="form-hint">OpenTelemetry分布式追踪</span>
        </el-form-item>
        
        <el-divider content-position="left">
          依赖服务
        </el-divider>
        
        <el-form-item label="依赖项">
          <el-select
            v-model="formData.dependencies"
            multiple
            placeholder="选择依赖的其他服务"
            style="width: 100%"
          >
            <el-option
              v-for="svc in otherServices"
              :key="svc.name"
              :label="svc.displayName"
              :value="svc.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    
    <div class="panel-footer">
      <el-button @click="$emit('close')">
        取消
      </el-button>
      <el-button
        type="primary"
        @click="handleSave"
      >
        保存更改
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Props {
  service: any
  allServices: any[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'close'])

const formData = ref({ ...props.service })

const otherServices = computed(() =>
  props.allServices.filter(s => s.name !== props.service.name)
)

watch(() => props.service, (newService) => {
  formData.value = { ...newService }
}, { deep: true })

const handleSave = () => {
  if (!formData.value.name || !formData.value.projectName) {
    ElMessage.warning('请填写必填字段')
    return
  }
  
  emit('update', formData.value)
  ElMessage.success('配置已更新')
}
</script>

<style scoped lang="scss">
.service-config-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    .panel-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .panel-body {
    flex: 1;
    padding: 16px;
    
    .form-hint {
      margin-left: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
  
  .panel-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>

