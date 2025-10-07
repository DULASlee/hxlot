using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Services;
using Volo.Abp.EventBus.Local;
using Volo.Abp.Settings;

namespace {{Namespace}}.Services
{
    /// <summary>
    /// {{Description}}
    /// </summary>
    public class {{SettingsGroupName}}SettingsService : DomainService, ITransientDependency
    {
        protected ISettingProvider SettingProvider { get; }
        protected ISettingManager SettingManager { get; }
        protected ILocalEventBus LocalEventBus { get; }

        public {{SettingsGroupName}}SettingsService(
            ISettingProvider settingProvider,
            ISettingManager settingManager,
            ILocalEventBus localEventBus)
        {
            SettingProvider = settingProvider;
            SettingManager = settingManager;
            LocalEventBus = localEventBus;
        }
{{SettingsMethods}}
    }

    /// <summary>
    /// 设置变更事件数据
    /// </summary>
    public class SettingChangeEventData
    {
        public string SettingName { get; set; } = null!;
        public string? NewValue { get; set; }
        public Guid? TenantId { get; set; }
        public Guid? UserId { get; set; }

        public SettingChangeEventData(string settingName, string? newValue, Guid? tenantId = null, Guid? userId = null)
        {
            SettingName = settingName;
            NewValue = newValue;
            TenantId = tenantId;
            UserId = userId;
        }
    }
}
