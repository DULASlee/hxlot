using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OpenIddict.Abstractions;
using OpenIddict.Server;
using OpenIddict.Server.AspNetCore;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.OpenIddict;

public class SmartAbpOpenIddictClaimsHandler : IOpenIddictServerHandler<OpenIddictServerEvents.HandleTokenRequestContext>, ITransientDependency
{
    public static OpenIddictServerHandlerDescriptor Descriptor { get; }
        = OpenIddictServerHandlerDescriptor.CreateBuilder<OpenIddictServerEvents.HandleTokenRequestContext>()
            .AddFilter<OpenIddictServerAspNetCoreHandlerFilters.RequireHttpRequest>()
            .UseScopedHandler<SmartAbpOpenIddictClaimsHandler>()
            .SetOrder(OpenIddictServerHandlers.Exchange.AttachPrincipal.Descriptor.Order + 500)
            .Build();

    private readonly ILogger<SmartAbpOpenIddictClaimsHandler> _logger;

    public SmartAbpOpenIddictClaimsHandler(ILogger<SmartAbpOpenIddictClaimsHandler> logger)
    {
        _logger = logger;
    }

    public ValueTask HandleAsync(OpenIddictServerEvents.HandleTokenRequestContext context)
    {
        if (context?.Transaction?.Request == null)
        {
            return default;
        }

        if (context.Principal?.Identity?.IsAuthenticated != true)
        {
            _logger.LogDebug("Principal未认证，跳过Claims处理");
            return default;
        }

        try
        {
            // 这里可以添加自定义的claims处理逻辑
            // 例如：根据用户信息添加额外的claims
            
            _logger.LogDebug("成功处理OpenIddict Claims");
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "处理OpenIddict Claims时发生错误");
        }

        return default;
    }
}