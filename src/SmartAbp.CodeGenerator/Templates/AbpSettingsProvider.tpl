{{UsingStatements}}
using Volo.Abp.Settings;

namespace {{Namespace}}.Settings
{
    /// <summary>
    /// {{Description}}
    /// </summary>
    public class {{SettingsGroupName}}SettingDefinitionProvider : SettingDefinitionProvider
    {
        public override void Define(ISettingDefinitionContext context)
        {
            // {{SettingsGroupName}} Settings Group
            var {{SettingsGroupName.ToLower()}}Group = context.GetOrAddGroup("{{SettingsGroupName}}");
            
            {{SettingsDefinitions}}
        }

        private static LocalizableString L(string name)
        {
            return LocalizableString.Create<{{SettingsGroupName}}Resource>(name);
        }
    }

    /// <summary>
    /// {{SettingsGroupName}} 设置常量
    /// </summary>
    public static class {{SettingsGroupName}}Settings
    {
        /// <summary>
        /// 设置组名称
        /// </summary>
        public const string GroupName = "{{SettingsGroupName}}";
{{SettingsProperties}}
    }
}
