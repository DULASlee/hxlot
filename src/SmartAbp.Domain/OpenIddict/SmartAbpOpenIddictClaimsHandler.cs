using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OpenIddict.Abstractions;
using SmartAbp.Identity;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;
using OpenIddict.Server;

namespace SmartAbp.OpenIddict
{
    /// <summary>
    /// OpenIddict Claims处理器，用于在Token生成时添加自定义Claims
    /// </summary>
    public class SmartAbpOpenIddictClaimsHandler : IOpenIddictServerHandler<OpenIddictServerEvents.HandleTokenRequestContext>, ITransientDependency
    {
        protected ILogger<SmartAbpOpenIddictClaimsHandler> Logger { get; }
        protected IServiceScopeFactory ServiceScopeFactory { get; }

        public SmartAbpOpenIddictClaimsHandler(
            ILogger<SmartAbpOpenIddictClaimsHandler> logger,
            IServiceScopeFactory serviceScopeFactory)
        {
            Logger = logger;
            ServiceScopeFactory = serviceScopeFactory;
        }

        public async ValueTask HandleAsync(OpenIddictServerEvents.HandleTokenRequestContext context)
        {
            if (context.Request.IsPasswordGrantType() || context.Request.IsRefreshTokenGrantType())
            {
                // 检查Principal是否有效
                if (context.Principal?.Identity?.IsAuthenticated != true)
                {
                    Logger.LogDebug("Principal未认证，跳过Claims处理");
                    return;
                }

                using var scope = ServiceScopeFactory.CreateScope();
                
                var userManager = scope.ServiceProvider.GetRequiredService<IdentityUserManager>();
                var profileService = scope.ServiceProvider.GetRequiredService<SmartAbpProfileService>();
                
                try
                {
                    var user = await userManager.GetUserAsync(context.Principal);
                    if (user != null)
                    {
                        // 使用ProfileService丰富Claims
                        var enrichedPrincipal = await profileService.EnrichClaimsAsync(context.Principal, user);
                        
                        // 更新Principal
                        context.Principal = enrichedPrincipal;
                        
                        // 确保必要的Claims被包含在Token中
                        var identity = enrichedPrincipal.Identity as ClaimsIdentity;
                        if (identity != null)
                        {
                            // 添加到Token的Claims
                            var claimsToInclude = new[]
                            {
                                "tenant_id",
                                "tenant_name", 
                                "tenant_display_name",
                                "display_name",
                                "avatar",
                                "department",
                                "position"
                            };

                            foreach (var claimType in claimsToInclude)
                            {
                                var claim = identity.FindFirst(claimType);
                                if (claim != null)
                                {
                                    context.Principal.SetClaim(claimType, claim.Value);
                                }
                            }

                            Logger.LogDebug("为用户 {UserId} 添加了自定义Claims到Token中", user.Id);
                        }
                    }
                    else
                    {
                        Logger.LogDebug("无法从Principal获取用户信息");
                    }
                }
                catch (System.Exception ex)
                {
                    Logger.LogError(ex, "处理Claims时发生错误");
                    // 不抛出异常，让登录流程继续
                }
            }

            await Task.CompletedTask;
        }

        public static OpenIddictServerHandlerDescriptor Descriptor { get; }
            = OpenIddictServerHandlerDescriptor.CreateBuilder<OpenIddictServerEvents.HandleTokenRequestContext>()
                .UseSingletonHandler<SmartAbpOpenIddictClaimsHandler>()
                .SetOrder(int.MaxValue - 100000)
                .SetType(OpenIddictServerHandlerType.Custom)
                .Build();
    }
}