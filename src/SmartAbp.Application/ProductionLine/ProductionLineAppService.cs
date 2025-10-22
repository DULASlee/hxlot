using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Application.Contracts.ProductionLine;
using SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Application.ProductionLine
{
    /// <summary>
    /// 生产线应用服务实现
    /// 用途：完整的CRUD操作 + 分页查询 + 筛选排序
    /// 符合铁律4：后端持久化（100%完整实现）
    /// </summary>
    public class ProductionLineAppService :
        CrudAppService<
            Domain.Entities.MES.ProductionLine,
            ProductionLineDto,
            Guid,
            GetProductionLineListInput,
            CreateProductionLineDto,
            UpdateProductionLineDto>,
        IProductionLineAppService
    {
        // ══════════════════════════════════════════════════════
        // 依赖注入
        // ══════════════════════════════════════════════════════

        private readonly ILogger<ProductionLineAppService> _logger;

        public ProductionLineAppService(
            IRepository<Domain.Entities.MES.ProductionLine, Guid> repository,
            ILogger<ProductionLineAppService> logger)
            : base(repository)
        {
            _logger = logger;
        }

        // ══════════════════════════════════════════════════════
        // 查询方法（支持筛选、排序、分页）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 创建筛选查询
        /// </summary>
        protected override async Task<IQueryable<Domain.Entities.MES.ProductionLine>> CreateFilteredQueryAsync(
            GetProductionLineListInput input)
        {
            var query = await base.CreateFilteredQueryAsync(input);

            // 关键词筛选（名称、编号）
            if (!string.IsNullOrWhiteSpace(input.Filter))
            {
                query = query.Where(x =>
                    x.Name.Contains(input.Filter) ||
                    x.Code.Contains(input.Filter));
            }

            // 状态筛选
            if (!string.IsNullOrWhiteSpace(input.Status))
            {
                query = query.Where(x => x.Status == input.Status);
            }

            // 类型筛选
            if (!string.IsNullOrWhiteSpace(input.Type))
            {
                query = query.Where(x => x.Type == input.Type);
            }

            // 启用状态筛选
            if (input.IsEnabled.HasValue)
            {
                query = query.Where(x => x.IsEnabled == input.IsEnabled.Value);
            }

            return query;
        }

        // ══════════════════════════════════════════════════════
        // CRUD方法（继承自CrudAppService，已自动实现）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 获取列表（分页、筛选、排序）
        /// </summary>
        /// <remarks>
        /// 继承自CrudAppService，自动实现
        /// 支持：分页（SkipCount、MaxResultCount）、排序（Sorting）、筛选（Filter等）
        /// </remarks>
        public override async Task<PagedResultDto<ProductionLineDto>> GetListAsync(
            GetProductionLineListInput input)
        {
            _logger.LogInformation(
                "[ProductionLineAppService] 获取生产线列表，筛选: {Filter}, 状态: {Status}, 分页: {SkipCount}/{MaxResultCount}",
                input.Filter,
                input.Status,
                input.SkipCount,
                input.MaxResultCount
            );

            var result = await base.GetListAsync(input);

            _logger.LogInformation(
                "[ProductionLineAppService] 返回生产线列表，总数: {TotalCount}, 返回: {Count}",
                result.TotalCount,
                result.Items.Count
            );

            return result;
        }

        /// <summary>
        /// 根据ID获取详情
        /// </summary>
        /// <remarks>
        /// 继承自CrudAppService，自动实现
        /// </remarks>
        public override async Task<ProductionLineDto> GetAsync(Guid id)
        {
            _logger.LogInformation(
                "[ProductionLineAppService] 获取生产线详情，ID: {Id}",
                id
            );

            var result = await base.GetAsync(id);

            _logger.LogInformation(
                "[ProductionLineAppService] 返回生产线详情，名称: {Name}, 编号: {Code}",
                result.Name,
                result.Code
            );

            return result;
        }

        /// <summary>
        /// 创建生产线
        /// </summary>
        /// <remarks>
        /// 继承自CrudAppService，自动实现
        /// 自动调用AutoMapper映射 CreateDto → Entity
        /// 自动调用Repository.InsertAsync()落库
        /// </remarks>
        public override async Task<ProductionLineDto> CreateAsync(CreateProductionLineDto input)
        {
            _logger.LogInformation(
                "[ProductionLineAppService] 创建生产线，名称: {Name}, 编号: {Code}",
                input.Name,
                input.Code
            );

            var result = await base.CreateAsync(input);

            _logger.LogInformation(
                "[ProductionLineAppService] 生产线创建成功，ID: {Id}",
                result.Id
            );

            return result;
        }

        /// <summary>
        /// 更新生产线
        /// </summary>
        /// <remarks>
        /// 继承自CrudAppService，自动实现
        /// 自动调用AutoMapper映射 UpdateDto → Entity
        /// 自动调用Repository.UpdateAsync()落库
        /// </remarks>
        public override async Task<ProductionLineDto> UpdateAsync(Guid id, UpdateProductionLineDto input)
        {
            _logger.LogInformation(
                "[ProductionLineAppService] 更新生产线，ID: {Id}, 名称: {Name}",
                id,
                input.Name
            );

            var result = await base.UpdateAsync(id, input);

            _logger.LogInformation(
                "[ProductionLineAppService] 生产线更新成功，ID: {Id}",
                result.Id
            );

            return result;
        }

        /// <summary>
        /// 删除生产线
        /// </summary>
        /// <remarks>
        /// 继承自CrudAppService，自动实现
        /// 自动调用Repository.DeleteAsync()
        /// ABP默认是软删除（IsDeleted = true）
        /// </remarks>
        public override async Task DeleteAsync(Guid id)
        {
            _logger.LogInformation(
                "[ProductionLineAppService] 删除生产线，ID: {Id}",
                id
            );

            await base.DeleteAsync(id);

            _logger.LogInformation(
                "[ProductionLineAppService] 生产线删除成功，ID: {Id}",
                id
            );
        }
    }
}

