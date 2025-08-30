using Volo.Abp.Settings;

namespace SmartAbp.Settings;

public class SmartAbpSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(SmartAbpSettings.MySetting1));
    }
}
