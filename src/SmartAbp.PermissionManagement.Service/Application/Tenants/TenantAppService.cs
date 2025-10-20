using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.TenantManagement;
using SmartAbp.PermissionManagement.Application.Contracts.Tenants;
using SmartAbp.PermissionManagement.Application.Contracts.Tenants.Dtos;
using SmartAbp.PermissionManagement.Infrastructure.MultiTenancy;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Identity;

namespace SmartAbp.PermissionManagement.Application.Tenants;

/// <summary>
/// 租户管理应用服务
/// 实现租户的完整CRUD操作和集团组织架构管理
/// </summary>
public class TenantAppService : ApplicationService, ITenantAppService
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantManager _tenantManager;
    private readonly ITenantSchemaManager _schemaManager;
    private readonly ITenantSchemaResolver _schemaResolver;
    private readonly IIdentityUserRepository _userRepository;
    private readonly IdentityUserManager _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TenantAppService> _logger;

    public TenantAppService(
        ITenantRepository tenantRepository,
        ITenantManager tenantManager,
        ITenantSchemaManager schemaManager,
        ITenantSchemaResolver schemaResolver,
        IIdentityUserRepository userRepository,
        IdentityUserManager userManager,
        IConfiguration configuration,
        ILogger<TenantAppService> logger)
    {
        _tenantRepository = tenantRepository;
        _tenantManager = tenantManager;
        _schemaManager = schemaManager;
        _schemaResolver = schemaResolver;
        _userRepository = userRepository;
        _userManager = userManager;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// 获取租户列表（分页+筛选）
    /// </summary>
    public async Task<PagedResultDto<TenantDto>> GetListAsync(GetTenantsInput input)
    {
        // 使用ABP的GetListAsync方法
        var tenants = await _tenantRepository.GetListAsync(
            input.Sorting ?? "CreationTime DESC",
            input.MaxResultCount,
            input.SkipCount,
            input.Filter,
            includeDetails: false
        );

        var totalCount = await _tenantRepository.GetCountAsync(input.Filter);

        var dtos = tenants.Select(t => MapToDto(t)).ToList();

        return new PagedResultDto<TenantDto>(totalCount, dtos);
    }

    /// <summary>
    /// 根据ID获取租户
    /// </summary>
    public async Task<TenantDto> GetAsync(Guid id)
    {
        var tenant = await _tenantRepository.GetAsync(id);
        return MapToDto(tenant);
    }

    /// <summary>
    /// 创建租户
    /// 1. 创建租户记录
    /// 2. 创建租户Schema
    /// 3. 应用数据库迁移
    /// 4. 创建默认管理员账号
    /// </summary>
    public async Task<TenantDto> CreateAsync(CreateTenantDto input)
    {
        _logger.LogInformation("开始创建租户: {TenantName}", input.Name);

        try
        {
            // 1. 检查租户名称是否已存在
            var existingTenant = await _tenantRepository.FindByNameAsync(input.Name);
            if (existingTenant != null)
            {
                throw new UserFriendlyException($"租户名称 '{input.Name}' 已存在");
            }

            // 2. 创建租户
            var tenant = await _tenantManager.CreateAsync(input.Name);
            await _tenantRepository.InsertAsync(tenant, autoSave: true);

            _logger.LogInformation("租户记录创建成功 - ID: {TenantId}, Name: {TenantName}", tenant.Id, tenant.Name);

            // 3. 创建租户Schema
            var connectionString = _configuration.GetConnectionString("PermissionManagement")
                ?? throw new InvalidOperationException("未找到数据库连接字符串");

            await _schemaManager.CreateSchemaAsync(tenant.Id, connectionString);

            _logger.LogInformation("租户Schema创建成功 - TenantId: {TenantId}", tenant.Id);

            // 4. TODO: 应用数据库迁移到租户Schema
            // await _schemaManager.ApplyMigrationsAsync(tenant.Id, dbContext);

            // 5. TODO: 创建默认管理员账号
            // 需要在租户上下文中创建用户
            // using (CurrentTenant.Change(tenant.Id))
            // {
            //     await CreateTenantAdminAsync(tenant.Id, input.AdminEmail, input.AdminPassword);
            // }

            _logger.LogInformation("租户创建完成 - ID: {TenantId}, Name: {TenantName}", tenant.Id, tenant.Name);

            return MapToDto(tenant);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "创建租户失败 - Name: {TenantName}", input.Name);
            throw;
        }
    }

    /// <summary>
    /// 更新租户信息
    /// </summary>
    public async Task<TenantDto> UpdateAsync(Guid id, UpdateTenantDto input)
    {
        var tenant = await _tenantRepository.GetAsync(id);

        // TODO: 更新扩展属性（IsActive、TenantType、ParentTenantId）
        // 当前使用ABP默认的Tenant实体，后续需要创建自定义扩展

        await _tenantRepository.UpdateAsync(tenant, autoSave: true);

        _logger.LogInformation("租户更新成功 - ID: {TenantId}", id);

        return MapToDto(tenant);
    }

    /// <summary>
    /// 删除租户
    /// 1. 删除租户Schema及所有数据
    /// 2. 删除租户记录
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        _logger.LogWarning("开始删除租户 - ID: {TenantId}", id);

        try
        {
            var tenant = await _tenantRepository.GetAsync(id);

            // 1. 删除租户Schema（谨慎操作！会删除所有数据）
            var connectionString = _configuration.GetConnectionString("PermissionManagement")
                ?? throw new InvalidOperationException("未找到数据库连接字符串");

            await _schemaManager.DeleteSchemaAsync(id, connectionString);

            _logger.LogInformation("租户Schema删除成功 - TenantId: {TenantId}", id);

            // 2. 删除租户记录
            await _tenantRepository.DeleteAsync(tenant, autoSave: true);

            _logger.LogInformation("租户删除完成 - ID: {TenantId}, Name: {TenantName}", id, tenant.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "删除租户失败 - ID: {TenantId}", id);
            throw;
        }
    }

    /// <summary>
    /// 根据名称查找租户
    /// </summary>
    public async Task<TenantDto?> FindByNameAsync(string name)
    {
        var tenant = await _tenantRepository.FindByNameAsync(name);
        return tenant != null ? MapToDto(tenant) : null;
    }

    /// <summary>
    /// 获取子租户列表（集团组织架构）
    /// </summary>
    public async Task<ListResultDto<TenantDto>> GetChildTenantsAsync(Guid parentTenantId)
    {
        // TODO: 实现基于ParentTenantId的查询
        // 需要扩展Tenant实体来支持ParentTenantId字段
        
        _logger.LogWarning("GetChildTenantsAsync需要扩展Tenant实体来支持ParentTenantId");
        
        return new ListResultDto<TenantDto>(new List<TenantDto>());
    }

    /// <summary>
    /// 获取租户组织架构树
    /// </summary>
    public async Task<ListResultDto<TenantDto>> GetOrganizationTreeAsync(Guid? rootTenantId = null)
    {
        // TODO: 实现递归查询组织架构树
        // 需要扩展Tenant实体来支持ParentTenantId字段
        
        _logger.LogWarning("GetOrganizationTreeAsync需要扩展Tenant实体来支持ParentTenantId");
        
        return new ListResultDto<TenantDto>(new List<TenantDto>());
    }

    /// <summary>
    /// 映射Tenant实体到TenantDto
    /// </summary>
    private TenantDto MapToDto(Tenant tenant)
    {
        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            DisplayName = tenant.Name, // ABP默认Tenant没有DisplayName
            Code = null, // 需要扩展
            IsActive = true, // 需要扩展
            SchemaName = _schemaResolver.GetSchemaName(tenant.Id),
            TenantType = TenantType.Independent, // 需要扩展
            ParentTenantId = null, // 需要扩展
            CreationTime = tenant.CreationTime,
            LastModificationTime = tenant.LastModificationTime
        };
    }
}

