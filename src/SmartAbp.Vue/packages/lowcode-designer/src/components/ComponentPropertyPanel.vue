<template>
  <div class="component-property-panel">
    <div class="panel-header">
      <h3>{{ title }}</h3>
      <el-button
        text
        icon="el-icon-close"
        @click="handleClose"
      />
    </div>

    <el-divider />

    <div
      v-if="!selectedComponent"
      class="empty-state"
    >
      <el-empty
        description="请选择一个组件"
        :image-size="80"
      />
    </div>

    <div
      v-else
      class="panel-content"
    >
      <!-- 基本信息 -->
      <div class="info-section">
        <h4>基本信息</h4>
        <el-descriptions
          :column="1"
          border
          size="small"
        >
          <el-descriptions-item label="组件ID">
            {{ selectedComponent.id }}
          </el-descriptions-item>
          <el-descriptions-item label="组件类型">
            {{ selectedComponent.type }}
          </el-descriptions-item>
          <el-descriptions-item label="组件名称">
            {{ selectedComponent.name }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 属性编辑 -->
      <div class="properties-section">
        <h4>属性配置</h4>
        <el-form
          label-width="100px"
          size="small"
        >
          <el-form-item
            v-for="prop in componentProperties"
            :key="prop.name"
            :label="prop.label"
          >
            <!-- 字符串输入 -->
            <el-input
              v-if="prop.type === 'string'"
              v-model="prop.value"
              :placeholder="`请输入${prop.label}`"
              @change="handlePropertyChange(prop.name, prop.value)"
            />

            <!-- 数字输入 -->
            <el-input-number
              v-else-if="prop.type === 'number'"
              v-model="prop.value"
              :min="0"
              :max="10000"
              @change="handlePropertyChange(prop.name, prop.value)"
            />

            <!-- 布尔开关 -->
            <el-switch
              v-else-if="prop.type === 'boolean'"
              v-model="prop.value"
              @change="handlePropertyChange(prop.name, prop.value)"
            />

            <!-- 颜色选择 -->
            <el-color-picker
              v-else-if="prop.type === 'color'"
              v-model="prop.value"
              @change="handlePropertyChange(prop.name, prop.value)"
            />

            <!-- 下拉选择 -->
            <el-select
              v-else-if="prop.type === 'select'"
              v-model="prop.value"
              @change="handlePropertyChange(prop.name, prop.value)"
            >
              <el-option
                v-for="option in prop.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <!-- JSON编辑 -->
            <el-input
              v-else-if="prop.type === 'json'"
              v-model="prop.value"
              type="textarea"
              :rows="3"
              placeholder="请输入JSON格式数据"
              @change="handlePropertyChange(prop.name, prop.value)"
            />

            <span
              v-if="prop.description"
              class="property-description"
            >
              {{ prop.description }}
            </span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 样式编辑 -->
      <div class="style-section">
        <h4>样式配置</h4>
        <el-form
          label-width="100px"
          size="small"
        >
          <el-form-item label="位置">
            <el-select
              v-model="componentStyle.position"
              size="small"
            >
              <el-option
                label="绝对定位"
                value="absolute"
              />
              <el-option
                label="相对定位"
                value="relative"
              />
              <el-option
                label="固定定位"
                value="fixed"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="左边距">
            <el-input
              v-model="componentStyle.left"
              placeholder="如: 100px"
              @change="handleStyleChange"
            />
          </el-form-item>

          <el-form-item label="上边距">
            <el-input
              v-model="componentStyle.top"
              placeholder="如: 100px"
              @change="handleStyleChange"
            />
          </el-form-item>

          <el-form-item label="宽度">
            <el-input
              v-model="componentStyle.width"
              placeholder="如: 200px"
              @change="handleStyleChange"
            />
          </el-form-item>

          <el-form-item label="高度">
            <el-input
              v-model="componentStyle.height"
              placeholder="如: 100px"
              @change="handleStyleChange"
            />
          </el-form-item>

          <el-form-item label="背景色">
            <el-color-picker
              v-model="componentStyle.backgroundColor"
              @change="handleStyleChange"
            />
          </el-form-item>

          <el-form-item label="边框">
            <el-input
              v-model="componentStyle.border"
              placeholder="如: 1px solid #ddd"
              @change="handleStyleChange"
            />
          </el-form-item>

          <el-form-item label="圆角">
            <el-input
              v-model="componentStyle.borderRadius"
              placeholder="如: 4px"
              @change="handleStyleChange"
            />
          </el-form-item>

          <el-form-item label="内边距">
            <el-input
              v-model="componentStyle.padding"
              placeholder="如: 16px"
              @change="handleStyleChange"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="handleApply"
        >
          应用
        </el-button>
        <el-button
          icon="el-icon-refresh"
          @click="handleReset"
        >
          重置
        </el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="handleDelete"
        >
          删除组件
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, watch } from 'vue'
import type { CanvasComponent, ComponentProperty } from '../types/designer'

