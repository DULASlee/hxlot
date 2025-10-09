<template>
  <div
    ref="canvasContainer"
    class="service-topology-canvas"
  >
    <div class="canvas-header">
      <h3 class="canvas-title">
        服务拓扑图
      </h3>
      <div class="canvas-controls">
        <el-button-group size="small">
          <el-button
            :icon="ZoomIn"
            @click="handleZoomIn"
          >
            放大
          </el-button>
          <el-button
            :icon="ZoomOut"
            @click="handleZoomOut"
          >
            缩小
          </el-button>
          <el-button
            :icon="RefreshRight"
            @click="handleReset"
          >
            重置
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div
      ref="canvasBody"
      class="canvas-body"
    >
      <svg
        :width="canvasWidth"
        :height="canvasHeight"
        class="topology-svg"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
      >
        <!-- 网格背景 -->
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="20"
              height="20"
              fill="none"
              stroke="#e4e7ed"
              stroke-width="0.5"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid)"
        />
        
        <!-- 基础设施服务 -->
        <g v-if="solutionConfig.usePostgreSQL || solutionConfig.useRedis || solutionConfig.useRabbitMQ">
          <text
            x="50"
            y="30"
            class="section-title"
          >基础设施</text>
          
          <!-- PostgreSQL -->
          <g
            v-if="solutionConfig.usePostgreSQL"
            transform="translate(50, 50)"
          >
            <rect
              width="120"
              height="60"
              rx="4"
              class="infra-node database"
            />
            <text
              x="60"
              y="30"
              class="node-label"
            >PostgreSQL</text>
            <text
              x="60"
              y="45"
              class="node-meta"
            >数据库</text>
          </g>
          
          <!-- Redis -->
          <g
            v-if="solutionConfig.useRedis"
            transform="translate(200, 50)"
          >
            <rect
              width="120"
              height="60"
              rx="4"
              class="infra-node cache"
            />
            <text
              x="60"
              y="30"
              class="node-label"
            >Redis</text>
            <text
              x="60"
              y="45"
              class="node-meta"
            >缓存</text>
          </g>
          
          <!-- RabbitMQ -->
          <g
            v-if="solutionConfig.useRabbitMQ"
            transform="translate(350, 50)"
          >
            <rect
              width="120"
              height="60"
              rx="4"
              class="infra-node messaging"
            />
            <text
              x="60"
              y="30"
              class="node-label"
            >RabbitMQ</text>
            <text
              x="60"
              y="45"
              class="node-meta"
            >消息队列</text>
          </g>
        </g>
        
        <!-- 微服务 -->
        <g v-if="microservices.length > 0">
          <text
            x="50"
            y="150"
            class="section-title"
          >微服务</text>
          
          <g
            v-for="(service, index) in microservices"
            :key="service.name"
            :transform="`translate(${50 + (index % 4) * 180}, ${180 + Math.floor(index / 4) * 100})`"
            class="service-node"
            :class="{ selected: selectedService?.name === service.name }"
            @click="$emit('select-service', service)"
          >
            <rect
              width="160"
              height="80"
              rx="6"
              class="service-rect"
            />
            <text
              x="80"
              y="30"
              class="service-name"
            >{{ service.displayName }}</text>
            <text
              x="80"
              y="50"
              class="service-project"
            >{{ service.projectName }}</text>
            <text
              x="80"
              y="65"
              class="service-replicas"
            >{{ service.replicas }}副本</text>
            
            <!-- 健康状态指示器 -->
            <circle
              v-if="service.useHealthChecks"
              cx="145"
              cy="15"
              r="5"
              class="health-indicator"
            />
          </g>
        </g>
        
        <!-- API Gateway -->
        <g
          v-if="solutionConfig.includeApiGateway"
          transform="translate(50, 400)"
        >
          <rect
            width="180"
            height="70"
            rx="6"
            class="gateway-node"
          />
          <text
            x="90"
            y="30"
            class="node-label"
          >API Gateway</text>
          <text
            x="90"
            y="50"
            class="node-meta"
          >统一入口</text>
        </g>
        
        <!-- 空状态 -->
        <g v-if="microservices.length === 0">
          <text
            x="300"
            y="250"
            class="empty-text"
          >暂无微服务</text>
          <text
            x="260"
            y="280"
            class="empty-hint"
          >点击左侧添加按钮开始设计</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ZoomIn, ZoomOut, RefreshRight } from '@element-plus/icons-vue'

