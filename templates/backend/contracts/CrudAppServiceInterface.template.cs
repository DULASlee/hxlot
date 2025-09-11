/// <AI_TEMPLATE_INFO>
/// 模板类型: ABP CRUD应用服务接口
/// 适用场景: 定义CRUD操作的服务接口
/// 依赖项: Volo.Abp.Application.Services
/// 生成规则: 
///   - EntityName: 实体名称（PascalCase）
///   - ModuleName: 模块名称
///   - 定义标准CRUD方法签名
/// </AI_TEMPLATE_INFO>

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.{{ModuleName}};

/// <summary>
/// {{EntityName}} CRUD应用服务接口
/// </summary>
public interface I{{EntityName}}AppService : IApplicationService
{
    /// <summary>
    /// 获取{{EntityName}}列表
    /// </summary>
    /// <param name="input">查询参数</param>
    /// <returns>分页结果</returns>
    Task<PagedResultDto<{{EntityName}}Dto>> GetListAsync(Get{{EntityName}}ListDto input);

    /// <summary>
    /// 根据ID获取{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    /// <returns>{{EntityName}}DTO</returns>
    Task<{{EntityName}}Dto> GetAsync(Guid id);

    /// <summary>
    /// 创建{{EntityName}}
    /// </summary>
    /// <param name="input">创建参数</param>
    /// <returns>创建的{{EntityName}}DTO</returns>
    Task<{{EntityName}}Dto> CreateAsync(Create{{EntityName}}Dto input);

    /// <summary>
    /// 更新{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    /// <param name="input">更新参数</param>
    /// <returns>更新的{{EntityName}}DTO</returns>
    Task<{{EntityName}}Dto> UpdateAsync(Guid id, Update{{EntityName}}Dto input);

    /// <summary>
    /// 删除{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// 批量删除{{EntityName}}
    /// </summary>
    /// <param name="ids">实体ID列表</param>
    Task DeleteManyAsync(List<Guid> ids);

    /// <summary>
    /// 启用/禁用{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    /// <param name="isEnabled">是否启用</param>
    Task SetEnabledAsync(Guid id, bool isEnabled);
}