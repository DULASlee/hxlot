/**
 * 前端代码生成器
 * 基于元数据生成 TypeScript 类型、API、表单、列表、Store等
 */

import type { EntityMetadata, PropertyMetadata } from '@smartabp/metadata-core'
import { promises as fs } from 'fs'
import path from 'node:path'

export interface GeneratorOptions {
  dryRun?: boolean
  verbose?: boolean
  outputDir?: string
}

export interface GenerationResult {
  files: string[]
  errors: string[]
}

export class FrontendCodeGenerator {
  constructor(
    private rootDir: string,
    private options: GeneratorOptions = {}
  ) { }

  /**
   * 生成所有前端代码
   */
  async generate(metadata: EntityMetadata): Promise<GenerationResult> {
    const files: string[] = []
    const errors: string[] = []

    try {
      // 确定输出目录
      const modulePath = metadata.module.toLowerCase()
      const entityPath = metadata.name.toLowerCase()
      const outputDir = this.options.outputDir ||
        path.join(this.rootDir, 'src', 'views', modulePath, entityPath)

      // 生成各类文件
      const generators = [
        { name: 'types', fn: () => this.generateTypes(metadata, outputDir) },
        { name: 'api', fn: () => this.generateApi(metadata, outputDir) },
        { name: 'list', fn: () => this.generateListComponent(metadata, outputDir) },
        { name: 'form', fn: () => this.generateFormComponent(metadata, outputDir) },
        { name: 'detail', fn: () => this.generateDetailComponent(metadata, outputDir) },
        { name: 'store', fn: () => this.generateStore(metadata, outputDir) },
      ]

      for (const generator of generators) {
        try {
          const filePath = await generator.fn()
          files.push(filePath)
        } catch (err) {
          errors.push(`${generator.name}: ${err}`)
        }
      }

    } catch (err) {
      errors.push(`Generation failed: ${err}`)
    }

    return { files, errors }
  }

  /**
   * 生成TypeScript类型定义
   */
  private async generateTypes(metadata: EntityMetadata, outputDir: string): Promise<string> {
    const content = `/**
 * ${metadata.name} 类型定义
 * 由元数据自动生成，请勿手动修改
 * @generated
 */

${this.generateTypeImports(metadata)}

/**
 * ${metadata.name} DTO
 */
export interface ${metadata.name}Dto {
${this.generateDtoProperties(metadata)}
}

/**
 * 创建/更新 ${metadata.name} DTO
 */
export interface Create${metadata.name}Dto {
${this.generateCreateDtoProperties(metadata)}
}

/**
 * 更新 ${metadata.name} DTO
 */
export interface Update${metadata.name}Dto extends Partial<Create${metadata.name}Dto> {}

/**
 * ${metadata.name} 分页查询DTO
 */
export interface ${metadata.name}PagedRequestDto {
  skipCount?: number
  maxResultCount?: number
  sorting?: string
  ${this.generateSearchProperties(metadata)}
}

/**
 * ${metadata.name} 分页结果DTO
 */
export interface ${metadata.name}PagedResultDto {
  totalCount: number
  items: ${metadata.name}Dto[]
}
`

    return await this.writeFile(outputDir, `${metadata.name.toLowerCase()}.types.ts`, content)
  }

