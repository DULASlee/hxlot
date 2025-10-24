using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.LowCode;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers
{
    /// <summary>
    /// 权限管理系统生成器API
    /// "吃自己的狗粮"示例
    /// </summary>
    [Route("api/permission-system-generator")]
    public class PermissionSystemGeneratorController : AbpControllerBase
    {
        private readonly PermissionSystemGenerator _permissionSystemGenerator;

        public PermissionSystemGeneratorController(PermissionSystemGenerator permissionSystemGenerator)
        {
            _permissionSystemGenerator = permissionSystemGenerator;
        }

        /// <summary>
        /// 🍽️ 吃自己的狗粮：生成权限管理系统
        /// </summary>
        /// <returns>生成结果</returns>
        [HttpPost("generate")]
        public async Task<PermissionSystemGenerationResult> GenerateAsync()
        {
            // 配置文件路径（相对于项目根目录）
            var configFilePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "..",
                "..",
                "config",
                "权限管理系统低代码配置.json"
            );

            // 确保文件存在
            if (!System.IO.File.Exists(configFilePath))
            {
                return new PermissionSystemGenerationResult
                {
                    Success = false,
                    ErrorMessage = $"配置文件不存在: {configFilePath}"
                };
            }

            // 调用生成器
            return await _permissionSystemGenerator.GenerateFromConfigFileAsync(configFilePath);
        }

        /// <summary>
        /// 从指定配置文件生成
        /// </summary>
        /// <param name="configPath">配置文件路径</param>
        /// <returns>生成结果</returns>
        [HttpPost("generate-from-file")]
        public async Task<PermissionSystemGenerationResult> GenerateFromFileAsync([FromQuery] string configPath)
        {
            // 确保文件存在
            if (!System.IO.File.Exists(configPath))
            {
                return new PermissionSystemGenerationResult
                {
                    Success = false,
                    ErrorMessage = $"配置文件不存在: {configPath}"
                };
            }

            // 调用生成器
            return await _permissionSystemGenerator.GenerateFromConfigFileAsync(configPath);
        }
    }
}

