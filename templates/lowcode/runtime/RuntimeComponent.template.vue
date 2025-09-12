<!-- 
AI_TEMPLATE_INFO:
模板类型: 低代码引擎运行时组件
适用场景: 创建可在低代码引擎中运行的Vue组件
依赖项: Vue 3, SmartAbp低代码运行时
权限要求: 无
生成规则:
  - ComponentName: 组件名称（PascalCase）
  - componentName: 组件名称（camelCase）
  - ComponentDescription: 组件描述
  - ComponentCategory: 组件分类
-->

<template>
  <div 
    :class="[
      '{{componentName}}-runtime-component',
      `{{componentName}}--${variant}`,
      { '{{componentName}}--disabled': disabled }
    ]"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <!-- 组件内容区域 -->
    <div class="{{componentName}}__content">
      <!-- 如果有插槽内容，显示插槽 -->
      <slot v-if="$slots.default" />
      
      <!-- 否则显示默认内容 -->
      <div v-else class="{{componentName}}__default-content">
        <h3 class="{{componentName}}__title">{{ title || '{{ComponentDescription}}' }}</h3>
        <p class="{{componentName}}__description">{{ description }}</p>
        
        <!-- 动态渲染子组件 -->
        <div 
          v-for="(child, index) in children" 
          :key="child.id || index"
          class="{{componentName}}__child"
        >
          <component 
            :is="child.component"
            v-bind="child.props"
            v-on="child.events"
          />
        </div>
      </div>
    </div>

    <!-- 编辑模式下的操作按钮 -->
    <div 
      v-if="isEditMode" 
      class="{{componentName}}__edit-controls"
    >
      <el-button 
        size="small" 
        type="primary" 
        @click="handleEdit"
      >
        编辑
      </el-button>
      <el-button 
        size="small" 
        type="danger" 
        @click="handleDelete"
      >
        删除
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElButton } from 'element-plus'
import { 
  RuntimeComponentProps, 
  RuntimeComponentEmits,
  LowCodeRuntimeContext 
} from '@/lowcode/types'

/**
 * 组件属性定义
 */
interface Props extends RuntimeComponentProps {
  // 基础属性
  title?: string
  description?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  
  // 样式属性
  width?: string | number
  height?: string | number
  backgroundColor?: string
  textColor?: string
  
  // 子组件
  children?: Array<{
    id?: string
    component: string
    props?: Record<string, any>
    events?: Record<string, Function>
  }>
  
  // 数据绑定
  dataSource?: any
  dataBinding?: Record<string, string>
  
  // 事件配置
  eventHandlers?: Record<string, string | Function>
}

/**
 * 组件事件定义
 */
interface Emits extends RuntimeComponentEmits {
  (e: 'edit', componentId: string): void
  (e: 'delete', componentId: string): void
  (e: 'data-change', data: any): void
  (e: 'interaction', event: string, data?: any): void
}

// 定义属性和事件
const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false,
  title: '',
  description: '',
  children: () => [],
  dataSource: null,
  dataBinding: () => ({}),
  eventHandlers: () => ({})
})

const emit = defineEmits<Emits>()

// 注入运行时上下文
const runtimeContext = inject<LowCodeRuntimeContext>('lowcode-runtime-context')
const isEditMode = computed(() => runtimeContext?.mode === 'edit')

// 响应式数据
const componentData = ref<any>(null)

// 计算属性
const computedStyle = computed(() => {
  const style: Record<string, any> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  }
  
  if (props.textColor) {
    style.color = props.textColor
  }
  
  return style
})

// 监听数据源变化
watch(
  () => props.dataSource,
  (newDataSource) => {
    if (newDataSource) {
      updateComponentData(newDataSource)
    }
  },
  { immediate: true, deep: true }
)

// 监听数据绑定变化
watch(
  () => props.dataBinding,
  (newBinding) => {
    if (newBinding && props.dataSource) {
      updateComponentData(props.dataSource)
    }
  },
  { deep: true }
)

/**
 * 更新组件数据
 * @param dataSource 数据源
 */
function updateComponentData(dataSource: any) {
  if (!dataSource || !props.dataBinding) {
    componentData.value = dataSource
    return
  }

  const boundData: Record<string, any> = {}
  
  Object.entries(props.dataBinding).forEach(([key, path]) => {
    boundData[key] = getValueByPath(dataSource, path)
  })
  
  componentData.value = boundData
  emit('data-change', boundData)
}

/**
 * 根据路径获取对象值
 * @param obj 对象
 * @param path 路径（如：'user.name'）
 */
function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * 处理编辑事件
 */
function handleEdit() {
  if (props.componentId) {
    emit('edit', props.componentId)
  }
}

/**
 * 处理删除事件
 */
function handleDelete() {
  if (props.componentId) {
    emit('delete', props.componentId)
  }
}

/**
 * 处理用户交互事件
 * @param eventName 事件名称
 * @param eventData 事件数据
 */
function handleInteraction(eventName: string, eventData?: any) {
  // 执行配置的事件处理器
  const handler = props.eventHandlers?.[eventName]
  if (handler) {
    if (typeof handler === 'function') {
      handler(eventData)
    } else if (typeof handler === 'string' && runtimeContext) {
      // 执行字符串形式的事件处理器（如：JavaScript代码）
      runtimeContext.executeScript(handler, { 
        event: eventName, 
        data: eventData,
        component: componentData.value 
      })
    }
  }
  
  // 发出交互事件
  emit('interaction', eventName, eventData)
}

// 生命周期钩子
onMounted(() => {
  // 组件挂载后的初始化逻辑
  if (runtimeContext) {
    runtimeContext.registerComponent(props.componentId, {
      type: '{{componentName}}',
      instance: getCurrentInstance(),
      data: componentData.value
    })
  }
})

onUnmounted(() => {
  // 组件卸载时的清理逻辑
  if (runtimeContext && props.componentId) {
    runtimeContext.unregisterComponent(props.componentId)
  }
})

// 暴露给父组件的方法和数据
defineExpose({
  componentData,
  updateData: updateComponentData,
  handleInteraction
})
</script>

<style scoped>
.{{componentName}}-runtime-component {
  position: relative;
  display: block;
  box-sizing: border-box;
}

.{{componentName}}--default {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);
}

.{{componentName}}--primary {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.{{componentName}}--success {
  border-color: var(--el-color-success);
  background-color: var(--el-color-success-light-9);
}

.{{componentName}}--warning {
  border-color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-9);
}

.{{componentName}}--danger {
  border-color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-9);
}

.{{componentName}}--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.{{componentName}}__content {
  padding: 16px;
}

.{{componentName}}__default-content {
  text-align: center;
}

.{{componentName}}__title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.{{componentName}}__description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.{{componentName}}__child {
  margin-bottom: 12px;
}

.{{componentName}}__child:last-child {
  margin-bottom: 0;
}

.{{componentName}}__edit-controls {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.{{componentName}}-runtime-component:hover .{{componentName}}__edit-controls {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .{{componentName}}__content {
    padding: 12px;
  }
  
  .{{componentName}}__title {
    font-size: 14px;
  }
  
  .{{componentName}}__description {
    font-size: 12px;
  }
}
</style>