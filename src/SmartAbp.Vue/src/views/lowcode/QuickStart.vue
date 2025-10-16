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
                <el-checkbox label="props">
                  Props定义
                </el-checkbox>
                <el-checkbox label="emits">
                  事件定义
                </el-checkbox>
                <el-checkbox label="computed">
                  计算属性
                </el-checkbox>
                <el-checkbox label="methods">
                  方法定义
                </el-checkbox>
                <el-checkbox label="lifecycle">
                  生命周期
                </el-checkbox>
                <el-checkbox label="style">
                  样式
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="generating" :disabled="!form.componentName" @click="generateCode">
                <i class="el-icon-magic-stick" />
                生成代码
              </el-button>

              <el-button @click="resetForm">
                <i class="el-icon-refresh" />
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 状态信息 -->
          <el-divider>系统状态</el-divider>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="内核状态">
              <el-tag :type="kernelStatus.type">
                {{ kernelStatus.text }}
              </el-tag>
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
                <el-button size="small" :disabled="!generatedCode" @click="copyCode">
                  <i class="el-icon-copy-document" />
                  复制
                </el-button>
                <el-button size="small" :disabled="!generatedCode" @click="downloadCode">
                  <i class="el-icon-download" />
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
          <el-divider v-if="generationInfo">
            生成信息
          </el-divider>
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
import { codeGeneratorApi, type ModuleGenerationConfig, type ModuleMetadataDto } from "@smartabp/lowcode-api"
import { ElMessage } from "element-plus"
import { computed, onMounted, reactive, ref } from "vue"

// 表单数据
const form = reactive({
  componentName: "MyComponent",
  componentType: "component",
  features: ["props", "style"],
})

// 状态管理
const generating = ref(false)
const generatedCode = ref("")
const generationCount = ref(0)
const pluginCount = ref(0)
const generationInfo = ref<any>(null)

// 内核状态 - 类型安全的Element Plus标签类型
const kernelStatus = computed((): { type: 'success' | 'info' | 'warning' | 'danger' | '' | undefined, text: string } => {
  if (pluginCount.value > 0) {
    return { type: "success", text: "就绪" }
  }
  return { type: "info", text: "未初始化" }
})

// 当前Schema
const currentSchema = computed(() => {
  return {
    id: `${form.componentName.toLowerCase()}-001`,
    version: "1.0.0",
    type: form.componentType,
    metadata: {
      name: form.componentName,
      description: `自动生成的${form.componentName}组件`,
    },
    template: {
      type: "template",
      content: {
        tag: "div",
        props: {
          class: form.componentName.toLowerCase(),
        },
        children: [`Hello from ${form.componentName}!`],
      },
    },
    props: form.features.includes("props")
      ? [
        {
          name: "title",
          type: "string",
          required: false,
          default: "Default Title",
        },
      ]
      : undefined,
    emits: form.features.includes("emits")
      ? [
        {
          name: "click",
          payload: "MouseEvent",
        },
      ]
      : undefined,
    script: {
      lang: "ts",
      setup: true,
      computed: form.features.includes("computed")
        ? [
          {
            name: "displayTitle",
            get: 'title || "No Title"',
            type: "string",
          },
        ]
        : undefined,
      methods: form.features.includes("methods")
        ? [
          {
            name: "handleClick",
            params: [{ name: "event", type: "MouseEvent" }],
            returnType: "void",
            body: 'emit("click", event);',
          },
        ]
        : undefined,
      lifecycle: form.features.includes("lifecycle")
        ? [
          {
            hook: "onMounted",
            body: 'console.log("Component mounted");',
          },
        ]
        : undefined,
    },
    style: form.features.includes("style")
      ? {
        lang: "css",
        scoped: true,
        content: {
          [`.${form.componentName.toLowerCase()}`]: {
            padding: "16px",
            "border-radius": "8px",
            background: "#f5f5f5",
          },
        },
      }
      : undefined,
  }
})

// ✅ 真实代码生成（使用SmartAbp后端API）
const generateCode = async () => {
  generating.value = true
  generationInfo.value = null

  try {
    const startTime = Date.now()

    // ✅ 构建模块元数据
    const moduleMetadata: ModuleMetadataDto = {
      id: crypto.randomUUID(),
      systemName: 'SmartAbp',
      name: form.componentName,
      displayName: form.componentName,
      description: `Auto-generated ${form.componentName} component`,
      version: '1.0.0',
      author: 'SmartAbp QuickStart',
      namespace: `SmartAbp.${form.componentName}`,
      architecturePattern: 'Crud',
      databaseInfo: {
        connectionStringName: 'Default',
        schema: 'dbo',
        provider: 'SqlServer'
      },
      frontend: {
        parentId: '',
        routePrefix: form.componentName.toLowerCase()
      },
      generateMobilePages: false,
      featureManagement: {
        isEnabled: true,
        defaultPolicy: 'RequiresAuthentication'
      },
      dependencies: [],
      entities: [],
      permissionConfig: {
        groups: [],
        customActions: []
      },
      menuConfig: [],
      schemaVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // ✅ 调用真实API
    const config: ModuleGenerationConfig = {
      moduleMetadata,
      targetPath: './generated',
      overwriteExisting: true,
      generateTests: false,
      generateDocs: false
    }

    const result = await codeGeneratorApi.generateModule(config)

    const endTime = Date.now()

    if (result.success && result.generatedFiles && result.generatedFiles.length > 0) {
      // 提取第一个Vue组件文件
      const vueFile = result.generatedFiles.find((f: { path: string }) => f.path.endsWith('.vue'))
      generatedCode.value = vueFile?.content || '// No Vue component generated'

      generationInfo.value = {
        duration: endTime - startTime,
        size: generatedCode.value.length,
        plugin: "SmartAbp CodeGen",
        filesGenerated: result.generatedFiles.length,
        totalLines: result.statistics?.totalLines || 0
      }

      generationCount.value++
      ElMessage.success(`代码生成成功！生成了${result.generatedFiles.length}个文件`)
    } else {
      throw new Error(result.errors?.join(', ') || '代码生成失败')
    }
  } catch (error) {
    console.error("代码生成失败：", error)
    ElMessage.error(`代码生成失败: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    generating.value = false
  }
}

// ✅ 已移除模拟函数，现在使用真实的后端API生成代码

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success("代码已复制到剪贴板")
  } catch {
    ElMessage.error("复制失败")
  }
}

// 下载代码
const downloadCode = () => {
  const blob = new Blob([generatedCode.value], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${form.componentName}.vue`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success("代码已下载")
}

// 重置表单
const resetForm = () => {
  form.componentName = "MyComponent"
  form.componentType = "component"
  form.features = ["props", "style"]
  generatedCode.value = ""
  generationInfo.value = null
}

// 初始化
onMounted(() => {
  pluginCount.value = 1 // SmartAbp CodeGen插件
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
  margin: 0 0 10px;
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
  font-family: Consolas, Monaco, "Courier New", monospace;
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
