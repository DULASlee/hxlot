using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;
using SmartAbp.PermissionManagement.Application.Contracts.Roles;
using SmartAbp.PermissionManagement.Application.Contracts.Roles.Dtos;

namespace SmartAbp.PermissionManagement.Application.Roles;

/// <summary>
/// 角色管理应用服务
/// 实现租户级角色管理（自动租户过滤）
/// </summary>
public class RoleAppService : ApplicationService, IRoleAppService
{
    private readonly IIdentityRoleRepository _roleRepository;
    private readonly IdentityRoleManager _roleManager;

    public RoleAppService(
        IIdentityRoleRepository roleRepository,
        IdentityRoleManager roleManager)
    {
        _roleRepository = roleRepository;
        _roleManager = roleManager;
    }

    /// <summary>
    /// 获取角色列表（分页，自动租户过滤）
    /// </summary>
    public async Task<PagedResultDto<RoleDto>> GetListAsync(GetRolesInput input)
    {
        // ABP会自动根据CurrentTenant过滤角色
        var roles = await _roleRepository.GetListAsync(
            input.Sorting ?? "Name ASC",
            input.MaxResultCount,
            input.SkipCount,
            input.Filter
        );

        var totalCount = await _roleRepository.GetCountAsync(input.Filter);

        var dtos = roles.Select(MapToDto).ToList();

        return new PagedResultDto<RoleDto>(totalCount, dtos);
    }

    /// <summary>
    /// 根据ID获取角色
    /// </summary>
    public async Task<RoleDto> GetAsync(Guid id)
    {
        var role = await _roleRepository.GetAsync(id);
        return MapToDto(role);
    }

    /// <summary>
    /// 创建角色（在当前租户下）
    /// </summary>
    public async Task<RoleDto> CreateAsync(CreateRoleDto input)
    {
        // 检查角色名是否已存在
        var existingRole = await _roleRepository.FindByNormalizedNameAsync(
            _roleManager.NormalizeKey(input.Name)
        );
        if (existingRole != null)
        {
            throw new UserFriendlyException($"角色名 '{input.Name}' 已存在");
        }

        // 创建角色（自动关联当前租户）
        var role = new IdentityRole(
            GuidGenerator.Create(),
            input.Name,
            CurrentTenant.Id
        )
        {
            IsDefault = input.IsDefault,
            IsPublic = input.IsPublic
        };

        await _roleManager.CreateAsync(role);
        await _roleRepository.InsertAsync(role, autoSave: true);

        return MapToDto(role);
    }

    /// <summary>
    /// 更新角色信息
    /// </summary>
    public async Task<RoleDto> UpdateAsync(Guid id, UpdateRoleDto input)
    {
        var role = await _roleRepository.GetAsync(id);

        // 检查是否为静态角色（不可修改）
        if (role.IsStatic)
        {
            throw new UserFriendlyException("静态角色不可修改");
        }

        // 更新角色名
        if (role.Name != input.Name)
        {
            await _roleManager.SetRoleNameAsync(role, input.Name);
        }

        role.IsDefault = input.IsDefault;
        role.IsPublic = input.IsPublic;

        await _roleManager.UpdateAsync(role);
        await _roleRepository.UpdateAsync(role, autoSave: true);

        return MapToDto(role);
    }

    /// <summary>
    /// 删除角色
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        var role = await _roleRepository.GetAsync(id);

        // 检查是否为静态角色（不可删除）
        if (role.IsStatic)
        {
            throw new UserFriendlyException("静态角色不可删除");
        }

        await _roleManager.DeleteAsync(role);
    }

    /// <summary>
    /// 获取所有可用角色（不分页）
    /// </summary>
    public async Task<ListResultDto<RoleDto>> GetAllListAsync()
    {
        var roles = await _roleRepository.GetListAsync();
        var dtos = roles.Select(MapToDto).OrderBy(r => r.Name).ToList();
        return new ListResultDto<RoleDto>(dtos);
    }

    /// <summary>
    /// 映射到DTO
    /// </summary>
    private static RoleDto MapToDto(IdentityRole role)
    {
        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            IsDefault = role.IsDefault,
            IsPublic = role.IsPublic,
            IsStatic = role.IsStatic,
            TenantId = role.TenantId,
            CreationTime = DateTime.UtcNow // IdentityRole may not have CreationTime in ABP v8.3.1
        };
    }
}

