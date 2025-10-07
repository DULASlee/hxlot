using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Volo.Abp.Auditing;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Services;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Timing;
using Volo.Abp.Users;

namespace {{Namespace}}.Services
{
    /// <summary>
    /// {{Description}}
    /// </summary>
    public class {{EntityName}}AuditService : DomainService, ITransientDependency
    {
        protected IAuditingStore AuditingStore { get; }
        protected ICurrentUser CurrentUser { get; }
        protected ICurrentTenant CurrentTenant { get; }
        protected IClock Clock { get; }
        protected IHttpContextAccessor HttpContextAccessor { get; }
        protected string ApplicationName { get; }

        public {{EntityName}}AuditService(
            IAuditingStore auditingStore,
            ICurrentUser currentUser,
            ICurrentTenant currentTenant,
            IClock clock,
            IHttpContextAccessor httpContextAccessor)
        {
            AuditingStore = auditingStore;
            CurrentUser = currentUser;
            CurrentTenant = currentTenant;
            Clock = clock;
            HttpContextAccessor = httpContextAccessor;
            ApplicationName = "{{EntityName}}App";
            Logger = NullLogger<{{EntityName}}AuditService>.Instance;
        }

        protected virtual HttpContext? HttpContext => HttpContextAccessor.HttpContext;
{{AuditMethods}}

        /// <summary>
        /// 比较实体变更
        /// </summary>
        protected virtual List<EntityPropertyChangeInfo> CompareEntities(object? originalEntity, object currentEntity)
        {
            var changes = new List<EntityPropertyChangeInfo>();
            
            if (originalEntity == null)
            {
                return changes;
            }

            var type = currentEntity.GetType();
            var properties = type.GetProperties();

            foreach (var property in properties)
            {
                if (!property.CanRead) continue;

                var originalValue = property.GetValue(originalEntity);
                var currentValue = property.GetValue(currentEntity);

                if (!Equals(originalValue, currentValue))
                {
                    changes.Add(new EntityPropertyChangeInfo
                    {
                        PropertyName = property.Name,
                        PropertyTypeFullName = property.PropertyType.FullName,
                        OriginalValue = originalValue?.ToString(),
                        NewValue = currentValue?.ToString()
                    });
                }
            }

            return changes;
        }
{{FilterMethods}}

        /// <summary>
        /// 获取客户端IP地址
        /// </summary>
        protected virtual string? GetClientIpAddress()
        {
            return HttpContext?.Connection?.RemoteIpAddress?.ToString();
        }

        /// <summary>
        /// 获取用户代理
        /// </summary>
        protected virtual string? GetUserAgent()
        {
            return HttpContext?.Request?.Headers["User-Agent"].FirstOrDefault();
        }

        /// <summary>
        /// 记录异常审计日志
        /// </summary>
        public virtual async Task LogExceptionAsync(Exception exception, string? operationName = null)
        {
            var auditLog = new AuditLogInfo
            {
                ApplicationName = ApplicationName,
                UserId = CurrentUser.Id,
                UserName = CurrentUser.UserName,
                TenantId = CurrentTenant.Id,
                ExecutionTime = Clock.Now,
                ExecutionDuration = 0,
                HttpMethod = HttpContext?.Request?.Method,
                Url = HttpContext?.Request?.GetDisplayUrl(),
                Exceptions = new List<Exception> { exception },
                Comments = $"Exception occurred in {operationName ?? "Unknown Operation"}: {exception.Message}"
            };

            Logger.Log{{LogLevel}}(exception, "Audit log exception: {Message}", exception.Message);
            
            await AuditingStore.SaveAsync(auditLog);
        }

        /// <summary>
        /// 记录性能审计日志
        /// </summary>
        public virtual async Task LogPerformanceAsync(string operationName, int executionTimeMs, object? parameters = null)
        {
            if (executionTimeMs < 1000) // 只记录超过1秒的操作
            {
                return;
            }

            var auditLog = new AuditLogInfo
            {
                ApplicationName = ApplicationName,
                UserId = CurrentUser.Id,
                UserName = CurrentUser.UserName,
                TenantId = CurrentTenant.Id,
                ExecutionTime = Clock.Now,
                ExecutionDuration = executionTimeMs,
                HttpMethod = HttpContext?.Request?.Method,
                Url = HttpContext?.Request?.GetDisplayUrl(),
                Comments = $"Performance audit: {operationName} took {executionTimeMs}ms"
            };

            if (parameters != null)
            {
                auditLog.Comments += $" | Parameters: {System.Text.Json.JsonSerializer.Serialize(parameters)}";
            }

            Logger.LogWarning("Performance issue detected: {Operation} took {Duration}ms", operationName, executionTimeMs);
            
            await AuditingStore.SaveAsync(auditLog);
        }
    }
}