  /**
   * 生成API请求函数
   */
  private async generateApi(metadata: EntityMetadata, outputDir: string): Promise<string> {
    const entityName = metadata.name
    const entityNameLower = metadata.name.toLowerCase()
    const moduleLower = metadata.module.toLowerCase()

    const content = `/**
 * ${entityName} API
 * 由元数据自动生成，请勿手动修改
 * @generated
 */

import http from '@/utils/http'
import type {
  ${entityName}Dto,
  Create${entityName}Dto,
  Update${entityName}Dto,
  ${entityName}PagedRequestDto,
  ${entityName}PagedResultDto
} from './${entityNameLower}.types'

const BASE_URL = '/api/${moduleLower}/${entityNameLower}'

/**
 * 获取${entityName}列表
 */
export function get${entityName}List(params?: ${entityName}PagedRequestDto) {
  return http.get<${entityName}PagedResultDto>(BASE_URL, { params })
}

/**
 * 获取${entityName}详情
 */
export function get${entityName}ById(id: string) {
  return http.get<${entityName}Dto>(\`\${BASE_URL}/\${id}\`)
}

/**
 * 创建${entityName}
 */
export function create${entityName}(data: Create${entityName}Dto) {
  return http.post<${entityName}Dto>(BASE_URL, data)
}

/**
 * 更新${entityName}
 */
export function update${entityName}(id: string, data: Update${entityName}Dto) {
  return http.put<${entityName}Dto>(\`\${BASE_URL}/\${id}\`, data)
}

/**
 * 删除${entityName}
 */
export function delete${entityName}(id: string) {
  return http.delete(\`\${BASE_URL}/\${id}\`)
}

/**
 * 批量删除${entityName}
 */
export function delete${entityName}Batch(ids: string[]) {
  return http.delete(BASE_URL, { data: { ids } })
}
`

    return await this.writeFile(outputDir, `${entityNameLower}-api.ts`, content)
  }

  /**
   * 生成列表组件
   */
  private async generateListComponent(metadata: EntityMetadata, outputDir: string): Promise<string> {
    const entityName = metadata.name
    const entityNameLower = metadata.name.toLowerCase()

    const content = `<template>
  <div class="${entityNameLower}-list">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
${this.generateSearchFormItems(metadata)}
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button type="primary" icon="Plus" @click="handleCreate">新增</el-button>
        <el-button type="danger" icon="Delete" :disabled="!selectedRows.length" @click="handleBatchDelete">
          批量删除
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
${this.generateTableColumns(metadata)}
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 表单对话框 -->
    <${entityName}Form
      v-model:visible="formVisible"
      :${entityNameLower}-id="currentId"
      @success="handleFormSuccess"
    />

    <!-- 详情对话框 -->
    <${entityName}Detail
      v-model:visible="detailVisible"
      :${entityNameLower}-id="currentId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get${entityName}List, delete${entityName}, delete${entityName}Batch } from './${entityNameLower}-api'
import ${entityName}Form from './${entityName}Form.vue'
import ${entityName}Detail from './${entityName}Detail.vue'
import type { ${entityName}Dto, ${entityName}PagedRequestDto } from './${entityNameLower}.types'

// 搜索表单
const searchForm = ref<${entityName}PagedRequestDto>({})

// 表格数据
const tableData = ref<${entityName}Dto[]>([])
const loading = ref(false)
const selectedRows = ref<${entityName}Dto[]>([])

// 分页
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

// 对话框
const formVisible = ref(false)
const detailVisible = ref(false)
const currentId = ref<string>()

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const { items, totalCount } = await get${entityName}List({
      ...searchForm.value,
      skipCount: (pagination.value.current - 1) * pagination.value.pageSize,
      maxResultCount: pagination.value.pageSize
    })
    tableData.value = items
    pagination.value.total = totalCount
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.value.current = 1
  loadData()
}

// 重置
function handleReset() {
  searchForm.value = {}
  handleSearch()
}

// 新增
function handleCreate() {
  currentId.value = undefined
  formVisible.value = true
}

// 编辑
function handleEdit(row: ${entityName}Dto) {
  currentId.value = row.id
  formVisible.value = true
}

// 查看
function handleView(row: ${entityName}Dto) {
  currentId.value = row.id
  detailVisible.value = true
}

// 删除
async function handleDelete(row: ${entityName}Dto) {
  try {
    await ElMessageBox.confirm('确认删除此记录吗？', '提示', {
      type: 'warning'
    })
    await delete${entityName}(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(\`确认删除选中的 \${selectedRows.value.length} 条记录吗？\`, '提示', {
      type: 'warning'
    })
    await delete${entityName}Batch(selectedRows.value.map(r => r.id))
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化
function handleSelectionChange(rows: ${entityName}Dto[]) {
  selectedRows.value = rows
}

// 分页变化
function handleSizeChange() {
  pagination.value.current = 1
  loadData()
}

function handleCurrentChange() {
  loadData()
}

// 表单成功回调
function handleFormSuccess() {
  formVisible.value = false
  loadData()
}

// 挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.${entityNameLower}-list {
  .search-form {
    margin-bottom: 16px;
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .el-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
`

    return await this.writeFile(outputDir, `${entityName}List.vue`, content)
  }

