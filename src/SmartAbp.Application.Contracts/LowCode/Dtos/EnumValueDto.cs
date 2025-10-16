using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 枚举值DTO（与前端UnifiedEnumValue一致）
    /// </summary>
    public class EnumValueDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string StringValue { get; set; }
        public int? IntValue { get; set; }
    }
}


