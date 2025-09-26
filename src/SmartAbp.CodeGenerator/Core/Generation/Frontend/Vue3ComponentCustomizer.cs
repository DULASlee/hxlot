using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core.Generation.Frontend;

/// <summary>
/// 🎨 Vue3组件订制优化器 - 协助请求3实现
/// 为Vue3组件生成提供深度订制能力和业务逻辑扩展点
/// 支持企业级UI定制、主题适配、业务流程扩展
/// </summary>
public class Vue3ComponentCustomizer : ITransientDependency
{
    private readonly ILogger<Vue3ComponentCustomizer> _logger;

    public Vue3ComponentCustomizer(ILogger<Vue3ComponentCustomizer> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 🎨 生成带业务逻辑扩展点的Vue管理组件
    /// </summary>
    /// <param name="entity">实体模型</param>
    /// <param name="metadata">模块元数据</param>
    /// <param name="customizationOptions">订制选项</param>
    /// <returns>增强的Vue组件代码</returns>
    public string GenerateCustomizableManagementComponent(
        EnhancedEntityModelDto entity, 
        ModuleMetadataDto metadata,
        ComponentCustomizationOptions? customizationOptions = null)
    {
        _logger.LogInformation("🎨 生成可订制Vue管理组件: {EntityName}", entity.Name);

        var options = customizationOptions ?? new ComponentCustomizationOptions();
        var sb = new StringBuilder();

        // 🔥 生成模板头部和AI信息
        GenerateTemplateHeader(sb, entity, metadata, options);

        // 🎨 生成带扩展点的Template部分
        GenerateTemplate(sb, entity, metadata, options);

        // 🔧 生成带扩展点的Script部分
        GenerateScript(sb, entity, metadata, options);

        // 🎨 生成可订制的Style部分
        GenerateStyle(sb, entity, metadata, options);

        _logger.LogDebug("✅ Vue管理组件生成完成: {EntityName}, 长度: {Length}", 
            entity.Name, sb.Length);

        return sb.ToString();
    }

    /// <summary>
    /// 🔥 生成模板头部和AI信息
    /// </summary>
    private void GenerateTemplateHeader(StringBuilder sb, EnhancedEntityModelDto entity, ModuleMetadataDto metadata, ComponentCustomizationOptions options)
    {
        sb.AppendLine("<!--");
        sb.AppendLine($"🔥 {entity.DisplayName}管理组件 - 自动生成");
        sb.AppendLine($"生成时间: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}");
        sb.AppendLine($"模块: {metadata.DisplayName} ({metadata.Name})");
        sb.AppendLine($"实体: {entity.DisplayName} ({entity.Name})");
        sb.AppendLine();
        sb.AppendLine("🎨 UI订制特性:");
        sb.AppendLine($"- 主题支持: {(options.EnableThemeCustomization ? "✅" : "❌")}");
        sb.AppendLine($"- 响应式布局: {(options.EnableResponsiveLayout ? "✅" : "❌")}");
        sb.AppendLine($"- 高级搜索: {(options.EnableAdvancedSearch ? "✅" : "❌")}");
        sb.AppendLine($"- 批量操作: {(options.EnableBatchOperations ? "✅" : "❌")}");
        sb.AppendLine($"- 导入导出: {(options.EnableImportExport ? "✅" : "❌")}");
        sb.AppendLine();
        sb.AppendLine("🔧 业务逻辑扩展点:");
        sb.AppendLine("- beforeLoad: 数据加载前钩子");
        sb.AppendLine("- afterLoad: 数据加载后钩子");
        sb.AppendLine("- beforeSave: 数据保存前钩子");
        sb.AppendLine("- afterSave: 数据保存后钩子");
        sb.AppendLine("- customValidation: 自定义验证逻辑");
        sb.AppendLine("- customActions: 自定义操作按钮");
        sb.AppendLine("-->");
        sb.AppendLine();
    }

    /// <summary>
    /// 🎨 生成带扩展点的Template部分
    /// </summary>
    private void GenerateTemplate(StringBuilder sb, EnhancedEntityModelDto entity, ModuleMetadataDto metadata, ComponentCustomizationOptions options)
    {
        var entityLower = entity.Name.ToLowerInvariant();
        var entityDisplay = entity.DisplayName ?? entity.Name;

        sb.AppendLine("<template>");
        sb.AppendLine($"  <div class=\"{entityLower}-management\" :class=\"customClasses\">");
        
        // 🎯 扩展点1：自定义页面头部
        sb.AppendLine("    <!-- 🔧 扩展点1：自定义页面头部 -->");
        sb.AppendLine("    <slot name=\"page-header\">");
        sb.AppendLine("      <div class=\"page-header\">");
        sb.AppendLine($"        <h2 class=\"page-title\">{{{{ pageTitle || '{entityDisplay}管理' }}}}</h2>");
        sb.AppendLine("        <p class=\"page-description\">{{ pageDescription }}</p>");
        sb.AppendLine("      </div>");
        sb.AppendLine("    </slot>");
        sb.AppendLine();

        // 🔍 高级搜索区域（可选）
        if (options.EnableAdvancedSearch)
        {
            GenerateAdvancedSearchSection(sb, entity, options);
        }

        // 📊 数据表格区域
        GenerateDataTableSection(sb, entity, metadata, options);

        // 📝 编辑对话框
        GenerateEditDialog(sb, entity, options);

        // 🎯 扩展点2：自定义底部内容
        sb.AppendLine("    <!-- 🔧 扩展点2：自定义底部内容 -->");
        sb.AppendLine("    <slot name=\"page-footer\">");
        sb.AppendLine("      <!-- 可在此添加统计信息、快捷操作等 -->");
        sb.AppendLine("    </slot>");

        sb.AppendLine("  </div>");
        sb.AppendLine("</template>");
        sb.AppendLine();
    }

    /// <summary>
    /// 🔍 生成高级搜索区域
    /// </summary>
    private void GenerateAdvancedSearchSection(StringBuilder sb, EnhancedEntityModelDto entity, ComponentCustomizationOptions options)
    {
        sb.AppendLine("    <!-- 🔍 高级搜索区域 -->");
        sb.AppendLine("    <el-card class=\"search-card\" shadow=\"never\">");
        sb.AppendLine("      <el-form");
        sb.AppendLine("        ref=\"searchFormRef\"");
        sb.AppendLine("        :model=\"searchForm\"");
        sb.AppendLine("        :inline=\"!isMobile\"");
        sb.AppendLine("        class=\"search-form\"");
        sb.AppendLine("        @submit.prevent=\"onSearch\"");
        sb.AppendLine("      >");
        sb.AppendLine("        <el-row :gutter=\"16\">");
        
        // 为每个可搜索字段生成搜索表单项
        if (entity.Properties != null)
        {
            var searchableProps = entity.Properties.Where(p => p.Type == "string" || p.Type == "int" || p.Type == "DateTime").Take(4);
            foreach (var prop in searchableProps)
            {
                sb.AppendLine($"          <el-col :xs=\"24\" :sm=\"12\" :md=\"6\">");
                sb.AppendLine($"            <el-form-item label=\"{prop.DisplayName ?? prop.Name}\">");
                
                if (prop.Type == "string")
                {
                    sb.AppendLine($"              <el-input");
                    sb.AppendLine($"                v-model=\"searchForm.{prop.Name.ToCamelCase()}\"");
                    sb.AppendLine($"                placeholder=\"请输入{prop.DisplayName ?? prop.Name}\"");
                    sb.AppendLine($"                clearable");
                    sb.AppendLine($"                @keyup.enter=\"onSearch\"");
                    sb.AppendLine($"              />");
                }
                else if (prop.Type == "DateTime")
                {
                    sb.AppendLine($"              <el-date-picker");
                    sb.AppendLine($"                v-model=\"searchForm.{prop.Name.ToCamelCase()}Range\"");
                    sb.AppendLine($"                type=\"daterange\"");
                    sb.AppendLine($"                placeholder=\"选择{prop.DisplayName ?? prop.Name}范围\"");
                    sb.AppendLine($"                format=\"YYYY-MM-DD\"");
                    sb.AppendLine($"                value-format=\"YYYY-MM-DD\"");
                    sb.AppendLine($"              />");
                }
                
                sb.AppendLine($"            </el-form-item>");
                sb.AppendLine($"          </el-col>");
            }
        }

        sb.AppendLine("          <el-col :xs=\"24\" :sm=\"12\" :md=\"6\">");
        sb.AppendLine("            <el-form-item>");
        sb.AppendLine("              <el-button type=\"primary\" @click=\"onSearch\" :loading=\"loading\">");
        sb.AppendLine("                <el-icon><Search /></el-icon> 搜索");
        sb.AppendLine("              </el-button>");
        sb.AppendLine("              <el-button @click=\"onResetSearch\">");
        sb.AppendLine("                <el-icon><Refresh /></el-icon> 重置");
        sb.AppendLine("              </el-button>");
        sb.AppendLine("            </el-form-item>");
        sb.AppendLine("          </el-col>");
        sb.AppendLine("        </el-row>");
        sb.AppendLine("      </el-form>");
        sb.AppendLine("    </el-card>");
        sb.AppendLine();
    }

    /// <summary>
    /// 📊 生成数据表格区域
    /// </summary>
    private void GenerateDataTableSection(StringBuilder sb, EnhancedEntityModelDto entity, ModuleMetadataDto metadata, ComponentCustomizationOptions options)
    {
        var entityLower = entity.Name.ToLowerInvariant();

        sb.AppendLine("    <!-- 📊 数据表格区域 -->");
        sb.AppendLine("    <el-card class=\"table-card\">");
        sb.AppendLine("      <div class=\"table-toolbar\">");
        sb.AppendLine("        <div class=\"toolbar-left\">");
        sb.AppendLine($"          <el-button");
        sb.AppendLine($"            v-permission=\"'SmartAbp.{entity.Name}.Create'\"");
        sb.AppendLine($"            type=\"primary\"");
        sb.AppendLine($"            @click=\"onAdd\"");
        sb.AppendLine($"          >");
        sb.AppendLine($"            <el-icon><Plus /></el-icon> 新增{entity.DisplayName ?? entity.Name}");
        sb.AppendLine($"          </el-button>");

        // 批量操作按钮（可选）
        if (options.EnableBatchOperations)
        {
            sb.AppendLine($"          <el-button");
            sb.AppendLine($"            v-permission=\"'SmartAbp.{entity.Name}.Delete'\"");
            sb.AppendLine($"            type=\"danger\"");
            sb.AppendLine($"            :disabled=\"selectedRows.length === 0\"");
            sb.AppendLine($"            @click=\"onBatchDelete\"");
            sb.AppendLine($"          >");
            sb.AppendLine($"            <el-icon><Delete /></el-icon> 批量删除");
            sb.AppendLine($"          </el-button>");
        }

        // 导入导出按钮（可选）
        if (options.EnableImportExport)
        {
            sb.AppendLine($"          <el-button @click=\"onExport\" :loading=\"exporting\">");
            sb.AppendLine($"            <el-icon><Download /></el-icon> 导出");
            sb.AppendLine($"          </el-button>");
            sb.AppendLine($"          <el-upload");
            sb.AppendLine($"            :show-file-list=\"false\"");
            sb.AppendLine($"            :before-upload=\"onImport\"");
            sb.AppendLine($"            accept=\".xlsx,.xls,.csv\"");
            sb.AppendLine($"          >");
            sb.AppendLine($"            <el-button>");
            sb.AppendLine($"              <el-icon><Upload /></el-icon> 导入");
            sb.AppendLine($"            </el-button>");
            sb.AppendLine($"          </el-upload>");
        }

        sb.AppendLine("        </div>");
        sb.AppendLine();
        
        // 🎯 扩展点3：自定义工具栏按钮
        sb.AppendLine("        <!-- 🔧 扩展点3：自定义工具栏按钮 -->");
        sb.AppendLine("        <div class=\"toolbar-right\">");
        sb.AppendLine("          <slot name=\"toolbar-actions\" :selected-rows=\"selectedRows\">");
        sb.AppendLine("            <!-- 可在此添加自定义操作按钮 -->");
        sb.AppendLine("          </slot>");
        sb.AppendLine("        </div>");
        sb.AppendLine("      </div>");
        sb.AppendLine();

        // 表格主体
        GenerateTableStructure(sb, entity, options);

        sb.AppendLine("    </el-card>");
        sb.AppendLine();
    }

    /// <summary>
    /// 📋 生成表格结构
    /// </summary>
    private void GenerateTableStructure(StringBuilder sb, EnhancedEntityModelDto entity, ComponentCustomizationOptions options)
    {
        sb.AppendLine("      <el-table");
        sb.AppendLine("        ref=\"tableRef\"");
        sb.AppendLine("        v-loading=\"loading\"");
        sb.AppendLine("        :data=\"tableData\"");
        sb.AppendLine("        row-key=\"id\"");
        sb.AppendLine("        style=\"width: 100%\"");
        sb.AppendLine("        @selection-change=\"onSelectionChange\"");
        sb.AppendLine("        @sort-change=\"onSortChange\"");
        sb.AppendLine("      >");

        // 批量选择列（可选）
        if (options.EnableBatchOperations)
        {
            sb.AppendLine("        <el-table-column type=\"selection\" width=\"55\" align=\"center\" />");
        }

        // 为每个属性生成表格列
        if (entity.Properties != null)
        {
            var displayProperties = entity.Properties.Where(p => !p.IsKey || p.Name == "Id").Take(6);
            foreach (var prop in displayProperties)
            {
                sb.AppendLine($"        <el-table-column");
                sb.AppendLine($"          prop=\"{prop.Name.ToCamelCase()}\"");
                sb.AppendLine($"          label=\"{prop.DisplayName ?? prop.Name}\"");
                
                if (prop.Type == "DateTime")
                {
                    sb.AppendLine($"          width=\"180\"");
                    sb.AppendLine($"          sortable=\"custom\"");
                    sb.AppendLine($"        >");
                    sb.AppendLine($"          <template #default=\"{{ row }}\">");
                    sb.AppendLine($"            <span>{{{{ formatDateTime(row.{prop.Name.ToCamelCase()}) }}}}</span>");
                    sb.AppendLine($"          </template>");
                    sb.AppendLine($"        </el-table-column>");
                }
                else if (prop.Type == "bool")
                {
                    sb.AppendLine($"          width=\"100\"");
                    sb.AppendLine($"          align=\"center\"");
                    sb.AppendLine($"        >");
                    sb.AppendLine($"          <template #default=\"{{ row }}\">");
                    sb.AppendLine($"            <el-tag :type=\"row.{prop.Name.ToCamelCase()} ? 'success' : 'info'\">");
                    sb.AppendLine($"              {{{{ row.{prop.Name.ToCamelCase()} ? '是' : '否' }}}}");
                    sb.AppendLine($"            </el-tag>");
                    sb.AppendLine($"          </template>");
                    sb.AppendLine($"        </el-table-column>");
                }
                else
                {
                    var width = prop.Type == "string" ? (prop.MaxLength > 50 ? "200" : "150") : "120";
                    sb.AppendLine($"          width=\"{width}\"");
                    sb.AppendLine($"          sortable=\"custom\"");
                    sb.AppendLine($"          show-overflow-tooltip");
                    sb.AppendLine($"        />");
                }
            }
        }

        // 🎯 扩展点4：自定义表格列
        sb.AppendLine("        <!-- 🔧 扩展点4：自定义表格列 -->");
        sb.AppendLine("        <slot name=\"table-columns\" :data=\"tableData\">");
        sb.AppendLine("          <!-- 可在此添加自定义列 -->");
        sb.AppendLine("        </slot>");

        // 操作列
        sb.AppendLine("        <el-table-column label=\"操作\" width=\"200\" align=\"center\" fixed=\"right\">");
        sb.AppendLine("          <template #default=\"{ row }\">");
        sb.AppendLine("            <div class=\"action-buttons\">");
        sb.AppendLine($"              <el-button");
        sb.AppendLine($"                v-permission=\"'SmartAbp.{entity.Name}.Edit'\"");
        sb.AppendLine($"                link");
        sb.AppendLine($"                type=\"primary\"");
        sb.AppendLine($"                size=\"small\"");
        sb.AppendLine($"                @click=\"onEdit(row)\"");
        sb.AppendLine($"              >");
        sb.AppendLine($"                <el-icon><Edit /></el-icon> 编辑");
        sb.AppendLine($"              </el-button>");
        sb.AppendLine($"              <el-button");
        sb.AppendLine($"                v-permission=\"'SmartAbp.{entity.Name}.Delete'\"");
        sb.AppendLine($"                link");
        sb.AppendLine($"                type=\"danger\"");
        sb.AppendLine($"                size=\"small\"");
        sb.AppendLine($"                @click=\"onDelete(row)\"");
        sb.AppendLine($"              >");
        sb.AppendLine($"                <el-icon><Delete /></el-icon> 删除");
        sb.AppendLine($"              </el-button>");
        
        // 🎯 扩展点5：自定义操作按钮
        sb.AppendLine("              <!-- 🔧 扩展点5：自定义操作按钮 -->");
        sb.AppendLine("              <slot name=\"row-actions\" :row=\"row\">");
        sb.AppendLine("                <!-- 可在此添加自定义行操作 -->");
        sb.AppendLine("              </slot>");
        
        sb.AppendLine("            </div>");
        sb.AppendLine("          </template>");
        sb.AppendLine("        </el-table-column>");
        sb.AppendLine("      </el-table>");
        sb.AppendLine();

        // 分页组件
        GeneratePaginationSection(sb, options);
    }

    /// <summary>
    /// 📝 生成编辑对话框
    /// </summary>
    private void GenerateEditDialog(StringBuilder sb, EnhancedEntityModelDto entity, ComponentCustomizationOptions options)
    {
        sb.AppendLine("    <!-- 📝 编辑对话框 -->");
        sb.AppendLine("    <el-dialog");
        sb.AppendLine("      v-model=\"editDialogVisible\"");
        sb.AppendLine("      :title=\"editMode === 'add' ? `新增${entityDisplayName}` : `编辑${entityDisplayName}`\"");
        sb.AppendLine("      width=\"600px\"");
        sb.AppendLine("      :close-on-click-modal=\"false\"");
        sb.AppendLine("      @close=\"onDialogClose\"");
        sb.AppendLine("    >");
        sb.AppendLine("      <el-form");
        sb.AppendLine("        ref=\"editFormRef\"");
        sb.AppendLine("        :model=\"editForm\"");
        sb.AppendLine("        :rules=\"formRules\"");
        sb.AppendLine("        label-width=\"120px\"");
        sb.AppendLine("        @submit.prevent=\"onSave\"");
        sb.AppendLine("      >");

        // 🎯 扩展点6：自定义表单前置内容
        sb.AppendLine("        <!-- 🔧 扩展点6：自定义表单前置内容 -->");
        sb.AppendLine("        <slot name=\"form-prepend\" :form=\"editForm\" :mode=\"editMode\">");
        sb.AppendLine("          <!-- 可在此添加表单前置内容 -->");
        sb.AppendLine("        </slot>");

        // 为每个属性生成表单项
        if (entity.Properties != null)
        {
            var editableProps = entity.Properties.Where(p => !p.IsKey);
            foreach (var prop in editableProps)
            {
                GenerateFormField(sb, prop);
            }
        }

        // 🎯 扩展点7：自定义表单后置内容
        sb.AppendLine("        <!-- 🔧 扩展点7：自定义表单后置内容 -->");
        sb.AppendLine("        <slot name=\"form-append\" :form=\"editForm\" :mode=\"editMode\">");
        sb.AppendLine("          <!-- 可在此添加表单后置内容 -->");
        sb.AppendLine("        </slot>");

        sb.AppendLine("      </el-form>");
        sb.AppendLine();
        sb.AppendLine("      <template #footer>");
        sb.AppendLine("        <div class=\"dialog-footer\">");
        sb.AppendLine("          <el-button @click=\"editDialogVisible = false\">取消</el-button>");
        sb.AppendLine("          <el-button type=\"primary\" @click=\"onSave\" :loading=\"saving\">");
        sb.AppendLine("            {{ editMode === 'add' ? '创建' : '更新' }}");
        sb.AppendLine("          </el-button>");
        sb.AppendLine("        </div>");
        sb.AppendLine("      </template>");
        sb.AppendLine("    </el-dialog>");
        sb.AppendLine();
    }

    /// <summary>
    /// 📄 生成分页区域
    /// </summary>
    private void GeneratePaginationSection(StringBuilder sb, ComponentCustomizationOptions options)
    {
        sb.AppendLine("      <!-- 📄 分页组件 -->");
        sb.AppendLine("      <div class=\"pagination-wrapper\">");
        sb.AppendLine("        <el-pagination");
        sb.AppendLine("          v-model:current-page=\"pagination.pageIndex\"");
        sb.AppendLine("          v-model:page-size=\"pagination.pageSize\"");
        sb.AppendLine("          :total=\"pagination.total\"");
        sb.AppendLine("          :page-sizes=\"[10, 20, 50, 100]\"");
        sb.AppendLine("          :small=\"isMobile\"");
        sb.AppendLine("          layout=\"total, sizes, prev, pager, next, jumper\"");
        sb.AppendLine("          @size-change=\"onPageSizeChange\"");
        sb.AppendLine("          @current-change=\"onPageIndexChange\"");
        sb.AppendLine("        />");
        sb.AppendLine("      </div>");
    }

    /// <summary>
    /// 📝 生成表单字段
    /// </summary>
    private void GenerateFormField(StringBuilder sb, EntityPropertyDto prop)
    {
        var fieldName = prop.Name.ToCamelCase();
        var label = prop.DisplayName ?? prop.Name;
        var required = prop.IsRequired ? "required" : "";

        sb.AppendLine($"        <el-form-item label=\"{label}\" prop=\"{fieldName}\">");

        switch (prop.Type?.ToLowerInvariant())
        {
            case "string":
                if (prop.MaxLength > 100)
                {
                    sb.AppendLine($"          <el-input");
                    sb.AppendLine($"            v-model=\"editForm.{fieldName}\"");
                    sb.AppendLine($"            type=\"textarea\"");
                    sb.AppendLine($"            :rows=\"4\"");
                    sb.AppendLine($"            placeholder=\"请输入{label}\"");
                    if (prop.MaxLength.HasValue)
                    {
                        sb.AppendLine($"            maxlength=\"{prop.MaxLength.Value}\"");
                        sb.AppendLine($"            show-word-limit");
                    }
                    sb.AppendLine($"          />");
                }
                else
                {
                    sb.AppendLine($"          <el-input");
                    sb.AppendLine($"            v-model=\"editForm.{fieldName}\"");
                    sb.AppendLine($"            placeholder=\"请输入{label}\"");
                    if (prop.MaxLength.HasValue)
                    {
                        sb.AppendLine($"            maxlength=\"{prop.MaxLength.Value}\"");
                    }
                    sb.AppendLine($"          />");
                }
                break;

            case "int":
            case "integer":
            case "long":
            case "decimal":
            case "double":
                sb.AppendLine($"          <el-input-number");
                sb.AppendLine($"            v-model=\"editForm.{fieldName}\"");
                sb.AppendLine($"            placeholder=\"请输入{label}\"");
                sb.AppendLine($"            style=\"width: 100%\"");
                if (prop.MinValue.HasValue)
                {
                    sb.AppendLine($"            :min=\"{prop.MinValue.Value}\"");
                }
                if (prop.MaxValue.HasValue)
                {
                    sb.AppendLine($"            :max=\"{prop.MaxValue.Value}\"");
                }
                sb.AppendLine($"          />");
                break;

            case "bool":
            case "boolean":
                sb.AppendLine($"          <el-switch");
                sb.AppendLine($"            v-model=\"editForm.{fieldName}\"");
                sb.AppendLine($"            active-text=\"是\"");
                sb.AppendLine($"            inactive-text=\"否\"");
                sb.AppendLine($"          />");
                break;

            case "datetime":
                sb.AppendLine($"          <el-date-picker");
                sb.AppendLine($"            v-model=\"editForm.{fieldName}\"");
                sb.AppendLine($"            type=\"datetime\"");
                sb.AppendLine($"            placeholder=\"选择{label}\"");
                sb.AppendLine($"            format=\"YYYY-MM-DD HH:mm:ss\"");
                sb.AppendLine($"            value-format=\"YYYY-MM-DD HH:mm:ss\"");
                sb.AppendLine($"            style=\"width: 100%\"");
                sb.AppendLine($"          />");
                break;

            default:
                sb.AppendLine($"          <el-input");
                sb.AppendLine($"            v-model=\"editForm.{fieldName}\"");
                sb.AppendLine($"            placeholder=\"请输入{label}\"");
                sb.AppendLine($"          />");
                break;
        }

        sb.AppendLine($"        </el-form-item>");
    }

    /// <summary>
    /// 🔧 生成带扩展点的Script部分
    /// </summary>
    private void GenerateScript(StringBuilder sb, EnhancedEntityModelDto entity, ModuleMetadataDto metadata, ComponentCustomizationOptions options)
    {
        var entityLower = entity.Name.ToLowerInvariant();
        var entityCamel = entity.Name.ToCamelCase();

        sb.AppendLine("<script setup lang=\"ts\">");
        sb.AppendLine("// Vue 3 Composition API");
        sb.AppendLine("import { ref, reactive, computed, onMounted, nextTick } from 'vue'");
        sb.AppendLine("// Element Plus组件和图标");
        sb.AppendLine("import { ElMessage, ElMessageBox } from 'element-plus'");
        sb.AppendLine("import { Search, Refresh, Plus, Edit, Delete, Download, Upload } from '@element-plus/icons-vue'");
        sb.AppendLine("// Vue Router");
        sb.AppendLine("import { useRoute, useRouter } from 'vue-router'");
        sb.AppendLine("// 状态管理");
        sb.AppendLine($"import {{ use{entity.Name}Store }} from '@/stores/modules/{metadata.Name.ToLowerInvariant()}/{entityLower}'");
        sb.AppendLine("// 权限指令");
        sb.AppendLine("import { usePermission } from '@/composables/usePermission'");
        sb.AppendLine("// 响应式设计");
        sb.AppendLine("import { useBreakpoints } from '@/composables/useBreakpoints'");
        
        if (options.EnableThemeCustomization)
        {
            sb.AppendLine("// 主题定制");
            sb.AppendLine("import { useTheme } from '@/composables/useTheme'");
        }
        
        sb.AppendLine();
        sb.AppendLine("// 🔧 类型定义");
        sb.AppendLine($"interface {entity.Name}FormData {{");
        if (entity.Properties != null)
        {
            foreach (var prop in entity.Properties)
            {
                var tsType = MapCSharpTypeToTypeScript(prop.Type);
                var optional = !prop.IsRequired ? "?" : "";
                sb.AppendLine($"  {prop.Name.ToCamelCase()}{optional}: {tsType}");
            }
        }
        sb.AppendLine("}");
        sb.AppendLine();

        // 🎯 扩展点8：自定义组合式函数和状态
        GenerateCustomComposables(sb, entity, metadata, options);

        // 🔧 生成核心业务逻辑
        GenerateBusinessLogic(sb, entity, metadata, options);

        sb.AppendLine("</script>");
        sb.AppendLine();
    }

    /// <summary>
    /// 🎯 生成自定义组合式函数和状态
    /// </summary>
    private void GenerateCustomComposables(StringBuilder sb, EnhancedEntityModelDto entity, ModuleMetadataDto metadata, ComponentCustomizationOptions options)
    {
        // 🔥 变量定义修复：在方法开始处定义entityCamel（遵循BUG修复铁律）
        var entityCamel = entity.Name.ToCamelCase();
        
        sb.AppendLine("// 🔧 扩展点8：自定义组合式函数和状态");
        sb.AppendLine("// 可在此区域添加自定义的组合式函数");
        sb.AppendLine();
        sb.AppendLine("// 基础组合式函数");
        sb.AppendLine("const route = useRoute()");
        sb.AppendLine("const router = useRouter()");
        sb.AppendLine($"const {entityCamel}Store = use{entity.Name}Store()");
        sb.AppendLine("const { hasPermission } = usePermission()");
        sb.AppendLine("const { isMobile, isTablet } = useBreakpoints()");
        
        if (options.EnableThemeCustomization)
        {
            sb.AppendLine("const { currentTheme, setThemeVariable } = useTheme()");
        }
        
        sb.AppendLine();
        sb.AppendLine("// 🎨 UI状态管理");
        sb.AppendLine("const loading = ref(false)");
        sb.AppendLine("const saving = ref(false)");
        sb.AppendLine("const exporting = ref(false)");
        sb.AppendLine("const editDialogVisible = ref(false)");
        sb.AppendLine("const editMode = ref<'add' | 'edit'>('add')");
        sb.AppendLine();
        sb.AppendLine("// 📊 数据状态");
        sb.AppendLine("const tableData = ref<any[]>([])");
        sb.AppendLine("const selectedRows = ref<any[]>([])");
        sb.AppendLine("const editForm = reactive<any>({})");
        sb.AppendLine();
        sb.AppendLine("// 🔍 搜索状态");
        if (options.EnableAdvancedSearch)
        {
            sb.AppendLine("const searchForm = reactive({");
            if (entity.Properties != null)
            {
                var searchableProps = entity.Properties.Where(p => p.Type == "string" || p.Type == "int" || p.Type == "DateTime").Take(4);
                foreach (var prop in searchableProps)
                {
                    if (prop.Type == "DateTime")
                    {
                        sb.AppendLine($"  {prop.Name.ToCamelCase()}Range: null as [string, string] | null,");
                    }
                    else
                    {
                        sb.AppendLine($"  {prop.Name.ToCamelCase()}: '',");
                    }
                }
            }
            sb.AppendLine("})");
        }
        else
        {
            sb.AppendLine("const searchForm = reactive({ keyword: '' })");
        }
        
        sb.AppendLine();
        sb.AppendLine("// 📄 分页状态");
        sb.AppendLine("const pagination = reactive({");
        sb.AppendLine("  pageIndex: 1,");
        sb.AppendLine("  pageSize: 20,");
        sb.AppendLine("  total: 0");
        sb.AppendLine("})");
        sb.AppendLine();
    }

    /// <summary>
    /// 🔧 生成核心业务逻辑
    /// </summary>
    private void GenerateBusinessLogic(StringBuilder sb, EnhancedEntityModelDto entity, ModuleMetadataDto metadata, ComponentCustomizationOptions options)
    {
        // 🔥 变量定义修复：在方法开始处定义entityCamel（遵循BUG修复铁律）
        var entityCamel = entity.Name.ToCamelCase();
        
        sb.AppendLine("// 🔧 业务逻辑扩展点定义");
        sb.AppendLine("const businessLogicHooks = {");
        sb.AppendLine("  // 🎯 扩展点9：数据加载前钩子");
        sb.AppendLine("  beforeLoad: async (params: any) => {");
        sb.AppendLine("    // 可在此添加数据加载前的自定义逻辑");
        sb.AppendLine("    // 例如：参数转换、权限检查、缓存处理等");
        sb.AppendLine("    console.log('beforeLoad hook:', params)");
        sb.AppendLine("    return params");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  // 🎯 扩展点10：数据加载后钩子");
        sb.AppendLine("  afterLoad: async (data: any) => {");
        sb.AppendLine("    // 可在此添加数据加载后的自定义逻辑");
        sb.AppendLine("    // 例如：数据转换、状态更新、UI刷新等");
        sb.AppendLine("    console.log('afterLoad hook:', data)");
        sb.AppendLine("    return data");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  // 🎯 扩展点11：数据保存前钩子");
        sb.AppendLine("  beforeSave: async (formData: any, mode: 'add' | 'edit') => {");
        sb.AppendLine("    // 可在此添加数据保存前的自定义逻辑");
        sb.AppendLine("    // 例如：数据验证、格式转换、业务规则检查等");
        sb.AppendLine("    console.log('beforeSave hook:', { formData, mode })");
        sb.AppendLine("    return formData");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  // 🎯 扩展点12：数据保存后钩子");
        sb.AppendLine("  afterSave: async (result: any, mode: 'add' | 'edit') => {");
        sb.AppendLine("    // 可在此添加数据保存后的自定义逻辑");
        sb.AppendLine("    // 例如：消息通知、页面跳转、缓存更新等");
        sb.AppendLine("    console.log('afterSave hook:', { result, mode })");
        sb.AppendLine("    return result");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  // 🎯 扩展点13：自定义验证逻辑");
        sb.AppendLine("  customValidation: async (formData: any) => {");
        sb.AppendLine("    // 可在此添加自定义验证逻辑");
        sb.AppendLine("    // 返回 { valid: boolean, message?: string }");
        sb.AppendLine("    console.log('customValidation hook:', formData)");
        sb.AppendLine("    return { valid: true }");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();

        // 生成主要业务方法（带扩展点调用）
        GenerateBusinessMethods(sb, entity, options);
    }

    /// <summary>
    /// 🔧 生成业务方法（集成扩展点）
    /// </summary>
    private void GenerateBusinessMethods(StringBuilder sb, EnhancedEntityModelDto entity, ComponentCustomizationOptions options)
    {
        var entityCamel = entity.Name.ToCamelCase();

        sb.AppendLine("// 🔧 核心业务方法（集成扩展点）");
        sb.AppendLine("const loadData = async (params?: any) => {");
        sb.AppendLine("  try {");
        sb.AppendLine("    loading.value = true");
        sb.AppendLine();
        sb.AppendLine("    // 🎯 调用扩展点：数据加载前钩子");
        sb.AppendLine("    const processedParams = await businessLogicHooks.beforeLoad(params || {})");
        sb.AppendLine();
        sb.AppendLine($"    // TODO: 调用实际的API服务");
        sb.AppendLine($"    // const result = await {entityCamel}Store.fetchList(processedParams)");
        sb.AppendLine($"    const mockResult = {{ items: [], total: 0 }}");
        sb.AppendLine();
        sb.AppendLine("    // 🎯 调用扩展点：数据加载后钩子");
        sb.AppendLine("    const processedData = await businessLogicHooks.afterLoad(mockResult)");
        sb.AppendLine();
        sb.AppendLine("    tableData.value = processedData.items");
        sb.AppendLine("    pagination.total = processedData.total");
        sb.AppendLine("  } catch (error) {");
        sb.AppendLine("    console.error('数据加载失败:', error)");
        sb.AppendLine("    ElMessage.error('数据加载失败')");
        sb.AppendLine("  } finally {");
        sb.AppendLine("    loading.value = false");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();

        sb.AppendLine("const saveData = async () => {");
        sb.AppendLine("  try {");
        sb.AppendLine("    saving.value = true");
        sb.AppendLine();
        sb.AppendLine("    // 🎯 调用扩展点：自定义验证逻辑");
        sb.AppendLine("    const validationResult = await businessLogicHooks.customValidation(editForm)");
        sb.AppendLine("    if (!validationResult.valid) {");
        sb.AppendLine("      ElMessage.error(validationResult.message || '数据验证失败')");
        sb.AppendLine("      return");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    // 🎯 调用扩展点：数据保存前钩子");
        sb.AppendLine("    const processedData = await businessLogicHooks.beforeSave(editForm, editMode.value)");
        sb.AppendLine();
        sb.AppendLine("    // TODO: 调用实际的API服务");
        sb.AppendLine("    if (editMode.value === 'add') {");
        sb.AppendLine($"      // await {entityCamel}Store.create(processedData)");
        sb.AppendLine("    } else {");
        sb.AppendLine($"      // await {entityCamel}Store.update(processedData.id, processedData)");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    // 🎯 调用扩展点：数据保存后钩子");
        sb.AppendLine("    await businessLogicHooks.afterSave(processedData, editMode.value)");
        sb.AppendLine();
        sb.AppendLine("    ElMessage.success(editMode.value === 'add' ? '创建成功' : '更新成功')");
        sb.AppendLine("    editDialogVisible.value = false");
        sb.AppendLine("    await loadData()");
        sb.AppendLine("  } catch (error) {");
        sb.AppendLine("    console.error('保存失败:', error)");
        sb.AppendLine("    ElMessage.error('保存失败')");
        sb.AppendLine("  } finally {");
        sb.AppendLine("    saving.value = false");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();

        // 🎯 扩展点14：暴露给父组件的API
        sb.AppendLine("// 🎯 扩展点14：暴露给父组件的API");
        sb.AppendLine("defineExpose({");
        sb.AppendLine("  // 🔧 公共方法，供父组件调用");
        sb.AppendLine("  loadData,");
        sb.AppendLine("  saveData,");
        sb.AppendLine("  resetForm: () => Object.assign(editForm, {}),");
        sb.AppendLine("  getSelectedRows: () => selectedRows.value,");
        sb.AppendLine("  // 🎯 业务逻辑钩子，供父组件自定义");
        sb.AppendLine("  businessLogicHooks,");
        sb.AppendLine("  // 🎨 UI状态，供父组件控制");
        sb.AppendLine("  uiState: {");
        sb.AppendLine("    loading: readonly(loading),");
        sb.AppendLine("    editMode: readonly(editMode),");
        sb.AppendLine("    editDialogVisible");
        sb.AppendLine("  }");
        sb.AppendLine("})");
        sb.AppendLine();

        // 组件生命周期
        sb.AppendLine("// 🚀 组件生命周期");
        sb.AppendLine("onMounted(async () => {");
        sb.AppendLine("  await loadData()");
        sb.AppendLine("})");
    }

    /// <summary>
    /// 🎨 生成可订制的Style部分
    /// </summary>
    private void GenerateStyle(StringBuilder sb, EnhancedEntityModelDto entity, ModuleMetadataDto metadata, ComponentCustomizationOptions options)
    {
        var entityLower = entity.Name.ToLowerInvariant();

        sb.AppendLine("<style scoped>");
        sb.AppendLine("/* 🎨 企业级样式定制 - 支持主题变量和响应式设计 */");
        sb.AppendLine();
        sb.AppendLine($".{entityLower}-management {{");
        sb.AppendLine("  padding: var(--spacing-6);");
        sb.AppendLine("  background: var(--color-bg-container);");
        sb.AppendLine("  border-radius: var(--border-radius-lg);");
        sb.AppendLine("  min-height: calc(100vh - 120px);");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine(".page-header {");
        sb.AppendLine("  margin-bottom: var(--spacing-6);");
        sb.AppendLine("  padding-bottom: var(--spacing-4);");
        sb.AppendLine("  border-bottom: 1px solid var(--color-border-secondary);");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine(".page-title {");
        sb.AppendLine("  font-size: var(--font-size-xl);");
        sb.AppendLine("  font-weight: var(--font-weight-bold);");
        sb.AppendLine("  color: var(--color-text-primary);");
        sb.AppendLine("  margin: 0 0 var(--spacing-2) 0;");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine(".page-description {");
        sb.AppendLine("  color: var(--color-text-secondary);");
        sb.AppendLine("  margin: 0;");
        sb.AppendLine("}");
        sb.AppendLine();

        // 🎯 扩展点15：自定义样式变量
        sb.AppendLine("/* 🎯 扩展点15：自定义样式变量 */");
        sb.AppendLine("/* 可通过CSS变量进行主题定制 */");
        sb.AppendLine($".{entityLower}-management {{");
        sb.AppendLine($"  --{entityLower}-primary-color: var(--color-primary);");
        sb.AppendLine($"  --{entityLower}-success-color: var(--color-success);");
        sb.AppendLine($"  --{entityLower}-warning-color: var(--color-warning);");
        sb.AppendLine($"  --{entityLower}-danger-color: var(--color-danger);");
        sb.AppendLine($"  --{entityLower}-card-shadow: var(--shadow-sm);");
        sb.AppendLine("}");
        sb.AppendLine();

        // 响应式设计
        if (options.EnableResponsiveLayout)
        {
            GenerateResponsiveStyles(sb, entityLower);
        }

        sb.AppendLine("</style>");
    }

    /// <summary>
    /// 📱 生成响应式样式
    /// </summary>
    private void GenerateResponsiveStyles(StringBuilder sb, string entityLower)
    {
        sb.AppendLine("/* 📱 响应式设计 */");
        sb.AppendLine("@media (max-width: 768px) {");
        sb.AppendLine($"  .{entityLower}-management {{");
        sb.AppendLine("    padding: var(--spacing-4);");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine("  .table-toolbar {");
        sb.AppendLine("    flex-direction: column;");
        sb.AppendLine("    gap: var(--spacing-3);");
        sb.AppendLine("    align-items: stretch;");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine("  .action-buttons {");
        sb.AppendLine("    justify-content: center;");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine("@media (max-width: 480px) {");
        sb.AppendLine("  .pagination-wrapper {");
        sb.AppendLine("    overflow-x: auto;");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();
    }

    /// <summary>
    /// 🔧 C#类型到TypeScript类型映射（复用）
    /// </summary>
    private static string MapCSharpTypeToTypeScript(string? csharpType)
    {
        return csharpType?.ToLowerInvariant() switch
        {
            "string" => "string",
            "int" or "integer" or "long" or "short" or "byte" => "number",
            "double" or "float" or "decimal" => "number",
            "bool" or "boolean" => "boolean",
            "datetime" or "datetimeoffset" => "Date | string",
            "guid" => "string",
            null => "any",
            _ when csharpType.EndsWith("?") => MapCSharpTypeToTypeScript(csharpType.TrimEnd('?')) + " | null",
            _ when csharpType.EndsWith("[]") => MapCSharpTypeToTypeScript(csharpType.TrimEnd('[', ']')) + "[]",
            _ => "any"
        };
    }
}

/// <summary>
/// 🎨 组件订制选项
/// </summary>
public class ComponentCustomizationOptions
{
    /// <summary>启用主题定制</summary>
    public bool EnableThemeCustomization { get; set; } = true;
    
    /// <summary>启用响应式布局</summary>
    public bool EnableResponsiveLayout { get; set; } = true;
    
    /// <summary>启用高级搜索</summary>
    public bool EnableAdvancedSearch { get; set; } = true;
    
    /// <summary>启用批量操作</summary>
    public bool EnableBatchOperations { get; set; } = true;
    
    /// <summary>启用导入导出</summary>
    public bool EnableImportExport { get; set; } = true;
    
    /// <summary>自定义CSS类名</summary>
    public List<string> CustomCssClasses { get; set; } = new();
    
    /// <summary>自定义字段显示</summary>
    public Dictionary<string, bool> FieldVisibility { get; set; } = new();
    
    /// <summary>自定义表单验证规则</summary>
    public Dictionary<string, string> CustomValidationRules { get; set; } = new();
}

// 🔥 重复代码清理：移除重复的StringExtensions定义（遵循第十三重爆雷规则）
// 使用已存在的StringExtensions.ToCamelCase方法
