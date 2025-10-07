using System.Collections.Generic;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    public class IndustryTemplateConfigDto
    {
        public string TemplateId { get; set; } = string.Empty;
        public string SystemName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public List<string> SelectedModules { get; set; } = new();
        public List<string> SelectedHardware { get; set; } = new();
    }
}
