using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator.EnhancedGenerators;

/// <summary>
/// 🔥 P1-4: Vue表单组件生成器（支持字段分组）
/// 
/// 职责：
/// - 生成Vue3 Composition API表单组件
/// - 支持字段分组（el-collapse/el-tabs）
/// - 支持表单验证
/// - 支持创建/编辑模式
/// </summary>
public class VueFormComponentGenerator : LayerGeneratorBase
{
    public VueFormComponentGenerator(
        UnifiedMetadataSDK metadataSDK,
        ILogger<VueFormComponentGenerator> logger)
        : base(metadataSDK, logger)
    {
    }

    public override string Name => "VueFormComponentGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 180; // 在Pinia Store之后

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var entityName = entityMetadata.Name;
            var baseOutputPath = $"{input.Options.OutputBasePath}/frontend/src/views/{ToKebabCase(entityName)}";

            // 生成表单组件
            var formCode = GenerateFormComponent(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/{entityName}Form.vue"] = formCode;

            Logger.LogInformation("  ✅ 生成Vue表单组件: {EntityName}Form.vue", entityName);

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"Vue表单组件生成失败: {ex.Message}");
            Logger.LogError(ex, "Vue表单组件生成异常");
        }
    }

    private string GenerateFormComponent(EntityMetadata entity)
    {
        var entityName = entity.Name;
        var entityNameCamel = ToCamelCase(entityName);
        var entityNameKebab = ToKebabCase(entityName);

        var sb = new StringBuilder();

        // Template部分
        sb.AppendLine("<template>");
        sb.AppendLine($"  <el-dialog v-model=\"visible\" :title=\"title\" width=\"60%\" @close=\"handleClose\">");
        sb.AppendLine($"    <el-form ref=\"formRef\" :model=\"formData\" :rules=\"rules\" label-width=\"120px\">");
        
        // 检查是否有字段分组
        var fieldGroups = GetFieldGroups(entity);
        
        if (fieldGroups.Any())
        {
            // 使用折叠面板展示分组
            sb.AppendLine("      <el-collapse v-model=\"activeGroups\" accordion>");
            
            foreach (var group in fieldGroups)
            {
                sb.AppendLine($"        <el-collapse-item name=\"{group.Name}\" title=\"{group.DisplayName}\">");
                
                foreach (var propertyName in group.Properties)
                {
                    var property = entity.Properties.FirstOrDefault(p => p.Name == propertyName);
                    if (property != null)
                    {
                        sb.AppendLine(GenerateFormItem(property, "          "));
                    }
                }
                
                sb.AppendLine("        </el-collapse-item>");
            }
            
            sb.AppendLine("      </el-collapse>");
        }
        else
        {
            // 无分组，直接生成表单项
            foreach (var property in entity.Properties.Where(p => p.Name != "Id"))
            {
                sb.AppendLine(GenerateFormItem(property, "      "));
            }
        }
        
        sb.AppendLine("    </el-form>");
        sb.AppendLine("    <template #footer>");
        sb.AppendLine("      <el-button @click=\"handleClose\">取消</el-button>");
        sb.AppendLine("      <el-button type=\"primary\" @click=\"handleSubmit\" :loading=\"loading\">确定</el-button>");
        sb.AppendLine("    </template>");
        sb.AppendLine("  </el-dialog>");
        sb.AppendLine("</template>");
        sb.AppendLine();

        // Script部分
        sb.AppendLine("<script setup lang=\"ts\">");
        sb.AppendLine("import { ref, computed, watch } from 'vue'");
        sb.AppendLine($"import {{ use{entityName}Store }} from '@/stores/use{entityName}Store'");
        sb.AppendLine($"import type {{ {entityName}Dto, Create{entityName}Dto, Update{entityName}Dto }} from '@/types/{entityNameKebab}'");
        sb.AppendLine("import { ElMessage } from 'element-plus'");
        sb.AppendLine();
        sb.AppendLine("interface Props {");
        sb.AppendLine("  modelValue: boolean");
        sb.AppendLine("  mode: 'create' | 'edit'");
        sb.AppendLine($"  data?: {entityName}Dto");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine("const props = defineProps<Props>()");
        sb.AppendLine("const emit = defineEmits<{");
        sb.AppendLine("  'update:modelValue': [value: boolean]");
        sb.AppendLine("  'success': []");
        sb.AppendLine("}>()");
        sb.AppendLine();
        sb.AppendLine($"const {entityNameCamel}Store = use{entityName}Store()");
        sb.AppendLine("const formRef = ref()");
        sb.AppendLine("const loading = ref(false)");
        
        if (fieldGroups.Any())
        {
            sb.AppendLine($"const activeGroups = ref(['{fieldGroups.First().Name}'])");
        }
        
        sb.AppendLine();
        sb.AppendLine("const visible = computed({");
        sb.AppendLine("  get: () => props.modelValue,");
        sb.AppendLine("  set: (value) => emit('update:modelValue', value)");
        sb.AppendLine("})");
        sb.AppendLine();
        sb.AppendLine("const title = computed(() => props.mode === 'create' ? '新建' : '编辑')");
        sb.AppendLine();
        
        // formData
        sb.AppendLine("const formData = ref({");
        foreach (var property in entity.Properties.Where(p => p.Name != "Id"))
        {
            var defaultValue = GetDefaultValue(property);
            sb.AppendLine($"  {ToCamelCase(property.Name)}: {defaultValue},");
        }
        sb.AppendLine("})");
        sb.AppendLine();
        
        // 验证规则
        sb.AppendLine("const rules = {");
        foreach (var property in entity.Properties.Where(p => p.Name != "Id" && p.IsRequired))
        {
            sb.AppendLine($"  {ToCamelCase(property.Name)}: [{{ required: true, message: '请输入{property.Name}', trigger: 'blur' }}],");
        }
        sb.AppendLine("}");
        sb.AppendLine();
        
        // watch props.data
        sb.AppendLine("watch(() => props.data, (data) => {");
        sb.AppendLine("  if (data && props.mode === 'edit') {");
        foreach (var property in entity.Properties.Where(p => p.Name != "Id"))
        {
            sb.AppendLine($"    formData.value.{ToCamelCase(property.Name)} = data.{ToCamelCase(property.Name)}");
        }
        sb.AppendLine("  }");
        sb.AppendLine("}, { immediate: true })");
        sb.AppendLine();
        
        // handleSubmit
        sb.AppendLine("const handleSubmit = async () => {");
        sb.AppendLine("  await formRef.value.validate()");
        sb.AppendLine("  loading.value = true");
        sb.AppendLine("  try {");
        sb.AppendLine("    if (props.mode === 'create') {");
        sb.AppendLine($"      await {entityNameCamel}Store.create(formData.value)");
        sb.AppendLine("      ElMessage.success('创建成功')");
        sb.AppendLine("    } else {");
        sb.AppendLine($"      await {entityNameCamel}Store.update(props.data!.id, formData.value)");
        sb.AppendLine("      ElMessage.success('更新成功')");
        sb.AppendLine("    }");
        sb.AppendLine("    emit('success')");
        sb.AppendLine("    handleClose()");
        sb.AppendLine("  } finally {");
        sb.AppendLine("    loading.value = false");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();
        
        // handleClose
        sb.AppendLine("const handleClose = () => {");
        sb.AppendLine("  formRef.value.resetFields()");
        sb.AppendLine("  emit('update:modelValue', false)");
        sb.AppendLine("}");
        sb.AppendLine("</script>");

        return sb.ToString();
    }

    private List<FieldGroup> GetFieldGroups(EntityMetadata entity)
    {
        var groups = new List<FieldGroup>();
        
        if (entity.ExtensionData.TryGetValue("FieldGroups", out var groupsData))
        {
            if (groupsData is List<FieldGroup> fieldGroups)
            {
                return fieldGroups.OrderBy(g => g.Order).ToList();
            }
        }
        
        return groups;
    }

    private string GenerateFormItem(PropertyMetadata property, string indent)
    {
        var sb = new StringBuilder();
        var propertyNameCamel = ToCamelCase(property.Name);
        
        sb.AppendLine($"{indent}<el-form-item label=\"{property.Name}\" prop=\"{propertyNameCamel}\">");
        
        // 根据类型生成不同的输入控件
        var propertyType = property.Type.ToLower();
        
        if (propertyType.Contains("string"))
        {
            // 检查是否是JSON字段
            bool isJsonField = false;
            if (property.ExtensionData.TryGetValue("IsJsonField", out var isJson))
            {
                isJsonField = Convert.ToBoolean(isJson);
            }
            
            // 检查是否是敏感字段
            bool isSensitive = false;
            if (property.ExtensionData.TryGetValue("IsSensitive", out var sensitive))
            {
                isSensitive = Convert.ToBoolean(sensitive);
            }
            
            if (isJsonField)
            {
                sb.AppendLine($"{indent}  <el-input v-model=\"formData.{propertyNameCamel}\" type=\"textarea\" :rows=\"6\" placeholder=\"JSON格式\" />");
            }
            else if (isSensitive)
            {
                sb.AppendLine($"{indent}  <el-input v-model=\"formData.{propertyNameCamel}\" type=\"password\" show-password placeholder=\"请输入{property.Name}\" />");
            }
            else
            {
                // 检查MaxLength
                int maxLength = 0;
                if (property.ExtensionData.TryGetValue("MaxLength", out var maxLengthValue))
                {
                    maxLength = Convert.ToInt32(maxLengthValue);
                }
                
                if (maxLength > 200)
                {
                    sb.AppendLine($"{indent}  <el-input v-model=\"formData.{propertyNameCamel}\" type=\"textarea\" :rows=\"3\" placeholder=\"请输入{property.Name}\" />");
                }
                else
                {
                    sb.AppendLine($"{indent}  <el-input v-model=\"formData.{propertyNameCamel}\" placeholder=\"请输入{property.Name}\" />");
                }
            }
        }
        else if (propertyType.Contains("int") || propertyType.Contains("decimal") || propertyType.Contains("double"))
        {
            sb.AppendLine($"{indent}  <el-input-number v-model=\"formData.{propertyNameCamel}\" placeholder=\"请输入{property.Name}\" />");
        }
        else if (propertyType.Contains("bool"))
        {
            sb.AppendLine($"{indent}  <el-switch v-model=\"formData.{propertyNameCamel}\" />");
        }
        else if (propertyType.Contains("datetime"))
        {
            sb.AppendLine($"{indent}  <el-date-picker v-model=\"formData.{propertyNameCamel}\" type=\"datetime\" placeholder=\"选择日期时间\" />");
        }
        else
        {
            // 默认文本输入
            sb.AppendLine($"{indent}  <el-input v-model=\"formData.{propertyNameCamel}\" placeholder=\"请输入{property.Name}\" />");
        }
        
        sb.AppendLine($"{indent}</el-form-item>");
        
        return sb.ToString();
    }

    private string GetDefaultValue(PropertyMetadata property)
    {
        var type = property.Type.ToLower();
        
        if (type.Contains("string"))
            return "''";
        if (type.Contains("int") || type.Contains("decimal") || type.Contains("double"))
            return "0";
        if (type.Contains("bool"))
            return "false";
        if (type.Contains("datetime"))
            return "null";
        if (type.Contains("guid"))
            return "''";
        
        return "null";
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
/// 字段分组定义
/// </summary>
public class FieldGroup
{
    public string Name { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string Description { get; set; } = default!;
    public int Order { get; set; }
    public List<string> Properties { get; set; } = new();
    public bool IsCollapsible { get; set; } = true;
    public bool IsCollapsedByDefault { get; set; } = false;
}

