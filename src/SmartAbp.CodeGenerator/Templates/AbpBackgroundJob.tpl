using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;

namespace {{Namespace}}
{
    /// <summary>
    /// {{Description}}
    /// </summary>
{{JobAttributes}}
    public class {{JobName}} : AsyncBackgroundJob<{{ArgsType}}>, ITransientDependency
    {
{{Dependencies}}
        public {{JobName}}(ILogger<{{JobName}}> logger{{ConstructorParams}})
            : base(logger)
        {
{{ConstructorAssignments}}
        }

        public override async Task ExecuteAsync({{ArgsType}} args)
        {
{{ExecuteCode}}

            await Task.CompletedTask;
        }
    }
}

