<template>
  <el-dialog
    v-model="visible"
    title="导出设计"
    width="600px"
    @close="handleClose"
  >
    <div class="export-options">
      <div class="option-group">
        <h4>导出格式</h4>
        <el-radio-group v-model="exportFormat">
          <el-radio value="vue">Vue 组件</el-radio>
          <el-radio value="html">HTML</el-radio>
          <el-radio value="json">JSON 配置</el-radio>
        </el-radio-group>
      </div>

      <div class="option-group">
        <h4>导出选项</h4>
        <el-checkbox v-model="includeStyles">包含样式</el-checkbox>
        <el-checkbox v-model="includeAssets">包含资源文件</el-checkbox>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

interface Props {
  designer?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  export: [data: any]
}>()

const visible = computed({
  get: () => true,
  set: () => emit("close")
})

const exportFormat = ref("vue")
const includeStyles = ref(true)
const includeAssets = ref(false)

const handleClose = () => {
  emit("close")
}

const handleExport = () => {
  const exportData = {
    format: exportFormat.value,
    options: {
      includeStyles: includeStyles.value,
      includeAssets: includeAssets.value,
    },
    designer: props.designer,
  }
  emit("export", exportData)
  emit("close")
}
</script>

<style scoped>
.export-options {
  padding: 20px 0;
}

.option-group {
  margin-bottom: 24px;
}

.option-group h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.el-checkbox {
  display: block;
  margin-bottom: 8px;
}
</style>
