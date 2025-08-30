using SmartAbp.Localization;
using Volo.Abp.Application.Services;

namespace SmartAbp;

/* Inherit your application services from this class.
 */
public abstract class SmartAbpAppService : ApplicationService
{
    protected SmartAbpAppService()
    {
        LocalizationResource = typeof(SmartAbpResource);
    }
}
