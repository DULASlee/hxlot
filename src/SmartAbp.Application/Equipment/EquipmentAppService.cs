using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Application.Contracts.Equipment;
using SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Application.Equipment
{
    public class EquipmentAppService :
        CrudAppService<
            Domain.Entities.MES.Equipment,
            EquipmentDto,
            Guid,
            GetEquipmentListInput,
            CreateEquipmentDto,
            UpdateEquipmentDto>,
        IEquipmentAppService
    {
        private readonly ILogger<EquipmentAppService> _logger;

        public EquipmentAppService(
            IRepository<Domain.Entities.MES.Equipment, Guid> repository,
            ILogger<EquipmentAppService> logger)
            : base(repository)
        {
            _logger = logger;
        }

        protected override async Task<IQueryable<Domain.Entities.MES.Equipment>> CreateFilteredQueryAsync(
            GetEquipmentListInput input)
        {
            var query = await base.CreateFilteredQueryAsync(input);

            if (!string.IsNullOrWhiteSpace(input.Filter))
            {
                query = query.Where(x =>
                    x.Name.Contains(input.Filter) ||
                    x.Code.Contains(input.Filter));
            }

            if (!string.IsNullOrWhiteSpace(input.Status))
            {
                query = query.Where(x => x.Status == input.Status);
            }

            if (!string.IsNullOrWhiteSpace(input.Type))
            {
                query = query.Where(x => x.Type == input.Type);
            }

            if (input.ProductionLineId.HasValue)
            {
                query = query.Where(x => x.ProductionLineId == input.ProductionLineId.Value);
            }

            if (input.IsEnabled.HasValue)
            {
                query = query.Where(x => x.IsEnabled == input.IsEnabled.Value);
            }

            if (input.IsOnline.HasValue)
            {
                query = query.Where(x => x.IsOnline == input.IsOnline.Value);
            }

            return query;
        }

        public override async Task<PagedResultDto<EquipmentDto>> GetListAsync(GetEquipmentListInput input)
        {
            _logger.LogInformation("[EquipmentAppService] 获取设备列表，筛选: {Filter}", input.Filter);
            return await base.GetListAsync(input);
        }

        public override async Task<EquipmentDto> CreateAsync(CreateEquipmentDto input)
        {
            _logger.LogInformation("[EquipmentAppService] 创建设备，名称: {Name}, 编号: {Code}", input.Name, input.Code);
            return await base.CreateAsync(input);
        }

        public override async Task<EquipmentDto> UpdateAsync(Guid id, UpdateEquipmentDto input)
        {
            _logger.LogInformation("[EquipmentAppService] 更新设备，ID: {Id}, 名称: {Name}", id, input.Name);
            return await base.UpdateAsync(id, input);
        }

        public override async Task DeleteAsync(Guid id)
        {
            _logger.LogInformation("[EquipmentAppService] 删除设备，ID: {Id}", id);
            await base.DeleteAsync(id);
        }
    }
}

