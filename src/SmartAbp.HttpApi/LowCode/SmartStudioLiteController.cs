using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.HttpApi.LowCode
{
    /// <summary>
    /// Layer2 (SmartStudio Lite) - 控制器
    /// API路径: /api/lowcode/smart-studio-lite
    /// </summary>
    [RemoteService(Name = "Default")]
    [Area("lowcode")]
    [Route("api/lowcode/smart-studio-lite")]
    public class SmartStudioLiteController : AbpControllerBase, ISmartStudioLiteAppService
    {
        private readonly ISmartStudioLiteAppService _smartStudioLiteAppService;

        public SmartStudioLiteController(ISmartStudioLiteAppService smartStudioLiteAppService)
        {
            _smartStudioLiteAppService = smartStudioLiteAppService;
        }

        /// <summary>
        /// 创建模块（简化模式）
        /// POST /api/lowcode/smart-studio-lite/create-module
        /// </summary>
        /// <param name="input">简化的模块创建输入</param>
        /// <returns>创建结果</returns>
        [HttpPost("create-module")]
        public Task<SimplifiedModuleCreationResultDto> CreateModuleAsync(SimplifiedModuleCreationDto input)
        {
            return _smartStudioLiteAppService.CreateModuleAsync(input);
        }

        /// <summary>
        /// 预览将要生成的文件列表
        /// POST /api/lowcode/smart-studio-lite/preview-files
        /// </summary>
        /// <param name="input">简化的模块创建输入</param>
        /// <returns>文件列表</returns>
        [HttpPost("preview-files")]
        public Task<ListResultDto<string>> PreviewGeneratedFilesAsync(SimplifiedModuleCreationDto input)
        {
            return _smartStudioLiteAppService.PreviewGeneratedFilesAsync(input);
        }

        /// <summary>
        /// 验证模块配置
        /// POST /api/lowcode/smart-studio-lite/validate
        /// </summary>
        /// <param name="input">简化的模块创建输入</param>
        /// <returns>验证结果</returns>
        [HttpPost("validate")]
        public Task<ValidationResultDto> ValidateModuleConfigurationAsync(SimplifiedModuleCreationDto input)
        {
            return _smartStudioLiteAppService.ValidateModuleConfigurationAsync(input);
        }
    }
}

