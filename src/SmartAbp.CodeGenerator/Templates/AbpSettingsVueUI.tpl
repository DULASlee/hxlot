<template>
  <div class="{{SettingsGroupName.ToLower()}}-settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ $t('{{Description}}') }}</span>
        </div>
      </template>
      
      <el-form 
        ref="settingsFormRef" 
        :model="settingsForm" 
        :rules="settingsRules" 
        label-width="120px">
{{SettingsControls}}
        
        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            {{ $t('保存') }}
          </el-button>
          <el-button @click="resetSettings">
            {{ $t('重置') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { {{SettingsGroupName}}SettingsService } from '@/api/{{SettingsGroupName.ToLower()}}'

const { t } = useI18n()

const settingsFormRef = ref<InstanceType<typeof ElForm>>()
const saving = ref(false)

const settingsForm = reactive({
{{SettingsData}}
})

const settingsRules = reactive({
{{SettingsValidation}}
})

const settingsService = new {{SettingsGroupName}}SettingsService()

onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  try {
    // Load settings from backend
    // TODO: Implement actual API calls
    ElMessage.success(t('设置加载成功'))
  } catch (error) {
    ElMessage.error(t('设置加载失败'))
  }
}

const saveSettings = async () => {
  if (!settingsFormRef.value) return

  try {
    await settingsFormRef.value.validate()
    saving.value = true
    
    // Save settings to backend
    // TODO: Implement actual API calls
    
    ElMessage.success(t('设置保存成功'))
  } catch (error) {
    ElMessage.error(t('设置保存失败'))
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  settingsFormRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.{{SettingsGroupName.ToLower()}}-settings {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
