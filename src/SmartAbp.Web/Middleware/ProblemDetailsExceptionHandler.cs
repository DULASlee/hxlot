using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace SmartAbp.Web.Middleware;

public class ProblemDetailsExceptionHandler
{
    private readonly RequestDelegate _next;

    public ProblemDetailsExceptionHandler(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = new ProblemDetails
        {
            Title = "An error occurred while processing your request.",
            Status = StatusCodes.Status500InternalServerError,
            Detail = exception.Message
        };

        if (exception is BusinessException businessException)
        {
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Title = businessException.Code;
            problemDetails.Detail = businessException.Message;
        }

        context.Response.StatusCode = problemDetails.Status.Value;
        context.Response.ContentType = "application/problem+json";

        return context.Response.WriteAsJsonAsync(problemDetails);
    }
}