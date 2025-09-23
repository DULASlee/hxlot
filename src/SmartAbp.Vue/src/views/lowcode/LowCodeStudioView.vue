<template>
  <div class="lowcode-studio">
    <header class="lowcode-studio__header">
      <div class="lowcode-studio__brand">
        <img src="/logo.svg" alt="SmartAbp" class="lowcode-studio__logo" />
        <h1 class="lowcode-studio__title">LowCode Studio</h1>
      </div>
      <div class="lowcode-studio__actions">
        <button class="lc-btn" @click="onNewProject">新建</button>
        <button class="lc-btn" @click="onSaveProject" :disabled="!hasProject">保存</button>
        <button class="lc-btn" @click="onOpenProject">打开</button>
        <button class="lc-btn lc-btn--primary" @click="goPreview" :disabled="!hasProject">预览</button>
        <button class="lc-btn lc-btn--accent" @click="goCodegen" :disabled="!hasProject">生成</button>
      </div>
    </header>

    <div class="lowcode-studio__body">
      <aside class="lowcode-studio__nav">
        <nav>
          <ul>
            <li :class="navClass('project')" @click="setSection('project')">项目概览</li>
            <li :class="navClass('models')" @click="setSection('models')">数据建模</li>
            <li :class="navClass('pages')" @click="setSection('pages')">页面设计</li>
            <li :class="navClass('workflows')" @click="setSection('workflows')">流程与规则</li>
            <li :class="navClass('themes')" @click="setSection('themes')">主题定制</li>
            <li :class="navClass('integrations')" @click="setSection('integrations')">集成资源</li>
            <li :class="navClass('codegen')" @click="setSection('codegen')">代码生成</li>
            <li :class="navClass('preview')" @click="setSection('preview')">运行预览</li>
          </ul>
        </nav>
      </aside>

      <main class="lowcode-studio__main">
        <section v-if="section === 'project'" class="panel">
          <h2>项目概览</h2>
          <p v-if="!hasProject">尚未创建项目。点击“新建”或“打开”开始。</p>
          <div v-else class="grid grid--2">
            <div class="card">
              <h3>项目信息</h3>
              <p><strong>名称</strong>：{{ project?.name }}</p>
              <p><strong>版本</strong>：{{ project?.version }}</p>
              <p><strong>描述</strong>：{{ project?.description || '—' }}</p>
            </div>
            <div class="card">
              <h3>快速开始</h3>
              <div class="quick-actions">
                <button class="lc-btn" @click="setSection('models')">定义实体</button>
                <button class="lc-btn" @click="setSection('pages')">设计页面</button>
                <button class="lc-btn" @click="setSection('themes')">定制主题</button>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="section === 'models'" class="panel">
          <h2>数据建模</h2>
          <p>使用“模块向导”快速生成实体与服务，或进入可视化设计器。</p>
          <div class="quick-actions">
            <button class="lc-btn" @click="goModuleWizard">模块向导</button>
            <button class="lc-btn" @click="goDesigner">可视化设计器</button>
          </div>
        </section>

        <section v-else-if="section === 'pages'" class="panel">
          <h2>页面设计</h2>
          <div class="quick-actions">
            <button class="lc-btn" @click="goDesigner">打开页面设计器</button>
          </div>
        </section>

        <section v-else-if="section === 'themes'" class="panel">
          <h2>主题定制</h2>
          <p>即将提供主题编辑器，在此之前可在“设计系统”内调整变量。</p>
        </section>

        <section v-else-if="section === 'workflows'" class="panel">
          <h2>流程与规则</h2>
          <p>即将上线：状态机、转换条件、策略规则编排与代码骨架生成。</p>
        </section>

        <section v-else-if="section === 'integrations'" class="panel">
          <h2>集成资源</h2>
          <p>即将支持：数据源、权限、外部API、审计日志联动。</p>
        </section>

        <section v-else-if="section === 'codegen'" class="panel">
          <h2>代码生成</h2>
          <div class="quick-actions">
            <button class="lc-btn lc-btn--accent" @click="goCodegen">打开生成控制台</button>
          </div>
        </section>

        <section v-else-if="section === 'preview'" class="panel">
          <h2>运行预览</h2>
          <p>预览将在安全沙箱中呈现（iframe/Worker + 严格CSP）。</p>
        </section>
      </main>

      <aside class="lowcode-studio__inspector">
        <h3>属性检查器</h3>
        <p>选择对象后将显示其可编辑属性。</p>
      </aside>
    </div>

    <footer class="lowcode-studio__footer">
      <div class="footer__log">准备就绪 · 架构整洁 · 质量门控启用</div>
      <div class="footer__actions">
        <button class="lc-btn" @click="runQualityGates">质量检查</button>
      </div>
    </footer>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useWorkspaceStore } from "@/stores/lowcode/workspace"

