<template>
  <div class="advanced-settings-panel">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="高级配置"
      description="这些配置将影响Aspire解决方案的生成行为"
      class="mb-4"
    />
    
    <el-form :model="settings" label-width="140px">
      <el-divider content-position="left">环境配置</el-divider>
      
      <el-form-item label="开发环境日志">
        <el-select v-model="settings.devLogLevel" style="width: 100%">
          <el-option label="Trace" value="Trace" />
          <el-option label="Debug" value="Debug" />
          <el-option label="Information" value="Information" />
          <el-option label="Warning" value="Warning" />
          <el-option label="Error" value="Error" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="详细错误信息">
        <el-switch v-model="settings.enableDetailedErrors" />
      </el-form-item>
      
      <el-divider content-position="left">安全配置</el-divider>
      
      <el-form-item label="HTTPS重定向">
        <el-switch v-model="settings.useHttpsRedirection" />
      </el-form-item>
      
      <el-form-item label="CORS支持">
        <el-switch v-model="settings.useCors" />
      </el-form-item>
      
      <el-form-item label="允许的源" v-if="settings.useCors">
        <el-input
          v-model="settings.allowedOrigins"
          type="textarea"
          :rows="3"
          placeholder="每行一个URL，例如：&#10;https://localhost:5173&#10;https://app.example.com"
        />
      </el-form-item>
      
      <el-divider content-position="left">可观测性</el-divider>
      
      <el-form-item label="Prometheus">
        <el-switch v-model="settings.usePrometheus" />
      </el-form-item>
      
      <el-form-item label="Jaeger追踪">
        <el-switch v-model="settings.useJaeger" />
      </el-form-item>
      
      <el-form-item label="Seq日志中心">
        <el-switch v-model="settings.useSeq" />
      </el-form-item>
      
      <el-divider content-position="left">服务网格</el-divider>
      
      <el-form-item label="启用服务网格">
        <el-switch v-model="settings.useServiceMesh" />
      </el-form-item>
      
      <el-form-item label="网格类型" v-if="settings.useServiceMesh">
        <el-select v-model="settings.serviceMeshType" style="width: 100%">
          <el-option label="Istio" value="Istio" />
          <el-option label="Linkerd" value="Linkerd" />
          <el-option label="Consul Connect" value="ConsulConnect" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <div class="panel-actions">
      <el-button @click="handleReset">重置为默认</el-button>
      <el-button type="primary" @click="handleApply">应用设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  config: any
}

defineProps<Props>()
const emit = defineEmits(['update'])

const settings = reactive({
  devLogLevel: 'Information',
  enableDetailedErrors: true,
  useHttpsRedirection: true,
  useCors: true,
  allowedOrigins: 'https://localhost:5173',
  usePrometheus: true,
  useJaeger: true,
  useSeq: true,
  useServiceMesh: false,
  serviceMeshType: 'Istio'
})

const handleReset = () => {
  Object.assign(settings, {
    devLogLevel: 'Information',
    enableDetailedErrors: true,
    useHttpsRedirection: true,
    useCors: true,
    allowedOrigins: 'https://localhost:5173',
    usePrometheus: true,
    useJaeger: true,
    useSeq: true,
    useServiceMesh: false,
    serviceMeshType: 'Istio'
  })
  ElMessage.info('已重置为默认设置')
}

const handleApply = () => {
  emit('update', { ...settings })
  ElMessage.success('设置已应用')
}
</script>

<style scoped lang="scss">
.advanced-settings-panel {
  padding: 16px;
  
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .panel-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>

