<template>
  <div class="design-view">
    <div class="design-header">
      <h2>页面设计器</h2>
      <div class="design-actions">
        <el-button-group>
          <el-button
            size="small"
            :type="activeDesignMode === 'visual' ? 'primary' : ''"
            @click="activeDesignMode = 'visual'"
          >
            <i class="el-icon-brush" /> 可视化
          </el-button>
          <el-button
            size="small"
            :type="activeDesignMode === 'code' ? 'primary' : ''"
            @click="activeDesignMode = 'code'"
          >
            <i class="el-icon-document" /> 代码
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="design-content">
      <!-- 可视化设计模式 -->
      <div
        v-if="activeDesignMode === 'visual'"
        class="visual-designer"
      >
        <div class="component-palette">
          <h3>组件面板</h3>
          <div class="palette-sections">
            <div class="palette-section">
              <h4>基础组件</h4>
              <div class="component-items">
                <div 
                  v-for="component in basicComponents" 
                  :key="component.type"
                  class="component-item"
                  draggable="true"
                >
                  <i :class="component.icon" />
                  <span>{{ component.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="design-canvas">
          <div class="canvas-header">
            <div class="canvas-info">
              <span>设计画布</span>
              <el-tag size="small">
                0 个组件
              </el-tag>
            </div>
            <div class="canvas-tools">
              <el-button-group size="small">
                <el-button>
                  <i class="el-icon-delete" /> 清空
                </el-button>
                <el-button>
                  <i class="el-icon-view" /> 预览
                </el-button>
              </el-button-group>
            </div>
          </div>
          
          <div class="canvas-workspace">
            <div class="canvas-empty">
              <i class="el-icon-plus" />
              <p>将组件拖拽到这里开始设计</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 代码设计模式 -->
      <div
        v-if="activeDesignMode === 'code'"
        class="code-designer"
      >
        <div class="code-editor">
          <div class="editor-header">
            <div class="editor-tabs">
              <el-tabs v-model="activeCodeTab">
                <el-tab-pane
                  label="Template"
                  name="template"
                />
                <el-tab-pane
                  label="Script"
                  name="script"
                />
                <el-tab-pane
                  label="Style"
                  name="style"
                />
              </el-tabs>
            </div>
            <div class="editor-actions">
              <el-button size="small">
                <i class="el-icon-s-operation" /> 格式化
              </el-button>
              <el-button
                size="small"
                type="primary"
              >
                <i class="el-icon-check" /> 应用
              </el-button>
            </div>
          </div>
          
          <div class="editor-content">
            <textarea 
              v-model="currentCodeContent"
              class="code-textarea"
              placeholder="输入代码..."
            />
          </div>
        </div>
        
        <div class="code-preview">
          <div class="preview-header">
            <h4>实时预览</h4>
          </div>
          <div class="preview-content">
            <SandboxPreview :code="previewHtml" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import SandboxPreview from "@/components/lowcode/SandboxPreview.vue"

// 设计模式
const activeDesignMode = ref<"visual" | "code">("visual")

// 组件数据
const basicComponents = [
  { type: "div", name: "容器", icon: "el-icon-menu" },
  { type: "text", name: "文本", icon: "el-icon-document" },
  { type: "button", name: "按钮", icon: "el-icon-mouse" },
  { type: "image", name: "图片", icon: "el-icon-picture" },
]

// 代码编辑器状态
const activeCodeTab = ref("template")
const currentCodeContent = ref("<template>\n  <div class=\"page\">\n    <h1>Hello LowCode</h1>\n  </div>\n</template>")
const previewHtml = ref("<div><h1>Hello LowCode</h1><p>这是一个示例页面</p></div>")
</script>

<style scoped>
.design-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.design-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.design-content {
  flex: 1;
  overflow: hidden;
}

/* 可视化设计器样式 */
.visual-designer {
  display: flex;
  height: 100%;
}

.component-palette {
  width: 280px;
  border-right: 1px solid var(--el-border-color);
  padding: 16px;
  overflow-y: auto;
}

.palette-section {
  margin-bottom: 24px;
}

.palette-section h4 {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 12px 0;
}

.component-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.component-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.component-item span {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.design-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.canvas-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.canvas-workspace {
  flex: 1;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  min-height: 400px;
  position: relative;
  overflow: auto;
}

.canvas-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--el-text-color-placeholder);
}

.canvas-empty i {
  font-size: 48px;
  margin-bottom: 8px;
  display: block;
}

/* 代码设计器样式 */
.code-designer {
  display: flex;
  height: 100%;
}

.code-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.editor-content {
  flex: 1;
  padding: 16px;
}

.code-textarea {
  width: 100%;
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
}

.code-preview {
  width: 400px;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.preview-content {
  flex: 1;
  padding: 16px;
}
</style>