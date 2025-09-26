/// <AI_TEMPLATE_INFO>
/// 模板类型: ABP 一对多CRUD应用服务 (极简版)
/// 适用场景: 主子表关系的CRUD操作，如订单-订单项
/// 基于模板: CrudAppService.template.cs (扩展版)
/// 技术路线: 极简实现，不搞复杂关系处理
/// 依赖项: SmartAbpAppService, IRepository, AutoMapper
/// 生成规则: 
///   - MasterEntityName: 主表实体名称（PascalCase）
///   - DetailEntityName: 子表实体名称（PascalCase）  
///   - ForeignKeyField: 外键字段名（PascalCase）
///   - ModuleName: 模块名称
/// </AI_TEMPLATE_INFO>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using SmartAbp.Localization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Permissions;

namespace SmartAbp.{{ModuleName}};

/// <summary>
/// {{MasterEntityName}} 一对多CRUD应用服务
/// 支持{{MasterEntityName}}与{{DetailEntityName}}的主子表关系管理
/// </summary>
[Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
public class {{MasterEntityName}}AppService : SmartAbpAppService, I{{MasterEntityName}}AppService
{
    private readonly IRepository<{{MasterEntityName}}, Guid> _{{masterEntityName}}Repository;
    private readonly IRepository<{{DetailEntityName}}, Guid> _{{detailEntityName}}Repository;

    public {{MasterEntityName}}AppService(
        IRepository<{{MasterEntityName}}, Guid> {{masterEntityName}}Repository,
        IRepository<{{DetailEntityName}}, Guid> {{detailEntityName}}Repository)
    {
        _{{masterEntityName}}Repository = {{masterEntityName}}Repository;
        _{{detailEntityName}}Repository = {{detailEntityName}}Repository;
    }

    #region 标准CRUD方法 (基于CrudAppService.template.cs)

    /// <summary>
    /// 获取{{MasterEntityName}}列表
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<PagedResultDto<{{MasterEntityName}}Dto>> GetListAsync(Get{{MasterEntityName}}ListDto input)
    {
        var queryable = await _{{masterEntityName}}Repository.GetQueryableAsync();

        // 应用过滤条件
        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            queryable = queryable.Where(x => 
                x.Name.Contains(input.Filter) || 
                (x.DisplayName != null && x.DisplayName.Contains(input.Filter)));
        }

        // 分页查询
        var totalCount = await AsyncExecuter.CountAsync(queryable);
        var items = await AsyncExecuter.ToListAsync(
            queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
        );

        var dtos = ObjectMapper.Map<List<{{MasterEntityName}}>, List<{{MasterEntityName}}Dto>>(items);
        return new PagedResultDto<{{MasterEntityName}}Dto>(totalCount, dtos);
    }

    /// <summary>
    /// 根据ID获取{{MasterEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<{{MasterEntityName}}Dto> GetAsync(Guid id)
    {
        var entity = await _{{masterEntityName}}Repository.GetAsync(id);
        return ObjectMapper.Map<{{MasterEntityName}}, {{MasterEntityName}}Dto>(entity);
    }

    /// <summary>
    /// 创建{{MasterEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Create)]
    public virtual async Task<{{MasterEntityName}}Dto> CreateAsync(Create{{MasterEntityName}}Dto input)
    {
        var entity = ObjectMapper.Map<Create{{MasterEntityName}}Dto, {{MasterEntityName}}>(input);
        entity = await _{{masterEntityName}}Repository.InsertAsync(entity, autoSave: true);
        return ObjectMapper.Map<{{MasterEntityName}}, {{MasterEntityName}}Dto>(entity);
    }

    /// <summary>
    /// 更新{{MasterEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Edit)]
    public virtual async Task<{{MasterEntityName}}Dto> UpdateAsync(Guid id, Update{{MasterEntityName}}Dto input)
    {
        var entity = await _{{masterEntityName}}Repository.GetAsync(id);
        ObjectMapper.Map(input, entity);
        entity = await _{{masterEntityName}}Repository.UpdateAsync(entity, autoSave: true);
        return ObjectMapper.Map<{{MasterEntityName}}, {{MasterEntityName}}Dto>(entity);
    }

    /// <summary>
    /// 删除{{MasterEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Delete)]
    public virtual async Task DeleteAsync(Guid id)
    {
        await _{{masterEntityName}}Repository.DeleteAsync(id);
    }

    #endregion

    #region 一对多关系管理方法 (极简实现)

    /// <summary>
    /// 根据主表ID获取所有子表数据
    /// </summary>
    /// <param name="masterId">主表ID</param>
    /// <returns>子表数据列表</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<List<{{DetailEntityName}}Dto>> GetDetailsByMasterIdAsync(Guid masterId)
    {
        // 简单查询：根据外键获取子表数据
        var queryable = await _{{detailEntityName}}Repository.GetQueryableAsync();
        var details = await AsyncExecuter.ToListAsync(
            queryable.Where(x => x.{{ForeignKeyField}} == masterId)
                     .OrderBy(x => x.CreationTime)
        );

        return ObjectMapper.Map<List<{{DetailEntityName}}>, List<{{DetailEntityName}}Dto>>(details);
    }

    /// <summary>
    /// 给主表添加子表项
    /// </summary>
    /// <param name="masterId">主表ID</param>
    /// <param name="input">子表创建参数</param>
    /// <returns>创建的子表DTO</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Create)]
    public virtual async Task<{{DetailEntityName}}Dto> AddDetailToMasterAsync(Guid masterId, Create{{DetailEntityName}}Dto input)
    {
        // 验证主表存在
        var master = await _{{masterEntityName}}Repository.GetAsync(masterId);
        
        // 创建子表实体
        var detailEntity = ObjectMapper.Map<Create{{DetailEntityName}}Dto, {{DetailEntityName}}>(input);
        detailEntity.{{ForeignKeyField}} = masterId;
        
        // 保存到数据库
        detailEntity = await _{{detailEntityName}}Repository.InsertAsync(detailEntity, autoSave: true);
        
        return ObjectMapper.Map<{{DetailEntityName}}, {{DetailEntityName}}Dto>(detailEntity);
    }

    /// <summary>
    /// 更新子表项
    /// </summary>
    /// <param name="detailId">子表ID</param>
    /// <param name="input">子表更新参数</param>
    /// <returns>更新的子表DTO</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Edit)]
    public virtual async Task<{{DetailEntityName}}Dto> UpdateDetailAsync(Guid detailId, Update{{DetailEntityName}}Dto input)
    {
        var entity = await _{{detailEntityName}}Repository.GetAsync(detailId);
        ObjectMapper.Map(input, entity);
        entity = await _{{detailEntityName}}Repository.UpdateAsync(entity, autoSave: true);
        return ObjectMapper.Map<{{DetailEntityName}}, {{DetailEntityName}}Dto>(entity);
    }

    /// <summary>
    /// 从主表删除子表项
    /// </summary>
    /// <param name="detailId">子表ID</param>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Delete)]
    public virtual async Task RemoveDetailFromMasterAsync(Guid detailId)
    {
        await _{{detailEntityName}}Repository.DeleteAsync(detailId);
    }

    /// <summary>
    /// 批量添加子表项
    /// </summary>
    /// <param name="masterId">主表ID</param>
    /// <param name="inputs">子表创建参数列表</param>
    /// <returns>创建的子表DTO列表</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Create)]
    public virtual async Task<List<{{DetailEntityName}}Dto>> BatchAddDetailsToMasterAsync(Guid masterId, List<Create{{DetailEntityName}}Dto> inputs)
    {
        // 验证主表存在
        var master = await _{{masterEntityName}}Repository.GetAsync(masterId);
        
        var detailEntities = new List<{{DetailEntityName}}>();
        
        foreach (var input in inputs)
        {
            var detailEntity = ObjectMapper.Map<Create{{DetailEntityName}}Dto, {{DetailEntityName}}>(input);
            detailEntity.{{ForeignKeyField}} = masterId;
            detailEntities.Add(detailEntity);
        }
        
        // 批量插入
        await _{{detailEntityName}}Repository.InsertManyAsync(detailEntities, autoSave: true);
        
        return ObjectMapper.Map<List<{{DetailEntityName}}>, List<{{DetailEntityName}}Dto>>(detailEntities);
    }

    /// <summary>
    /// 获取主表及其子表的完整数据
    /// </summary>
    /// <param name="id">主表ID</param>
    /// <returns>包含子表数据的主表DTO</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<{{MasterEntityName}}WithDetailsDto> GetWithDetailsAsync(Guid id)
    {
        // 获取主表数据
        var master = await _{{masterEntityName}}Repository.GetAsync(id);
        var masterDto = ObjectMapper.Map<{{MasterEntityName}}, {{MasterEntityName}}Dto>(master);
        
        // 获取子表数据
        var details = await GetDetailsByMasterIdAsync(id);
        
        // 组合返回
        return new {{MasterEntityName}}WithDetailsDto
        {
            Master = masterDto,
            Details = details
        };
    }

    #endregion
}
