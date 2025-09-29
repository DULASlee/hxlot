/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"C#","handler":"None"}
 * TEMPLATE_DESCRIPTION: 为实体生成标准的CRUD应用服务接口。
 * USAGE_GUIDE:
 * 1. 替换 {{entityName}} 为实体名 (如 'Product')。
 * 2. 替换 {{primaryKeyType}} 为主键类型 (如 'Guid')。
 */
using System;
using Volo.Abp.Application.Services;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts
{
    public interface I{{entityName}}AppService :
        ICrudAppService<
            {{entityName}}Dto,
            {{primaryKeyType}},
            Get{{entityName}}ListDto,
            {{entityName}}CreateDto,
            {{entityName}}UpdateDto>
    {
    }
}
