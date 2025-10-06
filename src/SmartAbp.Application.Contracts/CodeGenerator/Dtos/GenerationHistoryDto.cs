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
        public string Mode { get; set; }
        public string TemplateName { get; set; }
        public string ProjectName { get; set; }
        public int EntityCount { get; set; }
        public int GeneratedFileCount { get; set; }
        public int GenerationDuration { get; set; }
        public string Status { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime CreationTime { get; set; }
    }
    
    /// <summary>
    /// 创建生成历史DTO
    /// </summary>
    public class CreateGenerationHistoryDto
    {
        public string Mode { get; set; }
        public string TemplateName { get; set; }
        public string ProjectName { get; set; }
        public int EntityCount { get; set; }
        public int GeneratedFileCount { get; set; }
        public int GenerationDuration { get; set; }
        public string Status { get; set; }
        public string ErrorMessage { get; set; }
        public string Metadata { get; set; }
    }
}

