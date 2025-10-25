using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator.EnhancedGenerators;

/// <summary>
/// 🔥 P0-3.3: Pinia Store生成器（DevKit版本）
///
/// 职责：
/// - 生成Pinia状态管理Store
/// - 封装业务逻辑和API调用
/// - 提供响应式状态和操作方法
/// </summary>
public class PiniaStoreGenerator : LayerGeneratorBase
{
    public PiniaStoreGenerator(
        UnifiedMetadataSDK metadataSDK,
        ILogger<PiniaStoreGenerator> logger)
        : base(metadataSDK, logger)
    {
    }

    public override string Name => "PiniaStoreGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 170; // 在API Client之后生成

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var entityName = entityMetadata.Name;
            var baseOutputPath = $"{input.Options.OutputBasePath}/frontend/src/stores";

            var storeCode = GeneratePiniaStore(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/use{entityName}Store.ts"] = storeCode;

            Logger.LogInformation("  ✅ 生成Pinia Store: use{EntityName}Store", entityName);

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"Pinia Store生成失败: {ex.Message}");
            Logger.LogError(ex, "Pinia Store生成异常");
        }
    }

    private string GeneratePiniaStore(EntityMetadata entity)
    {
        var entityName = entity.Name;
        var entityNameLower = ToCamelCase(entityName);
        var entityNameKebab = ToKebabCase(entityName);

        var sb = new StringBuilder();

        sb.AppendLine("import { defineStore } from 'pinia'");
        sb.AppendLine("import { ref, computed } from 'vue'");
        sb.AppendLine($"import {{ {entityNameLower}Api }} from '@/api/{entityNameKebab}.api'");
        sb.AppendLine($"import type {{ {entityName}Dto, Create{entityName}Dto, Update{entityName}Dto }} from '@/types/{entityNameKebab}'");
        sb.AppendLine();
        sb.AppendLine("/**");
        sb.AppendLine($" * {entity.DisplayName} Store");
        sb.AppendLine(" * 自动生成，请勿手动修改");
        sb.AppendLine(" */");
        sb.AppendLine($"export const use{entityName}Store = defineStore('{entityNameLower}', () => {{");
        sb.AppendLine("  // State");
        sb.AppendLine($"  const {entityNameLower}s = ref<{entityName}Dto[]>([])");
        sb.AppendLine($"  const current{entityName} = ref<{entityName}Dto | null>(null)");
        sb.AppendLine("  const loading = ref(false)");
        sb.AppendLine("  const totalCount = ref(0)");
        sb.AppendLine();
        sb.AppendLine("  // Getters");
        sb.AppendLine($"  const {entityNameLower}List = computed(() => {entityNameLower}s.value)");
        sb.AppendLine();
        sb.AppendLine("  // Actions");
        sb.AppendLine("  async function fetchList(params?: any) {");
        sb.AppendLine("    loading.value = true");
        sb.AppendLine("    try {");
        sb.AppendLine($"      const {{ data }} = await {entityNameLower}Api.getList(params)");
        sb.AppendLine($"      {entityNameLower}s.value = data.items");
        sb.AppendLine("      totalCount.value = data.totalCount");
        sb.AppendLine("    } finally {");
        sb.AppendLine("      loading.value = false");
        sb.AppendLine("    }");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine("  async function fetchById(id: string) {");
        sb.AppendLine("    loading.value = true");
        sb.AppendLine("    try {");
        sb.AppendLine($"      const {{ data }} = await {entityNameLower}Api.get(id)");
        sb.AppendLine($"      current{entityName}.value = data");
        sb.AppendLine("      return data");
        sb.AppendLine("    } finally {");
        sb.AppendLine("      loading.value = false");
        sb.AppendLine("    }");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine($"  async function create(input: Create{entityName}Dto) {{");
        sb.AppendLine("    loading.value = true");
        sb.AppendLine("    try {");
        sb.AppendLine($"      const {{ data }} = await {entityNameLower}Api.create(input)");
        sb.AppendLine("      await fetchList()");
        sb.AppendLine("      return data");
        sb.AppendLine("    } finally {");
        sb.AppendLine("      loading.value = false");
        sb.AppendLine("    }");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine($"  async function update(id: string, input: Update{entityName}Dto) {{");
        sb.AppendLine("    loading.value = true");
        sb.AppendLine("    try {");
        sb.AppendLine($"      const {{ data }} = await {entityNameLower}Api.update(id, input)");
        sb.AppendLine("      await fetchList()");
        sb.AppendLine("      return data");
        sb.AppendLine("    } finally {");
        sb.AppendLine("      loading.value = false");
        sb.AppendLine("    }");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine("  async function remove(id: string) {");
        sb.AppendLine("    loading.value = true");
        sb.AppendLine("    try {");
        sb.AppendLine($"      await {entityNameLower}Api.delete(id)");
        sb.AppendLine("      await fetchList()");
        sb.AppendLine("    } finally {");
        sb.AppendLine("      loading.value = false");
        sb.AppendLine("    }");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine("  return {");
        sb.AppendLine("    // State");
        sb.AppendLine($"    {entityNameLower}s,");
        sb.AppendLine($"    current{entityName},");
        sb.AppendLine("    loading,");
        sb.AppendLine("    totalCount,");
        sb.AppendLine("    // Getters");
        sb.AppendLine($"    {entityNameLower}List,");
        sb.AppendLine("    // Actions");
        sb.AppendLine("    fetchList,");
        sb.AppendLine("    fetchById,");
        sb.AppendLine("    create,");
        sb.AppendLine("    update,");
        sb.AppendLine("    remove");
        sb.AppendLine("  }");
        sb.AppendLine("})");

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

