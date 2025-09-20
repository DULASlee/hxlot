using System;
using System.Linq;
using System.Text;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services
{
    public class FrontendIntegrationService
    {
        private readonly ILogger<FrontendIntegrationService> _logger;

        public FrontendIntegrationService(ILogger<FrontendIntegrationService> logger)
        {
            _logger = logger;
        }

        public Task IntegrateAsync(ModuleMetadataDto metadata, string solutionRoot)
        {
            try
            {
                IntegrateRoutes(metadata, solutionRoot);
                IntegrateMenus(metadata, solutionRoot);
                _logger.LogInformation("Frontend integration completed for module {ModuleName}", metadata.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Frontend integration failed for module {ModuleName}", metadata.Name);
            }
            return Task.CompletedTask;
        }

        private void IntegrateRoutes(ModuleMetadataDto metadata, string solutionRoot)
        {
            var routesFile = Path.Combine(solutionRoot, "src/SmartAbp.Vue/src/appshell/router/routes.generated.ts");
            var header = "// AUTO-GENERATED FILE – DO NOT EDIT.\n// Generated at: " + DateTime.UtcNow.ToString("o") + "\n\nimport type { RouteRecordRaw } from 'vue-router'\n\nexport const generatedRoutes: RouteRecordRaw[] = [\n";

            var ensure = new StringBuilder();
            if (File.Exists(routesFile))
            {
                ensure.Append(File.ReadAllText(routesFile, Encoding.UTF8));
            }
            else
            {
                ensure.Append(header);
                ensure.AppendLine("]");
            }

            var content = ensure.ToString();

            foreach (var entity in (metadata.Entities ?? new System.Collections.Generic.List<EnhancedEntityModelDto>()))
            {
                var entityName = entity.Name;
                var entityLower = entityName.ToLowerInvariant();
                var listName = $"{entityName}List";
                var mgmtName = $"{entityName}Management";

                if (!content.Contains($"name: '{listName}'"))
                {
                    var listMetaTitle = string.IsNullOrWhiteSpace(entity.DisplayName) ? $"{entityName}列表" : $"{entity.DisplayName}列表";
                    var listLine =
                        $"  {{ name: '{listName}', path: '/{entityName}', component: () => import('@/views/{entityLower}/{entityName}ListView.vue'), meta: {{ \"title\":\"{listMetaTitle}\",\"icon\":\"📄\",\"requiredRoles\":[],\"menuKey\":\"{entityLower}-list\",\"showInMenu\":true }} }},\n";
                    content = InsertBeforeClosingBracket(content, listLine);
                }

                if (!content.Contains($"name: '{mgmtName}'"))
                {
                    var mgmtMetaTitle = string.IsNullOrWhiteSpace(entity.DisplayName) ? $"{entityName}管理" : $"{entity.DisplayName}管理";
                    var mgmtLine =
                        $"  {{ name: '{mgmtName}', path: '/{entityName}/management', component: () => import('@/views/{entityLower}/{entityName}Management.vue'), meta: {{ \"title\":\"{mgmtMetaTitle}\",\"icon\":\"🛠\",\"requiredRoles\":[],\"menuKey\":\"{entityLower}-management\",\"showInMenu\":true }} }},\n";
                    content = InsertBeforeClosingBracket(content, mgmtLine);
                }
            }

            File.WriteAllText(routesFile, NormalizeGenerated(content), Encoding.UTF8);
        }

        private void IntegrateMenus(ModuleMetadataDto metadata, string solutionRoot)
        {
            var menuFile = Path.Combine(solutionRoot, "src/SmartAbp.Vue/src/appshell/menu/menu.generated.ts");
            var header = "// AUTO-GENERATED FILE – DO NOT EDIT.\n// Generated at: " + DateTime.UtcNow.ToString("o") + "\n\nexport const generatedMenus = [\n";

            var ensure = new StringBuilder();
            if (File.Exists(menuFile))
            {
                ensure.Append(File.ReadAllText(menuFile, Encoding.UTF8));
            }
            else
            {
                ensure.Append(header);
                ensure.AppendLine("]");
            }

            var content = ensure.ToString();

            foreach (var entity in (metadata.Entities ?? new System.Collections.Generic.List<EnhancedEntityModelDto>()))
            {
                var entityName = entity.Name;
                var entityLower = entityName.ToLowerInvariant();
                var folderKey = $"{entityLower}-management";
                if (content.Contains($"\"key\": \"{folderKey}\"")) continue;

                var title = string.IsNullOrWhiteSpace(entity.DisplayName) ? entityName : entity.DisplayName;
                var folder = new System.Text.StringBuilder();
                folder.AppendLine("  {");
                folder.AppendLine($"    \"key\": \"{folderKey}\",");
                folder.AppendLine($"    \"title\": \"{title}\",");
                folder.AppendLine("    \"icon\": \"📁\",");
                folder.AppendLine("    \"type\": \"folder\",");
                folder.AppendLine("    \"order\": 100,");
                folder.AppendLine("    \"visible\": true,");
                folder.AppendLine("    \"requiredRoles\": [],");
                folder.AppendLine("    \"children\": [");
                folder.AppendLine("      {");
                folder.AppendLine($"        \"key\": \"{entityLower}-list\",");
                folder.AppendLine($"        \"title\": \"{title}列表\",");
                folder.AppendLine("        \"icon\": \"📄\",");
                folder.AppendLine("        \"type\": \"page\",");
                folder.AppendLine($"        \"path\": \"/{entityName}\",");
                folder.AppendLine($"        \"component\": \"@/views/{entityLower}/{entityName}ListView.vue\",");
                folder.AppendLine("        \"order\": 0,");
                folder.AppendLine("        \"visible\": true,");
                folder.AppendLine("        \"requiredRoles\": [],");
                folder.AppendLine("        \"meta\": { \"title\": \"" + title + "列表\", \"icon\": \"📄\", \"requiredRoles\": [], \"menuKey\": \"" + entityLower + "-list\", \"showInMenu\": true } ");
                folder.AppendLine("      },");
                folder.AppendLine("      {");
                folder.AppendLine($"        \"key\": \"{entityLower}-management\",");
                folder.AppendLine($"        \"title\": \"{title}管理\",");
                folder.AppendLine("        \"icon\": \"🛠\",");
                folder.AppendLine("        \"type\": \"page\",");
                folder.AppendLine($"        \"path\": \"/{entityName}/management\",");
                folder.AppendLine($"        \"component\": \"@/views/{entityLower}/{entityName}Management.vue\",");
                folder.AppendLine("        \"order\": 1,");
                folder.AppendLine("        \"visible\": true,");
                folder.AppendLine("        \"requiredRoles\": [],");
                folder.AppendLine("        \"meta\": { \"title\": \"" + title + "管理\", \"icon\": \"🛠\", \"requiredRoles\": [], \"menuKey\": \"" + entityLower + "-management\", \"showInMenu\": true } ");
                folder.AppendLine("      }");
                folder.AppendLine("    ]");
                folder.AppendLine("  },");

                content = InsertBeforeClosingBracket(content, folder.ToString());
            }

            File.WriteAllText(menuFile, NormalizeGenerated(content), Encoding.UTF8);
        }

        private static string InsertBeforeClosingBracket(string content, string toInsert)
        {
            var idx = content.LastIndexOf("]", StringComparison.Ordinal);
            if (idx < 0) return content + toInsert + "]\n"; // fallback
            // ensure trailing comma before insert if needed
            var prefix = content.Substring(0, idx);
            var suffix = content.Substring(idx);
            if (!prefix.TrimEnd().EndsWith("[") && !prefix.TrimEnd().EndsWith(","))
            {
                prefix += "\n"; // safe newline
            }
            return prefix + toInsert + suffix;
        }

        private static string NormalizeGenerated(string content)
        {
            // Ensure header present and minimal formatting
            if (!content.StartsWith("// AUTO-GENERATED FILE")) return content;
            return content;
        }
    }
}


