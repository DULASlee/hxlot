using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator.Implementations;

/// <summary>
/// Vue CRUD页面生成器（重构版）
///
/// 职责：
/// - 生成Vue3列表页面（index.vue）
/// - 生成表单对话框组件（FormDialog.vue）
/// - 生成TypeScript API客户端
/// </summary>
public class VueCrudPageLayerGenerator : LayerGeneratorBase
{
    private readonly TemplateManager _templateManager;

    public VueCrudPageLayerGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager,
        ILogger<VueCrudPageLayerGenerator> logger)
        : base(metadataSDK, logger)
    {
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));
        _templateManager.RegisterHelpers();
    }

    public override string Name => "VueCrudPageGenerator";

    public override TargetLayer Layer => TargetLayer.Frontend;

    public override int Priority => 300; // Frontend层优先级300

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var entityName = entityMetadata.Name;
            var entityNameLower = entityName.ToLowerInvariant();
            var baseOutputPath = $"{input.Options.OutputBasePath}/SmartAbp.Vue/src/views/{entityNameLower}";

            // 1. 生成列表页面
            var indexVueCode = GenerateIndexVue(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/index.vue"] = indexVueCode;

            // 2. 生成表单对话框
            var formDialogCode = GenerateFormDialog(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/components/FormDialog.vue"] = formDialogCode;

            // 3. 生成API客户端
            var apiCode = GenerateApiClient(entityMetadata);
            result.GeneratedFiles[$"{input.Options.OutputBasePath}/SmartAbp.Vue/src/api/{entityNameLower}.ts"] = apiCode;

            Logger.LogInformation("  ✅ 生成Vue页面: index.vue + FormDialog.vue + API客户端");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"Vue页面生成失败: {ex.Message}");
            Logger.LogError(ex, "Vue页面生成异常");
        }
    }

    private string GenerateIndexVue(EntityMetadata entity)
    {
        var entityName = entity.Name;
        var entityNameLower = entityName.ToLowerInvariant();
        var entityNamePlural = StringHelper.Pluralize(entityName).ToLowerInvariant();

        var columns = string.Join(",\n      ", entity.Properties.Take(5).Select(p =>
            $"{{ prop: '{ToCamelCase(p.Name)}', label: '{p.Name}', width: 150 }}"));

        return $@"<template>
  <div class=""{entityNameLower}-page"">
    <el-card>
      <template #header>
        <div class=""card-header"">
          <span>{entity.DisplayName}管理</span>
          <el-button type=""primary"" @click=""handleCreate"">新增</el-button>
        </div>
      </template>

      <el-table :data=""list"" border>
        {GenerateTableColumns(entity.Properties.Take(5))}
        <el-table-column label=""操作"" width=""200"" fixed=""right"">
          <template #default=""{{ row }}"">
            <el-button size=""small"" @click=""handleEdit(row)"">编辑</el-button>
            <el-button size=""small"" type=""danger"" @click=""handleDelete(row)"">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page=""currentPage""
        v-model:page-size=""pageSize""
        :total=""total""
        @current-change=""fetchList""
      />
    </el-card>

    <FormDialog
      v-model=""dialogVisible""
      :form-data=""currentRow""
      @success=""fetchList""
    />
  </div>
</template>

<script setup lang=""ts"">
import {{ ref, onMounted }} from 'vue'
import {{ ElMessage, ElMessageBox }} from 'element-plus'
import FormDialog from './components/FormDialog.vue'
import * as {entityNameLower}Api from '@/api/{entityNameLower}'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentRow = ref(null)

const fetchList = async () => {{
  const {{ items, totalCount }} = await {entityNameLower}Api.getList({{
    skipCount: (currentPage.value - 1) * pageSize.value,
    maxResultCount: pageSize.value
  }})
  list.value = items
  total.value = totalCount
}}

const handleCreate = () => {{
  currentRow.value = null
  dialogVisible.value = true
}}

const handleEdit = (row: any) => {{
  currentRow.value = {{ ...row }}
  dialogVisible.value = true
}}

const handleDelete = async (row: any) => {{
  await ElMessageBox.confirm('确认删除？', '提示', {{ type: 'warning' }})
  await {entityNameLower}Api.delete(row.id)
  ElMessage.success('删除成功')
  fetchList()
}}

onMounted(() => {{
  fetchList()
}})
</script>

<style scoped lang=""scss"">
.{entityNameLower}-page {{
  padding: 20px;
}}
.card-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
}}
</style>
";
    }

    private string GenerateTableColumns(IEnumerable<PropertyMetadata> properties)
    {
        return string.Join("\n        ", properties.Select(p =>
            $"<el-table-column prop=\"{ToCamelCase(p.Name)}\" label=\"{p.Name}\" width=\"150\" />"));
    }

    private string GenerateFormDialog(EntityMetadata entity)
    {
        var entityNameLower = entity.Name.ToLowerInvariant();
        var formItems = string.Join("\n      ", entity.Properties
            .Where(p => !p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
            .Select(p => $"<el-form-item label=\"{p.Name}\" prop=\"{ToCamelCase(p.Name)}\">\n        <el-input v-model=\"form.{ToCamelCase(p.Name)}\" />\n      </el-form-item>"));

        return $@"<template>
  <el-dialog v-model=""visible"" :title=""title"" width=""600px"">
    <el-form ref=""formRef"" :model=""form"" label-width=""120px"">
      {formItems}
    </el-form>

    <template #footer>
      <el-button @click=""visible = false"">取消</el-button>
      <el-button type=""primary"" @click=""handleSubmit"">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang=""ts"">
import {{ ref, watch, computed }} from 'vue'
import {{ ElMessage }} from 'element-plus'
import * as {entityNameLower}Api from '@/api/{entityNameLower}'

const props = defineProps<{{
  modelValue: boolean
  formData: any
}}>()

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({{
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
}})

const title = computed(() => props.formData ? '编辑' : '新增')
const formRef = ref()
const form = ref({{ }})

watch(() => props.formData, (val) => {{
  if (val) {{
    form.value = {{ ...val }}
  }} else {{
    form.value = {{ }}
  }}
}})

const handleSubmit = async () => {{
  if (props.formData) {{
    await {entityNameLower}Api.update(props.formData.id, form.value)
    ElMessage.success('更新成功')
  }} else {{
    await {entityNameLower}Api.create(form.value)
    ElMessage.success('创建成功')
  }}
  visible.value = false
  emit('success')
}}
</script>
";
    }

    private string GenerateApiClient(EntityMetadata entity)
    {
        var entityName = entity.Name;
        var entityNameLower = entityName.ToLowerInvariant();
        var entityNamePlural = StringHelper.Pluralize(entityName).ToLowerInvariant();

        return $@"import request from '@/utils/request'

export interface {entityName} {{
  id: string
{string.Join("\n", entity.Properties.Select(p => $"  {ToCamelCase(p.Name)}: {MapToTypeScriptType(p.Type)}"))}
}}

export interface Create{entityName} {{
{string.Join("\n", entity.Properties.Where(p => !p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase)).Select(p => $"  {ToCamelCase(p.Name)}: {MapToTypeScriptType(p.Type)}"))}
}}

export const getList = (params: any) => {{
  return request({{
    url: '/api/app/{entityNamePlural}',
    method: 'get',
    params
  }})
}}

export const get = (id: string) => {{
  return request({{
    url: `/api/app/{entityNamePlural}/${{id}}`,
    method: 'get'
  }})
}}

export const create = (data: Create{entityName}) => {{
  return request({{
    url: '/api/app/{entityNamePlural}',
    method: 'post',
    data
  }})
}}

export const update = (id: string, data: Create{entityName}) => {{
  return request({{
    url: `/api/app/{entityNamePlural}/${{id}}`,
    method: 'put',
    data
  }})
}}

export const delete = (id: string) => {{
  return request({{
    url: `/api/app/{entityNamePlural}/${{id}}`,
    method: 'delete'
  }})
}}
";
    }

    private string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str)) return str;
        return char.ToLowerInvariant(str[0]) + str.Substring(1);
    }

    private string MapToTypeScriptType(string csharpType)
    {
        return csharpType?.ToLowerInvariant() switch
        {
            "string" => "string",
            "int" => "number",
            "long" => "number",
            "decimal" => "number",
            "double" => "number",
            "float" => "number",
            "bool" => "boolean",
            "datetime" => "string",
            "guid" => "string",
            _ => "any"
        };
    }
}

