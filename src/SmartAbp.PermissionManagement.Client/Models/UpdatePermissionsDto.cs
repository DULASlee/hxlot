namespace SmartAbp.PermissionManagement.Client.Models;

/// <summary>
/// 更新权限DTO
/// </summary>
public class UpdatePermissionsDto
{
    /// <summary>
    /// 权限列表（权限名称 => 是否授予）
    /// </summary>
    public Dictionary<string, bool> Permissions { get; set; } = new();
}

