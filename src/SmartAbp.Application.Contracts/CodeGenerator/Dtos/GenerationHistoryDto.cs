using System;

namespace SmartAbp.CodeGenerator.Dtos
{
    /// <summary>
    /// 生成历史DTO
    /// </summary>
    public class GenerationHistoryDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public required string Mode { get; set; }
        public string? TemplateName { get; set; }
        public required string ProjectName { get; set; }
        public int EntityCount { get; set; }
        public int GeneratedFileCount { get; set; }
        public int GenerationDuration { get; set; }
        public required string Status { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreationTime { get; set; }
    }
    
    /// <summary>
    /// 创建生成历史DTO
    /// </summary>
    public class CreateGenerationHistoryDto
    {
        public required string Mode { get; set; }
        public string? TemplateName { get; set; }
        public required string ProjectName { get; set; }
        public int EntityCount { get; set; }
        public int GeneratedFileCount { get; set; }
        public int GenerationDuration { get; set; }
        public required string Status { get; set; }
        public string? ErrorMessage { get; set; }
        public string? Metadata { get; set; }
    }
}

