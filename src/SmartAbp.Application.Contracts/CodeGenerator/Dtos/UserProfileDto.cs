using System;

namespace SmartAbp.CodeGenerator.Dtos
{
    /// <summary>
    /// 用户配置DTO
    /// </summary>
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public required string Industry { get; set; }
        public required string CompanyName { get; set; }
        public required string CompanySize { get; set; }
        public required string LastUsedMode { get; set; }
        public bool IsFirstVisit { get; set; }
    }
    
    /// <summary>
    /// 更新用户配置DTO
    /// </summary>
    public class UpdateUserProfileDto
    {
        public required string Industry { get; set; }
        public required string CompanyName { get; set; }
        public required string CompanySize { get; set; }
        public required string LastUsedMode { get; set; }
    }
    
    /// <summary>
    /// 行业推荐DTO
    /// </summary>
    public class IndustryRecommendationDto
    {
        public required string Template { get; set; }
        public required string Name { get; set; }
        public required string Reason { get; set; }
        public required string Benefits { get; set; }
    }
}

