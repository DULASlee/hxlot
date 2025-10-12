using System.Collections.Generic;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    public class IndustryTemplateGenerationResultDto
    {
        public bool Success { get; set; }
        public List<GeneratedFileDto> GeneratedFiles { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    public class GeneratedFileDto
    {
        public required string Path { get; set; }
        public required string Content { get; set; }
    }
}
