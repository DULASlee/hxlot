using SmartAbp.Samples;
using Xunit;

namespace SmartAbp.EntityFrameworkCore.Domains;

[Collection(SmartAbpTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<SmartAbpEntityFrameworkCoreTestModule>
{

}
