using System;
using System.Linq;
using System.Threading.Tasks;
using HandlebarsDotNet;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// Vue CRUD页面生成器
/// Phase 2核心组件 - 生成完整的Vue3前端CRUD页面
/// </summary>
public class VueCrudPageGenerator : CodeGeneratorFramework<Guid, VueCrudPageGeneratorOutput>
{
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public VueCrudPageGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager)
    {
        _metadataSDK = metadataSDK;
        _templateManager = templateManager;
        
        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override async Task<VueCrudPageGeneratorOutput> GenerateAsync(Guid entityId)
    {
        // 1. 验证输入
        var validation = await ValidateInputAsync(entityId);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        // 2. 获取元数据
        var entity = _metadataSDK.GetEntity(entityId);
        if (entity == null)
            throw new InvalidOperationException($"Entity {entityId} not found");

        var properties = _metadataSDK.GetProperties(entityId);
        var primaryKeyType = _metadataSDK.GetPrimaryKeyType(entityId);

        // 3. 准备模板数据
        var templateData = PrepareTemplateData(entity, properties, primaryKeyType);

        // 4. 生成代码
        var listPage = GenerateListPage(templateData);
        var formDialog = GenerateFormDialog(templateData);
        var apiClient = GenerateApiClient(templateData);
        var typeDefinitions = GenerateTypeDefinitions(templateData);

        return new VueCrudPageGeneratorOutput
        {
            ListPageCode = listPage,
            FormDialogCode = formDialog,
            ApiClientCode = apiClient,
            TypeDefinitionsCode = typeDefinitions,
            EntityName = entity.Name
        };
    }

    public override Task<ValidationResult> ValidateInputAsync(Guid entityId)
    {
        if (_metadataSDK.GetEntity(entityId) == null)
        {
            return Task.FromResult(ValidationResult.Fail($"Entity with ID {entityId} not found."));
        }
        return Task.FromResult(ValidationResult.Success());
    }

    /// <summary>
    /// 准备模板数据
    /// </summary>
    private object PrepareTemplateData(dynamic entity, dynamic properties, string primaryKeyType)
    {
        var entityName = entity.Name;
        var entityNamePlural = StringHelper.Pluralize(entityName);
        var entityNameCamel = StringHelper.ToCamelCase(entityName);
        var entityNameKebab = StringHelper.ToKebabCase(entityName);

        // 转换属性到前端格式
        var vueProp = properties.Select(p => new
        {
            Name = p.Name,
            NameCamel = StringHelper.ToCamelCase(p.Name),
            Type = p.Type,
            TypeScript = TypeMapper.CSharpToTypeScript(p.Type),
            IsRequired = p.IsRequired ?? false,
            MaxLength = p.Length ?? 0,
            HasMaxLength = (p.Length ?? 0) > 0,
            IsString = TypeMapper.IsStringType(p.Type),
            IsNumber = TypeMapper.IsNumericType(p.Type),
            IsBoolean = TypeMapper.IsBooleanType(p.Type),
            IsDateTime = TypeMapper.IsDateTimeType(p.Type),
            DefaultValue = TypeMapper.GetTypeScriptDefaultValue(TypeMapper.CSharpToTypeScript(p.Type)),
            ValidationRules = ValidationHelper.GenerateTypeScriptValidation(
                StringHelper.ToCamelCase(p.Name),
                TypeMapper.CSharpToTypeScript(p.Type),
                p.IsRequired ?? false,
                p.Length,
                null, null, null, null
            )
        }).ToList();

        return new
        {
            EntityName = entityName,
            EntityNamePlural = entityNamePlural,
            EntityNameCamel = entityNameCamel,
            EntityNameKebab = entityNameKebab,
            PrimaryKeyType = primaryKeyType,
            PrimaryKeyTypeScript = TypeMapper.CSharpToTypeScript(primaryKeyType),
            
            // 属性列表
            Properties = vueProps,
            
            // API路由
            ApiPath = $"/api/app/{StringHelper.ToKebabCase(entityNamePlural)}",
            
            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };
    }

    /// <summary>
    /// 生成列表页面
    /// </summary>
    private string GenerateListPage(object templateData)
    {
        var templateSource = @"<template>
  <div class=""{{EntityNameKebab}}-list"">
    <!-- 搜索栏 -->
    <el-card class=""search-card"" shadow=""never"">
      <el-form :model=""searchForm"" inline>
        <el-form-item label=""搜索"">
          <el-input
            v-model=""searchForm.filter""
            placeholder=""请输入关键词""
            clearable
            @clear=""handleSearch""
            @keyup.enter=""handleSearch""
          />
        </el-form-item>
        <el-form-item>
          <el-button type=""primary"" @click=""handleSearch"">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click=""handleReset"">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class=""action-card"" shadow=""never"">
      <el-button type=""primary"" @click=""handleCreate"">
        <el-icon><Plus /></el-icon>
        新增{{EntityName}}
      </el-button>
      <el-button
        type=""danger""
        :disabled=""selectedIds.length === 0""
        @click=""handleBatchDelete""
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class=""table-card"" shadow=""never"">
      <el-table
        v-loading=""loading""
        :data=""tableData""
        @selection-change=""handleSelectionChange""
      >
        <el-table-column type=""selection"" width=""55"" />
{{#each Properties}}
        <el-table-column prop=""{{NameCamel}}"" label=""{{Name}}"" {{#if IsDateTime}}width=""180""{{/if}} />
{{/each}}
        <el-table-column label=""操作"" width=""180"" fixed=""right"">
          <template #default=""{ row }"">
            <el-button link type=""primary"" @click=""handleEdit(row)"">
              编辑
            </el-button>
            <el-button link type=""danger"" @click=""handleDelete(row)"">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page=""pagination.page""
        v-model:page-size=""pagination.pageSize""
        :total=""pagination.total""
        :page-sizes=""[10, 20, 50, 100]""
        layout=""total, sizes, prev, pager, next, jumper""
        @size-change=""handlePageSizeChange""
        @current-change=""handlePageChange""
      />
    </el-card>

    <!-- 表单弹窗 -->
    <{{EntityName}}FormDialog
      v-model=""dialogVisible""
      :form-data=""currentRow""
      :mode=""dialogMode""
      @success=""handleFormSuccess""
    />
  </div>
</template>

<script setup lang=""ts"">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import {{EntityName}}FormDialog from './{{EntityName}}FormDialog.vue'
import { {{EntityNameCamel}}Api } from '@/api/{{EntityNameKebab}}'
import type { {{EntityName}}Dto } from '@/api/{{EntityNameKebab}}/types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式数据
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const loading = ref(false)
const tableData = ref<{{EntityName}}Dto[]>([])
const selectedIds = ref<string[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentRow = ref<{{EntityName}}Dto | null>(null)

const searchForm = reactive({
  filter: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  loadData()
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 数据加载
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function loadData() {
  try {
    loading.value = true
    const response = await {{EntityNameCamel}}Api.getList({
      filter: searchForm.filter,
      skipCount: (pagination.page - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize
    })
    
    tableData.value = response.items
    pagination.total = response.totalCount
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 事件处理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.filter = ''
  pagination.page = 1
  loadData()
}

function handleCreate() {
  dialogMode.value = 'create'
  currentRow.value = null
  dialogVisible.value = true
}

function handleEdit(row: {{EntityName}}Dto) {
  dialogMode.value = 'edit'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

async function handleDelete(row: {{EntityName}}Dto) {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await {{EntityNameCamel}}Api.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await Promise.all(selectedIds.value.map(id => {{EntityNameCamel}}Api.delete(id)))
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

function handleSelectionChange(selection: {{EntityName}}Dto[]) {
  selectedIds.value = selection.map(item => item.id)
}

function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadData()
}

function handleFormSuccess() {
  dialogVisible.value = false
  loadData()
}
</script>

<style scoped lang=""scss"">
.{{EntityNameKebab}}-list {
  padding: 16px;

  .search-card,
  .action-card,
  .table-card {
    margin-bottom: 16px;
  }

  .el-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }

    /// <summary>
    /// 生成表单弹窗
    /// </summary>
    private string GenerateFormDialog(object templateData)
    {
        var templateSource = @"<template>
  <el-dialog
    v-model=""visible""
    :title=""mode === 'create' ? '新增{{EntityName}}' : '编辑{{EntityName}}'"" 
    width=""600px""
    @close=""handleClose""
  >
    <el-form
      ref=""formRef""
      :model=""form""
      :rules=""rules""
      label-width=""120px""
    >
{{#each Properties}}
{{#if IsString}}
      <el-form-item label=""{{Name}}"" prop=""{{NameCamel}}"">
        <el-input v-model=""form.{{NameCamel}}"" placeholder=""请输入{{Name}}"" {{#if HasMaxLength}}maxlength=""{{MaxLength}}""{{/if}} />
      </el-form-item>
{{else if IsNumber}}
      <el-form-item label=""{{Name}}"" prop=""{{NameCamel}}"">
        <el-input-number v-model=""form.{{NameCamel}}"" :controls=""false"" style=""width: 100%"" />
      </el-form-item>
{{else if IsBoolean}}
      <el-form-item label=""{{Name}}"" prop=""{{NameCamel}}"">
        <el-switch v-model=""form.{{NameCamel}}"" />
      </el-form-item>
{{else if IsDateTime}}
      <el-form-item label=""{{Name}}"" prop=""{{NameCamel}}"">
        <el-date-picker
          v-model=""form.{{NameCamel}}""
          type=""datetime""
          placeholder=""请选择{{Name}}""
          style=""width: 100%""
        />
      </el-form-item>
{{else}}
      <el-form-item label=""{{Name}}"" prop=""{{NameCamel}}"">
        <el-input v-model=""form.{{NameCamel}}"" placeholder=""请输入{{Name}}"" />
      </el-form-item>
{{/if}}
{{/each}}
    </el-form>

    <template #footer>
      <el-button @click=""handleClose"">取消</el-button>
      <el-button type=""primary"" :loading=""loading"" @click=""handleSubmit"">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang=""ts"">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { {{EntityNameCamel}}Api } from '@/api/{{EntityNameKebab}}'
import type { {{EntityName}}Dto, Create{{EntityName}}Dto, Update{{EntityName}}Dto } from '@/api/{{EntityNameKebab}}/types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props & Emits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  modelValue: boolean
  formData: {{EntityName}}Dto | null
  mode: 'create' | 'edit'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式数据
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<Partial<Create{{EntityName}}Dto>>({
{{#each Properties}}
  {{NameCamel}}: {{DefaultValue}},
{{/each}}
})

// 表单验证规则
const rules: FormRules = {
{{#each Properties}}
{{#if IsRequired}}
  {{NameCamel}}: {{{ValidationRules}}},
{{/if}}
{{/each}}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 监听器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(form, newData)
  } else {
    resetForm()
  }
}, { immediate: true })

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function resetForm() {
{{#each Properties}}
  form.{{NameCamel}} = {{DefaultValue}}
{{/each}}
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    
    loading.value = true
    if (props.mode === 'create') {
      await {{EntityNameCamel}}Api.create(form as Create{{EntityName}}Dto)
      ElMessage.success('创建成功')
    } else {
      await {{EntityNameCamel}}Api.update(form.id!, form as Update{{EntityName}}Dto)
      ElMessage.success('更新成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(props.mode === 'create' ? '创建失败' : '更新失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  resetForm()
  visible.value = false
}
</script>
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }

    /// <summary>
    /// 生成API Client代码
    /// </summary>
    private string GenerateApiClient(object templateData)
    {
        var templateSource = @"import request from '@/utils/request'
import type {
  {{EntityName}}Dto,
  Create{{EntityName}}Dto,
  Update{{EntityName}}Dto,
  Get{{EntityNamePlural}}Input,
  PagedResultDto
} from './types'

/**
 * {{EntityName}} API Client
 * 生成时间: {{GeneratedTime}}
 */
class {{EntityName}}Api {
  private readonly baseUrl = '{{ApiPath}}'

  /**
   * 获取{{EntityName}}列表（分页）
   */
  async getList(params: Get{{EntityNamePlural}}Input): Promise<PagedResultDto<{{EntityName}}Dto>> {
    return request.get(this.baseUrl, { params })
  }

  /**
   * 根据ID获取{{EntityName}}
   */
  async get(id: {{PrimaryKeyTypeScript}}): Promise<{{EntityName}}Dto> {
    return request.get(`${this.baseUrl}/${id}`)
  }

  /**
   * 创建{{EntityName}}
   */
  async create(data: Create{{EntityName}}Dto): Promise<{{EntityName}}Dto> {
    return request.post(this.baseUrl, data)
  }

  /**
   * 更新{{EntityName}}
   */
  async update(id: {{PrimaryKeyTypeScript}}, data: Update{{EntityName}}Dto): Promise<{{EntityName}}Dto> {
    return request.put(`${this.baseUrl}/${id}`, data)
  }

  /**
   * 删除{{EntityName}}
   */
  async delete(id: {{PrimaryKeyTypeScript}}): Promise<void> {
    return request.delete(`${this.baseUrl}/${id}`)
  }
}

export const {{EntityNameCamel}}Api = new {{EntityName}}Api()
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }

    /// <summary>
    /// 生成TypeScript类型定义
    /// </summary>
    private string GenerateTypeDefinitions(object templateData)
    {
        var templateSource = @"/**
 * {{EntityName}} TypeScript类型定义
 * 生成时间: {{GeneratedTime}}
 */

/**
 * {{EntityName}}DTO
 */
export interface {{EntityName}}Dto {
  id: {{PrimaryKeyTypeScript}}
{{#each Properties}}
  {{NameCamel}}: {{TypeScript}}
{{/each}}
}

/**
 * 创建{{EntityName}}DTO
 */
export interface Create{{EntityName}}Dto {
{{#each Properties}}
  {{NameCamel}}: {{TypeScript}}
{{/each}}
}

/**
 * 更新{{EntityName}}DTO
 */
export interface Update{{EntityName}}Dto {
{{#each Properties}}
  {{NameCamel}}: {{TypeScript}}
{{/each}}
}

/**
 * 获取{{EntityNamePlural}}查询参数
 */
export interface Get{{EntityNamePlural}}Input {
  filter?: string
  skipCount?: number
  maxResultCount?: number
}

/**
 * 分页结果DTO
 */
export interface PagedResultDto<T> {
  items: T[]
  totalCount: number
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }
}

/// <summary>
/// Vue CRUD页面生成器输出
/// </summary>
public class VueCrudPageGeneratorOutput
{
    /// <summary>
    /// 列表页面代码
    /// </summary>
    public string ListPageCode { get; set; } = default!;

    /// <summary>
    /// 表单弹窗代码
    /// </summary>
    public string FormDialogCode { get; set; } = default!;

    /// <summary>
    /// API Client代码
    /// </summary>
    public string ApiClientCode { get; set; } = default!;

    /// <summary>
    /// TypeScript类型定义代码
    /// </summary>
    public string TypeDefinitionsCode { get; set; } = default!;

    /// <summary>
    /// 实体名称
    /// </summary>
    public string EntityName { get; set; } = default!;
}

