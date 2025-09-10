<template>
  <div class="lowcode-quick-start">
    <el-card class="header-card">
      <h1>🚀 低代码引擎快速开始</h1>
      <p>企业级代码生成器 - 集成到SmartAbp.Vue项目</p>
    </el-card>

    <el-row :gutter="20">
      <!-- 控制面板 -->
      <el-col :span="8">
        <el-card title="控制面板">
          <el-form :model="form" label-width="120px">
            <el-form-item label="组件名称">
              <el-input v-model="form.componentName" placeholder="请输入组件名称" />
            </el-form-item>

            <el-form-item label="组件类型">
              <el-select v-model="form.componentType" placeholder="选择组件类型">
                <el-option label="基础组件" value="component" />
                <el-option label="页面组件" value="page" />
                <el-option label="布局组件" value="layout" />
              </el-select>
            </el-form-item>

            <el-form-item label="包含功能">
              <el-checkbox-group v-model="form.features">
                <el-checkbox label="props">Props定义</el-checkbox>
                <el-checkbox label="emits">事件定义</el-checkbox>
                <el-checkbox label="computed">计算属性</el-checkbox>
                <el-checkbox label="methods">方法定义</el-checkbox>
                <el-checkbox label="lifecycle">生命周期</el-checkbox>
                <el-checkbox label="style">样式</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="generateCode"
                :loading="generating"
                :disabled="!form.componentName"
              >
                <i class="el-icon-magic-stick"></i>
                生成代码
              </el-button>

              <el-button @click="resetForm">
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 状态信息 -->
          <el-divider>系统状态</el-divider>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="内核状态">
              <el-tag :type="kernelStatus.type as any">{{ kernelStatus.text }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="插件数量">
              {{ pluginCount }}
            </el-descriptions-item>
            <el-descriptions-item label="生成次数">
              {{ generationCount }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 代码预览 -->
      <el-col :span="16">
        <el-card title="生成的代码">
          <template #header>
            <div class="card-header">
              <span>生成的Vue组件代码</span>
              <el-button-group>
                <el-button
                  size="small"
                  @click="copyCode"
                  :disabled="!generatedCode"
                >
                  <i class="el-icon-copy-document"></i>
                  复制
                </el-button>
                <el-button
                  size="small"
                  @click="downloadCode"
                  :disabled="!generatedCode"
                >
                  <i class="el-icon-download"></i>
                  下载
                </el-button>
              </el-button-group>
            </div>
          </template>

          <div v-if="generating" class="loading-container">
            <el-skeleton :rows="10" animated />
          </div>

          <div v-else-if="generatedCode" class="code-container">
            <pre><code class="language-vue">{{ generatedCode }}</code></pre>
          </div>

          <el-empty v-else description="点击生成代码按钮开始" />

          <!-- 生成信息 -->
          <el-divider v-if="generationInfo">生成信息</el-divider>
          <el-descriptions v-if="generationInfo" :column="3" size="small">
            <el-descriptions-item label="生成时间">
              {{ generationInfo.duration }}ms
            </el-descriptions-item>
            <el-descriptions-item label="代码大小">
              {{ generationInfo.size }} 字符
            </el-descriptions-item>
            <el-descriptions-item label="使用插件">
              {{ generationInfo.plugin }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 示例Schema -->
    <el-card class="mt-4">
      <template #header>
        <span>💡 示例Schema配置</span>
      </template>
      <el-collapse>
        <el-collapse-item title="查看当前Schema配置" name="schema">
          <pre><code class="language-json">{{ JSON.stringify(currentSchema, null, 2) }}</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 导入低代码引擎 (暂时注释，等待迁移完成)
// import { LowCodeKernel, Vue3Plugin } from '@/lowcode'

// 表单数据
const form = reactive({
  componentName: 'MyComponent',
  componentType: 'component',
  features: ['props', 'style']
})

// 状态管理
const generating = ref(false)
const generatedCode = ref('')
const generationCount = ref(0)
const pluginCount = ref(0)
const generationInfo = ref<any>(null)

// 内核状态
const kernelStatus = computed(() => {
  if (pluginCount.value > 0) {
    return { type: 'success', text: '就绪' }
  }
  return { type: 'info', text: '未初始化' }
})

// 当前Schema
const currentSchema = computed(() => {
  return {
    id: `${form.componentName.toLowerCase()}-001`,
    version: '1.0.0',
    type: form.componentType,
    metadata: {
      name: form.componentName,
      description: `自动生成的${form.componentName}组件`
    },
    template: {
      type: 'template',
      content: {
        tag: 'div',
        props: {
          class: form.componentName.toLowerCase()
        },
        children: [
          `Hello from ${form.componentName}!`
        ]
      }
    },
    props: form.features.includes('props') ? [
      {
        name: 'title',
        type: 'string',
        required: false,
        default: 'Default Title'
      }
    ] : undefined,
    emits: form.features.includes('emits') ? [
      {
        name: 'click',
        payload: 'MouseEvent'
      }
    ] : undefined,
    script: {
      lang: 'ts',
      setup: true,
      computed: form.features.includes('computed') ? [
        {
          name: 'displayTitle',
          get: 'title || "No Title"',
          type: 'string'
        }
      ] : undefined,
      methods: form.features.includes('methods') ? [
        {
          name: 'handleClick',
          params: [{ name: 'event', type: 'MouseEvent' }],
          returnType: 'void',
          body: 'emit("click", event);'
        }
      ] : undefined,
      lifecycle: form.features.includes('lifecycle') ? [
        {
          hook: 'onMounted',
          body: 'console.log("Component mounted");'
        }
      ] : undefined
    },
    style: form.features.includes('style') ? {
      lang: 'css',
      scoped: true,
      content: {
        [`.${form.componentName.toLowerCase()}`]: {
          'padding': '16px',
          'border-radius': '8px',
          'background': '#f5f5f5'
        }
      }
    } : undefined
  }
})

// 生成代码
const generateCode = async () => {
  generating.value = true
  generationInfo.value = null

  try {
    // 模拟低代码引擎（迁移完成后使用真实的引擎）
    await simulateCodeGeneration()

    generationCount.value++
    ElMessage.success('代码生成成功！')
  } catch (error) {
    console.error('代码生成失败：', error)
    ElMessage.error('代码生成失败，请检查配置')
  } finally {
    generating.value = false
  }
}

// 模拟代码生成（迁移完成后替换为真实实现）
const simulateCodeGeneration = async () => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      const startTime = Date.now()

      // 生成模拟的Vue代码
      const template = generateTemplate()
      const script = generateScript()
      const style = generateStyle()

      // 构建最终代码
      const scriptTag = '<' + 'script setup lang="ts">'
      const scriptEndTag = '</' + 'script>'
      const styleTag = '<' + 'style scoped>'
      const styleEndTag = '</' + 'style>'

      const parts = ['<template>', template, '</template>', '', scriptTag, script, scriptEndTag]

      if (style) {
        parts.push('', styleTag, style, styleEndTag)
      }

      generatedCode.value = parts.join('\n')

      const endTime = Date.now()

      generationInfo.value = {
        duration: endTime - startTime,
        size: generatedCode.value.length,
        plugin: 'Vue3Plugin'
      }

      resolve(true)
    }, 1000)
  })
}

