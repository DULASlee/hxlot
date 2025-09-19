using System.Linq;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services
{
    public class DefaultUIConfigGenerator
    {
        public void ApplyDefaults(ModuleMetadataDto metadata)
        {
            if (metadata?.Entities == null)
            {
                return;
            }

            foreach (var entity in metadata.Entities)
            {
                if (entity.UiConfig == null)
                {
                    entity.UiConfig = new EntityUIConfigDto
                    {
                        ListConfig = new ListConfigDto(),
                        FormConfig = new FormConfigDto(),
                        DetailConfig = new DetailConfigDto(),
                    };
                }

                // List defaults
                var list = entity.UiConfig.ListConfig;
                if (list.DefaultPageSize == 0)
                {
                    list.DefaultPageSize = 10;
                }
                if (!list.DisplayColumns.Any() && entity.Properties != null)
                {
                    list.DisplayColumns = entity.Properties
                        .Where(p => p.ListVisible || p.FormVisible || p.DetailVisible || p.IsKey || p.IsRequired)
                        .Select(p => p.Name)
                        .Distinct()
                        .Take(8)
                        .ToList();
                }

                // Basic query/filter defaults
                if (!list.FilterableColumns.Any() && entity.Properties != null)
                {
                    list.FilterableColumns = entity.Properties
                        .Where(p => p.Searchable || p.IsIndexed || p.IsUnique)
                        .Select(p => p.Name)
                        .Distinct()
                        .Take(6)
                        .ToList();
                }

                // Form defaults
                var form = entity.UiConfig.FormConfig;
                if (string.IsNullOrWhiteSpace(form.Layout))
                {
                    form.Layout = "grid";
                }
                if (form.ColumnCount <= 0)
                {
                    form.ColumnCount = 2;
                }
                if (!form.FieldGroups.Any() && entity.Properties != null)
                {
                    var group = new FieldGroupDto
                    {
                        Id = entity.Name + "Main",
                        Name = "Main",
                        Title = entity.DisplayName + "信息",
                        Columns = 2,
                        Fields = entity.Properties
                            .Where(p => p.FormVisible || p.IsRequired || p.IsKey)
                            .Select(p => p.Name)
                            .Distinct()
                            .Take(12)
                            .ToList(),
                    };
                    form.FieldGroups.Add(group);
                }

                // Detail defaults
                var detail = entity.UiConfig.DetailConfig;
                if (!detail.Sections.Any())
                {
                    detail.Sections.Add(new DetailSectionDto
                    {
                        Id = entity.Name + "Base",
                        Title = entity.DisplayName + "详情",
                        Type = "basic",
                        Properties = entity.Properties?.Select(p => p.Name).Take(12).ToList() ?? new System.Collections.Generic.List<string>(),
                    });
                }
            }
        }
    }
}


