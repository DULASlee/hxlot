using System;
using System.IO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartAbp.Web.Swagger;
using SmartAbp.Web.Hubs;
using SmartAbp.Web.BackgroundWorkers;
using SmartAbp.Web.Realtime;
using SmartAbp.Application.Contracts.Realtime;
using SmartAbp.Application.RealtimeData;
using Volo.Abp;
using Volo.Abp.Autofac;
using Volo.Abp.AspNetCore.Authentication.JwtBearer;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.Auditing;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.Swashbuckle;
using Volo.Abp.Account.Web;
using Volo.Abp.Identity.Web;
using Volo.Abp.TenantManagement.Web;
using SmartAbp.EntityFrameworkCore;
using SmartAbp.CodeGenerator;

namespace SmartAbp.Web;

[DependsOn(
    typeof(SmartAbpApplicationModule),
    typeof(SmartAbpHttpApiModule),
    typeof(SmartAbpEntityFrameworkCoreModule),
    typeof(SmartAbpCodeGeneratorModule),
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreAuthenticationJwtBearerModule),
    typeof(AbpAccountWebOpenIddictModule),
    typeof(AbpAspNetCoreSerilogModule),
    typeof(AbpSwashbuckleModule),
    typeof(AbpAspNetCoreMvcUiLeptonXLiteThemeModule),
    typeof(AbpIdentityWebModule),
    typeof(AbpTenantManagementWebModule)
)]
public class SmartAbpHttpApiHostModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();

        Configure<AbpAuditingOptions>(options =>
        {
            options.IsEnabledForGetRequests = true;
            options.ApplicationName = "SmartAbp";
        });

        Configure<AbpLocalizationOptions>(options =>
        {
            options.Languages.Add(new LanguageInfo("en", "en", "English"));
            options.Languages.Add(new LanguageInfo("zh-Hans", "zh-Hans", "简体中文"));
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CORS配置（支持SignalR）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                var hostEnvironment = context.Services.GetRequiredService<IHostEnvironment>();

                if (hostEnvironment.IsDevelopment())
                {
                    // 开发环境：明确允许前端开发服务器和Swagger UI的地址
                    builder.WithOrigins(
                            "http://localhost:9001", // 前端Vue开发服务器
                            "http://localhost:9002", // 后端Swagger UI
                            "http://127.0.0.1:9001", // 前端备用地址
                            "http://127.0.0.1:9002"  // 后端备用地址
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
                else
                {
                    // 生产环境：严格的CORS策略
                    var origins = configuration["App:CorsOrigins"] ?? "http://localhost:11369";
                    builder.WithOrigins(origins.Split(',', StringSplitOptions.RemoveEmptyEntries))
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials(); // SignalR必须开启Credentials
                }
            });
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SignalR配置（用于数字大屏实时数据推送）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        context.Services.AddSignalR(options =>
        {
            // 客户端超时时间（30秒）
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);

            // 心跳间隔（15秒）
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);

            // 最大消息大小（1MB）
            options.MaximumReceiveMessageSize = 1024 * 1024;

            // 启用详细错误（仅开发环境）
            options.EnableDetailedErrors = context.Services.GetRequiredService<IHostEnvironment>().IsDevelopment();
        });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 注册应用服务
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // 实时数据聚合服务
        context.Services.AddTransient<RealtimeDataAggregatorService>();

        // 注册实时数据通知服务
        context.Services.AddTransient<IRealtimeDataNotifier, SignalRRealtimeDataNotifier>();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔴 临时禁用: 此后台任务会高频轮询并刷屏日志，导致性能问题
        // 禁用原因: 避免在开发和UI测试期间造成干扰和性能下降
        // 禁用日期: 2025-10-22
        // 计划: 在需要真实数据推送功能时再重新启用
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // context.Services.AddHostedService<RealtimeDataPushBackgroundWorker>();

        context.Services.AddAbpSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
            {
                Title = "SmartAbp API",
                Version = "v1",
                Description = "SmartAbp 低代码平台 REST API - 后端SSOT架构"
            });

            options.DocInclusionPredicate((docName, description) => true);
            options.CustomSchemaIds(type => type.FullName);

            // Phase 1B: 配置Swagger扫描Domain层类型（用于NSwag生成前端类型）
            // 让 PropertyUIConfig, PageConfigDto, ValidationRuleConfig 等Domain层DTO被NSwag识别
            var domainXmlPath = Path.Combine(AppContext.BaseDirectory, "SmartAbp.Domain.xml");
            if (File.Exists(domainXmlPath))
            {
                options.IncludeXmlComments(domainXmlPath, includeControllerXmlComments: true);
            }

            // 扫描Application.Contracts层的XML注释
            var contractsXmlPath = Path.Combine(AppContext.BaseDirectory, "SmartAbp.Application.Contracts.xml");
            if (File.Exists(contractsXmlPath))
            {
                options.IncludeXmlComments(contractsXmlPath, includeControllerXmlComments: true);
            }

            // 确保所有Domain层的嵌套类型都被扫描到
            options.UseAllOfToExtendReferenceSchemas();
            options.UseOneOfForPolymorphism();
            options.UseInlineDefinitionsForEnums();

            // 配置序列化选项，确保所有属性都被包含
            options.SchemaFilter<RequireNonNullablePropertiesSchemaFilter>();
        });

        // Configure OpenIddict Validation as default authentication scheme
        context.Services.Configure<Microsoft.AspNetCore.Authentication.AuthenticationOptions>(authOptions =>
        {
            // 🔥 使用 OpenIddict Validation 方案（本地验证 JWT token）
            // 方案名称常量值为 "OpenIddict.Validation.AspNetCore"
            const string OpenIddictValidationScheme = "OpenIddict.Validation.AspNetCore";
            authOptions.DefaultAuthenticateScheme = OpenIddictValidationScheme;
            authOptions.DefaultChallengeScheme = OpenIddictValidationScheme;
        });
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
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();

        // Phase 1B: 配置Swagger为默认页面，增强健壮性
        app.UseSwagger(options =>
        {
            options.SerializeAsV2 = false; // 使用OpenAPI 3.0
        });

        app.UseAbpSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartAbp API v1");
            options.RoutePrefix = string.Empty; // 设置Swagger UI为根路径（访问 / 即打开Swagger）
            options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
            options.DefaultModelsExpandDepth(2);
            options.DisplayRequestDuration();
        });

        app.UseAuditing();
        app.UseAbpSerilogEnrichers();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 配置端点路由（包括SignalR Hub）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        app.UseConfiguredEndpoints(endpoints =>
        {
            // 映射SignalR Hub（数字大屏实时数据推送）
            endpoints.MapHub<ProductionLineHub>("/hubs/production-line");
        });
    }
}
