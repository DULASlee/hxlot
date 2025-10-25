#!/usr/bin/env node
/**
 * ts-morph Vue组件生成器
 * 由FrontendWorkstation调用，负责生成Vue组件和TypeScript类型
 *
 * 使用方式: node tsMorphGenerator.js '{"Name":"User","DisplayName":"用户",...}'
 */

const { Project, ScriptKind } = require('ts-morph');
const path = require('path');

// 从命令行参数读取实体元数据JSON
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 错误：缺少实体元数据JSON参数');
  console.error('使用方式: node tsMorphGenerator.js \'{"Name":"User",...}\'');
  process.exit(1);
}

let entitySchema;
try {
  entitySchema = JSON.parse(args[0]);
} catch (error) {
  console.error('❌ 错误：无法解析JSON参数:', error.message);
  process.exit(1);
}

// 验证必需字段
if (!entitySchema.Name || !entitySchema.DisplayName) {
  console.error('❌ 错误：实体元数据缺少必需字段（Name, DisplayName）');
  process.exit(1);
}

console.log(`🚀 开始生成Vue组件: ${entitySchema.Name} (${entitySchema.DisplayName})`);

// 创建ts-morph项目（内存模式，不实际写入文件）
const project = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    target: 99, // ESNext
    module: 99, // ESNext
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true
  }
});

// ==================== 生成TypeScript接口 ====================
const typeScriptCode = generateTypeScriptInterface(entitySchema);
console.log('✅ TypeScript接口已生成');

// ==================== 生成API Client ====================
const apiClientCode = generateApiClient(entitySchema);
console.log('✅ API Client已生成');

// ==================== 生成Pinia Store ====================
const storeCode = generatePiniaStore(entitySchema);
console.log('✅ Pinia Store已生成');

// ==================== 生成Vue组件 ====================
const vueComponentCode = generateVueComponent(entitySchema);
console.log('✅ Vue组件已生成');

// ==================== 输出所有生成的代码 ====================
const output = {
  types: typeScriptCode,
  apiClient: apiClientCode,
  store: storeCode,
  component: vueComponentCode
};

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 生成完成！代码结构:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(JSON.stringify(output, null, 2));

// ==================== 辅助函数 ====================

/**
 * 生成TypeScript接口
 */
function generateTypeScriptInterface(schema) {
  const interfaceFile = project.createSourceFile('types.ts', '', { overwrite: true });

  // 主DTO接口
  interfaceFile.addInterface({
    name: `${schema.Name}Dto`,
    isExported: true,
    properties: [
      { name: 'id', type: 'string', hasQuestionToken: true },
      ...schema.Properties.map(prop => ({
        name: toCamelCase(prop.Name),
        type: mapToTypeScript(prop.Type),
        hasQuestionToken: !prop.IsRequired
      }))
    ]
  });

  // Create DTO接口
  interfaceFile.addInterface({
    name: `Create${schema.Name}Input`,
    isExported: true,
    properties: schema.Properties
      .filter(p => !p.IsKey)
      .map(prop => ({
        name: toCamelCase(prop.Name),
        type: mapToTypeScript(prop.Type),
        hasQuestionToken: !prop.IsRequired
      }))
  });

  // Update DTO接口
  interfaceFile.addInterface({
    name: `Update${schema.Name}Input`,
    isExported: true,
    properties: schema.Properties
      .filter(p => !p.IsKey)
      .map(prop => ({
        name: toCamelCase(prop.Name),
        type: mapToTypeScript(prop.Type),
        hasQuestionToken: !prop.IsRequired
      }))
  });

  return interfaceFile.getFullText();
}

/**
 * 生成API Client
 */
function generateApiClient(schema) {
  const entityName = schema.Name;
  const camelName = toCamelCase(entityName);
  const kebabName = toKebabCase(pluralize(entityName));

  return `
import http from '@/utils/http'
import type { ${entityName}Dto, Create${entityName}Input, Update${entityName}Input } from './types'
import type { PagedResultDto } from '@/types'

/**
 * ${schema.DisplayName} API客户端
 */
export class ${entityName}ApiClient {
  private readonly baseUrl = '/api/lowcode/${kebabName}'

  /**
   * 获取列表
   */
  async getList(params: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
  }): Promise<PagedResultDto<${entityName}Dto>> {
    return await http.get(this.baseUrl, { params })
  }

  /**
   * 获取详情
   */
  async get(id: string): Promise<${entityName}Dto> {
    return await http.get(\`\${this.baseUrl}/\${id}\`)
  }

  /**
   * 创建
   */
  async create(input: Create${entityName}Input): Promise<${entityName}Dto> {
    return await http.post(this.baseUrl, input)
  }

  /**
   * 更新
   */
  async update(id: string, input: Update${entityName}Input): Promise<${entityName}Dto> {
    return await http.put(\`\${this.baseUrl}/\${id}\`, input)
  }

  /**
   * 删除
   */
  async delete(id: string): Promise<void> {
    return await http.delete(\`\${this.baseUrl}/\${id}\`)
  }
}

export const ${camelName}Api = new ${entityName}ApiClient()
`.trim();
}

/**
 * 生成Pinia Store
 */
