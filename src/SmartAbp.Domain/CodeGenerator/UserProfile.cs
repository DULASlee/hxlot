using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.CodeGenerator
{
    /// <summary>
    /// 用户配置
    /// </summary>
    public class UserProfile : AuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        public virtual Guid UserId { get; set; }
        
        /// <summary>
        /// 所属行业
        /// </summary>
        public virtual string Industry { get; set; }
        
        /// <summary>
        /// 公司名称
        /// </summary>
        public virtual string CompanyName { get; set; }
        
        /// <summary>
        /// 公司规模
        /// </summary>
        public virtual string CompanySize { get; set; }
        
        /// <summary>
        /// 最后使用的模式
        /// </summary>
        public virtual string LastUsedMode { get; set; }
        
        /// <summary>
        /// 是否首次访问
        /// </summary>
        public virtual bool IsFirstVisit { get; set; }
        
        /// <summary>
        /// 其他偏好设置（JSON格式）
        /// </summary>
        public virtual string Preferences { get; set; }
        
        protected UserProfile() { }
        
        public UserProfile(
            Guid id,
            Guid userId,
            string industry = null,
            string companyName = null
        ) : base(id)
        {
            UserId = userId;
            Industry = industry;
            CompanyName = companyName;
            IsFirstVisit = true;
        }
        
        /// <summary>
        /// 标记为已访问
        /// </summary>
        public virtual void MarkAsVisited()
        {
            IsFirstVisit = false;
        }
        
        /// <summary>
        /// 更新最后使用的模式
        /// </summary>
        public virtual void UpdateLastUsedMode(string mode)
        {
            LastUsedMode = mode;
        }
    }
}

