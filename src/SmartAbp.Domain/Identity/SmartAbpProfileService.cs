using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Security.Claims;
using Volo.Abp.TenantManagement;
using System.Collections.Generic;

namespace SmartAbp.Identity
{
    /// <summary>
    /// 自定义ProfileService，用于在Token中添加租户信息和其他自定义Claims
    /// </summary>
    public class SmartAbpProfileService : ITransientDependency
    {
        protected ILogger<SmartAbpProfileService> Logger { get; }
        protected ICurrentTenant CurrentTenant { get; }
        protected ITenantRepository TenantRepository { get; }
        protected IdentityUserManager UserManager { get; }
        protected IAbpClaimsPrincipalFactory ClaimsPrincipalFactory { get; }

        public SmartAbpProfileService(
            ILogger<SmartAbpProfileService> logger,
            ICurrentTenant currentTenant,
            ITenantRepository tenantRepository,
            IdentityUserManager userManager,
            IAbpClaimsPrincipalFactory claimsPrincipalFactory)
        {
            Logger = logger;
            CurrentTenant = currentTenant;
            TenantRepository = tenantRepository;
            UserManager = userManager;
            ClaimsPrincipalFactory = claimsPrincipalFactory;
        }

        /// <summary>
        /// 为用户添加自定义Claims，包括租户信息
        /// </summary>
        public virtual async Task<ClaimsPrincipal> EnrichClaimsAsync(ClaimsPrincipal principal, IdentityUser user)
        {
            var identity = principal.Identity as ClaimsIdentity;
            if (identity == null)
            {
                return principal;
            }

            // 添加租户相关Claims
            await AddTenantClaimsAsync(identity, user);

            // 添加用户扩展信息
            await AddUserExtensionClaimsAsync(identity, user);

            // 添加角色和权限信息
            await AddRoleAndPermissionClaimsAsync(identity, user);

            return principal;
        }

        protected virtual async Task AddTenantClaimsAsync(ClaimsIdentity identity, IdentityUser user)
        {
            if (CurrentTenant.Id.HasValue)
            {
                var tenant = await TenantRepository.FindAsync(CurrentTenant.Id.Value);
                if (tenant != null)
                {
                    // 添加租户ID
                    identity.AddClaim(new Claim("tenant_id", tenant.Id.ToString()));
                    
                    // 添加租户名称
                    identity.AddClaim(new Claim("tenant_name", tenant.Name));
                    
                    // 添加租户显示名称（如果有）
                    if (!string.IsNullOrEmpty(tenant.Name))
                    {
                        identity.AddClaim(new Claim("tenant_display_name", tenant.Name));
                    }

                    Logger.LogDebug("为用户 {UserId} 添加租户Claims: {TenantId}, {TenantName}", 
                        user.Id, tenant.Id, tenant.Name);
                }
            }
            else
            {
                // 主机用户（Host User）
                identity.AddClaim(new Claim("tenant_id", ""));
                identity.AddClaim(new Claim("tenant_name", "Host"));
                identity.AddClaim(new Claim("tenant_display_name", "系统管理员"));
            }
        }

        protected virtual async Task AddUserExtensionClaimsAsync(ClaimsIdentity identity, IdentityUser user)
        {
            // 添加用户显示名称
            if (!string.IsNullOrEmpty(user.Name))
            {
                identity.AddClaim(new Claim("display_name", user.Name));
            }

            // 添加用户头像（如果有扩展属性）
            var avatarClaim = user.ExtraProperties.GetValueOrDefault("Avatar");
            if (avatarClaim != null)
            {
                identity.AddClaim(new Claim("avatar", avatarClaim.ToString()));
            }

            // 添加部门信息（如果有扩展属性）
            var departmentClaim = user.ExtraProperties.GetValueOrDefault("Department");
            if (departmentClaim != null)
            {
                identity.AddClaim(new Claim("department", departmentClaim.ToString()));
            }

            // 添加职位信息（如果有扩展属性）
            var positionClaim = user.ExtraProperties.GetValueOrDefault("Position");
            if (positionClaim != null)
            {
                identity.AddClaim(new Claim("position", positionClaim.ToString()));
            }

            await Task.CompletedTask;
        }

        protected virtual async Task AddRoleAndPermissionClaimsAsync(ClaimsIdentity identity, IdentityUser user)
        {
            // 获取用户角色
            var roles = await UserManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }

            // 注意：权限Claims通常由ABP的动态权限系统处理，这里不需要手动添加
            await Task.CompletedTask;
        }
    }
}