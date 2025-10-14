<!--
🏢 SmartAbp 企业级图标 - 低代码
🛠️ 专业的低代码开发图标
🎨 符合企业级视觉规范
-->
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="enterprise-lowcode-icon"
  >
    <!-- 🖼️ 可视化设计画布 -->
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="2"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      class="canvas-frame"
    />

    <!-- 🎯 画布网格 -->
    <defs>
      <pattern
        id="grid"
        width="2"
        height="2"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 2 0 L 0 0 0 2"
          fill="none"
          stroke="currentColor"
          stroke-width="0.2"
          opacity="0.3"
        />
      </pattern>
    </defs>

    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      fill="url(#grid)"
      class="canvas-grid"
    />

    <!-- 🧩 拖拽组件块 -->
    <g class="component-blocks">
      <!-- 📋 表单组件 -->
      <rect
        x="5"
        y="7"
        width="4"
        height="2"
        rx="0.5"
        fill="var(--enterprise-icon-color-primary, #409EFF)"
        class="component-block form-component"
      />

      <!-- 📊 图表组件 -->
      <rect
        x="10"
        y="7"
        width="4"
        height="2"
        rx="0.5"
        fill="var(--enterprise-icon-color-success, #67C23A)"
        class="component-block chart-component"
      />

      <!-- 📄 表格组件 -->
      <rect
        x="15"
        y="7"
        width="4"
        height="2"
        rx="0.5"
        fill="var(--enterprise-icon-color-warning, #E6A23C)"
        class="component-block table-component"
      />

      <!-- 🔲 布局组件 -->
      <rect
        x="5"
        y="11"
        width="6"
        height="3"
        rx="0.5"
        fill="none"
        stroke="var(--enterprise-icon-color-info, #909399)"
        stroke-width="1"
        stroke-dasharray="2,1"
        class="component-block layout-component"
      />

      <!-- 💡 逻辑组件 -->
      <circle
        cx="16"
        cy="12.5"
        r="1.5"
        fill="var(--enterprise-icon-color-danger, #F56C6C)"
        class="component-block logic-component"
      />
    </g>

    <!-- ⚡ 组件连接线 -->
    <g class="component-connections">
      <path
        d="M9 8 Q 11 10 10 11"
        stroke="var(--enterprise-icon-color-primary, #409EFF)"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
        class="connection-line"
      />

      <path
        d="M14 8 Q 15 9 16 11"
        stroke="var(--enterprise-icon-color-success, #67C23A)"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
        class="connection-line"
      />
    </g>

    <!-- 🎯 选择器工具 -->
    <g class="selector-tool">
      <circle
        cx="19"
        cy="6"
        r="1"
        stroke="currentColor"
        stroke-width="1"
        fill="none"
        class="selector-circle"
      />
      <path
        d="M18 5 L19 6 L20 5"
        stroke="currentColor"
        stroke-width="1"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="selector-arrow"
      />
    </g>

    <!-- 🛠️ 工具栏 -->
    <g class="toolbar">
      <rect
        x="2"
        y="2"
        width="20"
        height="1.5"
        rx="0.5"
        fill="var(--enterprise-icon-color-info, #909399)"
        opacity="0.8"
        class="toolbar-bg"
      />

      <!-- 🔧 工具按钮 -->
      <circle
        cx="4"
        cy="2.75"
        r="0.3"
        fill="currentColor"
        class="toolbar-btn"
      />
      <circle
        cx="6"
        cy="2.75"
        r="0.3"
        fill="currentColor"
        class="toolbar-btn"
      />
      <circle
        cx="8"
        cy="2.75"
        r="0.3"
        fill="currentColor"
        class="toolbar-btn"
      />

      <!-- 🏃 运行按钮 -->
      <polygon
        points="19,2.25 21,2.75 19,3.25"
        fill="var(--enterprise-icon-color-success, #67C23A)"
        class="run-button"
      />
    </g>

    <!-- ✨ 魔法效果粒子 -->
    <g class="magic-particles">
      <circle
        cx="7"
        cy="15"
        r="0.5"
        fill="var(--enterprise-icon-color-warning, #E6A23C)"
        opacity="0.8"
        class="particle particle-1"
      />
      <circle
        cx="12"
        cy="16"
        r="0.3"
        fill="var(--enterprise-icon-color-primary, #409EFF)"
        opacity="0.6"
        class="particle particle-2"
      />
      <circle
        cx="17"
        cy="15.5"
        r="0.4"
        fill="var(--enterprise-icon-color-success, #67C23A)"
        opacity="0.7"
        class="particle particle-3"
      />
    </g>

    <!-- 🔮 代码生成指示器 -->
    <g class="code-generation-indicator">
      <rect
        x="4"
        y="17"
        width="16"
        height="1"
        rx="0.5"
        fill="none"
        stroke="var(--enterprise-icon-color-primary, #409EFF)"
        stroke-width="1"
        stroke-dasharray="2,1"
        class="progress-bar"
      />

      <rect
        x="4"
        y="17"
        width="8"
        height="1"
        rx="0.5"
        fill="var(--enterprise-icon-color-primary, #409EFF)"
        class="progress-fill"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
