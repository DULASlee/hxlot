<!--
🎨 SmartAbp 图标风格选择器组件
🎯 提供可视化的图标风格切换界面
⚡ 支持实时预览和一键切换
🏢 企业级图标管理体验
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="🎨 选择图标风格"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="icon-style-selector">
      <!-- 当前风格显示 -->
      <el-alert
        :title="`当前风格: ${iconStyleStore.styleConfig.name}`"
        type="info"
        :closable="false"
        class="current-style-alert"
      >
        <template #default>
          <div class="current-style-info">
            <span class="style-icon">{{ getCurrentStylePreview() }}</span>
            <span class="style-desc">{{ iconStyleStore.styleConfig.description }}</span>
          </div>
        </template>
      </el-alert>

      <!-- 风格选择列表 -->
      <div class="style-list">
        <div
          v-for="style in iconStyleStore.availableStyles"
          :key="style.id"
          class="style-card"
          :class="{
            active: iconStyleStore.currentStyle === style.id,
            enterprise: style.enterprise
          }"
          @click="selectStyle(style.id)"
        >
          <!-- 风格预览 -->
          <div class="style-preview">
            <div
              v-if="style.id === 'emoji'"
              class="preview-icon emoji-preview"
            >
              {{ style.preview }}
            </div>
            <div
              v-else
              class="preview-icon"
            >
              <i :class="style.preview" />
            </div>
          </div>

          <!-- 风格信息 -->
          <div class="style-info">
            <h3 class="style-name">
              {{ style.name }}
              <el-tag
                v-if="style.enterprise"
                size="small"
                type="success"
              >
                企业级
              </el-tag>
            </h3>
            <p class="style-description">
              {{ style.description }}
            </p>
          </div>

          <!-- 当前风格标记 -->
          <div
            v-if="iconStyleStore.currentStyle === style.id"
            class="active-badge"
          >
            <el-icon><SuccessFilled /></el-icon>
            <span>当前使用</span>
          </div>

          <!-- 预览图标组 -->
          <div class="icon-samples">
            <span class="sample-label">示例：</span>
            <div class="sample-icons">
              <template v-if="style.id === 'emoji'">
                <span>📊</span>
                <span>👥</span>
                <span>⚙️</span>
                <span>📁</span>
              </template>
              <template v-else>
                <i :class="getIconForStyle(style.id, 'dashboard')" />
                <i :class="getIconForStyle(style.id, 'users')" />
                <i :class="getIconForStyle(style.id, 'settings')" />
                <i :class="getIconForStyle(style.id, 'project')" />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <el-alert
        title="💡 提示"
        type="warning"
        :closable="false"
        class="tips-alert"
      >
        <ul class="tips-list">
          <li>✅ 企业级图标风格更专业、更统一</li>
          <li>⚡ 切换后将立即应用到所有菜单和按钮</li>
          <li>💾 您的选择将自动保存</li>
        </ul>
      </el-alert>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="iconStyleStore.isChanging"
          @click="confirmChange"
        >
          确认切换
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { SuccessFilled } from '@element-plus/icons-vue'
import { useIconStyleStore } from '@/stores'
import type { IconStyleType } from '@/stores'

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'change': [style: IconStyleType]
}>()

// Store
const iconStyleStore = useIconStyleStore()

// 状态
const dialogVisible = ref(props.modelValue)
const selectedStyle = ref<IconStyleType>(iconStyleStore.currentStyle)

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 获取当前风格预览
const getCurrentStylePreview = () => {
  if (iconStyleStore.currentStyle === 'emoji') {
    return iconStyleStore.styleConfig.preview
  }
  return ''
}

// 选择风格
const selectStyle = (style: IconStyleType) => {
  selectedStyle.value = style
}

// 获取指定风格的图标类名
const getIconForStyle = (style: IconStyleType, iconKey: string): string => {
  // 临时切换到指定风格获取图标
  const originalStyle = iconStyleStore.currentStyle
  iconStyleStore.currentStyle = style
  const icon = iconStyleStore.getIcon(iconKey)
  iconStyleStore.currentStyle = originalStyle
  return icon
}

// 确认切换
const confirmChange = async () => {
  if (selectedStyle.value === iconStyleStore.currentStyle) {
    ElMessage.info('当前已是所选风格')
    dialogVisible.value = false
    return
  }

  try {
    await iconStyleStore.setIconStyle(selectedStyle.value)
    
    ElMessage.success({
      message: `✅ 图标风格已切换为: ${iconStyleStore.styleConfig.name}`,
      duration: 3000
    })
    
    emit('change', selectedStyle.value)
    
    // 刷新页面以应用新风格
    setTimeout(() => {
      window.location.reload()
    }, 500)
    
  } catch (error) {
    console.error('切换图标风格失败:', error)
    ElMessage.error('切换失败，请重试')
  }
}

// 关闭对话框
const handleClose = () => {
  selectedStyle.value = iconStyleStore.currentStyle
}
</script>

<script lang="ts">
import { watch } from 'vue'
export default {
  name: 'IconStyleSelector'
}
</script>

<style scoped lang="scss">
.icon-style-selector {
  .current-style-alert {
    margin-bottom: 20px;
  }

  .current-style-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;

    .style-icon {
      font-size: 24px;
    }

    .style-desc {
      color: var(--el-text-color-regular);
    }
  }

  .style-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .style-card {
    position: relative;
    border: 2px solid var(--el-border-color);
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--el-bg-color-page);

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
      transform: translateY(-2px);
    }

    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }

    &.enterprise {
      border-left: 4px solid var(--el-color-success);
    }

    .style-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
      margin-bottom: 16px;
      border-radius: 8px;
      background: var(--el-fill-color-light);

      .preview-icon {
        font-size: 48px;
        color: var(--el-color-primary);

        &.emoji-preview {
          font-size: 64px;
        }
      }
    }

    .style-info {
      margin-bottom: 16px;

      .style-name {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .style-description {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
        line-height: 1.6;
      }
    }

    .active-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: var(--el-color-primary);
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      .el-icon {
        font-size: 14px;
      }
    }

    .icon-samples {
      padding-top: 16px;
      border-top: 1px dashed var(--el-border-color);

      .sample-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-right: 8px;
      }

      .sample-icons {
        display: inline-flex;
        gap: 16px;
        align-items: center;
        font-size: 20px;
        color: var(--el-text-color-regular);

        span,
        i {
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }
  }

  .tips-alert {
    .tips-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      line-height: 1.8;

      li {
        margin: 4px 0;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .style-list {
    grid-template-columns: 1fr !important;
  }
}
</style>

