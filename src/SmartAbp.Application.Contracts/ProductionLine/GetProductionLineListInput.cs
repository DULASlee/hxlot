using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.ProductionLine
{
    /// <summary>
    /// 获取生产线列表输入参数
    /// 用途：分页查询、筛选、排序
    /// 符合铁律5：DTO一致性
    /// </summary>
    public class GetProductionLineListInput : PagedAndSortedResultRequestDto
    {
        /// <summary>
        /// 筛选关键词（搜索名称、编号）
        /// </summary>
        public string Filter { get; set; }

        /// <summary>
        /// 状态筛选（running、stopped、maintenance）
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// 类型筛选
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// 是否启用筛选
        /// </summary>
        public bool? IsEnabled { get; set; }
    }
}

