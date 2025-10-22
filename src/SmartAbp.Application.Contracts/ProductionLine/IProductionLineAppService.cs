using System;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.ProductionLine
{
    /// <summary>
    /// 生产线应用服务接口
    /// 用途：定义CRUD操作
    /// 符合铁律4：后端持久化
    /// </summary>
    public interface IProductionLineAppService :
        ICrudAppService<
            ProductionLineDto,
            Guid,
            GetProductionLineListInput,
            CreateProductionLineDto,
            UpdateProductionLineDto>
    {
    }
}