  /**
   * 生成表单组件
   */
  private async generateFormComponent(metadata: EntityMetadata, outputDir: string): Promise<string> {
    const entityName = metadata.name
    const entityNameLower = metadata.name.toLowerCase()

    const content = `<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      v-loading="loading"
    >
${this.generateFormItems(metadata)}
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { get${entityName}ById, create${entityName}, update${entityName} } from './${entityNameLower}-api'
import type { Create${entityName}Dto } from './${entityNameLower}.types'

interface Props {
  visible: boolean
  ${entityNameLower}Id?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

// 表单数据
const formData = ref<Create${entityName}Dto>({
${this.generateFormDataDefaults(metadata)}
})

// 验证规则
const rules: FormRules = {
${this.generateFormRules(metadata)}
}

// 标题
const title = computed(() => props.${entityNameLower}Id ? '编辑' : '新增')

// 监听ID变化，加载数据
watch(() => props.${entityNameLower}Id, (id) => {
  if (id && props.visible) {
    loadData(id)
  } else {
    resetForm()
  }
}, { immediate: true })

// 加载数据
async function loadData(id: string) {
  loading.value = true
  try {
    const data = await get${entityName}ById(id)
    formData.value = { ...data }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
function resetForm() {
  formData.value = {
${this.generateFormDataDefaults(metadata)}
  }
  formRef.value?.clearValidate()
}

// 提交
async function handleSubmit() {
  try {
    await formRef.value?.validate()
    
    submitting.value = true
    if (props.${entityNameLower}Id) {
      await update${entityName}(props.${entityNameLower}Id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await create${entityName}(formData.value)
      ElMessage.success('创建成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}

// 关闭
function handleClose() {
  emit('update:visible', false)
}
</script>
`

    return await this.writeFile(outputDir, `${entityName}Form.vue`, content)
  }

  /**
   * 生成详情组件
   */
  private async generateDetailComponent(metadata: EntityMetadata, outputDir: string): Promise<string> {
    const entityName = metadata.name
    const entityNameLower = metadata.name.toLowerCase()

    const content = `<template>
  <el-dialog
    v-model="visible"
    title="详情"
    width="600px"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-loading="loading">
${this.generateDescriptionItems(metadata)}
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { get${entityName}ById } from './${entityNameLower}-api'
import type { ${entityName}Dto } from './${entityNameLower}.types'

interface Props {
  visible: boolean
  ${entityNameLower}Id?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const data = ref<${entityName}Dto>()

// 监听ID变化，加载数据
watch(() => [props.${entityNameLower}Id, props.visible], ([id, visible]) => {
  if (id && visible) {
    loadData(id as string)
  }
}, { immediate: true })

// 加载数据
async function loadData(id: string) {
  loading.value = true
  try {
    data.value = await get${entityName}ById(id)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 关闭
function handleClose() {
  emit('update:visible', false)
}
</script>
`

    return await this.writeFile(outputDir, `${entityName}Detail.vue`, content)
  }

