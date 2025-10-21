namespace SmartAbp.PermissionManagement.Client.Models;

/// <summary>
/// 权限DTO
/// </summary>
public class PermissionDto
{
    /// <summary>
    /// 权限名称
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 显示名称
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// 父权限名称
    /// </summary>
    public string? ParentName { get; set; }

    /// <summary>
    /// 是否已授予
    /// </summary>
    public bool IsGranted { get; set; }
}

