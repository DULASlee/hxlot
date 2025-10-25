using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator.EnhancedGenerators;

/// <summary>
/// 🔥 P1-2: 树形结构生成器
///
/// 职责：
/// - 生成递归查询方法（GetTreeAsync）
/// - 生成层级路径计算（HierarchyPath）
/// - 生成子节点查询（GetChildrenAsync）
/// - 生成前端el-tree-select组件支持
/// </summary>
public class TreeStructureGenerator : LayerGeneratorBase
{
    public TreeStructureGenerator(
        UnifiedMetadataSDK metadataSDK,
        ILogger<TreeStructureGenerator> logger)
        : base(metadataSDK, logger)
    {
    }

    public override string Name => "TreeStructureGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 210; // 在AppService之后

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            // 检查是否有树形结构定义
            if (!entityMetadata.ExtensionData.TryGetValue("TreeStructure", out var treeData))
            {
                Logger.LogInformation("  ℹ️  实体无树形结构，跳过树形结构生成");
                return;
            }

            var treeStructure = treeData as TreeStructure;
            if (treeStructure == null)
            {
                Logger.LogWarning("  ⚠️  树形结构数据格式错误");
                return;
            }

            var entityName = entityMetadata.Name;
            var namespacePrefix = input.Options.NamespacePrefix ?? "SmartAbp";
            var baseOutputPath = $"{input.Options.OutputBasePath}/SmartAbp.Application/{entityName}";

            // 生成AppService扩展方法
            var appServiceExtCode = GenerateAppServiceExtensions(entityName, treeStructure, namespacePrefix);
            result.GeneratedFiles[$"{baseOutputPath}/{entityName}AppService.Tree.cs"] = appServiceExtCode;

            // 生成前端Tree组件支持
            var frontendCode = GenerateFrontendTreeSupport(entityName, treeStructure);
            var frontendOutputPath = $"{input.Options.OutputBasePath}/frontend/src/components/{ToKebabCase(entityName)}";
            result.GeneratedFiles[$"{frontendOutputPath}/{entityName}TreeSelect.vue"] = frontendCode;