// Props
interface Props {
  selectedComponent?: CanvasComponent | null
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '组件属性'
})

// Emits
const emit = defineEmits<{
  'close': []
  'update:component': [component: CanvasComponent]
  'delete:component': [componentId: string]
}>()

// 组件属性（基于组件类型动态生成）
const componentProperties = ref<ComponentProperty[]>([])

// 组件样式
const componentStyle = ref({
  position: 'absolute',
  left: '0px',
  top: '0px',
  width: '200px',
  height: '100px',
  backgroundColor: '',
  border: '',
  borderRadius: '',
  padding: ''
})

// 监听选中组件变化
watch(
  () => props.selectedComponent,
  (newComponent) => {
    if (newComponent) {
      // 初始化属性列表
      initComponentProperties(newComponent)
      
      // 初始化样式
      Object.assign(componentStyle.value, newComponent.style)
    }
  },
  { immediate: true, deep: true }
)

// 初始化组件属性
const initComponentProperties = (component: CanvasComponent) => {
  // 根据组件类型生成不同的属性列表
  const propertiesByType: Record<string, ComponentProperty[]> = {
    'el-button': [
      { name: 'text', label: '按钮文字', type: 'string', value: component.props.text || '按钮' },
      { name: 'type', label: '按钮类型', type: 'select', value: component.props.type || 'default',
        options: [
          { label: '默认', value: 'default' },
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' }
        ]
      },
      { name: 'size', label: '尺寸', type: 'select', value: component.props.size || 'default',
        options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' }
        ]
      },
      { name: 'disabled', label: '禁用', type: 'boolean', value: component.props.disabled || false }
    ],
    'el-input': [
      { name: 'placeholder', label: '占位文字', type: 'string', value: component.props.placeholder || '请输入' },
      { name: 'clearable', label: '可清空', type: 'boolean', value: component.props.clearable || false },
      { name: 'disabled', label: '禁用', type: 'boolean', value: component.props.disabled || false },
      { name: 'maxlength', label: '最大长度', type: 'number', value: component.props.maxlength || 100 }
    ],
    'default': [
      { name: 'customProps', label: '自定义属性', type: 'json', value: JSON.stringify(component.props, null, 2) }
    ]
  }

  componentProperties.value = propertiesByType[component.type] || propertiesByType['default'] || []
}

// 处理属性变化
const handlePropertyChange = (propName: string, propValue: any) => {
  if (!props.selectedComponent) return
  
  const updatedComponent: import('../types/designer').CanvasComponent = {
    ...props.selectedComponent,
    props: {
      ...props.selectedComponent.props,
      [propName]: propValue
    }
  }
  
  emit('update:component', updatedComponent)
}

// 处理样式变化
const handleStyleChange = () => {
  if (!props.selectedComponent) return
  
  const base = props.selectedComponent.style
  const allowedPositions = new Set(['fixed', 'absolute', 'relative'])
  const currentPos = (componentStyle.value as { position?: string }).position ?? base.position
  const desired = String(currentPos)
  const pos = (allowedPositions.has(desired) ? desired : base.position) as 'fixed' | 'absolute' | 'relative'
  const next: import('../types/designer').CanvasComponentStyle = {
    position: pos,
    left: String(componentStyle.value.left ?? base.left ?? '0px'),
    top: String(componentStyle.value.top ?? base.top ?? '0px'),
    width: String(componentStyle.value.width ?? base.width ?? '100px'),
    height: String(componentStyle.value.height ?? base.height ?? '100px')
  }
  
  const updatedComponent: import('../types/designer').CanvasComponent = {
    ...props.selectedComponent,
    style: {
      ...base,
      ...next
    }
  }
  
  emit('update:component', updatedComponent)
}

// 应用更改
const handleApply = () => {
  ElMessage.success('属性已应用')
}

// 重置
const handleReset = () => {
  if (!props.selectedComponent) return
  initComponentProperties(props.selectedComponent)
  Object.assign(componentStyle.value, props.selectedComponent.style)
  ElMessage.info('已重置')
}

// 删除组件
const handleDelete = async () => {
  if (!props.selectedComponent) return
  
  try {
    await ElMessageBox.confirm('确定要删除该组件吗？', '提示', {
      type: 'warning'
    })
    
    emit('delete:component', props.selectedComponent.id)
    ElMessage.success('组件已删除')
  } catch {
    // 用户取消
  }
}

// 关闭面板
const handleClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.component-property-panel {
  width: 320px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .info-section,
    .properties-section,
    .style-section {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .property-description {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
    }

    .action-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
