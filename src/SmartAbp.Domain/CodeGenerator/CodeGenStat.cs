using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.CodeGenerator
{
    /// <summary>
    /// 代码生成统计
    /// </summary>
    public class CodeGenStat : CreationAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        public virtual Guid UserId { get; set; }
        
        /// <summary>
        /// 累计生成项目数
        /// </summary>
        public virtual int TotalProjects { get; set; }
        
        /// <summary>
        /// 本月生成次数
        /// </summary>
        public virtual int MonthlyGenerations { get; set; }
        
        /// <summary>
        /// 累计节省工时（小时）
        /// </summary>
        public virtual int SavedHours { get; set; }
        
        /// <summary>
        /// 质量评分
        /// </summary>
        public virtual decimal QualityScore { get; set; }
        
        /// <summary>
        /// 最后更新时间
        /// </summary>
        public virtual DateTime LastUpdated { get; set; }
        
        protected CodeGenStat() { }
        
        public CodeGenStat(
            Guid id,
            Guid userId,
            int totalProjects = 0,
            int monthlyGenerations = 0,
            int savedHours = 0,
            decimal qualityScore = 0
        ) : base(id)
        {
            UserId = userId;
            TotalProjects = totalProjects;
            MonthlyGenerations = monthlyGenerations;
            SavedHours = savedHours;
            QualityScore = qualityScore;
            LastUpdated = DateTime.UtcNow;
        }
        
        /// <summary>
        /// 更新统计数据
        /// </summary>
        public virtual void UpdateStats(int newProjects, int estimatedHours, decimal newQualityScore)
        {
            TotalProjects += newProjects;
            MonthlyGenerations += newProjects;
            SavedHours += estimatedHours;
            QualityScore = newQualityScore;
            LastUpdated = DateTime.UtcNow;
        }
    }
}

