using SmartAbp.Localization;
using Volo.Abp.AspNetCore.Mvc.UI.RazorPages;

namespace SmartAbp.Web.Pages;

public abstract class SmartAbpPageModel : AbpPageModel
{
    protected SmartAbpPageModel()
    {
        LocalizationResourceType = typeof(SmartAbpResource);
    }
}
