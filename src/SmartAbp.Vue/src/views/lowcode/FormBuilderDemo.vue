<template>
  <div class="form-builder-demo">
    <!-- 页面头部 -->
    <div class="demo-header">
      <h2>SmartFormBuilder 2.0 演示</h2>
      <el-tag type="success">
        企业级表单构建器
      </el-tag>
    </div>

    <!-- 内容区 -->
    <el-tabs
      v-model="activeTab"
      type="border-card"
    >
      <!-- Tab 1: 表单渲染器演示 -->
      <el-tab-pane
        label="📝 表单渲染器"
        name="renderer"
      >
        <div class="demo-section">
          <h3>基础表单渲染</h3>
          <p>SmartFormBuilder基于form-create，支持动态表单渲染和验证</p>

          <el-divider />

          <SmartFormBuilder
            ref="formBuilderRef"
            v-model="formData"
            :rules="demoFormRules"
            :config="demoFormConfig"
            @submit="handleFormSubmit"
            @reset="handleFormReset"
          />

          <el-divider />

          <el-card>
            <template #header>
              <span>当前表单数据</span>
            </template>
            <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 可视化设计器 -->
      <el-tab-pane
        label="🎨 可视化设计器"
        name="designer"
      >
        <div class="demo-section">
          <el-alert
            title="进入完整设计器"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              <p>完整的可视化表单设计器请访问：</p>
              <el-button
                type="primary"
                @click="goToFullDesigner"
              >
                🚀 打开表单设计器
              </el-button>
            </template>
          </el-alert>

          <h3>设计器功能特性</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card>
                <template #header>
                  <el-icon>
                    <Edit />
                  </el-icon>
                  拖拽式设计
                </template>
                <ul>
                  <li>40种字段类型</li>
                  <li>拖拽添加字段</li>
                  <li>实时预览</li>
                </ul>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card>
                <template #header>
                  <el-icon>
                    <Setting />
                  </el-icon>
                  属性配置
                </template>
                <ul>
                  <li>字段属性配置</li>
                  <li>验证规则设置</li>
                  <li>布局配置</li>
                </ul>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card>
                <template #header>
                  <el-icon>
                    <Document />
                  </el-icon>
                  代码导出
                </template>
                <ul>
                  <li>JSON Schema</li>
                  <li>Vue Template</li>
                  <li>即时可用</li>
                </ul>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- Tab 3: API文档 -->
      <el-tab-pane
        label="📖 API文档"
        name="api"
      >
        <div class="demo-section">
          <h3>SmartFormBuilder Props</h3>
          <el-table
            :data="propsData"
            border
          >
            <el-table-column
              prop="name"
              label="属性名"
              width="180"
            />
            <el-table-column
              prop="type"
              label="类型"
              width="180"
            />
            <el-table-column
              prop="default"
              label="默认值"
              width="120"
            />
            <el-table-column
              prop="description"
              label="说明"
            />
          </el-table>

          <el-divider />

          <h3>SmartFormBuilder Events</h3>
          <el-table
            :data="eventsData"
            border
          >
            <el-table-column
              prop="name"
              label="事件名"
              width="180"
            />
            <el-table-column
              prop="params"
              label="参数"
              width="250"
            />
            <el-table-column
              prop="description"
              label="说明"
            />
          </el-table>

          <el-divider />

          <h3>SmartFormBuilder Methods</h3>
          <el-table
            :data="methodsData"
            border
          >
            <el-table-column
              prop="name"
              label="方法名"
              width="180"
            />
            <el-table-column
              prop="params"
              label="参数"
              width="180"
            />
            <el-table-column
              prop="returns"
              label="返回值"
              width="120"
            />
            <el-table-column
              prop="description"
              label="说明"
            />
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Tab 4: 使用示例 -->
      <el-tab-pane
        label="💡 使用示例"
        name="examples"
      >
        <div class="demo-section">
          <h3>基础使用示例</h3>
          <pre class="code-block">{{ basicExample }}</pre>

          <el-divider />

          <h3>高级使用示例（动态规则）</h3>
          <pre class="code-block">{{ advancedExample }}</pre>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { Document, Edit, Setting } from '@element-plus/icons-vue'
