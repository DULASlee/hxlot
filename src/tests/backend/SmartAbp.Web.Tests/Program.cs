using Microsoft.AspNetCore.Builder;
using SmartAbp;
using Volo.Abp.AspNetCore.TestBase;

var builder = WebApplication.CreateBuilder();
builder.Environment.ContentRootPath = GetWebProjectContentRootPathHelper.Get("SmartAbp.Web.csproj"); 
await builder.RunAbpModuleAsync<SmartAbpWebTestModule>(applicationName: "SmartAbp.Web");

public partial class Program
{
}
