using System;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.SensorData
{
    public interface ISensorDataAppService :
        ICrudAppService<
            SensorDataDto,
            Guid,
            GetSensorDataListInput,
            CreateSensorDataDto,
            UpdateSensorDataDto>
    {
    }
}

