using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 代码生成器AppService的部分类实现 - 会话状态方法
    /// </summary>
    public partial class CodeGenerationAppService
    {
        /// <summary>
        /// 获取代码生成状态
        /// </summary>
        public Task<GenerationStatusDto> GetGenerationStatusAsync(string sessionId)
        {
            try
            {
                var status = CodeGenerationExtensions.GetGenerationStatus(sessionId);
                return Task.FromResult(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取生成状态失败 - SessionId: {SessionId}", sessionId);
                throw new UserFriendlyException($"获取生成状态失败: {ex.Message}");
            }
        }
        
        /// <summary>
        /// 导出生成的代码
        /// </summary>
        public Task<ZipPackageDto> ExportGeneratedCodeAsync(string sessionId)
        {
            try
            {
                var zipPackage = CodeGenerationExtensions.CreateZipPackage(sessionId);
                return Task.FromResult(zipPackage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "导出生成代码失败 - SessionId: {SessionId}", sessionId);
                throw new UserFriendlyException($"导出生成代码失败: {ex.Message}");
            }
        }
    }
}
