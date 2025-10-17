using System;
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
    }
}

