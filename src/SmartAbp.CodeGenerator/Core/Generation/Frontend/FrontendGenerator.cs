using System.Collections.Generic;
using System.IO;
using System.Text;
using Pluralize.NET;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;
using System.Linq;

namespace SmartAbp.CodeGenerator.Core.Generation.Frontend
{
    public class FrontendGenerator : ITransientDependency
    {
        private readonly Pluralizer _pluralizer;

        public FrontendGenerator()
        {
            _pluralizer = new Pluralizer();
        }

        public Dictionary<string, string> Generate(ModuleMetadataDto metadata, string solutionRoot)
        {
            var generatedFiles = new Dictionary<string, string>();
            var vueRoot = Path.Combine(solutionRoot, "src", "SmartAbp.Vue");

            // Define paths for the new module (lower-cased folder for views and stores)
            var modulePath = Path.Combine(vueRoot, "src", "views", metadata.Name.ToLower());
            var apiPath = Path.Combine(vueRoot, "src", "api", metadata.Name);
            var storePath = Path.Combine(vueRoot, "src", "stores", "modules", metadata.Name.ToLower());

            // Generate files for each entity
            foreach (var entity in metadata.Entities)
            {
                var viewsDir = modulePath;
                var storeDir = storePath;
                Directory.CreateDirectory(viewsDir);
                Directory.CreateDirectory(storeDir);

                generatedFiles.Add(
                    Path.Combine(viewsDir, $"{entity.Name}ListView.vue"),
                    GenerateListView(entity, metadata)
                );
                generatedFiles.Add(
                    Path.Combine(viewsDir, $"{entity.Name}Management.vue"),
                    GenerateManagementView(entity, metadata)
                );
                generatedFiles.Add(
                    Path.Combine(apiPath, $"{entity.Name.ToLower()}.ts"),
                    GenerateApiFile(entity, metadata)
                );
                generatedFiles.Add(
                    Path.Combine(storeDir, $"{entity.Name.ToLower()}.ts"),
                    GenerateStoreFile(entity, metadata)
                );
            }

            return generatedFiles;
        }

