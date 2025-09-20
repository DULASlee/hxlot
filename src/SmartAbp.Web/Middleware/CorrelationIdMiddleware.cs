using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace SmartAbp.Web.Middleware;

public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers["X-Correlation-ID"].ToString();
        
        if (string.IsNullOrEmpty(correlationId))
        {
            correlationId = Guid.NewGuid().ToString();
            context.Request.Headers["X-Correlation-ID"] = correlationId;
        }

        context.Response.Headers["X-Correlation-ID"] = correlationId;

        await _next(context);
    }
}