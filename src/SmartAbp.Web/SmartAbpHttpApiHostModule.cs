using System;
using System.IO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartAbp.Web.Swagger;
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

        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                var origins = configuration["App:CorsOrigins"] ?? "http://localhost:11369";
                builder.WithOrigins(origins.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

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

        // Configure JWT Bearer authentication
        context.Services.Configure<Microsoft.AspNetCore.Authentication.AuthenticationOptions>(authOptions =>
        {
            authOptions.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            authOptions.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
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
        app.UseConfiguredEndpoints();
    }
}