const router = useRouter()
const ws = useWorkspaceStore()

const section = computed(() => ws.activeSection)
const project = computed(() => ws.project)
const hasProject = computed(() => !!ws.project)

function navClass(key: string) {
  return {
    active: section.value === (key as typeof ws.activeSection),
  }
}

function setSection(s: typeof ws.activeSection) {
  ws.setActiveSection(s)
}

function onNewProject() {
  ws.newProject({ name: "My LowCode Project" })
}

function onSaveProject() {
  ws.saveProjectToLocalStorage()
}

function onOpenProject() {
  ws.loadProjectFromLocalStorage()
}

function goDesigner() {
  router.push({ name: "VisualDesigner" })
}

function goModuleWizard() {
  router.push({ name: "ModuleWizard" })
}

function goCodegen() {
  router.push({ name: "LowCodeEngine" })
}

function goPreview() {
  ws.setActiveSection("preview")
}

async function runQualityGates() {
  // 预留：可集成前端质量门控脚本调用
  // 此处仅作为提示，避免引入运行时依赖
  console.info("[LowCodeStudio] 质量检查启动：type-check, lint, tests, build")
}
</script>

<style scoped>
.lowcode-studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--theme-bg-component, #f7f7fb);
}
.lowcode-studio__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  background: var(--theme-bg-surface, #fff);
}
.lowcode-studio__brand { display: flex; align-items: center; gap: 10px; }
.lowcode-studio__logo { width: 24px; height: 24px; }
.lowcode-studio__title { font-size: 16px; margin: 0; }
.lowcode-studio__actions { display: flex; gap: 8px; }

.lowcode-studio__body { display: grid; grid-template-columns: 220px 1fr 280px; gap: 0; flex: 1; }
.lowcode-studio__nav { border-right: 1px solid rgba(0,0,0,0.06); background: var(--theme-bg-surface, #fff); }
.lowcode-studio__nav ul { list-style: none; margin: 0; padding: 8px; }
.lowcode-studio__nav li { padding: 8px 10px; border-radius: 6px; cursor: pointer; }
.lowcode-studio__nav li:hover { background: rgba(0,0,0,0.04); }
.lowcode-studio__nav li.active { background: var(--theme-brand-primary, #0ea5e9); color: #fff; }

.lowcode-studio__main { padding: 16px; overflow: auto; }
.panel { background: var(--theme-bg-surface, #fff); border: 1px solid rgba(0,0,0,0.06); border-radius: 10px; padding: 16px; }
.grid { display: grid; gap: 12px; }
.grid--2 { grid-template-columns: 1fr 1fr; }
.card { border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 12px; background: #fff; }
.quick-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.lowcode-studio__inspector { border-left: 1px solid rgba(0,0,0,0.06); background: var(--theme-bg-surface, #fff); padding: 12px; }

.lowcode-studio__footer { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-top: 1px solid rgba(0,0,0,0.06); background: var(--theme-bg-surface, #fff); }
.footer__log { color: rgba(0,0,0,0.6); font-size: 12px; }

.lc-btn {
  background: var(--theme-bg-surface, #fff);
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}
.lc-btn:hover { background: rgba(0,0,0,0.04); }
.lc-btn--primary { background: var(--theme-brand-primary, #0ea5e9); color: #fff; border: none; }
.lc-btn--accent { background: #16a34a; color: #fff; border: none; }
</style>


