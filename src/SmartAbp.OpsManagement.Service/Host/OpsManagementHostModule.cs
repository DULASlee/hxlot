using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Volo.Abp;
using Volo.Abp.Autofac;
using Volo.Abp.AspNetCore.Authentication.JwtBearer;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.Auditing;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.Swashbuckle;
using SmartAbp.OpsManagement.Application;
using SmartAbp.OpsManagement.Infrastructure;
using SmartAbp.OpsManagement.HttpApi;

namespace SmartAbp.OpsManagement.Host;

/// <summary>
/// 运维管理微服务主机模块
/// 集成 Application + Infrastructure + HttpApi 层
/// 支持 Dapr + 健康检查 + JWT 认证
/// </summary>
[DependsOn(
    typeof(OpsManagementApplicationModule),
    typeof(OpsManagementInfrastructureModule), 
    typeof(OpsManagementHttpApiModule),
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMvcModule),
    typeof(AbpAspNetCoreAuthenticationJwtBearerModule),
    typeof(AbpAspNetCoreSerilogModule),
    typeof(AbpSwashbuckleModule)
)]
public class OpsManagementHostModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var services = context.Services;

        // 配置审计
        Configure<AbpAuditingOptions>(options =>
        {
            options.IsEnabledForGetRequests = true;
            options.ApplicationName = "SmartAbp.OpsManagement";
        });

        // 配置本地化
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Languages.Add(new LanguageInfo("en", "en", "English"));
            options.Languages.Add(new LanguageInfo("zh-Hans", "zh-Hans", "简体中文"));
        });

        // 配置 CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                var origins = configuration["App:CorsOrigins"] ?? "http://localhost:3000,http://localhost:11369";
                builder.WithOrigins(origins.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        // 配置 Swagger
        services.AddAbpSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
            { 
                Title = "SmartAbp OpsManagement API", 
                Version = "v1",
                Description = "运维管理微服务 API - 提供性能监控、日志管理、K8s监控、告警管理功能"
            });
            options.DocInclusionPredicate((docName, description) => true);
            options.CustomSchemaIds(type => type.FullName);
        });

        // 配置 JWT 认证
        services.Configure<Microsoft.AspNetCore.Authentication.AuthenticationOptions>(authOptions =>
        {
            authOptions.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            authOptions.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        });

        // 添加健康检查
        services.AddHealthChecks()
            .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy())
            .AddElasticsearch(configuration.GetConnectionString("Elasticsearch") ?? "http://localhost:9200")
            .AddPrometheusMetrics();

        // 添加 Dapr 支持
        services.AddDapr(daprClientBuilder =>
        {
            daprClientBuilder.UseHttpEndpoint(configuration["Dapr:HttpEndpoint"] ?? "http://localhost:3500");
            daprClientBuilder.UseGrpcEndpoint(configuration["Dapr:GrpcEndpoint"] ?? "http://localhost:50001");
        });

        // 添加控制器
        services.AddControllers()
            .AddDapr();
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseAbpRequestLocalization();
        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();
        
        // Swagger UI
        app.UseSwagger();
        app.UseAbpSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartAbp OpsManagement API v1");
            options.RoutePrefix = "swagger";
        });

        app.UseAuditing();
        app.UseAbpSerilogEnrichers();

        // 健康检查端点
        app.UseHealthChecks("/health");
        app.UseHealthChecks("/health/ready");
        app.UseHealthChecks("/health/live");

        // Dapr 订阅端点
        app.UseCloudEvents();

        app.UseConfiguredEndpoints();
    }
}
