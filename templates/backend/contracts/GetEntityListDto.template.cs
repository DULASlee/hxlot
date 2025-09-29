/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"C#","handler":"None"}
 * TEMPLATE_DESCRIPTION: 为实体生成标准的GetList DTO，用于分页和排序查询。
 * USAGE_GUIDE:
 * 1. 替换 {{entityName}} 为实体名 (如 'Product')。
 */
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts
{
    public class Get{{entityName}}ListDto : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}
