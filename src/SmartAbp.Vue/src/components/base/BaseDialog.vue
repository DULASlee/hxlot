<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="modelValue" class="base-dialog__wrapper" @click.self="handleMaskClick">
        <div :class="dialogClasses" :style="dialogStyles">
          <div class="base-dialog__header">
            <slot name="header">
              <h3 class="base-dialog__title">{{ title }}</h3>
            </slot>
            <button
              v-if="showClose"
              class="base-dialog__close"
              @click="handleClose"
            >
              <i class="el-icon-close"></i>
            </button>
          </div>
          
          <div class="base-dialog__body">
            <slot></slot>
          </div>
          
          <div v-if="hasFooter" class="base-dialog__footer">
            <slot name="footer">
              <BaseButton @click="handleClose">取消</BaseButton>
              <BaseButton type="primary" :loading="confirmLoading" @click="handleConfirm">
                确定
              </BaseButton>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useSlots, watch } from 'vue'
import BaseButton from './BaseButton.vue'

/**
 * BaseDialog - 基础对话框组件
 * 统一的对话框样式和交互
 */

interface Props {
  /**
   * 是否显示
   */
  modelValue: boolean
  
  /**
   * 对话框标题
   */
  title?: string
  
  /**
   * 对话框宽度
   */
  width?: string
  
  /**
   * 是否显示关闭按钮
   */
  showClose?: boolean
  
  /**
   * 是否点击遮罩关闭
   */
  closeOnClickMask?: boolean
  
  /**
   * 是否在按下ESC键时关闭
   */
  closeOnPressEscape?: boolean
  
  /**
   * 确认按钮loading状态
   */
  confirmLoading?: boolean
  
  /**
   * 是否居中
   */
  center?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '50%',
  showClose: true,
  closeOnClickMask: true,
  closeOnPressEscape: true,
  confirmLoading: false,
  center: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: []
}>()

const slots = useSlots()

const hasFooter = computed(() => {
  return !!slots.footer || true // 默认显示footer
})

const dialogClasses = computed(() => {
  return [
    'base-dialog',
    {
      'base-dialog--center': props.center
    }
  ]
})

const dialogStyles = computed(() => {
  return {
    width: props.width
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

const handleMaskClick = () => {
  if (props.closeOnClickMask) {
    handleClose()
  }
}

// ESC键关闭
watch(() => props.modelValue, (visible) => {
  if (visible && props.closeOnPressEscape) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
  }
})
</script>

<style scoped>
.base-dialog__wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.base-dialog {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.base-dialog--center .base-dialog__body {
  text-align: center;
}

.base-dialog__header {
  position: relative;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.base-dialog__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.base-dialog__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  color: #909399;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-dialog__close:hover {
  background-color: #f5f7fa;
  color: #606266;
}

.base-dialog__body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.base-dialog__footer {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* 动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .base-dialog,
.dialog-leave-active .base-dialog {
  transition: transform 0.3s ease;
}

.dialog-enter-from .base-dialog,
.dialog-leave-to .base-dialog {
  transform: scale(0.9);
}
</style>
