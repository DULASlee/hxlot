<template>
  <div class="rule-toolbox">
    <!-- 工具箱标题 -->
    <div class="toolbox-header">
      <el-icon>
        <Grid />
      </el-icon>
      <span>节点工具箱</span>
    </div>

    <!-- 搜索框 -->
    <div class="toolbox-search">
      <el-input v-model="searchText" placeholder="搜索节点..." size="small" clearable>
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 节点分类 -->
    <div class="toolbox-categories">
      <el-collapse v-model="activeCategories" accordion>
        <!-- 基础节点 -->
        <el-collapse-item name="basic" title="基础节点">
          <div class="node-templates">
            <div v-for="template in filteredTemplates.basic" :key="template.type" class="node-template" draggable="true"
              @dragstart="onDragStart($event, template)" @click="onTemplateClick(template)">
              <div class="template-icon" :style="{ color: template.color }">
                <component :is="template.iconComponent" />
              </div>
              <div class="template-info">
                <div class="template-label">{{ template.label }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>
          </div>
        </el-collapse-item>

        <!-- 流程控制 -->
        <el-collapse-item name="control" title="流程控制">
          <div class="node-templates">
            <div v-for="template in filteredTemplates.control" :key="template.type" class="node-template"
              draggable="true" @dragstart="onDragStart($event, template)" @click="onTemplateClick(template)">
              <div class="template-icon" :style="{ color: template.color }">
                <component :is="template.iconComponent" />
              </div>
              <div class="template-info">
                <div class="template-label">{{ template.label }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>
          </div>
        </el-collapse-item>

        <!-- 业务规则 -->
        <el-collapse-item name="business" title="业务规则">
          <div class="node-templates">
            <div v-for="template in filteredTemplates.business" :key="template.type" class="node-template"
              draggable="true" @dragstart="onDragStart($event, template)" @click="onTemplateClick(template)">
              <div class="template-icon" :style="{ color: template.color }">
                <component :is="template.iconComponent" />
              </div>
              <div class="template-info">
                <div class="template-label">{{ template.label }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 使用提示 -->
    <div class="toolbox-tips">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>
          <span style="font-size: 12px;">拖拽或点击添加节点</span>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  Grid,
  Operation,
  Search,
  Setting, Share,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { ElAlert, ElCollapse, ElCollapseItem, ElIcon, ElInput } from 'element-plus'
import { computed, ref } from 'vue'
import type { NodeTemplate } from './types'

const logger = getGlobalLogger()

// Props & Emits
const emit = defineEmits<{
  (e: 'add-node', template: NodeTemplate): void
}>()

// 状态
const searchText = ref('')
const activeCategories = ref<string>('basic')

// 节点模板定义
const nodeTemplates: Record<string, NodeTemplate[]> = {
  basic: [
    {
      type: 'start',
      label: '开始',
      icon: 'VideoPlay',
      iconComponent: VideoPlay,
      description: '流程开始节点',
      color: '#909399',
      defaultData: {
        label: '开始',
        type: 'start'
      }
    },
    {
      type: 'end',
      label: '结束',
      icon: 'VideoPause',
      iconComponent: VideoPause,
      description: '流程结束节点',
      color: '#f56c6c',
      defaultData: {
        label: '结束',
        type: 'end'
      }
    }
  ],
  control: [
    {
      type: 'condition',
      label: '条件判断',
      icon: 'Share',
      iconComponent: Share,
      description: '根据条件分支',
      color: '#409eff',
      defaultData: {
        label: '条件判断',
        type: 'condition',
        expression: 'entity.status == "approved"'
      }
    },
    {
      type: 'decision',
      label: '多路分支',
      icon: 'Operation',
      iconComponent: Operation,
      description: '多条件分支决策',
      color: '#e6a23c',
      defaultData: {
        label: '多路分支',
        type: 'decision',
        branches: []
      }
    }
  ],
  business: [
    {
      type: 'action',
      label: '执行动作',
      icon: 'Setting',
      iconComponent: Setting,
      description: '执行业务动作',
      color: '#67c23a',
      defaultData: {
        label: '执行动作',
        type: 'action',
        actionType: 'SetFieldValue',
        actionParams: {
          actionType: 'SetFieldValue',
          field: '',
          value: ''
        }
      }
    },
    {
      type: 'action',
      label: '字段验证',
      icon: 'Check',
      iconComponent: Check,
      description: '验证字段值',
      color: '#67c23a',
      defaultData: {
        label: '字段验证',
        type: 'action',
        actionType: 'ValidateField',
        actionParams: {
          actionType: 'ValidateField',
          field: '',
          rules: ['required']
        }
      }
    }
  ]
}

// 计算属性：过滤后的模板
const filteredTemplates = computed(() => {
  if (!searchText.value) {
    return nodeTemplates
  }

  const keyword = searchText.value.toLowerCase()
  const result: Record<string, NodeTemplate[]> = {
    basic: [],
    control: [],
    business: []
  }

  Object.entries(nodeTemplates).forEach(([category, templates]) => {
    result[category] = templates.filter(
      t => t.label.toLowerCase().includes(keyword) ||
        t.description.toLowerCase().includes(keyword)
    )
  })

  return result
})

/**
 * 拖拽开始事件
 */
const onDragStart = (event: DragEvent, template: NodeTemplate) => {
  if (!event.dataTransfer) return

  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/vueflow', JSON.stringify(template))

  logger.debug('🎯 开始拖拽节点模板', { type: template.type })
}

/**
 * 模板点击事件
 */
const onTemplateClick = (template: NodeTemplate) => {
  emit('add-node', template)
  logger.info('➕ 添加节点', { type: template.type, label: template.label })
}
</script>

<style scoped>
.rule-toolbox {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  overflow: hidden;
}

.toolbox-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
}

.toolbox-search {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbox-categories {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.node-templates {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px;
}

.node-template {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.node-template:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.node-template:active {
  cursor: grabbing;
}

.template-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
  background-color: #fff;
  border-radius: 6px;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbox-tips {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

/* 折叠面板样式覆盖 */
:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  background-color: #f5f7fa;
  border: none;
}

:deep(.el-collapse-item__wrap) {
  border: none;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

/* 滚动条样式 */
.toolbox-categories::-webkit-scrollbar {
  width: 6px;
}

.toolbox-categories::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.toolbox-categories::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}
</style>