        private string GenerateListView(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
        {
            var displayColumns = entity.UiConfig?.ListConfig?.DisplayColumns ?? new List<string>();
            var kebab = ToKebabCase(entity.Name);
            var title = string.IsNullOrWhiteSpace(entity.DisplayName) ? entity.Name : entity.DisplayName;
            var tableCols = string.Join("\n        ", displayColumns.Select(c => $"<el-table-column prop=\"{ToCamelCase(c)}\" label=\"{c}\" sortable />"));

            var content = @"<template>
  <div class=""__KEBAB__-list"">
    <el-card>
      <template #header>
        <div class=""card-header"">__TITLE__列表</div>
      </template>

      <el-form :inline=""true"" :model=""query"" class=""query-bar"">
        <el-form-item v-for=""field in searchFields"" :key=""field"" :label=""field"">
          <el-input v-model=""query[field]"" :placeholder=""'请输入' + field"" />
        </el-form-item>
        <el-form-item>
          <el-button type=""primary"" @click=""onSearch"">查询</el-button>
          <el-button @click=""onReset"">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data=""items"" style=""width: 100%"" v-loading=""loading"">
        __TABLE_COLS__
        <el-table-column label=""操作"" width=""160"">
          <template #default=""scope"">
            <el-button link type=""primary"" @click=""onEdit(scope.row)"">编辑</el-button>
            <el-button link type=""danger"" @click=""onDelete(scope.row)"">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class=""pager"">
        <el-pagination
          v-model:current-page=""pageIndex""
          v-model:page-size=""pageSize""
          :page-sizes=""[10,20,50]""
          layout=""total, sizes, prev, pager, next""
          :total=""total""
          @size-change=""onSearch""
          @current-change=""onSearch""
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang=""ts"">
import { ref, onMounted, reactive } from 'vue'
import { use__ENTITY__Store } from '@/stores/modules/__MODULE_LOWER__/__ENTITY_LOWER__'

const store = use__ENTITY__Store()
const items = store.items
const loading = store.loading
const total = store.total
const pageIndex = store.pageIndex
const pageSize = store.pageSize
const query = reactive<Record<string, any>>({})
const searchFields = Object.keys(query)

const onSearch = () => store.fetchList({ pageIndex: pageIndex.value, pageSize: pageSize.value, query })
const onReset = () => { Object.keys(query).forEach(k => delete (query as any)[k]); pageIndex.value = 1; onSearch() }
const onEdit = (_row: any) => {}
const onDelete = async (row: any) => { await store.remove(row.id); onSearch() }

onMounted(() => { onSearch() })
</script>

<style scoped>
.card-header { font-weight: 600; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
.query-bar { margin-bottom: 12px; }
</style>
";
            return content
                .Replace("__KEBAB__", kebab)
                .Replace("__TITLE__", title)
                .Replace("__TABLE_COLS__", tableCols)
                .Replace("__MODULE_LOWER__", metadata.Name.ToLower())
                .Replace("__ENTITY__", entity.Name)
                .Replace("__ENTITY_LOWER__", entity.Name.ToLower());
        }

        private string GenerateManagementView(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
        {
            var kebab = ToKebabCase(entity.Name);
            var title = string.IsNullOrWhiteSpace(entity.DisplayName) ? entity.Name : entity.DisplayName;
            var content = @"<template>
  <div class=""__KEBAB__-management"">
    <el-card>
      <template #header>
        <div class=""card-header"">__TITLE__管理</div>
      </template>
      <el-form :model=""form"" label-width=""120px"" style=""max-width:720px"">
        <!-- TODO: 按字段生成表单项 -->
      </el-form>
      <div class=""actions"">
        <el-button type=""primary"" @click=""onSubmit"">保存</el-button>
        <el-button @click=""onCancel"">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang=""ts"">
import { reactive } from 'vue'
import { use__ENTITY__Store } from '@/stores/modules/__MODULE_LOWER__/__ENTITY_LOWER__'
const store = use__ENTITY__Store()
const form = reactive<Record<string, any>>({})
const onSubmit = async () => { await store.createOrUpdate(form) }
const onCancel = () => { Object.keys(form).forEach(k => delete (form as any)[k]) }
</script>

<style scoped>
.actions { margin-top: 12px; }
.card-header { font-weight: 600; }
</style>
";
            return content
                .Replace("__KEBAB__", kebab)
                .Replace("__TITLE__", title)
                .Replace("__MODULE_LOWER__", metadata.Name.ToLower())
                .Replace("__ENTITY__", entity.Name)
                .Replace("__ENTITY_LOWER__", entity.Name.ToLower());
        }

        private string GenerateApiFile(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
        {
            var entityName = entity.Name;
            var entityNameCamel = ToCamelCase(entityName);
            var moduleName = metadata.Name;
            var entityDto = $"{entityName}Dto";
            var createDto = $"Create{entityName}Dto";
            var updateDto = $"Update{entityName}Dto";
            var getListDto = $"Get{entityName}ListDto";
            var entityPlural = _pluralizer.Pluralize(entityNameCamel);

            var content = $@"import {{ api }} from '@/utils/api'\n\nexport interface {entityDto} {{\n  id: string;\n  {string.Join("\n  ", entity.Properties.Select(p => $"{ToCamelCase(p.Name)}: {GetTsType(p.Type)};"))}\n}}\n\nexport interface {getListDto} {{\n  // Define query parameters here\n  keyword?: string;\n}}\n\nexport type {createDto} = Omit<{entityDto}, 'id'>;\nexport type {updateDto} = Partial<{createDto}>;\n\nconst Api = `/api/app/{entityNameCamel}`\n\nexport const get{entityPlural} = (params: {getListDto}) => api.get(Api, {{ params }})\nexport const get{entityName} = (id: string) => api.get(`${{Api}}/${{id}}`)\nexport const create{entityName} = (data: {createDto}) => api.post(Api, data)\nexport const update{entityName} = (id: string, data: {updateDto}) => api.put(`${{Api}}/${{id}}`, data)\nexport const delete{entityName} = (id: string) => api.delete(`${{Api}}/${{id}}`)\n";
            return content;
        }

        private string GenerateStoreFile(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
        {
            var entityLower = entity.Name.ToLower();
            var template = $@"import {{ defineStore }} from 'pinia'\nimport {{ ref }} from 'vue'\nimport * as api from '@/api/{metadata.Name}/{entityLower}'\n\nexport const use{entity.Name}Store = defineStore('{entityLower}', () => {{\n  const items = ref<any[]>([])\n  const loading = ref(false)\n  const total = ref(0)\n  const pageIndex = ref(1)\n  const pageSize = ref(10)\n\n  async function fetchList(params?: {{ pageIndex?: number; pageSize?: number; query?: Record<string, any> }}) {{\n    loading.value = true\n    try {{\n      const pi = params?.pageIndex ?? pageIndex.value\n      const ps = params?.pageSize ?? pageSize.value\n      pageIndex.value = pi\n      pageSize.value = ps\n      const res = await api.get{_pluralizer.Pluralize(entity.Name)}({{ keyword: params?.query?.keyword }}) as any\n      items.value = (res?.items) ?? []\n      total.value = (res?.totalCount) ?? 0\n    }} finally {{\n      loading.value = false\n    }}\n  }}\n\n  async function createOrUpdate(payload: any) {{\n    if (payload?.id) return api.update{entity.Name}(payload.id, payload)\n    return api.create{entity.Name}(payload)\n  }}\n\n  async function remove(id: string | number) {{\n    return api.delete{entity.Name}(String(id))\n  }}\n\n  return {{ items, loading, total, pageIndex, pageSize, fetchList, createOrUpdate, remove }}\n}})\n";
            return template;
        }

        private string ToCamelCase(string str)
        {
            if (string.IsNullOrEmpty(str) || char.IsLower(str, 0))
                return str;
            return char.ToLowerInvariant(str[0]) + str.Substring(1);
        }

        private string ToKebabCase(string str)
        {
            if (string.IsNullOrWhiteSpace(str)) return str;
            var sb = new StringBuilder();
            for (int i = 0; i < str.Length; i++)
            {
                var ch = str[i];
                if (char.IsUpper(ch))
                {
                    if (i > 0) sb.Append('-');
                    sb.Append(char.ToLowerInvariant(ch));
                }
                else sb.Append(ch);
            }
            return sb.ToString();
        }

        private string GetTsType(string csharpType)
        {
            return csharpType.ToLower() switch
            {
                "string" => "string",
                "text" => "string",
                "int" => "number",
                "long" => "number",
                "decimal" => "number",
                "double" => "number",
                "float" => "number",
                "bool" => "boolean",
                "boolean" => "boolean",
                "datetime" => "string", // Or Date
                "date" => "string", // Or Date
                "guid" => "string",
                _ => "any",
            };
        }
    }
}