// 生成模板
const generateTemplate = () => {
  return `  <div class="${form.componentName.toLowerCase()}">
    <h3 v-if="title">{{ displayTitle || title }}</h3>
    <p>Hello from ${form.componentName}!</p>
    <el-button v-if="handleClick" @click="handleClick">Click Me</el-button>
  </div>`
}

// 生成脚本
const generateScript = () => {
  const parts = []

  const imports = []
  if (form.features.includes('computed')) imports.push('computed')
  if (form.features.includes('lifecycle')) imports.push('onMounted')

  if (imports.length > 0) {
    parts.push(`import { ${imports.join(', ')} } from 'vue'`)
  }

  if (form.features.includes('props')) {
    parts.push(`
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Default Title'
})`)
  }

  if (form.features.includes('emits')) {
    parts.push(`
interface Emits {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()`)
  }

  if (form.features.includes('computed')) {
    parts.push(`
const displayTitle = computed(() => props.title || 'No Title')`)
  }

  if (form.features.includes('methods')) {
    parts.push(`
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}`)
  }

  if (form.features.includes('lifecycle')) {
    parts.push(`
onMounted(() => {
  console.log('` + form.componentName + ` mounted')
})`)
  }

  return parts.join('\n')
}

// 生成样式
const generateStyle = () => {
  if (!form.features.includes('style')) return ''

  return `.${form.componentName.toLowerCase()} {
  padding: 16px;
  border-radius: 8px;
  background: #f5f5f5;
}

.${form.componentName.toLowerCase()} h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.${form.componentName.toLowerCase()} p {
  margin: 0 0 16px 0;
  color: #666;
}`
}

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载代码
const downloadCode = () => {
  const blob = new Blob([generatedCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${form.componentName}.vue`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('代码已下载')
}

// 重置表单
const resetForm = () => {
  form.componentName = 'MyComponent'
  form.componentType = 'component'
  form.features = ['props', 'style']
  generatedCode.value = ''
  generationInfo.value = null
}

// 初始化
onMounted(() => {
  pluginCount.value = 1 // 模拟插件数量
})
</script>

<style scoped>
.lowcode-quick-start {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
  text-align: center;
}

.header-card h1 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.header-card p {
  margin: 0;
  color: #666;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-container {
  max-height: 600px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
}

.code-container pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.code-container code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.loading-container {
  padding: 20px;
}

.mt-4 {
  margin-top: 16px;
}

.language-vue,
.language-json {
  background: transparent;
}
</style>
