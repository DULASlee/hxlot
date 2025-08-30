using SmartAbp.Samples;
using Xunit;

namespace SmartAbp.EntityFrameworkCore.Applications;

[Collection(SmartAbpTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<SmartAbpEntityFrameworkCoreTestModule>
{

}
