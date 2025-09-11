/// <AI_TEMPLATE_INFO>
/// 模板类型: ABP CRUD应用服务
/// 适用场景: 标准的CRUD操作应用服务
/// 依赖项: SmartAbpAppService, IRepository, AutoMapper
/// 权限要求: 需要定义相应的权限常量
/// 生成规则: 
///   - EntityName: 实体名称（PascalCase）
///   - entityName: 实体名称（camelCase）
///   - ModuleName: 模块名称
///   - 自动生成CRUD方法
///   - 包含权限检查
///   - 使用AutoMapper映射
/// </AI_TEMPLATE_INFO>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Permissions;

namespace SmartAbp.{{ModuleName}};

/// <summary>
/// {{EntityName}} CRUD应用服务
/// </summary>
[Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
public class {{EntityName}}AppService : SmartAbpAppService, I{{EntityName}}AppService
{
    private readonly IRepository<{{EntityName}}, Guid> _{{entityName}}Repository;

    public {{EntityName}}AppService(IRepository<{{EntityName}}, Guid> {{entityName}}Repository)
    {
        _{{entityName}}Repository = {{entityName}}Repository;
    }

    /// <summary>
    /// 获取{{EntityName}}列表
    /// </summary>
    /// <param name="input">查询参数</param>
    /// <returns>分页结果</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<PagedResultDto<{{EntityName}}Dto>> GetListAsync(Get{{EntityName}}ListDto input)
    {
        var queryable = await _{{entityName}}Repository.GetQueryableAsync();

        // 应用过滤条件
        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            queryable = queryable.Where(x => 
                x.Name.Contains(input.Filter) || 
                (x.DisplayName != null && x.DisplayName.Contains(input.Filter)));
        }

        if (input.IsEnabled.HasValue)
        {
            queryable = queryable.Where(x => x.IsEnabled == input.IsEnabled.Value);
        }

        // 应用排序
        if (!string.IsNullOrWhiteSpace(input.Sorting))
        {
            queryable = queryable.OrderBy(input.Sorting);
        }
        else
        {
            queryable = queryable.OrderBy(x => x.Sort).ThenBy(x => x.Name);
        }

        // 分页查询
        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        // 映射到DTO
        var dtos = ObjectMapper.Map<List<{{EntityName}}>, List<{{EntityName}}Dto>>(items);

        return new PagedResultDto<{{EntityName}}Dto>(totalCount, dtos);
    }

    /// <summary>
    /// 根据ID获取{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    /// <returns>{{EntityName}}DTO</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<{{EntityName}}Dto> GetAsync(Guid id)
    {
        var entity = await _{{entityName}}Repository.GetAsync(id);
        return ObjectMapper.Map<{{EntityName}}, {{EntityName}}Dto>(entity);
    }

    /// <summary>
    /// 创建{{EntityName}}
    /// </summary>
    /// <param name="input">创建参数</param>
    /// <returns>创建的{{EntityName}}DTO</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Create)]
    public virtual async Task<{{EntityName}}Dto> CreateAsync(Create{{EntityName}}Dto input)
    {
        // 验证名称唯一性
        await CheckNameAsync(input.Name);

        // 创建实体
        var entity = new {{EntityName}}(
            GuidGenerator.Create(),
            input.Name,
            input.DisplayName,
            input.Description
        )
        {
            Sort = input.Sort,
            IsEnabled = input.IsEnabled
        };

        // 保存到数据库
        entity = await _{{entityName}}Repository.InsertAsync(entity, autoSave: true);

        // 返回DTO
        return ObjectMapper.Map<{{EntityName}}, {{EntityName}}Dto>(entity);
    }

    /// <summary>
    /// 更新{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    /// <param name="input">更新参数</param>
    /// <returns>更新的{{EntityName}}DTO</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Edit)]
    public virtual async Task<{{EntityName}}Dto> UpdateAsync(Guid id, Update{{EntityName}}Dto input)
    {
        // 获取实体
        var entity = await _{{entityName}}Repository.GetAsync(id);

        // 验证名称唯一性（排除当前实体）
        await CheckNameAsync(input.Name, id);

        // 更新属性
        entity.SetName(input.Name);
        entity.SetDisplayName(input.DisplayName);
        entity.SetDescription(input.Description);
        entity.Sort = input.Sort;
        entity.IsEnabled = input.IsEnabled;

        // 保存更改
        entity = await _{{entityName}}Repository.UpdateAsync(entity, autoSave: true);

        // 返回DTO
        return ObjectMapper.Map<{{EntityName}}, {{EntityName}}Dto>(entity);
    }

    /// <summary>
    /// 删除{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Delete)]
    public virtual async Task DeleteAsync(Guid id)
    {
        await _{{entityName}}Repository.DeleteAsync(id);
    }

    /// <summary>
    /// 批量删除{{EntityName}}
    /// </summary>
    /// <param name="ids">实体ID列表</param>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Delete)]
    public virtual async Task DeleteManyAsync(List<Guid> ids)
    {
        await _{{entityName}}Repository.DeleteManyAsync(ids);
    }

    /// <summary>
    /// 启用/禁用{{EntityName}}
    /// </summary>
    /// <param name="id">实体ID</param>
    /// <param name="isEnabled">是否启用</param>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Edit)]
    public virtual async Task SetEnabledAsync(Guid id, bool isEnabled)
    {
        var entity = await _{{entityName}}Repository.GetAsync(id);
        entity.IsEnabled = isEnabled;
        await _{{entityName}}Repository.UpdateAsync(entity, autoSave: true);
    }

    /// <summary>
    /// 检查名称唯一性
    /// </summary>
    /// <param name="name">名称</param>
    /// <param name="excludeId">排除的ID</param>
    protected virtual async Task CheckNameAsync(string name, Guid? excludeId = null)
    {
        var queryable = await _{{entityName}}Repository.GetQueryableAsync();
        
        if (excludeId.HasValue)
        {
            queryable = queryable.Where(x => x.Id != excludeId.Value);
        }

        var exists = await AsyncExecuter.AnyAsync(
            queryable.Where(x => x.Name == name)
        );

        if (exists)
        {
            throw new UserFriendlyException($"名称 '{name}' 已存在");
        }
    }
}