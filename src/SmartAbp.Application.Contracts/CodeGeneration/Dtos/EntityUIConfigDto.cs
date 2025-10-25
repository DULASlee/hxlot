using System.Collections.Generic;

namespace SmartAbp.Application.Contracts.CodeGeneration.Dtos
{
    /// <summary>
    /// 实体UI配置DTO
    /// </summary>
    public class EntityUIConfigDto
    {
        /// <summary>
        /// 表单布局
        /// </summary>
        public string FormLayout { get; set; } = "horizontal";

        /// <summary>
        /// 标签宽度
        /// </summary>
        public string LabelWidth { get; set; } = "120px";

        /// <summary>
        /// 字段配置
        /// </summary>
        public List<FieldConfigDto> Fields { get; set; } = new List<FieldConfigDto>();

        /// <summary>
        /// 表格列配置
        /// </summary>
        public List<TableColumnConfigDto> TableColumns { get; set; } = new List<TableColumnConfigDto>();

        /// <summary>
        /// 操作配置
        /// </summary>
        public ActionsConfigDto Actions { get; set; } = new ActionsConfigDto();

        /// <summary>
        /// 分页配置
        /// </summary>
        public PaginationConfigDto Pagination { get; set; } = new PaginationConfigDto();
    }

    /// <summary>
    /// 字段配置DTO
    /// </summary>
    public class FieldConfigDto
    {
        public string Name { get; set; }
        public string Label { get; set; }
        public string ComponentType { get; set; }
        public string Placeholder { get; set; }
        public List<string> Validation { get; set; } = new List<string>();
        public Dictionary<string, object> Props { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// 表格列配置DTO
    /// </summary>
    public class TableColumnConfigDto
    {
        public string Prop { get; set; }
        public string Label { get; set; }
        public int? Width { get; set; }
        public bool Sortable { get; set; }
        public string Type { get; set; }
    }

    /// <summary>
    /// 操作配置DTO
    /// </summary>
    public class ActionsConfigDto
    {
        public bool Create { get; set; } = true;
        public bool Update { get; set; } = true;
        public bool Delete { get; set; } = true;
        public bool Export { get; set; } = true;
        public bool Import { get; set; } = false;
        public bool BatchDelete { get; set; } = true;
    }

    /// <summary>
    /// 分页配置DTO
    /// </summary>
    public class PaginationConfigDto
    {
        public int PageSize { get; set; } = 10;
        public List<int> PageSizes { get; set; } = new List<int> { 10, 20, 50, 100 };
    }
}

