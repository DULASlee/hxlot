using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Linq;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 🔥 低代码模块应用服务（Phase 2A）
    /// 对应Controller: ModuleController
    /// 用途: 提供模块CRUD操作，支持完整元数据管理
    /// </summary>
    public class ModuleAppService : ApplicationService
    {
        private readonly IRepository<LowCodeModule, Guid> _moduleRepository;
        private readonly IRepository<LowCodeEntity, Guid> _entityRepository;

        public ModuleAppService(
            IRepository<LowCodeModule, Guid> moduleRepository,
            IRepository<LowCodeEntity, Guid> entityRepository)
        {
            _moduleRepository = moduleRepository;
            _entityRepository = entityRepository;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 查询操作
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取模块列表（分页）
        /// </summary>
        public async Task<PagedResultDto<ModuleDto>> GetListAsync(GetModulesInput input)
        {
            var query = (await _moduleRepository.GetQueryableAsync())
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
        public async Task<ModuleDto> GetAsync(Guid id)
        {
            var module = await _moduleRepository.GetAsync(id);
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
            var query = await _moduleRepository.GetQueryableAsync();
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
        // 增删改操作
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 创建模块
        /// </summary>
        public async Task<ModuleDto> CreateAsync(CreateOrUpdateModuleDto input)
        {
            var module = new LowCodeModule(
                GuidGenerator.Create(),
                input.SystemName,
                input.ModuleName,
                input.DisplayName,
                input.Namespace)
            {
                Description = input.Description,
                Version = input.Version,
                ArchitectureConfig = input.ArchitectureConfig,
                FrontendConfig = input.FrontendConfig,
                CodeGenOptions = input.CodeGenOptions,
                Status = input.Status,
                IsActive = input.IsActive
            };

            await _moduleRepository.InsertAsync(module);
            await CurrentUnitOfWork!.SaveChangesAsync();

            return ObjectMapper.Map<LowCodeModule, ModuleDto>(module);
        }

        /// <summary>
        /// 更新模块
        /// </summary>
        public async Task<ModuleDto> UpdateAsync(Guid id, CreateOrUpdateModuleDto input)
        {
            var module = await _moduleRepository.GetAsync(id);

            module.SystemName = input.SystemName;
            module.ModuleName = input.ModuleName;
            module.DisplayName = input.DisplayName;
            module.Description = input.Description;
            module.Namespace = input.Namespace;
            module.Version = input.Version;
            module.ArchitectureConfig = input.ArchitectureConfig;
            module.FrontendConfig = input.FrontendConfig;
            module.CodeGenOptions = input.CodeGenOptions;
            module.Status = input.Status;
            module.IsActive = input.IsActive;

            await _moduleRepository.UpdateAsync(module);
            await CurrentUnitOfWork!.SaveChangesAsync();

            return ObjectMapper.Map<LowCodeModule, ModuleDto>(module);
        }

        /// <summary>
        /// 删除模块
        /// </summary>
        public async Task DeleteAsync(Guid id)
        {
            await _moduleRepository.DeleteAsync(id);
        }
    }
}

