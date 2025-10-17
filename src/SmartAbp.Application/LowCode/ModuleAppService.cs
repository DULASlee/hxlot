using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Linq;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 🔥 低代码模块应用服务（Phase 2A - 后端SSOT）
    /// 实现接口: IModuleAppService
    /// 对应Controller: ModuleController
    /// 用途: 提供模块CRUD操作，支持完整元数据管理
    /// </summary>
    public class ModuleAppService :
        CrudAppService<
            LowCodeModule,
            ModuleDto,
            Guid,
            GetModulesInput,
            CreateOrUpdateModuleDto,
            CreateOrUpdateModuleDto>,
        IModuleAppService
    {
        private readonly IRepository<LowCodeEntity, Guid> _entityRepository;

        public ModuleAppService(
            IRepository<LowCodeModule, Guid> moduleRepository,
            IRepository<LowCodeEntity, Guid> entityRepository) : base(moduleRepository)
        {
            _entityRepository = entityRepository;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 查询操作
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取模块列表（分页）
        /// </summary>
        public override async Task<PagedResultDto<ModuleDto>> GetListAsync(GetModulesInput input)
        {
            var query = (await Repository.GetQueryableAsync())
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter),
                    x => x.SystemName.Contains(input.Filter!) ||
                         x.DisplayName.Contains(input.Filter!) ||
                         x.ModuleName.Contains(input.Filter!))
                .WhereIf(!string.IsNullOrWhiteSpace(input.Status),
                    x => x.Status == input.Status)
                .WhereIf(input.IsActive.HasValue,
                    x => x.IsActive == input.IsActive.Value);

            var totalCount = await AsyncExecuter.CountAsync(query);

            var items = await AsyncExecuter.ToListAsync(
                query.OrderBy(x => x.CreationTime)
                     .Skip(input.SkipCount)
                     .Take(input.MaxResultCount)
            );

            var dtos = ObjectMapper.Map<List<LowCodeModule>, List<ModuleDto>>(items);

            return new PagedResultDto<ModuleDto>(totalCount, dtos);
        }

        /// <summary>
        /// 根据ID获取模块（包含完整实体列表）
        /// </summary>
        public override async Task<ModuleDto> GetAsync(Guid id)
        {
            var module = await Repository.GetAsync(id);
            var dto = ObjectMapper.Map<LowCodeModule, ModuleDto>(module);

            // Phase 2A: 加载模块下的所有实体
            var entities = await _entityRepository.GetListAsync(x => x.ModuleId == id);
            dto.Entities = ObjectMapper.Map<List<LowCodeEntity>, List<EntityDefinitionDto>>(entities);

            return dto;
        }

        /// <summary>
        /// 根据系统名称获取模块
        /// </summary>
        public async Task<ModuleDto> GetBySystemNameAsync(string systemName)
        {
            var query = await Repository.GetQueryableAsync();
            var module = await AsyncExecuter.FirstOrDefaultAsync(
                query.Where(x => x.SystemName == systemName)
            );

            if (module == null)
            {
                throw new Volo.Abp.BusinessException($"Module with SystemName '{systemName}' not found.");
            }

            var dto = ObjectMapper.Map<LowCodeModule, ModuleDto>(module);

            // Phase 2A: 加载模块下的所有实体
            var entities = await _entityRepository.GetListAsync(x => x.ModuleId == module.Id);
            dto.Entities = ObjectMapper.Map<List<LowCodeEntity>, List<EntityDefinitionDto>>(entities);

            return dto;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CrudAppService基类已提供CRUD方法，无需重复实现：
        // - CreateAsync(CreateOrUpdateModuleDto input)
        // - UpdateAsync(Guid id, CreateOrUpdateModuleDto input)
        // - DeleteAsync(Guid id)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    }
}

