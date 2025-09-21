using SmartAbp.Localization;

namespace SmartAbp;

/* Inherit your application services from this class.
 */
public abstract class SmartAbpAppService
{
    protected SmartAbpAppService()
    {
        // LocalizationResource = typeof(SmartAbpResource);
    }
}
