using Xunit;

namespace SmartAbp.EntityFrameworkCore;

[CollectionDefinition(SmartAbpTestConsts.CollectionDefinitionName)]
public class SmartAbpEntityFrameworkCoreCollection : ICollectionFixture<SmartAbpEntityFrameworkCoreFixture>
{

}