  /**
   * 生成Pinia Store
   */
  private async generateStore(metadata: EntityMetadata, outputDir: string): Promise<string> {
    const entityName = metadata.name
    const entityNameLower = metadata.name.toLowerCase()
    const moduleLower = metadata.module.toLowerCase()

    const storeDir = path.join(this.rootDir, 'src', 'stores', moduleLower)
    const content = `/**
 * ${entityName} Store
 * 由元数据自动生成，请勿手动修改
 * @generated
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  get${entityName}List,
  get${entityName}ById,
  create${entityName},
  update${entityName},
  delete${entityName}
} from '@/views/${moduleLower}/${entityNameLower}/${entityNameLower}-api'
import type {
  ${entityName}Dto,
  Create${entityName}Dto,
  Update${entityName}Dto,
  ${entityName}PagedRequestDto
} from '@/views/${moduleLower}/${entityNameLower}/${entityNameLower}.types'

export const use${entityName}Store = defineStore('${entityNameLower}', () => {
  // 状态
  const list = ref<${entityName}Dto[]>([])
  const current = ref<${entityName}Dto>()
  const loading = ref(false)
  const total = ref(0)

  // 获取列表
  async function fetchList(params?: ${entityName}PagedRequestDto) {
    loading.value = true
    try {
      const { items, totalCount } = await get${entityName}List(params)
      list.value = items
      total.value = totalCount
      return items
    } finally {
      loading.value = false
    }
  }

  // 获取详情
  async function fetchById(id: string) {
    loading.value = true
    try {
      current.value = await get${entityName}ById(id)
      return current.value
    } finally {
      loading.value = false
    }
  }

  // 创建
  async function create(data: Create${entityName}Dto) {
    const result = await create${entityName}(data)
    list.value.unshift(result)
    total.value++
    return result
  }

  // 更新
  async function update(id: string, data: Update${entityName}Dto) {
    const result = await update${entityName}(id, data)
    const index = list.value.findIndex(item => item.id === id)
    if (index > -1) {
      list.value[index] = result
    }
    if (current.value?.id === id) {
      current.value = result
    }
    return result
  }

  // 删除
  async function remove(id: string) {
    await delete${entityName}(id)
    const index = list.value.findIndex(item => item.id === id)
    if (index > -1) {
      list.value.splice(index, 1)
      total.value--
    }
    if (current.value?.id === id) {
      current.value = undefined
    }
  }

  // 清空
  function reset() {
    list.value = []
    current.value = undefined
    total.value = 0
  }

  return {
    // 状态
    list,
    current,
    loading,
    total,

    // 方法
    fetchList,
    fetchById,
    create,
    update,
    remove,
    reset
  }
})
`

    return await this.writeFile(storeDir, `use${entityName}Store.ts`, content)
  }

  // ========== 辅助方法 ==========

  private generateTypeImports(metadata: EntityMetadata): string {
    // 生成必要的import语句
    return ''
  }

  private generateDtoProperties(metadata: EntityMetadata): string {
    const props = metadata.properties.map((prop: PropertyMetadata) => {
      const tsType = this.mapTypeToTypeScript(prop.type)
      const optional = !prop.isRequired ? '?' : ''
      const comment = prop.description ? `  /** ${prop.description} */\n` : ''
      return `${comment}  ${prop.name}${optional}: ${tsType}`
    })

    // 添加标准ABP字段
    props.unshift('  id: string')
    if (metadata.isSoftDelete) {
      props.push('  isDeleted?: boolean')
    }
    props.push('  creationTime?: string')
    props.push('  creatorId?: string')

    return props.join('\n')
  }

  private generateCreateDtoProperties(metadata: EntityMetadata): string {
    return metadata.properties
      .filter((prop: PropertyMetadata) => !prop.isReadOnly)
      .map((prop: PropertyMetadata) => {
        const tsType = this.mapTypeToTypeScript(prop.type)
        const optional = !prop.isRequired ? '?' : ''
        const comment = prop.description ? `  /** ${prop.description} */\n` : ''
        return `${comment}  ${prop.name}${optional}: ${tsType}`
      })
      .join('\n')
  }

  private generateSearchProperties(metadata: EntityMetadata): string {
    const searchFields = metadata.xUiConfig?.searchFields || []
    return searchFields
      .map((fieldName: string) => `${fieldName}?: string`)
      .join('\n  ')
  }

  private generateSearchFormItems(metadata: EntityMetadata): string {
    const searchFields = metadata.xUiConfig?.searchFields || []
    return searchFields
      .map((fieldName: string) => {
        const prop = metadata.properties.find((p: PropertyMetadata) => p.name === fieldName)
        const label = prop?.displayName || fieldName
        return `        <el-form-item label="${label}">
          <el-input v-model="searchForm.${fieldName}" placeholder="请输入${label}" clearable />
        </el-form-item>`
      })
      .join('\n')
  }

