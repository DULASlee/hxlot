<template>
  <div class="enhanced-state-machine">
    <el-container>
      <el-aside width="300px">
        <div class="toolbar">
          <el-button-group>
            <el-button
              type="primary"
              @click="addState"
            >
              添加状态
            </el-button>
            <el-button @click="addTransition">
              添加转换
            </el-button>
          </el-button-group>
        </div>
        <div class="state-list">
          <el-tag
            v-for="state in states"
            :key="state.id"
            closable
            @close="removeState(state.id)"
          >
            {{ state.label }}
          </el-tag>
        </div>
      </el-aside>
      <el-main>
        <div class="flow-container">
          <vue-flow
            :nodes="nodes"
            :edges="edges"
            @node-click="onNodeClick"
            @edge-click="onEdgeClick"
          >
            <template #node-custom="{ data }">
              <div
                class="custom-node"
                :class="{ 'active': data.active }"
              >
                {{ data.label }}
              </div>
            </template>
          </vue-flow>
        </div>
      </el-main>
    </el-container>

    <el-dialog
      v-model="stateDialogVisible"
      title="状态配置"
    >
      <el-form
        :model="currentState"
        label-width="80px"
      >
        <el-form-item label="状态名称">
          <el-input v-model="currentState.name" />
        </el-form-item>
        <el-form-item label="状态类型">
          <el-select v-model="currentState.type">
            <el-option
              label="初始状态"
              value="initial"
            />
            <el-option
              label="中间状态"
              value="normal"
            />
            <el-option
              label="结束状态"
              value="final"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stateDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="saveState"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { useEnhancedStateMachineStore } from '../../stores/lowcode/enhancedStateMachine'

const store = useEnhancedStateMachineStore()

// 响应式数据
const stateDialogVisible = ref(false)
const currentState = reactive({
  id: '',
  name: '',
  type: 'normal'
})

// 计算属性
const states = computed(() => store.states)
const transitions = computed(() => store.transitions)

// 转换为 vue-flow 格式
const nodes = computed(() =>
  states.value.map(state => ({
    id: state.id,
    type: 'default',
    position: state.position,
    data: { label: state.label, active: false }
  }))
)

const edges = computed(() =>
  transitions.value.map(transition => ({
    id: transition.id,
    source: transition.source,
    target: transition.target,
    label: transition.label || ''
  }))
)

// 方法
const addState = () => {
  currentState.id = ''
  currentState.name = ''
  currentState.type = 'normal'
  stateDialogVisible.value = true
}

const removeState = (id: string) => {
  store.removeState(id)
}

const addTransition = () => {
  // 简化版本：添加一个示例转换（需要选择源状态和目标状态）
  const sourceState = states.value[0]
  const targetState = states.value[1]

  if (sourceState && targetState) {
    store.addTransition({
      id: `${sourceState.id}-${targetState.id}`,
      source: sourceState.id,
      target: targetState.id,
      label: '转换'
    })
  }
}

const onNodeClick = (event: any) => {
  const node = event.node
  // TODO: 实现状态激活逻辑
  console.log('Node clicked:', node.id)
}

const onEdgeClick = (event: any) => {
  // 处理边点击事件
  console.log('Edge clicked:', event.edge)
}

const saveState = () => {
  if (currentState.id) {
    store.updateState(currentState.id, {
      label: currentState.name,
      type: currentState.type as "start" | "intermediate" | "end"
    })
  } else {
    store.addState({
      id: Date.now().toString(),
      type: currentState.type as "start" | "intermediate" | "end",
      label: currentState.name,
      position: { x: Math.random() * 400, y: Math.random() * 300 }
    })
  }
  stateDialogVisible.value = false
}
</script>

<style scoped>
.enhanced-state-machine {
  height: 600px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.toolbar {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.state-list {
  padding: 10px;
}

.state-list .el-tag {
  margin: 5px;
}

.flow-container {
  height: 100%;
}

.custom-node {
  padding: 10px;
  border: 2px solid #409eff;
  border-radius: 8px;
  background: white;
  min-width: 100px;
  text-align: center;
}

.custom-node.active {
  border-color: #f56c6c;
  background: #fef0f0;
}
</style>
