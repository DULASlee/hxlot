<template>
  <el-dialog
    v-model="visible"
    title="预览"
    width="80%"
    fullscreen
    @close="handleClose"
  >
    <div class="preview-container">
      <div class="preview-toolbar">
        <div class="device-selector">
          <el-radio-group v-model="previewDevice">
            <el-radio-button value="desktop">
              桌面
            </el-radio-button>
            <el-radio-button value="tablet">
              平板
            </el-radio-button>
            <el-radio-button value="mobile">
              手机
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="preview-actions">
          <el-button
            size="small"
            @click="refreshPreview"
          >
            刷新
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="openInNewTab"
          >
            新窗口打开
          </el-button>
        </div>
      </div>

      <div
        class="preview-frame"
        :class="`device-${previewDevice}`"
      >
        <div class="preview-content">
          <!-- 预览内容 -->
          <div class="preview-placeholder">
            <h3>设计预览</h3>
            <p>组件数量: {{ components?.length || 0 }}</p>
            <div
              v-if="components && components.length > 0"
              class="component-list"
            >
              <div
                v-for="(component, index) in components"
                :key="component.id || index"
                class="component-item"
              >
                {{ component.name || `Component ${index + 1}` }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

interface Props {
  components?: any[]
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const visible = computed({
  get: () => true,
  set: () => emit("close")
})

const previewDevice = ref("desktop")

const handleClose = () => {
  emit("close")
}

const refreshPreview = () => {
  // 刷新预览逻辑
  console.log("Refreshing preview...")
}

const openInNewTab = () => {
  // 在新窗口打开预览
  window.open("about:blank", "_blank")
}
</script>

<style scoped>
.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
}

.preview-frame {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: #f5f5f5;
}

.device-desktop .preview-content {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.device-tablet .preview-content {
  width: 768px;
  height: 1024px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.device-mobile .preview-content {
  width: 375px;
  height: 667px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-placeholder {
  padding: 40px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

.preview-placeholder h3 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.component-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  padding: 8px 16px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  font-size: 14px;
}
</style>
