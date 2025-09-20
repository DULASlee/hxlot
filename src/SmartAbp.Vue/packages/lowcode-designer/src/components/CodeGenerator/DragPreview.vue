<template>
  <div class="drag-preview-container">
    <!-- Global Drag Preview Portal -->
    <teleport to="body">
      <div
        v-if="isDragging"
        ref="dragPreview"
        class="drag-preview"
        :class="[previewType, dragState]"
        :style="previewStyle"
      >
        <div class="preview-content">
          <div class="preview-icon">
            <el-icon :color="iconColor">
              <component :is="icon" />
            </el-icon>
          </div>
          <div class="preview-text">
            <span class="preview-title">{{ title }}</span>
            <span class="preview-subtitle">{{ subtitle }}</span>
          </div>
        </div>
        
        <!-- Drop zone indicator -->
        <div
          v-if="showDropIndicator"
          class="drop-indicator"
        >
          <el-icon class="drop-icon">
            <Plus />
          </el-icon>
          <span>Drop here to add</span>
        </div>
      </div>
    </teleport>

    <!-- Drop zones highlighting -->
    <div
      v-for="zone in activeDropZones"
      :key="zone.id"
      class="drop-zone-highlight"
      :class="getDropZoneClass(zone)"
      :style="getDropZoneStyle(zone)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface DragPreviewProps {
  isDragging?: boolean
  dragItem?: any
  dragPosition?: { x: number; y: number }
  targetZone?: string
  previewType?: 'property' | 'component' | 'file' | 'default'
}

const props = withDefaults(defineProps<DragPreviewProps>(), {
  isDragging: false,
  previewType: 'default'
})

interface DropZone {
  id: string
  bounds: DOMRect
  isActive: boolean
  canAccept: boolean
}

// Reactive state
const dragPreview = ref<HTMLElement>()
const activeDropZones = ref<DropZone[]>([])
const mousePosition = ref({ x: 0, y: 0 })

// Computed properties
const dragState = computed(() => {
  if (!props.isDragging) return 'idle'
  if (props.targetZone) return 'over-target'
  return 'dragging'
})

const previewStyle = computed(() => ({
  left: `${mousePosition.value.x + 15}px`,
  top: `${mousePosition.value.y - 10}px`,
  opacity: props.isDragging ? '0.9' : '0',
  transform: props.isDragging ? 'scale(1)' : 'scale(0.8)',
  pointerEvents: 'none' as const
}))

const icon = computed(() => {
  if (!props.dragItem) return 'Document'
  
  switch (props.previewType) {
    case 'property':
      return getPropertyIcon(props.dragItem.type)
    case 'component':
      return 'Component'
    case 'file':
      return 'Document'
    default:
      return 'Box'
  }
})

const iconColor = computed(() => {
  switch (props.previewType) {
    case 'property':
      return getPropertyColor(props.dragItem?.type)
    case 'component':
      return '#67C23A'
    case 'file':
      return '#E6A23C'
    default:
      return '#409EFF'
  }
})

const title = computed(() => {
  if (!props.dragItem) return 'Dragging Item'
  
  switch (props.previewType) {
    case 'property':
      return props.dragItem.name || 'Property'
    case 'component':
      return props.dragItem.name || 'Component'
    case 'file':
      return props.dragItem.fileName || 'File'
    default:
      return props.dragItem.name || 'Item'
  }
})

const subtitle = computed(() => {
  if (!props.dragItem) return ''
  
  switch (props.previewType) {
    case 'property':
      return props.dragItem.type || 'Unknown Type'
    case 'component':
      return 'UI Component'
    case 'file':
      return 'Code File'
    default:
      return 'Drag Item'
  }
})

const showDropIndicator = computed(() => {
  return props.isDragging && props.targetZone
})

// Methods
const updateMousePosition = (event: MouseEvent) => {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

const getPropertyIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'string': 'Document',
    'int': 'Promotion',
    'decimal': 'Money',
    'bool': 'Switch',
    'DateTime': 'Calendar',
    'Guid': 'Key'
  }
  return iconMap[type] || 'Document'
}

const getPropertyColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'string': '#409EFF',
    'int': '#67C23A',
    'decimal': '#E6A23C',
    'bool': '#F56C6C',
    'DateTime': '#909399',
    'Guid': '#722ED1'
  }
  return colorMap[type] || '#409EFF'
}

const updateDropZones = () => {
  // Find all drop zones in the document
  const dropZoneElements = document.querySelectorAll('[data-drop-zone]')
  const zones: DropZone[] = []
  
  dropZoneElements.forEach((element) => {
    const rect = element.getBoundingClientRect()
    const zoneId = element.getAttribute('data-drop-zone')
    const canAccept = element.hasAttribute('data-can-accept')
    const isActive = element.classList.contains('drag-over')
    
    if (zoneId) {
      zones.push({
        id: zoneId,
        bounds: rect,
        isActive,
        canAccept
      })
    }
  })
  
  activeDropZones.value = zones
}

const getDropZoneClass = (zone: DropZone): string => {
  const classes = ['drop-zone-overlay']
  
  if (zone.isActive) classes.push('active')
  if (zone.canAccept) classes.push('can-accept')
  else classes.push('cannot-accept')
  
  return classes.join(' ')
}

const getDropZoneStyle = (zone: DropZone) => ({
  left: `${zone.bounds.left}px`,
  top: `${zone.bounds.top}px`,
  width: `${zone.bounds.width}px`,
  height: `${zone.bounds.height}px`
})

// Event listeners
onMounted(() => {
  document.addEventListener('mousemove', updateMousePosition)
  
  // Update drop zones periodically during drag
  const interval = setInterval(() => {
    if (props.isDragging) {
      updateDropZones()
    }
  }, 100)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', updateMousePosition)
})

// Watch for drag state changes
watch(() => props.isDragging, (isDragging) => {
  if (isDragging) {
    updateDropZones()
  } else {
    activeDropZones.value = []
  }
})
</script>

<style scoped>
.drag-preview-container {
  position: relative;
  pointer-events: none;
}

.drag-preview {
  position: fixed;
  z-index: 10000;
  background: white;
  border: 2px solid #409eff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  min-width: 180px;
  transition: all 0.2s ease;
  pointer-events: none;
  user-select: none;
}

.drag-preview.idle {
  opacity: 0;
  transform: scale(0.8);
}

.drag-preview.dragging {
  opacity: 0.9;
  transform: scale(1);
}

.drag-preview.over-target {
  opacity: 1;
  transform: scale(1.05);
  border-color: #67c23a;
  box-shadow: 0 8px 24px rgba(103, 194, 58, 0.3);
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(64, 158, 255, 0.1);
}

.preview-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.preview-subtitle {
  color: #909399;
  font-size: 12px;
}

.drop-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
  color: #67c23a;
  font-size: 12px;
  font-weight: 500;
}

.drop-icon {
  font-size: 14px;
}

/* Drop zone highlighting */
.drop-zone-overlay {
  position: fixed;
  border: 2px dashed transparent;
  border-radius: 6px;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.2s ease;
}

.drop-zone-overlay.can-accept {
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.05);
}

.drop-zone-overlay.cannot-accept {
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.05);
}

.drop-zone-overlay.active {
  border-style: solid;
  border-width: 3px;
}

.drop-zone-overlay.active.can-accept {
  background: rgba(103, 194, 58, 0.1);
  box-shadow: inset 0 0 20px rgba(103, 194, 58, 0.2);
}

.drop-zone-overlay.active.cannot-accept {
  background: rgba(245, 108, 108, 0.1);
  box-shadow: inset 0 0 20px rgba(245, 108, 108, 0.2);
}

/* Different preview types */
.drag-preview.property {
  border-color: #409eff;
}

.drag-preview.component {
  border-color: #67c23a;
}

.drag-preview.file {
  border-color: #e6a23c;
}

.drag-preview.property.over-target {
  border-color: #409eff;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
}

.drag-preview.component.over-target {
  border-color: #67c23a;
  box-shadow: 0 8px 24px rgba(103, 194, 58, 0.3);
}

.drag-preview.file.over-target {
  border-color: #e6a23c;
  box-shadow: 0 8px 24px rgba(230, 162, 60, 0.3);
}
</style>