using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Application.Contracts.SensorData;
using SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Application.SensorData
{
    public class SensorDataAppService :
        CrudAppService<
            Domain.Entities.MES.SensorData,
            SensorDataDto,
            Guid,
            GetSensorDataListInput,
            CreateSensorDataDto,
            UpdateSensorDataDto>,
        ISensorDataAppService
    {
        private readonly ILogger<SensorDataAppService> _logger;

        public SensorDataAppService(
            IRepository<Domain.Entities.MES.SensorData, Guid> repository,
            ILogger<SensorDataAppService> logger)
            : base(repository)
        {
            _logger = logger;
        }

        protected override async Task<IQueryable<Domain.Entities.MES.SensorData>> CreateFilteredQueryAsync(
            GetSensorDataListInput input)
        {
            var query = await base.CreateFilteredQueryAsync(input);

            if (!string.IsNullOrWhiteSpace(input.Filter))
            {
                query = query.Where(x =>
                    x.SensorName.Contains(input.Filter) ||
                    x.SensorCode.Contains(input.Filter));
            }

            if (!string.IsNullOrWhiteSpace(input.SensorType))
            {
                query = query.Where(x => x.SensorType == input.SensorType);
            }

            if (input.ProductionLineId.HasValue)
            {
                query = query.Where(x => x.ProductionLineId == input.ProductionLineId.Value);
            }

            if (input.EquipmentId.HasValue)
            {
                query = query.Where(x => x.EquipmentId == input.EquipmentId.Value);
            }

            if (input.IsAlarm.HasValue)
            {
                query = query.Where(x => x.IsAlarm == input.IsAlarm.Value);
            }

            if (input.StartTime.HasValue)
            {
                query = query.Where(x => x.Timestamp >= input.StartTime.Value);
            }

            if (input.EndTime.HasValue)
            {
                query = query.Where(x => x.Timestamp <= input.EndTime.Value);
            }

            return query;
        }

        public override async Task<PagedResultDto<SensorDataDto>> GetListAsync(GetSensorDataListInput input)
        {
            _logger.LogInformation("[SensorDataAppService] 获取传感器数据列表，筛选: {Filter}", input.Filter);
            return await base.GetListAsync(input);
        }

        public override async Task<SensorDataDto> CreateAsync(CreateSensorDataDto input)
        {
            _logger.LogInformation("[SensorDataAppService] 创建传感器数据，传感器: {SensorName}", input.SensorName);
            return await base.CreateAsync(input);
        }

        public override async Task<SensorDataDto> UpdateAsync(Guid id, UpdateSensorDataDto input)
        {
            _logger.LogInformation("[SensorDataAppService] 更新传感器数据，ID: {Id}", id);
            return await base.UpdateAsync(id, input);
        }

        public override async Task DeleteAsync(Guid id)
        {
            _logger.LogInformation("[SensorDataAppService] 删除传感器数据，ID: {Id}", id);
            await base.DeleteAsync(id);
        }
    }
}

