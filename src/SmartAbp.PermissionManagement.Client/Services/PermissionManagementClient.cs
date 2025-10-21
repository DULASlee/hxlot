using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.PermissionManagement.Client.Configuration;
using SmartAbp.PermissionManagement.Client.Models;

namespace SmartAbp.PermissionManagement.Client.Services;

/// <summary>
/// Permission Management Client实现
/// 提供对Permission Management微服务的HTTP调用封装
/// </summary>
public class PermissionManagementClient : IPermissionManagementClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PermissionManagementClient> _logger;
    private readonly PermissionManagementClientOptions _options;
    private readonly JsonSerializerOptions _jsonOptions;

    public PermissionManagementClient(
        HttpClient httpClient,
        ILogger<PermissionManagementClient> logger,
        IOptions<PermissionManagementClientOptions> options)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value;

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        // 配置HttpClient
        _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);

        if (!string.IsNullOrEmpty(_options.AuthenticationToken))
        {
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_options.AuthenticationToken}");
        }
    }

    /// <summary>
    /// 获取角色的权限列表
    /// </summary>
    public async Task<List<PermissionDto>> GetRolePermissionsAsync(string roleName, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/permission-management/permissions/role/{roleName}", cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<ListResultDto<PermissionDto>>(_jsonOptions, cancellationToken);
            return result?.Items ?? new List<PermissionDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取角色权限失败: RoleName={RoleName}", roleName);
            throw;
        }
    }

    /// <summary>
    /// 更新角色权限
    /// </summary>
    public async Task UpdateRolePermissionsAsync(string roleName, UpdatePermissionsDto input, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/permission-management/permissions/role/{roleName}", input, _jsonOptions, cancellationToken);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation("角色权限更新成功: RoleName={RoleName}, Count={Count}", roleName, input.Permissions.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新角色权限失败: RoleName={RoleName}", roleName);
            throw;
        }
    }

    /// <summary>
    /// 获取用户的权限列表
    /// </summary>
    public async Task<List<PermissionDto>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/permission-management/permissions/user/{userId}", cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<ListResultDto<PermissionDto>>(_jsonOptions, cancellationToken);
            return result?.Items ?? new List<PermissionDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取用户权限失败: UserId={UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// 更新用户权限
    /// </summary>
    public async Task UpdateUserPermissionsAsync(Guid userId, UpdatePermissionsDto input, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/permission-management/permissions/user/{userId}", input, _jsonOptions, cancellationToken);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation("用户权限更新成功: UserId={UserId}, Count={Count}", userId, input.Permissions.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新用户权限失败: UserId={UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// 获取组织单元的权限列表
    /// </summary>
    public async Task<List<PermissionDto>> GetOrganizationUnitPermissionsAsync(Guid ouId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/permission-management/permissions/organization-unit/{ouId}", cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<ListResultDto<PermissionDto>>(_jsonOptions, cancellationToken);
            return result?.Items ?? new List<PermissionDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取组织单元权限失败: OuId={OuId}", ouId);
            throw;
        }
    }

    /// <summary>
    /// 更新组织单元权限
    /// </summary>
    public async Task UpdateOrganizationUnitPermissionsAsync(Guid ouId, UpdatePermissionsDto input, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/permission-management/permissions/organization-unit/{ouId}", input, _jsonOptions, cancellationToken);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation("组织单元权限更新成功: OuId={OuId}, Count={Count}", ouId, input.Permissions.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新组织单元权限失败: OuId={OuId}", ouId);
            throw;
        }
    }

    /// <summary>
    /// 验证用户是否拥有指定权限
    /// </summary>
    public async Task<bool> CheckPermissionAsync(Guid userId, string permissionName, CancellationToken cancellationToken = default)
    {
        try
        {
            var permissions = await GetUserPermissionsAsync(userId, cancellationToken);
            var permission = permissions.FirstOrDefault(p => p.Name == permissionName);
            return permission?.IsGranted ?? false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "验证用户权限失败: UserId={UserId}, Permission={Permission}", userId, permissionName);
            return false;
        }
    }

    /// <summary>
    /// 批量验证用户权限
    /// </summary>
    public async Task<Dictionary<string, bool>> CheckPermissionsAsync(Guid userId, List<string> permissionNames, CancellationToken cancellationToken = default)
    {
        try
        {
            var permissions = await GetUserPermissionsAsync(userId, cancellationToken);
            var result = new Dictionary<string, bool>();

            foreach (var permissionName in permissionNames)
            {
                var permission = permissions.FirstOrDefault(p => p.Name == permissionName);
                result[permissionName] = permission?.IsGranted ?? false;
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "批量验证用户权限失败: UserId={UserId}, Count={Count}", userId, permissionNames.Count);
            return permissionNames.ToDictionary(name => name, _ => false);
        }
    }

    /// <summary>
    /// ListResultDto（ABP标准响应格式）
    /// </summary>
    private class ListResultDto<T>
    {
        public List<T> Items { get; set; } = new();
    }
}

