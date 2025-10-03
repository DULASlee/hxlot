<template>
  <el-dialog
    v-model="visible"
    title="导入设计"
    width="600px"
    @close="handleClose"
  >
    <div class="import-options">
      <div class="upload-area">
        <el-upload
          class="upload-dragger"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".json,.vue,.html"
        >
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <div class="el-upload__tip">
            支持 .json, .vue, .html 格式
          </div>
        </el-upload>
      </div>

      <div
        v-if="importData"
        class="preview-area"
      >
        <h4>预览</h4>
        <div class="preview-content">
          <pre>{{ JSON.stringify(importData, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!importData"
          @click="handleImport"
        >导入</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { UploadFilled } from "@element-plus/icons-vue"

const emit = defineEmits<{
  close: []
  import: [data: any]
}>()

const visible = computed({
  get: () => true,
  set: () => emit("close")
})

const importData = ref<any>(null)

const handleClose = () => {
  emit("close")
}

const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      if (file.name.endsWith('.json')) {
        importData.value = JSON.parse(content)
      } else {
        importData.value = { content, type: file.name.split('.').pop() }
      }
    } catch (error) {
      console.error('Failed to parse file:', error)
      importData.value = null
    }
  }
  reader.readAsText(file.raw)
}

const handleImport = () => {
  if (importData.value) {
    emit("import", importData.value)
    emit("close")
  }
}
</script>

<style scoped>
.import-options {
  padding: 20px 0;
}

.upload-area {
  margin-bottom: 24px;
}

.preview-area {
  margin-top: 24px;
}

.preview-area h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.preview-content {
  max-height: 200px;
  overflow-y: auto;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
}

.preview-content pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}
</style>
