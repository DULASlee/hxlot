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
        public string Industry { get; set; }
        public string CompanyName { get; set; }
        public string CompanySize { get; set; }
        public string LastUsedMode { get; set; }
        public bool IsFirstVisit { get; set; }
    }
    
    /// <summary>
    /// 更新用户配置DTO
    /// </summary>
    public class UpdateUserProfileDto
    {
        public string Industry { get; set; }
        public string CompanyName { get; set; }
        public string CompanySize { get; set; }
        public string LastUsedMode { get; set; }
    }
    
    /// <summary>
    /// 行业推荐DTO
    /// </summary>
    public class IndustryRecommendationDto
    {
        public string Template { get; set; }
        public string Name { get; set; }
        public string Reason { get; set; }
        public string Benefits { get; set; }
    }
}