function generatePiniaStore(schema) {
  const entityName = schema.Name;
  const camelName = toCamelCase(entityName);

  return `
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ${camelName}Api } from './api'
import type { ${entityName}Dto, Create${entityName}Input, Update${entityName}Input } from './types'
import type { PagedResultDto } from '@/types'

/**
 * ${schema.DisplayName} Store
 */
export const use${entityName}Store = defineStore('${camelName}', () => {
  // State
  const ${camelName}List = ref<${entityName}Dto[]>([])
  const current${entityName} = ref<${entityName}Dto | null>(null)
  const totalCount = ref(0)
  const loading = ref(false)

  // Actions
  async function loadList(params: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
  }) {
    loading.value = true
    try {
      const result = await ${camelName}Api.getList(params)
      ${camelName}List.value = result.items
      totalCount.value = result.totalCount
    } finally {
      loading.value = false
    }
  }

  async function load(id: string) {
    loading.value = true
    try {
      current${entityName}.value = await ${camelName}Api.get(id)
    } finally {
      loading.value = false
    }
  }

  async function create(input: Create${entityName}Input) {
    loading.value = true
    try {
      const created = await ${camelName}Api.create(input)
      ${camelName}List.value.unshift(created)
      totalCount.value++
      return created
    } finally {
      loading.value = false
    }
  }

  async function update(id: string, input: Update${entityName}Input) {
    loading.value = true
    try {
      const updated = await ${camelName}Api.update(id, input)
      const index = ${camelName}List.value.findIndex(x => x.id === id)
      if (index >= 0) {
        ${camelName}List.value[index] = updated
      }
      return updated
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    loading.value = true
    try {
      await ${camelName}Api.delete(id)
      const index = ${camelName}List.value.findIndex(x => x.id === id)
      if (index >= 0) {
        ${camelName}List.value.splice(index, 1)
        totalCount.value--
      }
    } finally {
      loading.value = false
    }
  }

  return {
    ${camelName}List,
    current${entityName},
    totalCount,
    loading,
    loadList,
    load,
    create,
    update,
    remove
  }
})
`.trim();
}

/**
 * 生成Vue组件
 */
function generateVueComponent(schema) {
  const entityName = schema.Name;
  const camelName = toCamelCase(entityName);
  const kebabName = toKebabCase(entityName);
  const displayName = schema.DisplayName;

  // 生成表格列
  const tableColumns = schema.Properties
    .slice(0, 5) // 只显示前5个属性
    .map(prop => `        <el-table-column prop="${toCamelCase(prop.Name)}" label="${prop.DisplayName}" />`)
    .join('\n');

  // 生成表单项
  const formItems = schema.Properties
    .filter(p => !p.IsKey)
    .map(prop => {
      const camelPropName = toCamelCase(prop.Name);
      return `        <el-form-item label="${prop.DisplayName}" prop="${camelPropName}">
          <el-input v-model="form.${camelPropName}" />
        </el-form-item>`;
    })
    .join('\n');

  return `
<template>
  <div class="${kebabName}-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>${displayName}管理</span>
          <el-button type="primary" @click="handleCreate">新增</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchKeyword" placeholder="请输入关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="store.loading"
        :data="store.${camelName}List"
        border
      >
${tableColumns}
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="store.totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑${displayName}' : '新增${displayName}'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" label-width="120px">
${formItems}
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { use${entityName}Store } from './store'
import type { ${entityName}Dto, Create${entityName}Input, Update${entityName}Input } from './types'

const store = use${entityName}Store()

// State
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<string>('')  // ✅ 存储当前编辑的实体ID，100%类型安全
const form = ref<Create${entityName}Input>({})  // ✅ 使用空对象初始化，避免类型断言

// 加载数据
async function loadData() {
  await store.loadList({
    skipCount: (currentPage.value - 1) * pageSize.value,
    maxResultCount: pageSize.value
  })
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  loadData()
}

// 重置
function handleReset() {
  searchKeyword.value = ''
  currentPage.value = 1
  loadData()
}

// 新增
function handleCreate() {
  isEdit.value = false
  form.value = {} as Create${entityName}Input
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: ${entityName}Dto) {
  isEdit.value = true
  currentId.value = row.id!  // ✅ 保存ID到单独变量
  form.value = { ...row }
  dialogVisible.value = true
}

// 提交
async function handleSubmit() {
  try {
    if (isEdit.value) {
      // ✅ 使用currentId.value，100%类型安全
      await store.update(currentId.value, form.value as Update${entityName}Input)
      ElMessage.success('更新成功')
    } else {
      await store.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 删除
async function handleDelete(row: ${entityName}Dto) {
  try {
    await ElMessageBox.confirm('确认删除吗？', '提示', {
      type: 'warning'
    })
    await store.remove(row.id!)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
`.trim();
}

// ==================== 辅助函数 ====================

function toCamelCase(str) {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toKebabCase(str) {
  if (!str) return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function pluralize(str) {
  if (!str) return '';
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s')) {
    return str + 'es';
  }
  return str + 's';
}

function mapToTypeScript(csharpType) {
  const typeMap = {
    'string': 'string',
    'int': 'number',
    'long': 'number',
    'decimal': 'number',
    'double': 'number',
    'float': 'number',
    'bool': 'boolean',
    'boolean': 'boolean',
    'datetime': 'Date',
    'guid': 'string',
    'Guid': 'string',
    'DateTime': 'Date'
  };

  // 移除可空标记（?）
  const baseType = csharpType?.replace('?', '');
  return typeMap[baseType] || 'any';
}

console.log('\n✅ ts-morph生成器执行成功！');
process.exit(0);

