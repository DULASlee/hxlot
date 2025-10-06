using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using SmartAbp.Application.CodeGenerator;
using SmartAbp.CodeGenerator.Dtos;

namespace SmartAbp.HttpApi.Controllers
{
    /// <summary>
    /// 用户配置API
    /// </summary>
    [Route("api/code-gen/user-profile")]
    [ApiController]
    public class UserProfileController : AbpControllerBase
    {
        private readonly UserProfileAppService _profileAppService;
        
        public UserProfileController(UserProfileAppService profileAppService)
        {
            _profileAppService = profileAppService;
        }
        
        /// <summary>
        /// 获取当前用户配置
        /// </summary>
        [HttpGet("my")]
        public async Task<UserProfileDto> GetMyProfile()
        {
            return await _profileAppService.GetMyProfileAsync();
        }
        
        /// <summary>
        /// 更新当前用户配置
        /// </summary>
        [HttpPut("my")]
        public async Task<UserProfileDto> UpdateMyProfile([FromBody] UpdateUserProfileDto input)
        {
            return await _profileAppService.UpdateMyProfileAsync(input);
        }
        
        /// <summary>
        /// 获取行业推荐
        /// </summary>
        [HttpGet("recommendation")]
        public async Task<IndustryRecommendationDto> GetRecommendation()
        {
            return await _profileAppService.GetIndustryRecommendationAsync();
        }
    }
}