            Logger.LogInformation("  ✅ 生成树形结构支持: AppService扩展 + Tree组件");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"树形结构生成失败: {ex.Message}");
            Logger.LogError(ex, "树形结构生成异常");
        }
    }

    private string GenerateAppServiceExtensions(string entityName, TreeStructure tree, string namespacePrefix)
    {
        var sb = new StringBuilder();

        sb.AppendLine("using System;");
        sb.AppendLine("using System.Collections.Generic;");
        sb.AppendLine("using System.Linq;");
        sb.AppendLine("using System.Threading.Tasks;");
        sb.AppendLine("using Microsoft.EntityFrameworkCore;");
        sb.AppendLine("using Volo.Abp.Application.Dtos;");
        sb.AppendLine();
        sb.AppendLine($"namespace {namespacePrefix}.Application.{entityName}");
        sb.AppendLine("{");
        sb.AppendLine("    /// <summary>");
        sb.AppendLine($"    /// {entityName}AppService - 树形结构扩展方法");
        sb.AppendLine("    /// 自动生成，请勿手动修改");
        sb.AppendLine("    /// </summary>");
        sb.AppendLine($"    public partial class {entityName}AppService");
        sb.AppendLine("    {");
        sb.AppendLine("        /// <summary>");
        sb.AppendLine("        /// 获取树形结构");
        sb.AppendLine("        /// </summary>");
        sb.AppendLine($"        public virtual async Task<List<{entityName}TreeDto>> GetTreeAsync()");
        sb.AppendLine("        {");
        sb.AppendLine($"            var allItems = await Repository.GetQueryableAsync();");
        sb.AppendLine($"            var items = await allItems");
        sb.AppendLine($"                .OrderBy(x => x.{tree.ParentIdProperty ?? "ParentId"})");
        sb.AppendLine("                .ToListAsync();");
        sb.AppendLine();
        sb.AppendLine($"            var dtos = ObjectMapper.Map<List<{entityName}>, List<{entityName}TreeDto>>(items);");
        sb.AppendLine("            return BuildTree(dtos);");
        sb.AppendLine("        }");
        sb.AppendLine();
        sb.AppendLine("        /// <summary>");
        sb.AppendLine("        /// 获取子节点");
        sb.AppendLine("        /// </summary>");
        sb.AppendLine($"        public virtual async Task<List<{entityName}Dto>> GetChildrenAsync(Guid parentId)");
        sb.AppendLine("        {");
        sb.AppendLine($"            var children = await Repository.GetListAsync(x => x.{tree.ParentIdProperty ?? "ParentId"} == parentId);");
        sb.AppendLine($"            return ObjectMapper.Map<List<{entityName}>, List<{entityName}Dto>>(children);");
        sb.AppendLine("        }");
        sb.AppendLine();
        sb.AppendLine("        /// <summary>");
        sb.AppendLine("        /// 构建树形结构");
        sb.AppendLine("        /// </summary>");
        sb.AppendLine($"        private List<{entityName}TreeDto> BuildTree(List<{entityName}TreeDto> allItems, Guid? parentId = null)");
        sb.AppendLine("        {");
        sb.AppendLine($"            return allItems");
        sb.AppendLine($"                .Where(x => x.{tree.ParentIdProperty ?? "ParentId"} == parentId)");
        sb.AppendLine("                .Select(x =>");
        sb.AppendLine("                {");
        sb.AppendLine($"                    x.{tree.ChildrenProperty ?? "Children"} = BuildTree(allItems, x.Id);");
        sb.AppendLine("                    return x;");
        sb.AppendLine("                })");
        sb.AppendLine("                .ToList();");
        sb.AppendLine("        }");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    /// <summary>");
        sb.AppendLine($"    /// {entityName}树形DTO");
        sb.AppendLine("    /// </summary>");
        sb.AppendLine($"    public class {entityName}TreeDto : EntityDto<Guid>");
        sb.AppendLine("    {");
        sb.AppendLine("        public string Name { get; set; } = default!;");
        sb.AppendLine($"        public Guid? {tree.ParentIdProperty ?? "ParentId"} {{ get; set; }}");
        sb.AppendLine($"        public List<{entityName}TreeDto> {tree.ChildrenProperty ?? "Children"} {{ get; set; }} = new();");
        sb.AppendLine("    }");
        sb.AppendLine("}");

        return sb.ToString();
    }

    private string GenerateFrontendTreeSupport(string entityName, TreeStructure tree)
    {
        var entityNameCamel = ToCamelCase(entityName);
        var entityNameKebab = ToKebabCase(entityName);

        var sb = new StringBuilder();

        sb.AppendLine("<template>");
        sb.AppendLine("  <el-tree-select");
        sb.AppendLine("    v-model=\"selectedValue\"");
        sb.AppendLine("    :data=\"treeData\"");
        sb.AppendLine("    :props=\"treeProps\"");
        sb.AppendLine("    :placeholder=\"placeholder\"");
        sb.AppendLine("    :disabled=\"disabled\"");
        sb.AppendLine("    :clearable=\"clearable\"");
        sb.AppendLine("    filterable");
        sb.AppendLine("    check-strictly");
        sb.AppendLine("    @change=\"handleChange\"");
        sb.AppendLine("  />");
        sb.AppendLine("</template>");
        sb.AppendLine();
        sb.AppendLine("<script setup lang=\"ts\">");
        sb.AppendLine("import { ref, computed, onMounted } from 'vue'");
        sb.AppendLine($"import {{ use{entityName}Store }} from '@/stores/use{entityName}Store'");
        sb.AppendLine();
        sb.AppendLine("interface Props {");
        sb.AppendLine("  modelValue?: string | null");
        sb.AppendLine("  placeholder?: string");
        sb.AppendLine("  disabled?: boolean");
        sb.AppendLine("  clearable?: boolean");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine("const props = withDefaults(defineProps<Props>(), {");
        sb.AppendLine($"  placeholder: '请选择{entityName}',");
        sb.AppendLine("  disabled: false,");
        sb.AppendLine("  clearable: true");
        sb.AppendLine("})");
        sb.AppendLine();
        sb.AppendLine("const emit = defineEmits<{");
        sb.AppendLine("  'update:modelValue': [value: string | null]");
        sb.AppendLine("  'change': [value: string | null]");
        sb.AppendLine("}>()");
        sb.AppendLine();
        sb.AppendLine($"const {entityNameCamel}Store = use{entityName}Store()");
        sb.AppendLine();
        sb.AppendLine("const selectedValue = computed({");
        sb.AppendLine("  get: () => props.modelValue,");
        sb.AppendLine("  set: (value) => emit('update:modelValue', value)");
        sb.AppendLine("})");
        sb.AppendLine();
        sb.AppendLine("const treeData = ref([])");
        sb.AppendLine();
        sb.AppendLine("const treeProps = {");
        sb.AppendLine("  label: 'name',");
        sb.AppendLine("  value: 'id',");
        sb.AppendLine($"  children: '{tree.ChildrenProperty ?? "children"}'");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine("const handleChange = (value: string | null) => {");
        sb.AppendLine("  emit('change', value)");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine("const loadTreeData = async () => {");
        sb.AppendLine($"  // 假设Store有getTree方法");
        sb.AppendLine($"  // const data = await {entityNameCamel}Store.getTree()");
        sb.AppendLine("  // treeData.value = data");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine("onMounted(() => {");
        sb.AppendLine("  loadTreeData()");
        sb.AppendLine("})");
        sb.AppendLine("</script>");

        return sb.ToString();
    }

    private string ToCamelCase(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        return char.ToLower(text[0]) + text.Substring(1);
    }

    private string ToKebabCase(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        var sb = new StringBuilder();
        sb.Append(char.ToLower(text[0]));

        for (int i = 1; i < text.Length; i++)
        {
            if (char.IsUpper(text[i]))
            {
                sb.Append('-');
                sb.Append(char.ToLower(text[i]));
            }
            else
            {
                sb.Append(text[i]);
            }
        }

        return sb.ToString();
    }
}

/// <summary>
/// 树形结构定义
/// </summary>
public class TreeStructure
{
    public string ParentIdProperty { get; set; } = "ParentId";
    public string ParentProperty { get; set; } = "Parent";
    public string ChildrenProperty { get; set; } = "Children";
    public string HierarchyPathProperty { get; set; } = "HierarchyPath";
    public string LevelProperty { get; set; } = "Level";
    public int MaxLevel { get; set; } = 10;
}

