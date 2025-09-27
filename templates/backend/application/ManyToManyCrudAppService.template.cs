/// <AI_TEMPLATE_INFO>
/// 模板类型: ABP 多对多CRUD应用服务 (极简版)
/// 适用场景: 多对多关系管理，如用户-角色、商品-分类
/// 基于模板: CrudAppService.template.cs (扩展版)
/// 技术路线: 极简实现，使用中间表管理关系
/// 依赖项: SmartAbpAppService, IRepository, AutoMapper
/// 生成规则: 
///   - SourceEntityName: 源实体名称（PascalCase）
///   - TargetEntityName: 目标实体名称（PascalCase）
///   - JunctionTableName: 中间表名称（PascalCase）
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
/// {{SourceEntityName}} 多对多CRUD应用服务
/// 支持{{SourceEntityName}}与{{TargetEntityName}}的多对多关系管理
/// </summary>
[Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
public class {{SourceEntityName}}AppService : SmartAbpAppService, I{{SourceEntityName}}AppService
{
    private readonly IRepository<{{SourceEntityName}}, Guid> _{{sourceEntityName}}Repository;
    private readonly IRepository<{{TargetEntityName}}, Guid> _{{targetEntityName}}Repository;
    private readonly IRepository<{{JunctionTableName}}, Guid> _{{junctionTableName}}Repository;

    public {{SourceEntityName}}AppService(
        IRepository<{{SourceEntityName}}, Guid> {{sourceEntityName}}Repository,
        IRepository<{{TargetEntityName}}, Guid> {{targetEntityName}}Repository,
        IRepository<{{JunctionTableName}}, Guid> {{junctionTableName}}Repository)
    {
        _{{sourceEntityName}}Repository = {{sourceEntityName}}Repository;
        _{{targetEntityName}}Repository = {{targetEntityName}}Repository;
        _{{junctionTableName}}Repository = {{junctionTableName}}Repository;
    }

    #region 标准CRUD方法 (基于CrudAppService.template.cs)

    /// <summary>
    /// 获取{{SourceEntityName}}列表
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<PagedResultDto<{{SourceEntityName}}Dto>> GetListAsync(Get{{SourceEntityName}}ListDto input)
    {
        var queryable = await _{{sourceEntityName}}Repository.GetQueryableAsync();

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

        var dtos = ObjectMapper.Map<List<{{SourceEntityName}}>, List<{{SourceEntityName}}Dto>>(items);
        return new PagedResultDto<{{SourceEntityName}}Dto>(totalCount, dtos);
    }

    /// <summary>
    /// 根据ID获取{{SourceEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<{{SourceEntityName}}Dto> GetAsync(Guid id)
    {
        var entity = await _{{sourceEntityName}}Repository.GetAsync(id);
        return ObjectMapper.Map<{{SourceEntityName}}, {{SourceEntityName}}Dto>(entity);
    }

    /// <summary>
    /// 创建{{SourceEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Create)]
    public virtual async Task<{{SourceEntityName}}Dto> CreateAsync(Create{{SourceEntityName}}Dto input)
    {
        var entity = ObjectMapper.Map<Create{{SourceEntityName}}Dto, {{SourceEntityName}}>(input);
        entity = await _{{sourceEntityName}}Repository.InsertAsync(entity, autoSave: true);
        return ObjectMapper.Map<{{SourceEntityName}}, {{SourceEntityName}}Dto>(entity);
    }

    /// <summary>
    /// 更新{{SourceEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Edit)]
    public virtual async Task<{{SourceEntityName}}Dto> UpdateAsync(Guid id, Update{{SourceEntityName}}Dto input)
    {
        var entity = await _{{sourceEntityName}}Repository.GetAsync(id);
        ObjectMapper.Map(input, entity);
        entity = await _{{sourceEntityName}}Repository.UpdateAsync(entity, autoSave: true);
        return ObjectMapper.Map<{{SourceEntityName}}, {{SourceEntityName}}Dto>(entity);
    }

    /// <summary>
    /// 删除{{SourceEntityName}}
    /// </summary>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Delete)]
    public virtual async Task DeleteAsync(Guid id)
    {
        // 先删除所有相关的关系记录
        var junctionQueryable = await _{{junctionTableName}}Repository.GetQueryableAsync();
        var junctionEntities = await AsyncExecuter.ToListAsync(
            junctionQueryable.Where(x => x.{{SourceEntityName}}Id == id)
        );
        
        if (junctionEntities.Any())
        {
            await _{{junctionTableName}}Repository.DeleteManyAsync(junctionEntities);
        }

        // 再删除主实体
        await _{{sourceEntityName}}Repository.DeleteAsync(id);
    }

    #endregion

    #region 多对多关系管理方法 (极简实现)

    /// <summary>
    /// 获取源实体的所有关联目标实体
    /// </summary>
    /// <param name="sourceId">源实体ID</param>
    /// <returns>关联的目标实体列表</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<List<{{TargetEntityName}}Dto>> GetRelatedTargetsAsync(Guid sourceId)
    {
        // 简单查询：通过中间表查询关联的目标实体
        var junctionQueryable = await _{{junctionTableName}}Repository.GetQueryableAsync();
        var targetQueryable = await _{{targetEntityName}}Repository.GetQueryableAsync();

        var relatedTargets = await AsyncExecuter.ToListAsync(
            from junction in junctionQueryable
            join target in targetQueryable on junction.{{TargetEntityName}}Id equals target.Id
            where junction.{{SourceEntityName}}Id == sourceId
            select target
        );

        return ObjectMapper.Map<List<{{TargetEntityName}}>, List<{{TargetEntityName}}Dto>>(relatedTargets);
    }

    /// <summary>
    /// 获取可用于关联的目标实体（排除已关联的）
    /// </summary>
    /// <param name="sourceId">源实体ID</param>
    /// <returns>可关联的目标实体列表</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<List<{{TargetEntityName}}Dto>> GetAvailableTargetsAsync(Guid sourceId)
    {
        var junctionQueryable = await _{{junctionTableName}}Repository.GetQueryableAsync();
        var targetQueryable = await _{{targetEntityName}}Repository.GetQueryableAsync();

        // 获取已关联的目标实体ID
        var relatedTargetIds = await AsyncExecuter.ToListAsync(
            junctionQueryable.Where(x => x.{{SourceEntityName}}Id == sourceId)
                            .Select(x => x.{{TargetEntityName}}Id)
        );

        // 查询未关联的目标实体
        var availableTargets = await AsyncExecuter.ToListAsync(
            targetQueryable.Where(x => !relatedTargetIds.Contains(x.Id))
        );

        return ObjectMapper.Map<List<{{TargetEntityName}}>, List<{{TargetEntityName}}Dto>>(availableTargets);
    }

    /// <summary>
    /// 添加关联关系
    /// </summary>
    /// <param name="sourceId">源实体ID</param>
    /// <param name="targetId">目标实体ID</param>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Create)]
    public virtual async Task AddRelationshipAsync(Guid sourceId, Guid targetId)
    {
        // 验证实体存在
        var source = await _{{sourceEntityName}}Repository.GetAsync(sourceId);
        var target = await _{{targetEntityName}}Repository.GetAsync(targetId);

        // 检查关系是否已存在
        var junctionQueryable = await _{{junctionTableName}}Repository.GetQueryableAsync();
        var existingRelation = await AsyncExecuter.FirstOrDefaultAsync(
            junctionQueryable.Where(x => x.{{SourceEntityName}}Id == sourceId && x.{{TargetEntityName}}Id == targetId)
        );

        if (existingRelation != null)
        {
            throw new UserFriendlyException("关系已存在");
        }

        // 创建关系记录
        var junctionEntity = new {{JunctionTableName}}
        {
            Id = GuidGenerator.Create(),
            {{SourceEntityName}}Id = sourceId,
            {{TargetEntityName}}Id = targetId,
            CreationTime = Clock.Now
        };

        await _{{junctionTableName}}Repository.InsertAsync(junctionEntity, autoSave: true);
    }

    /// <summary>
    /// 删除关联关系
    /// </summary>
    /// <param name="sourceId">源实体ID</param>
    /// <param name="targetId">目标实体ID</param>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Delete)]
    public virtual async Task RemoveRelationshipAsync(Guid sourceId, Guid targetId)
    {
        var junctionQueryable = await _{{junctionTableName}}Repository.GetQueryableAsync();
        var relationEntity = await AsyncExecuter.FirstOrDefaultAsync(
            junctionQueryable.Where(x => x.{{SourceEntityName}}Id == sourceId && x.{{TargetEntityName}}Id == targetId)
        );

        if (relationEntity != null)
        {
            await _{{junctionTableName}}Repository.DeleteAsync(relationEntity, autoSave: true);
        }
    }

    /// <summary>
    /// 批量设置关联关系（替换现有关系）
    /// </summary>
    /// <param name="sourceId">源实体ID</param>
    /// <param name="targetIds">目标实体ID列表</param>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Edit)]
    public virtual async Task SetRelationshipsAsync(Guid sourceId, List<Guid> targetIds)
    {
        // 验证源实体存在
        var source = await _{{sourceEntityName}}Repository.GetAsync(sourceId);

        // 删除现有关系
        var junctionQueryable = await _{{junctionTableName}}Repository.GetQueryableAsync();
        var existingRelations = await AsyncExecuter.ToListAsync(
            junctionQueryable.Where(x => x.{{SourceEntityName}}Id == sourceId)
        );

        if (existingRelations.Any())
        {
            await _{{junctionTableName}}Repository.DeleteManyAsync(existingRelations);
        }

        // 添加新关系
        if (targetIds != null && targetIds.Any())
        {
            var newRelations = targetIds.Select(targetId => new {{JunctionTableName}}
            {
                Id = GuidGenerator.Create(),
                {{SourceEntityName}}Id = sourceId,
                {{TargetEntityName}}Id = targetId,
                CreationTime = Clock.Now
            }).ToList();

            await _{{junctionTableName}}Repository.InsertManyAsync(newRelations, autoSave: true);
        }
    }

    /// <summary>
    /// 获取源实体及其关联关系的完整数据
    /// </summary>
    /// <param name="id">源实体ID</param>
    /// <returns>包含关联数据的源实体DTO</returns>
    [Authorize(SmartAbpPermissions.{{ModuleName}}.Default)]
    public virtual async Task<{{SourceEntityName}}WithRelationsDto> GetWithRelationsAsync(Guid id)
    {
        // 获取源实体数据
        var source = await _{{sourceEntityName}}Repository.GetAsync(id);
        var sourceDto = ObjectMapper.Map<{{SourceEntityName}}, {{SourceEntityName}}Dto>(source);
        
        // 获取关联的目标实体
        var relatedTargets = await GetRelatedTargetsAsync(id);
        
        // 获取可关联的目标实体
        var availableTargets = await GetAvailableTargetsAsync(id);
        
        // 组合返回
        return new {{SourceEntityName}}WithRelationsDto
        {
            Source = sourceDto,
            RelatedTargets = relatedTargets,
            AvailableTargets = availableTargets
        };
    }

    #endregion
}
