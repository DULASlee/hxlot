using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
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

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🚀 Portal入口页面扩展方法（Task 4: 增量实现）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取最近访问的模块（复用LastModificationTime排序）
        /// </summary>
        public async Task<List<ModuleDto>> GetRecentModulesAsync(int count = 5)
        {
            var query = (await Repository.GetQueryableAsync())
                .Where(x => x.IsActive) // 只返回激活的模块
                .OrderByDescending(x => x.LastModificationTime) // 按最后修改时间倒序
                .Take(count);

            var modules = await AsyncExecuter.ToListAsync(query);
            var dtos = ObjectMapper.Map<List<LowCodeModule>, List<ModuleDto>>(modules);

            // 加载每个模块的实体数量
            foreach (var dto in dtos)
            {
                var entityCount = await _entityRepository.CountAsync(x => x.ModuleId == dto.Id);
                dto.Entities = null; // 不加载完整实体列表，只设置数量
                // 注意：EntityCount字段需要在前端动态展示
            }

            return dtos;
        }

        /// <summary>
        /// 记录用户入口选择（Task 4: 暂时简单记录，后续可扩展到数据库）
        /// </summary>
        public async Task RecordUserChoiceAsync(string choice)
        {
            // Phase 1实现：简单日志记录
            // Phase 2实现：可扩展为数据库存储（新增UserChoiceStatistic表）

            if (string.IsNullOrEmpty(choice))
            {
                throw new Volo.Abp.BusinessException("Choice不能为空");
            }

            var validChoices = new[] { "layer1", "layer2", "layer3" };
            if (!validChoices.Contains(choice.ToLower()))
            {
                throw new Volo.Abp.BusinessException($"Choice必须是以下之一: {string.Join(", ", validChoices)}");
            }

            Logger.LogInformation($"📊 用户选择记录 | Choice: {choice} | UserId: {CurrentUser.Id} | Time: {DateTime.UtcNow}");

            // TODO Phase 2: 存储到数据库
            // await _choiceStatisticRepository.InsertAsync(new UserChoiceStatistic(choice, CurrentUser.Id));

            await Task.CompletedTask;
        }

        /// <summary>
        /// 获取用户选择统计（Task 4: 暂时返回模拟数据，后续可扩展）
        /// </summary>
        public async Task<UserChoiceStatsDto> GetUserChoiceStatisticsAsync()
        {
            // Phase 1实现：基于现有Module数据的统计
            var query = await Repository.GetQueryableAsync();
            var totalModules = await AsyncExecuter.CountAsync(query);
            var activeModules = await AsyncExecuter.CountAsync(query.Where(x => x.IsActive));

            var today = DateTime.UtcNow.Date;
            var todayNewModules = await AsyncExecuter.CountAsync(
                query.Where(x => x.CreationTime >= today)
            );

            // Phase 1：暂时返回均匀分布的模拟数据
            // Phase 2：可扩展为从UserChoiceStatistic表统计真实数据
            return new UserChoiceStatsDto
            {
                Layer1Percentage = 45.0, // 暂时模拟：Layer1使用最多
                Layer2Percentage = 35.0, // 暂时模拟：Layer2次之
                Layer3Percentage = 20.0, // 暂时模拟：Layer3最少
                TotalModules = totalModules,
                ActiveModules = activeModules,
                TodayNewModules = todayNewModules
            };

            // TODO Phase 2实现真实统计：
            // var layer1Count = await _choiceStatisticRepository.CountAsync(x => x.Choice == "layer1");
            // var layer2Count = await _choiceStatisticRepository.CountAsync(x => x.Choice == "layer2");
            // var layer3Count = await _choiceStatisticRepository.CountAsync(x => x.Choice == "layer3");
            // var total = layer1Count + layer2Count + layer3Count;
            // return new UserChoiceStatsDto
            // {
            //     Layer1Percentage = total > 0 ? (layer1Count * 100.0 / total) : 0,
            //     Layer2Percentage = total > 0 ? (layer2Count * 100.0 / total) : 0,
            //     Layer3Percentage = total > 0 ? (layer3Count * 100.0 / total) : 0,
            //     ...
            // };
        }
    }
}

