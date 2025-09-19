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

            // Define paths for the new module
            var modulePath = Path.Combine(vueRoot, "src", "views", metadata.Name);
            var apiPath = Path.Combine(vueRoot, "src", "api", metadata.Name);
            var storePath = Path.Combine(vueRoot, "src", "stores");

            // Generate files for each entity
            foreach (var entity in metadata.Entities)
            {
                generatedFiles.Add(
                    Path.Combine(modulePath, "components", $"{entity.Name}Management.vue"),
                    GenerateManagementView(entity, metadata)
                );
                generatedFiles.Add(
                    Path.Combine(apiPath, $"{entity.Name.ToLower()}.ts"),
                    GenerateApiFile(entity, metadata)
                );
                generatedFiles.Add(
                    Path.Combine(storePath, $"modules/{metadata.Name.ToLower()}/{entity.Name.ToLower()}.ts"),
                    GenerateStoreFile(entity, metadata)
                );
            }

            return generatedFiles;
        }

        private string GenerateManagementView(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
        {
            var displayColumns = entity.UiConfig?.ListConfig?.DisplayColumns ?? new List<string>();
            var kebab = ToKebabCase(entity.Name);
            var title = string.IsNullOrWhiteSpace(entity.DisplayName) ? entity.Name : entity.DisplayName;
            var tableCols = string.Join("\n        ", displayColumns.Select(c => $"<el-table-column prop=\"{ToCamelCase(c)}\" label=\"{c}\" sortable />"));

            var content = $@"<template>
  <div class=""{kebab}-management"">
    <el-card>
      <template #header>
        <div class=""card-header"">{title}管理</div>
      </template>

      <div class=""toolbar"">
        <el-button type=""primary"" @click=""onCreate"">新增</el-button>
        <el-button type=""danger"" @click=""onBatchDelete"">批量删除</el-button>
      </div>

      <el-table :data=""items"" style=""width: 100%"" v-loading=""loading"">
        {tableCols}
        <el-table-column label=""操作"" width=""160"">
          <template #default=""scope"">
            <el-button link type=""primary"" @click=""onEdit(scope.row)"">编辑</el-button>
            <el-button link type=""danger"" @click=""onDelete(scope.row)"">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang=""ts"">
import {{ ref, onMounted }} from 'vue'

const loading = ref(false)
const items = ref<any[]>([])

const fetchList = async () => {{
  loading.value = true
  try {{
    // TODO: replace with generated API call
    items.value = []
  }} finally {{
    loading.value = false
  }}
}}

const onCreate = () => {{}}
const onEdit = (_row: any) => {{}}
const onDelete = (_row: any) => {{}}
const onBatchDelete = () => {{}}

onMounted(fetchList)
</script>

<style scoped>
.toolbar {{ margin-bottom: 12px; display: flex; gap: 8px; }}
.card-header {{ font-weight: 600; }}
</style>
";
            return content;
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

            var content = $@"import {{ request }} from '@/utils/request';\nimport type {{ PagedResultDto }} from '@/utils/request/types';\n\nexport interface {entityDto} {{\n  id: string;\n  {string.Join("\n  ", entity.Properties.Select(p => $"{ToCamelCase(p.Name)}: {GetTsType(p.Type)};"))}\n}}\n\nexport interface {getListDto} {{\n  // Define query parameters here\n  keyword?: string;\n}}\n\nexport type {{createDto}} = Omit<{entityDto}, 'id'>;\nexport type {{updateDto}} = Partial<{createDto}>;\n\nconst Api = `/api/app/{entityNameCamel}`;\n\nexport const get{entityPlural} = (params: {{getListDto}}) => {{\n  return request.get<PagedResultDto<{entityDto}>>({{\n    url: Api,\n    params,\n  }});\n}};\n\nexport const get{entityName} = (id: string) => {{\n  return request.get<{entityDto}>({{\n    url: `${{Api}}/${{id}}`,\n  }});\n}};\n\nexport const create{entityName} = (data: {{createDto}}) => {{\n  return request.post<{entityDto}>({{\n    url: Api,\n    data,\n  }});\n}};\n\nexport const update{entityName} = (id: string, data: {{updateDto}}) => {{\n  return request.put<{entityDto}>({{\n    url: `${{Api}}/${{id}}`,\n    data,\n  }});\n}};\n\nexport const delete{entityName} = (id: string) => {{\n  return request.delete<void>({{\n    url: `${{Api}}/${{id}}`,\n  }});\n}};\n";
            return content;
        }

        private string GenerateStoreFile(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
        {
            // Placeholder for Pinia store file
            var template = $@"// Pinia store for {entity.DisplayName}\n// State, actions, and getters will be generated here\n";
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