  private generateTableColumns(metadata: EntityMetadata): string {
    const columns = metadata.xUiConfig?.listColumns ||
      metadata.properties.slice(0, 5).map((p: PropertyMetadata) => p.name)

    return columns
      .map((colName: string) => {
        const prop = metadata.properties.find((p: PropertyMetadata) => p.name === colName)
        const label = prop?.displayName || colName
        return `        <el-table-column prop="${colName}" label="${label}" />`
      })
      .join('\n')
  }

  private generateFormItems(metadata: EntityMetadata): string {
    const formFields = metadata.xUiConfig?.formFields ||
      metadata.properties.filter((p: PropertyMetadata) => !p.isReadOnly).map((p: PropertyMetadata) => p.name)

    return formFields
      .map((fieldName: string) => {
        const prop = metadata.properties.find((p: PropertyMetadata) => p.name === fieldName)
        if (!prop) return ''

        const label = prop.displayName || fieldName
        const required = prop.isRequired ? ' required' : ''

        return `      <el-form-item label="${label}" prop="${fieldName}"${required}>
        ${this.generateFormControl(prop)}
      </el-form-item>`
      })
      .join('\n')
  }

  private generateFormControl(prop: PropertyMetadata): string {
    switch (prop.type) {
      case 'string':
        if (prop.maxLength && prop.maxLength > 200) {
          return `<el-input v-model="formData.${prop.name}" type="textarea" :rows="4" placeholder="请输入${prop.displayName || prop.name}" />`
        }
        return `<el-input v-model="formData.${prop.name}" placeholder="请输入${prop.displayName || prop.name}" />`

      case 'int':
      case 'long':
      case 'decimal':
        return `<el-input-number v-model="formData.${prop.name}" :controls="false" style="width: 100%" />`

      case 'bool':
        return `<el-switch v-model="formData.${prop.name}" />`

      case 'DateTime':
        return `<el-date-picker v-model="formData.${prop.name}" type="datetime" placeholder="选择日期时间" style="width: 100%" />`

      default:
        return `<el-input v-model="formData.${prop.name}" placeholder="请输入${prop.displayName || prop.name}" />`
    }
  }

  private generateFormDataDefaults(metadata: EntityMetadata): string {
    return metadata.properties
      .filter((p: PropertyMetadata) => !p.isReadOnly)
      .map((prop: PropertyMetadata) => {
        const defaultValue = prop.defaultValue || this.getDefaultValue(prop.type)
        return `    ${prop.name}: ${defaultValue}`
      })
      .join(',\n')
  }

  private generateFormRules(metadata: EntityMetadata): string {
    return metadata.properties
      .filter((p: PropertyMetadata) => p.isRequired && !p.isReadOnly)
      .map((prop: PropertyMetadata) => {
        return `  ${prop.name}: [
    { required: true, message: '请输入${prop.displayName || prop.name}', trigger: 'blur' }
  ]`
      })
      .join(',\n')
  }

  private generateDescriptionItems(metadata: EntityMetadata): string {
    return metadata.properties
      .map((prop: PropertyMetadata) => {
        const label = prop.displayName || prop.name
        return `      <el-descriptions-item label="${label}">
        {{ data?.${prop.name} }}
      </el-descriptions-item>`
      })
      .join('\n')
  }

  private mapTypeToTypeScript(type: string): string {
    const map: Record<string, string> = {
      'string': 'string',
      'int': 'number',
      'long': 'number',
      'decimal': 'number',
      'bool': 'boolean',
      'DateTime': 'string',
      'Guid': 'string'
    }
    return map[type] || 'any'
  }

  private getDefaultValue(type: string): string {
    const map: Record<string, string> = {
      'string': "''",
      'int': '0',
      'long': '0',
      'decimal': '0',
      'bool': 'false',
      'DateTime': 'undefined',
      'Guid': 'undefined'
    }
    return map[type] || 'undefined'
  }

  private async writeFile(dir: string, filename: string, content: string): Promise<string> {
    const filePath = path.join(dir, filename)

    if (this.options.dryRun) {
      if (this.options.verbose) {
        console.log(`[Dry-run] Would write: ${filePath}`)
      }
      return filePath
    }

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')

    if (this.options.verbose) {
      console.log(`Generated: ${filePath}`)
    }

    return filePath
  }
}

