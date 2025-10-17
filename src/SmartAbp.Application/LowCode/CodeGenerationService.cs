using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using SmartAbp.Application.LowCode.Validation;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 低代码一键生成门面：按实体ID聚合配置 → 校验 → 调用增量生成引擎
    /// </summary>
    public class CodeGenerationService : ApplicationService
    {
        private readonly IRepository<LowCodeEntity, Guid> _entityRepo;
        private readonly IRepository<LowCodeProperty, Guid> _propRepo;
        private readonly IRepository<LowCodePageConfig, Guid> _pageRepo;
        private readonly IIncrementalCodeGenerationService _incGen;
        private readonly PageConfigValidator _validator;

        public CodeGenerationService(
            IRepository<LowCodeEntity, Guid> entityRepo,
            IRepository<LowCodeProperty, Guid> propRepo,
            IRepository<LowCodePageConfig, Guid> pageRepo,
            IIncrementalCodeGenerationService incGen,
            PageConfigValidator validator)
        {
            _entityRepo = entityRepo;
            _propRepo = propRepo;
            _pageRepo = pageRepo;
            _incGen = incGen;
            _validator = validator;
        }

        public async Task<IncrementalCodeGenerationResult> GenerateAsync(Guid entityId)
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

            // 2) 组装元数据（最小可行：将四张表聚合为一个JSON，供生成器使用）
            var metadata = new
            {
                entity,
                properties = props.OrderBy(p => p.DisplayOrder).ToList(),
                pages = pages.OrderBy(p => p.PageType).ToList()
            };
            var metadataJson = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            // 3) 调用增量生成服务（路径按实际工程配置调整）
            var request = new IncrementalCodeGenerationRequest
            {
                ModuleName = entity.Name,
                OutputPath = "generated-output", // 可改为配置项
                TemplatesPath = "templates",      // 可改为配置项
                MetadataJson = metadataJson,
                ConfigurationPath = null,
                EnableValidation = true,
                EnableOptimization = true
            };

            var result = await _incGen.GenerateAsync(request);
            return result;
        }
    }
}


