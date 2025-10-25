using System;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.CodeGeneration.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.CodeGeneration
{
    /// <summary>
    /// 代码生成应用服务接口
    /// </summary>
    public interface ICodeGenerationAppService : IApplicationService
    {
        /// <summary>
        /// 获取任务列表
        /// </summary>
        Task<PagedResultDto<CodeGenerationTaskDto>> GetListAsync(PagedAndSortedResultRequestDto input);

        /// <summary>
        /// 获取单个任务
        /// </summary>
        Task<CodeGenerationTaskDto> GetAsync(Guid id);

        /// <summary>
        /// 生成MES大屏
        /// </summary>
        Task<CodeGenerationResultDto> GenerateMESDashboardAsync(MESGeneratorConfigDto config);

        /// <summary>
        /// 生成UniApp移动应用
        /// </summary>
        Task<CodeGenerationResultDto> GenerateUniAppAsync(UniAppGeneratorConfigDto config);

        /// <summary>
        /// 删除任务
        /// </summary>
        Task DeleteAsync(Guid id);

        /// <summary>
        /// 测试数据库连接
        /// </summary>
        Task<DatabaseConnectionTestResultDto> TestDatabaseConnectionAsync(DatabaseConnectionRequestDto request);

        /// <summary>
        /// 数据库内省（获取表结构）
        /// </summary>
        Task<DatabaseSchemaDto> IntrospectDatabaseAsync(DatabaseIntrospectionRequestDto request);

        /// <summary>
        /// 获取UI配置
        /// </summary>
        Task<EntityUIConfigDto> GetUiConfigAsync(string module, string entity);

        /// <summary>
        /// 保存UI配置
        /// </summary>
        Task SaveUiConfigAsync(string module, string entity, EntityUIConfigDto config);
    }
}

