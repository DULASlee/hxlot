using System;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.Equipment
{
    public interface IEquipmentAppService :
        ICrudAppService<
            EquipmentDto,
            Guid,
            GetEquipmentListInput,
            CreateEquipmentDto,
            UpdateEquipmentDto>
    {
    }
}

