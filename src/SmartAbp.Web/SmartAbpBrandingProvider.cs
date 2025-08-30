using Volo.Abp.Ui.Branding;
using Volo.Abp.DependencyInjection;
using Microsoft.Extensions.Localization;
using SmartAbp.Localization;

namespace SmartAbp.Web;

[Dependency(ReplaceServices = true)]
public class SmartAbpBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<SmartAbpResource> _localizer;

    public SmartAbpBrandingProvider(IStringLocalizer<SmartAbpResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
