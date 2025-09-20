using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;

namespace SmartAbp.Web;

public class Program
{
    public async static Task<int> Main(string[] args)
    {
        // Resolve log root (default to ./log, can be overridden via LOG_ROOT)
        var defaultLogRoot = System.IO.Path.Combine(AppContext.BaseDirectory, "log");
        var logRoot = Environment.GetEnvironmentVariable("LOG_ROOT") ?? defaultLogRoot;
        var webLogDir = System.IO.Path.Combine(logRoot, "web");
        System.IO.Directory.CreateDirectory(webLogDir);
        var bootstrapLogPath = System.IO.Path.Combine(webLogDir, "logs.json");

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .Enrich.FromLogContext()
            .WriteTo.Async(c => c.File(
                path: bootstrapLogPath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 7,
                formatter: new Serilog.Formatting.Compact.CompactJsonFormatter()))
            .WriteTo.Async(c => c.Console())
            .CreateBootstrapLogger();

        try
        {
            Log.Information("Starting web host.");
            var builder = WebApplication.CreateBuilder(args);
            // Bind strong-typed options and validate at startup
            builder.Services.AddOptions<Configuration.ApplicationOptions>()
                .Bind(builder.Configuration.GetSection("Application"))
                .ValidateDataAnnotations()
                .ValidateOnStart();
            builder.Host
                .AddAppSettingsSecretsJson()
                .UseAutofac()
                .UseSerilog((context, services, loggerConfiguration) =>
                {
                    // Resolve log root using env/option/config → fallback to {ContentRoot}/log
                    var configuredRoot = Environment.GetEnvironmentVariable("LOG_ROOT");
                    var configuredRootFromConfig = context.Configuration.GetSection("Application")["LogRoot"];
                    if (string.IsNullOrWhiteSpace(configuredRoot))
                    {
                        configuredRoot = configuredRootFromConfig;
                    }
                    var contentRoot = context.HostingEnvironment.ContentRootPath;
                    var resolvedLogRoot = configuredRoot ?? System.IO.Path.Combine(contentRoot, "log");
                    var effectiveWebLogDir = System.IO.Path.Combine(resolvedLogRoot, "web");
                    System.IO.Directory.CreateDirectory(effectiveWebLogDir);

                    loggerConfiguration
                    #if DEBUG
                        .MinimumLevel.Debug()
                    #else
                        .MinimumLevel.Information()
                    #endif
                        .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
                        .Enrich.FromLogContext()
                        .Enrich.With(new Logging.SanitizingEnricher())
                        .Enrich.WithProperty("Application", "SmartAbp.Web")
                        // application log (info+)
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveWebLogDir, "app.log.json"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 14,
                            fileSizeLimitBytes: 50_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter(),
                            restrictedToMinimumLevel: LogEventLevel.Information))
                        // warnings
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveWebLogDir, "warn.log.json"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 21,
                            fileSizeLimitBytes: 50_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter(),
                            restrictedToMinimumLevel: LogEventLevel.Warning))
                        // errors
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveWebLogDir, "error.log.json"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 30,
                            fileSizeLimitBytes: 50_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter(),
                            restrictedToMinimumLevel: LogEventLevel.Error))
                        // request log (info+), separate file
                        .WriteTo.Async(c => c.File(
                            path: System.IO.Path.Combine(effectiveWebLogDir, "requests.log.json"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 7,
                            fileSizeLimitBytes: 50_000_000,
                            rollOnFileSizeLimit: true,
                            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter()))
                        .WriteTo.Async(c => c.Console())
                        .WriteTo.Async(c => c.AbpStudio(services));
                });
            await builder.AddApplicationAsync<SmartAbpWebModule>();
            var app = builder.Build();
            // CorrelationId + Request logging + ProblemDetails
            app.UseMiddleware<Middleware.CorrelationIdMiddleware>();
            app.UseSerilogRequestLogging();
            app.UseMiddleware<Middleware.ProblemDetailsExceptionHandler>();
            await app.InitializeApplicationAsync();
            await app.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Host terminated unexpectedly!");
            return 1;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
