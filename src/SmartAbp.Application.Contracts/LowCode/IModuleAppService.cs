using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.LowCode
{
    /// <summary>
    /// 🔥 低代码模块应用服务接口（Phase 2A - 后端SSOT）
    /// 用途：定义模块管理的标准接口契约，确保Swagger正确生成
    /// </summary>
    public interface IModuleAppService :
        ICrudAppService<
            ModuleDto,
            Guid,
            GetModulesInput,
            CreateOrUpdateModuleDto,
            CreateOrUpdateModuleDto>
    {
        /// <summary>
        /// 根据系统名称获取模块
        /// </summary>
        /// <param name="systemName">系统名称（唯一标识）</param>
        /// <returns>模块DTO</returns>
        Task<ModuleDto> GetBySystemNameAsync(string systemName);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🚀 Portal入口页面扩展API（Task 4: 增量添加）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取最近访问的模块（用于Portal"最近项目"功能）
        /// </summary>
        /// <param name="count">返回数量（默认5个）</param>
        /// <returns>最近访问的模块列表</returns>
        Task<List<ModuleDto>> GetRecentModulesAsync(int count = 5);

        /// <summary>
        /// 记录用户入口选择（Layer1/Layer2/Layer3）
        /// 用于Portal智能引导和统计展示
        /// </summary>
        /// <param name="choice">用户选择（layer1/layer2/layer3）</param>
        Task RecordUserChoiceAsync(string choice);

        /// <summary>
        /// 获取用户选择统计（Portal入口卡片展示）
        /// 返回Layer1/Layer2/Layer3的使用百分比
        /// </summary>
        /// <returns>用户选择统计数据</returns>
        Task<UserChoiceStatsDto> GetUserChoiceStatisticsAsync();
    }
}

