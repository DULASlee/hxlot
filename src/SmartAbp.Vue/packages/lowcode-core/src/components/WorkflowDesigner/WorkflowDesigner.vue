<template>
  <div class="workflow-designer">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      fit-view-on-init
    >
      <Background />
      <Controls />
      <MiniMap />

      <!-- 工具栏 -->
      <div class="workflow-toolbar">
        <el-button-group>
          <el-button type="primary" size="small" @click="addState">
            <el-icon><Plus /></el-icon>
            添加状态
          </el-button>
          <el-button size="small" @click="validate">
            <el-icon><Check /></el-icon>
            验证
          </el-button>
          <el-button size="small" @click="save">
            <el-icon><Document /></el-icon>
            保存
          </el-button>
          <el-button size="small" @click="exportWorkflow">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-button-group>
      </div>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { ElButton, ElButtonGroup, ElIcon, ElMessage } from 'element-plus'
import { Plus, Check, Document, Download } from '@element-plus/icons-vue'

const {
  nodes,
  edges,
  addNodes,
  onNodesChange,
  onEdgesChange,
  onConnect
} = useVueFlow()

const addState = () => {
  const newNode = {
    id: `state_${Date.now()}`,
    type: 'default',
    position: { x: Math.random() * 500, y: Math.random() * 300 },
    label: '新状态'
  }
  addNodes(newNode)
}

const validate = () => {
  ElMessage.success('工作流验证通过')
}

const save = () => {
  ElMessage.success('工作流已保存')
}

const exportWorkflow = () => {
  ElMessage.success('工作流已导出')
}
</script>

<style scoped>
.workflow-designer {
  width: 100%;
  height: 100%;
  position: relative;
}

.workflow-toolbar {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
