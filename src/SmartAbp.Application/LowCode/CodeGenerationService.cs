using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.LowCode.Validation;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 低代码一键生成门面：按实体ID聚合配置 → 校验 → 调用DevKit代码生成引擎
    /// 重构版本：使用DevKit解耦架构
    /// </summary>
    public class CodeGenerationService : ApplicationService
    {
        private readonly IRepository<LowCodeEntity, Guid> _entityRepo;
        private readonly IRepository<LowCodeProperty, Guid> _propRepo;
        private readonly IRepository<LowCodePageConfig, Guid> _pageRepo;
        private readonly ICodeGenerator _codeGenerator;
        private readonly PageConfigValidator _validator;

        public CodeGenerationService(
            IRepository<LowCodeEntity, Guid> entityRepo,
            IRepository<LowCodeProperty, Guid> propRepo,
            IRepository<LowCodePageConfig, Guid> pageRepo,
            ICodeGenerator codeGenerator,
            PageConfigValidator validator)
        {
            _entityRepo = entityRepo;
            _propRepo = propRepo;
            _pageRepo = pageRepo;
            _codeGenerator = codeGenerator;
            _validator = validator;
        }

        public async Task<GenerationResult> GenerateAsync(Guid entityId)
        {
            var entity = await _entityRepo.GetAsync(entityId);
            var props = await _propRepo.GetListAsync(p => p.EntityId == entityId);
            var pages = await _pageRepo.GetListAsync(p => p.EntityId == entityId);

            // 1) 页面配置体检
            foreach (var page in pages)
            {
                var check = _validator.Validate(page.PageConfig, props);
                if (!check.IsValid)
                {
                    var message = string.Join("; ", check.Errors);
                    throw new Volo.Abp.UserFriendlyException($"页面配置不合法：{message}");
                }
            }

            // 2) 使用DevKit解耦架构进行代码生成
            var generationInput = new GenerationInput
            {
                EntityId = entityId,
                Options = new GenerationOptions
                {
                    GenerateDomain = true,
                    GenerateApplication = true,
                    GenerateFrontend = true,
                    NamespacePrefix = "SmartAbp",
                    OutputBasePath = "src/"
                }
            };

            // 3) 调用DevKit代码生成器
            var result = await _codeGenerator.GenerateAsync(generationInput);

            Logger.LogInformation("代码生成完成: EntityId={EntityId}, Success={Success}, FileCount={FileCount}",
                entityId, result.Success, result.GeneratedFiles.Count);

            return result;
        }
    }
}


