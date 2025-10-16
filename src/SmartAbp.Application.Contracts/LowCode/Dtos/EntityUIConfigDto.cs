using System.Collections.Generic;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    public class EntityUIConfigDto
    {
        public ListPageConfigDto ListPage { get; set; }
        public FormPageConfigDto FormPage { get; set; }
        public DetailPageConfigDto DetailPage { get; set; }
    }

    public class ListPageConfigDto
    {
        public int PageSize { get; set; }
        public string SortField { get; set; }
        public string SortOrder { get; set; }
        public List<string> SearchFields { get; set; }
        public List<string> DisplayFields { get; set; }
    }

    public class FormPageConfigDto
    {
        public string Layout { get; set; }
        public int LabelWidth { get; set; }
        public List<FieldGroupDto> FieldGroups { get; set; }
    }

    public class FieldGroupDto
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public List<string> Fields { get; set; }
    }

    public class DetailPageConfigDto
    {
        public string Layout { get; set; }
        public List<string> DisplayFields { get; set; }
    }
}