interface Props {
  microservices: any[]
  solutionConfig: any
  selectedService: any
}

defineProps<Props>()
const emit = defineEmits(['select-service', 'add-service'])

// 状态
const canvasContainer = ref<HTMLElement>()
const canvasBody = ref<HTMLElement>()
const canvasWidth = ref(800)
const canvasHeight = ref(600)
const zoom = ref(1)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

// 方法：缩放控制
const handleZoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

const handleZoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
}

const handleReset = () => {
  zoom.value = 1
}

// 方法：画布拖动
const handleCanvasMouseDown = (e: MouseEvent) => {
  isPanning.value = true
  panStart.value = { x: e.clientX, y: e.clientY }
}

const handleCanvasMouseMove = (_e: MouseEvent) => {
  if (!isPanning.value) return
  // 实现拖动逻辑
}

const handleCanvasMouseUp = () => {
  isPanning.value = false
}

// 生命周期：调整画布大小
const handleResize = () => {
  if (canvasBody.value) {
    canvasWidth.value = canvasBody.value.clientWidth
    canvasHeight.value = canvasBody.value.clientHeight
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.service-topology-canvas {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .canvas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    .canvas-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .canvas-body {
    flex: 1;
    overflow: auto;
    
    .topology-svg {
      display: block;
      
      .section-title {
        fill: #606266;
        font-size: 14px;
        font-weight: 600;
        text-anchor: start;
      }
      
      .infra-node {
        stroke: #409eff;
        stroke-width: 2;
        cursor: pointer;
        transition: all 0.2s;
        
        &.database {
          fill: #e3f2fd;
        }
        
        &.cache {
          fill: #fff3e0;
        }
        
        &.messaging {
          fill: #f3e5f5;
        }
        
        &:hover {
          opacity: 0.8;
        }
      }
      
      .node-label {
        fill: #303133;
        font-size: 14px;
        font-weight: 600;
        text-anchor: middle;
      }
      
      .node-meta {
        fill: #909399;
        font-size: 12px;
        text-anchor: middle;
      }
      
      .service-node {
        cursor: pointer;
        
        .service-rect {
          fill: #ecf5ff;
          stroke: #409eff;
          stroke-width: 2;
          transition: all 0.2s;
        }
        
        &:hover .service-rect {
          fill: #d9ecff;
          stroke: #1890ff;
        }
        
        &.selected .service-rect {
          fill: #d9ecff;
          stroke: #1890ff;
          stroke-width: 3;
        }
        
        .service-name {
          fill: #303133;
          font-size: 14px;
          font-weight: 600;
          text-anchor: middle;
        }
        
        .service-project {
          fill: #606266;
          font-size: 12px;
          text-anchor: middle;
        }
        
        .service-replicas {
          fill: #909399;
          font-size: 10px;
          text-anchor: middle;
        }
        
        .health-indicator {
          fill: #67c23a;
          stroke: #529b2e;
          stroke-width: 1;
        }
      }
      
      .gateway-node {
        fill: #fef0f0;
        stroke: #f56c6c;
        stroke-width: 2;
        cursor: pointer;
        
        &:hover {
          opacity: 0.8;
        }
      }
      
      .empty-text {
        fill: #909399;
        font-size: 18px;
        text-anchor: middle;
      }
      
      .empty-hint {
        fill: #c0c4cc;
        font-size: 14px;
        text-anchor: middle;
      }
    }
  }
}
</style>

