using System;

namespace SmartAbp.CodeGenerator.Dtos
{
    /// <summary>
    /// 代码生成统计DTO
    /// </summary>
    public class CodeGenStatsDto
    {
        /// <summary>
        /// 累计生成项目数
        /// </summary>
        public int TotalProjects { get; set; }
        
        /// <summary>
        /// 本月生成次数
        /// </summary>
        public int MonthlyGenerations { get; set; }
        
        /// <summary>
        /// 累计节省工时（小时）
        /// </summary>
        public int SavedHours { get; set; }
        
        /// <summary>
        /// 质量评分
        /// </summary>
        public decimal QualityScore { get; set; }
        
        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }
}