import type { FormCreateConfig, FormCreateRule } from '@smartabp/lowcode-core'
import { SmartFormBuilder } from '@smartabp/lowcode-core'
import {
    ElAlert,
    ElButton,
    ElCard,
    ElCol,
    ElDivider,
    ElIcon,
    ElMessage,
    ElRow,
    ElTable,
    ElTableColumn,
    ElTabPane,
    ElTabs,
    ElTag
} from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('renderer')
const formBuilderRef = ref()
const formData = ref({})

// 演示表单规则
const demoFormRules: FormCreateRule[] = [
    {
        type: 'input',
        field: 'username',
        title: '用户名',
        value: '',
        props: {
            placeholder: '请输入用户名'
        },
        validate: [
            { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        col: { span: 12 }
    },
    {
        type: 'input',
        field: 'email',
        title: '邮箱',
        value: '',
        props: {
            placeholder: '请输入邮箱'
        },
        validate: [
            { required: true, message: '邮箱不能为空', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        col: { span: 12 }
    },
    {
        type: 'select',
        field: 'role',
        title: '角色',
        value: '',
        options: [
            { label: '管理员', value: 'admin' },
            { label: '用户', value: 'user' },
            { label: '访客', value: 'guest' }
        ],
        props: {
            placeholder: '请选择角色'
        },
        validate: [
            { required: true, message: '角色不能为空', trigger: 'change' }
        ],
        col: { span: 12 }
    },
    {
        type: 'switch',
        field: 'active',
        title: '是否激活',
        value: true,
        col: { span: 12 }
    },
    {
        type: 'input',
        field: 'description',
        title: '描述',
        value: '',
        props: {
            type: 'textarea',
            rows: 3,
            placeholder: '请输入描述'
        },
        col: { span: 24 }
    }
]

const demoFormConfig: FormCreateConfig = {
    form: {
        labelPosition: 'right',
        labelWidth: '100px',
        size: 'default'
    },
    submitBtn: {
        show: true,
        innerText: '提交'
    },
    resetBtn: {
        show: true,
        innerText: '重置'
    }
}

// Props数据
const propsData = [
    {
        name: 'schema',
        type: 'Object',
        default: '-',
        description: 'SmartAbp统一Schema格式'
    },
    {
        name: 'rules',
        type: 'FormCreateRule[]',
        default: '[]',
        description: 'form-create规则数组'
    },
    {
        name: 'config',
        type: 'FormCreateConfig',
        default: '{}',
        description: '表单配置'
    },
    {
        name: 'modelValue',
        type: 'Object',
        default: '{}',
        description: '表单数据（v-model）'
    },
    {
        name: 'readonly',
        type: 'Boolean',
        default: 'false',
        description: '是否只读'
    },
    {
        name: 'disabled',
        type: 'Boolean',
        default: 'false',
        description: '是否禁用'
    }
]

// Events数据
const eventsData = [
    {
        name: 'update:modelValue',
        params: 'data: Record<string, any>',
        description: '表单数据变化时触发'
    },
    {
        name: 'submit',
        params: 'data: Record<string, any>',
        description: '表单提交时触发'
    },
    {
        name: 'reset',
        params: '-',
        description: '表单重置时触发'
    },
    {
        name: 'validate',
        params: 'result: { valid: boolean; errors?: any[] }',
        description: '表单验证时触发'
    },
    {
        name: 'change',
        params: 'field: string, value: any',
        description: '字段值变化时触发'
    }
]

// Methods数据
const methodsData = [
    {
        name: 'validate',
        params: '-',
        returns: 'Promise<boolean>',
        description: '验证整个表单'
    },
    {
        name: 'validateField',
        params: 'field: string',
        returns: 'Promise<boolean>',
        description: '验证单个字段'
    },
    {
        name: 'clearValidate',
        params: 'fields?: string | string[]',
        returns: 'void',
        description: '清空验证结果'
    },
    {
        name: 'getFormData',
        params: '-',
        returns: 'Record<string, any>',
        description: '获取表单数据'
    },
    {
        name: 'setFormData',
        params: 'data: Record<string, any>',
        returns: 'void',
        description: '设置表单数据'
    },
    {
        name: 'getFieldValue',
        params: 'field: string',
        returns: 'any',
        description: '获取字段值'
    },
    {
        name: 'setFieldValue',
        params: 'field: string, value: any',
        returns: 'void',
        description: '设置字段值'
    },
    {
        name: 'disableForm',
        params: 'disabled?: boolean',
        returns: 'void',
        description: '禁用/启用表单'
    },
    {
        name: 'setFieldVisible',
        params: 'field: string, visible: boolean',
        returns: 'void',
        description: '显示/隐藏字段'
    },
    {
        name: 'updateRule',
        params: 'field: string, rule: Partial<FormCreateRule>',
        returns: 'void',
        description: '更新字段规则'
    },
    {
        name: 'reset',
        params: '-',
        returns: 'void',
        description: '重置表单'
    }
]

// 代码示例
const basicExample = `<template>
  <SmartFormBuilder
    v-model="formData"
    :rules="formRules"
    :config="formConfig"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SmartFormBuilder } from '@smartabp/lowcode-core'

const formData = ref({})
const formRules = [
  {
    type: 'input',
    field: 'name',
    title: '姓名',
    validate: [{ required: true, message: '姓名不能为空' }]
  }
]
const formConfig = {
  submitBtn: { show: true, innerText: '提交' }
}

const handleSubmit = (data) => {
  console.log('提交数据:', data)
}
<` + `/script>`

const advancedExample = `<template>
  <SmartFormBuilder
    ref="formRef"
    v-model="formData"
    :rules="dynamicRules"
    @change="handleFieldChange"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SmartFormBuilder } from '@smartabp/lowcode-core'

const formRef = ref()
const formData = ref({ type: 'personal' })

// 动态规则：根据type字段显示不同字段
const dynamicRules = computed(() => {
  const baseRules = [
    {
      type: 'select',
      field: 'type',
      title: '类型',
      options: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'company' }
      ]
    }
  ]
  
  if (formData.value.type === 'personal') {
    baseRules.push({
      type: 'input',
      field: 'idCard',
      title: '身份证号'
    })
  } else {
    baseRules.push({
      type: 'input',
      field: 'companyName',
      title: '公司名称'
    })
  }
  
  return baseRules
})

const handleFieldChange = (field, value) => {
  console.log(\`字段 \${field} 变化为 \${value}\`)
}
<` + `/script>`

// 事件处理
const handleFormSubmit = (data: Record<string, any>) => {
    console.log('表单提交:', data)
    ElMessage.success('表单提交成功！')
}

const handleFormReset = () => {
    console.log('表单重置')
    ElMessage.info('表单已重置')
}

const goToFullDesigner = () => {
    router.push({ name: 'FormDesigner' })
}
</script>

<style scoped>
.form-builder-demo {
    padding: 20px;
}

.demo-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.demo-header h2 {
    margin: 0;
}

.demo-section {
    padding: 20px;
}

.demo-section h3 {
    margin-top: 0;
    color: #409eff;
}

.demo-section ul {
    list-style: none;
    padding: 0;
}

.demo-section ul li {
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.demo-section ul li:last-child {
    border-bottom: none;
}

.code-block {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #303133;
}

:deep(.el-card__body) {
    padding-top: 10px;
}

:deep(.el-table) {
    font-size: 13px;
}
</style>
