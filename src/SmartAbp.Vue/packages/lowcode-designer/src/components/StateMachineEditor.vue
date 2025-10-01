<template>
  <div class="state-machine-editor">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      fit-view-on-init
    >
      <Background />
      <Controls />
    </VueFlow>
    <div class="controls">
      <el-input
        v-model="newNodeLabel"
        placeholder="New state label"
      />
      <el-button @click="addNode">
        Add State
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { VueFlow, useVueFlow } from "@vue-flow/core"
// import { Background } from "@vue-flow/background"
// import { Controls } from "@vue-flow/controls"
import { ElButton, ElInput } from "element-plus"
// import statemachine from '@smartabp/lowcode-core' // 重复导入已注释

// Import Vue Flow CSS
import "@vue-flow/core/dist/style.css"
import "@vue-flow/core/dist/theme-default.css"
import "@vue-flow/controls/dist/style.css"
// Note: @vue-flow/background CSS handled via component import

// const store = useStateMachineStore() // Store暂时不可用
const { addNodes: addFlowNodes } = useVueFlow()

const nodes = ref<any[]>([])
const edges = ref([])

const newNodeLabel = ref("")

const addNode = () => {
  if (!newNodeLabel.value) return
  const newNode: any = { // StateNode类型暂时不可用
    id: `node-${Date.now()}`,
    type: "default",
    label: newNodeLabel.value,
    position: { x: Math.random() * 250, y: Math.random() * 250 },
  }
  nodes.value.push(newNode)
  addFlowNodes([newNode])
  newNodeLabel.value = ""
}
</script>

<style scoped>
.state-machine-editor {
  height: 500px;
  width: 100%;
  border: 1px solid #ddd;
}
.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
}
</style>
