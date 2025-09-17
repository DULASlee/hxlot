using System.Linq;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Services
{
    public class FrontendMetadataGenerator : ITransientDependency
    {
        public ListPageSchemaDto GenerateListPageSchema(EnhancedEntityModelDto entity)
        {
            var schema = new ListPageSchemaDto
            {
                PageType = "list",
                Title = $"{entity.DisplayName}管理"
            };

            var listProperties = entity.Properties.Where(p => p.ListVisible);
            
            foreach (var prop in listProperties)
            {
                schema.Columns.Add(new ColumnDefinition
                {
                    Prop = prop.Name,
                    Label = prop.DisplayName ?? prop.Name
                });
            }

            return schema;
        }
        
        public FormPageSchemaDto GenerateFormPageSchema(EnhancedEntityModelDto entity)
        {
            var schema = new FormPageSchemaDto
            {
                PageType = "form",
                Title = $"新建/编辑{entity.DisplayName}"
            };

            var formProperties = entity.Properties.Where(p => p.FormVisible);

            foreach (var prop in formProperties)
            {
                schema.Fields.Add(new FieldDefinition
                {
                    Name = prop.Name,
                    Label = prop.DisplayName ?? prop.Name
                });
            }

            return schema;
        }
    }
}
