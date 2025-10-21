using System;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.LowCode
{
    /// <summary>
    /// Layer2 (SmartStudio Lite) - 应用服务接口
    /// 提供渐进式用户体验：基本信息 → 字段配置 → 生成代码
    /// </summary>
    public interface ISmartStudioLiteAppService : IApplicationService
    {
        /// <summary>
        /// 创建模块（简化模式）
        /// 一次性提交：基本信息 + 字段配置列表
        /// </summary>
        /// <param name="input">简化的模块创建输入</param>
        /// <returns>创建结果（包含ModuleId、EntityId、SessionId）</returns>
        Task<SimplifiedModuleCreationResultDto> CreateModuleAsync(SimplifiedModuleCreationDto input);

        /// <summary>
        /// 预览将要生成的文件列表
        /// 用于在生成前让用户确认
        /// </summary>
        /// <param name="input">简化的模块创建输入</param>
        /// <returns>文件列表</returns>
        Task<ListResultDto<string>> PreviewGeneratedFilesAsync(SimplifiedModuleCreationDto input);

        /// <summary>
        /// 验证模块配置
        /// 检查命名冲突、字段配置合法性等
        /// </summary>
        /// <param name="input">简化的模块创建输入</param>
        /// <returns>验证结果</returns>
        Task<ValidationResultDto> ValidateModuleConfigurationAsync(SimplifiedModuleCreationDto input);
    }

    /// <summary>
    /// 验证结果DTO
    /// </summary>
    public class ValidationResultDto
    {
        /// <summary>
        /// 是否有效
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// 错误列表
        /// </summary>
        public ListResultDto<ValidationErrorDto> Errors { get; set; } = new();
    }

    /// <summary>
    /// 验证错误DTO
    /// </summary>
    public class ValidationErrorDto
    {
        /// <summary>
        /// 字段名称
        /// </summary>
        public string Field { get; set; }

        /// <summary>
        /// 错误消息
        /// </summary>
        public string Message { get; set; }
    }
}