// 🎯 低代码图标属性接口
interface LowCodeIconProps {
  size?: number
  mode?: 'design' | 'preview' | 'code' | 'deploy'
  animated?: boolean
  progress?: number
}

withDefaults(defineProps<LowCodeIconProps>(), {
  size: 24,
  mode: 'design',
  animated: false,
  progress: 50
})
</script>

<style scoped>
/* 🎨 企业级低代码图标样式 */
.enterprise-lowcode-icon {
  width: 100%;
  height: 100%;
  display: block;
}

/* 🖼️ 画布框架样式 */
.canvas-frame {
  transition: all 0.3s ease;
  stroke-width: 2;
}

.canvas-grid {
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

/* 🧩 组件块样式 */
.component-blocks {
  transition: all 0.3s ease;
}

.component-block {
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-component {
  filter: drop-shadow(0 1px 2px rgba(64, 158, 255, 0.3));
}

.chart-component {
  filter: drop-shadow(0 1px 2px rgba(103, 194, 58, 0.3));
}

.table-component {
  filter: drop-shadow(0 1px 2px rgba(230, 162, 60, 0.3));
}

.layout-component {
  filter: drop-shadow(0 1px 2px rgba(144, 147, 153, 0.2));
}

.logic-component {
  filter: drop-shadow(0 1px 2px rgba(245, 108, 108, 0.3));
}

/* ⚡ 连接线样式 */
.component-connections {
  transition: all 0.3s ease;
}

.connection-line {
  stroke-dasharray: 4, 2;
  transition: all 0.3s ease;
}

/* 🎯 选择器工具样式 */
.selector-tool {
  transition: all 0.3s ease;
}

.selector-circle {
  transition: all 0.3s ease;
}

.selector-arrow {
  transition: all 0.3s ease;
}

/* 🛠️ 工具栏样式 */
.toolbar {
  transition: all 0.3s ease;
}

.toolbar-bg {
  transition: all 0.3s ease;
}

.toolbar-btn {
  transition: all 0.3s ease;
  cursor: pointer;
}

.run-button {
  transition: all 0.3s ease;
  cursor: pointer;
  filter: drop-shadow(0 1px 2px rgba(103, 194, 58, 0.4));
}

/* ✨ 魔法粒子样式 */
.magic-particles {
  transition: all 0.3s ease;
}

.particle {
  transition: all 0.3s ease;
}

/* 🔮 代码生成指示器样式 */
.code-generation-indicator {
  transition: all 0.3s ease;
}

.progress-bar {
  transition: all 0.3s ease;
}

.progress-fill {
  transition: all 0.3s ease;
}

/* 🖱️ 悬停效果 */
.enterprise-lowcode-icon:hover .canvas-frame {
  stroke-width: 2.5;
  stroke: var(--enterprise-icon-color-primary, #409EFF);
}

.enterprise-lowcode-icon:hover .canvas-grid {
  opacity: 0.6;
}

.enterprise-lowcode-icon:hover .component-block {
  transform: translateY(-1px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.enterprise-lowcode-icon:hover .connection-line {
  stroke-width: 2;
  stroke-dasharray: 6, 1;
}

.enterprise-lowcode-icon:hover .selector-circle {
  r: 1.2;
}

.enterprise-lowcode-icon:hover .toolbar-btn {
  r: 0.4;
}

.enterprise-lowcode-icon:hover .run-button {
  transform: scale(1.2);
}

.enterprise-lowcode-icon:hover .particle {
  transform: scale(1.5);
}

/* 🎬 动画效果 */
@keyframes component-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes connection-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 12; }
}

@keyframes particle-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

@keyframes progress-loading {
  0% { width: 0; }
  100% { width: var(--progress-width, 8px); }
}

@keyframes magic-sparkle {
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
}

.enterprise-lowcode-icon.animated .component-block {
  animation: component-float 3s ease-in-out infinite;
}

.enterprise-lowcode-icon.animated .form-component {
  animation-delay: 0s;
}

.enterprise-lowcode-icon.animated .chart-component {
  animation-delay: 0.5s;
}

.enterprise-lowcode-icon.animated .table-component {
  animation-delay: 1s;
}

.enterprise-lowcode-icon.animated .logic-component {
  animation-delay: 1.5s;
}

.enterprise-lowcode-icon.animated .connection-line {
  animation: connection-flow 2s linear infinite;
}

.enterprise-lowcode-icon.animated .particle-1 {
  animation: particle-twinkle 1.5s ease-in-out infinite;
  animation-delay: 0s;
}

.enterprise-lowcode-icon.animated .particle-2 {
  animation: particle-twinkle 1.8s ease-in-out infinite;
  animation-delay: 0.3s;
}

.enterprise-lowcode-icon.animated .particle-3 {
  animation: particle-twinkle 1.2s ease-in-out infinite;
  animation-delay: 0.6s;
}

.enterprise-lowcode-icon.animated .progress-fill {
  animation: progress-loading 3s ease-in-out infinite;
}

/* 🌓 暗色主题支持 */
.dark .enterprise-lowcode-icon {
  filter: brightness(1.1);
}

.dark .canvas-frame {
  stroke-opacity: 0.9;
}

.dark .canvas-grid {
  opacity: 0.2;
}

.dark .component-block {
  filter: brightness(1.1);
}

/* 📱 响应式适配 */
@media (max-width: 768px) {
  .enterprise-lowcode-icon {
    /* 移动端优化 */
  }

  .component-blocks {
    transform: scale(0.9);
  }

  .toolbar {
    transform: scale(0.95);
  }
}

/* ♿ 无障碍支持 */
.enterprise-lowcode-icon:focus {
  outline: 2px solid var(--enterprise-icon-color-primary, #409EFF);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 🔧 高对比度模式 */
@media (prefers-contrast: high) {
  .canvas-frame {
    stroke-width: 3;
  }

  .component-block {
    stroke: currentColor;
    stroke-width: 1;
  }

  .connection-line {
    stroke-width: 2;
  }
}

/* 🎨 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .enterprise-lowcode-icon.animated * {
    animation: none !important;
    transition: none !important;
  }
}

/* 🎯 模式变体 */
.enterprise-lowcode-icon[data-mode="design"] .component-blocks {
  opacity: 1;
}

.enterprise-lowcode-icon[data-mode="preview"] .component-blocks {
  opacity: 0.8;
  filter: brightness(1.1);
}

.enterprise-lowcode-icon[data-mode="code"] .component-blocks {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.enterprise-lowcode-icon[data-mode="deploy"] .run-button {
  fill: var(--enterprise-icon-color-success, #67C23A);
  animation: magic-sparkle 1s ease-in-out infinite;
}
</style>
