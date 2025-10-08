using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using SmartAbp.CodeGenerator.Dtos;

namespace SmartAbp.Application.CodeGenerator
{
    /// <summary>
    /// 用户配置服务
    /// </summary>
    public class UserProfileAppService : ApplicationService
    {
        private readonly IRepository<SmartAbp.CodeGenerator.UserProfile, Guid> _profileRepository;
        private readonly ICurrentUser _currentUser;
        
        public UserProfileAppService(
            IRepository<SmartAbp.CodeGenerator.UserProfile, Guid> profileRepository,
            ICurrentUser currentUser)
        {
            _profileRepository = profileRepository;
            _currentUser = currentUser;
        }
        
        /// <summary>
        /// 获取当前用户配置
        /// </summary>
        public virtual async Task<UserProfileDto> GetMyProfileAsync()
        {
            // ✅ 处理用户未登录的情况，返回默认配置
            if (!_currentUser.IsAuthenticated)
            {
                return new UserProfileDto
                {
                    Industry = null,
                    CompanyName = null,
                    CompanySize = null,
                    LastUsedMode = null,
                    IsFirstVisit = true
                };
            }
            
            var userId = _currentUser.GetId();
            var queryable = await _profileRepository.GetQueryableAsync();
            var profile = queryable.FirstOrDefault(x => x.UserId == userId);
            
            if (profile == null)
            {
                // 首次访问，创建初始配置
                profile = new SmartAbp.CodeGenerator.UserProfile(GuidGenerator.Create(), userId);
                await _profileRepository.InsertAsync(profile);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            
            return ObjectMapper.Map<SmartAbp.CodeGenerator.UserProfile, UserProfileDto>(profile);
        }
        
        /// <summary>
        /// 更新当前用户配置
        /// </summary>
        public virtual async Task<UserProfileDto> UpdateMyProfileAsync(UpdateUserProfileDto input)
        {
            // ✅ 处理用户未登录的情况，返回默认配置
            if (!_currentUser.IsAuthenticated)
            {
                return new UserProfileDto
                {
                    Industry = input.Industry,
                    CompanyName = input.CompanyName,
                    CompanySize = input.CompanySize,
                    LastUsedMode = input.LastUsedMode,
                    IsFirstVisit = false
                };
            }
            
            var userId = _currentUser.GetId();
            var queryable = await _profileRepository.GetQueryableAsync();
            var profile = queryable.FirstOrDefault(x => x.UserId == userId);
            
            if (profile == null)
            {
                profile = new SmartAbp.CodeGenerator.UserProfile(GuidGenerator.Create(), userId);
                await _profileRepository.InsertAsync(profile);
            }
            
            profile.Industry = input.Industry;
            profile.CompanyName = input.CompanyName;
            profile.CompanySize = input.CompanySize;
            
            if (!string.IsNullOrEmpty(input.LastUsedMode))
            {
                profile.UpdateLastUsedMode(input.LastUsedMode);
            }
            
            profile.MarkAsVisited();
            
            await _profileRepository.UpdateAsync(profile);
            await CurrentUnitOfWork.SaveChangesAsync();
            
            return ObjectMapper.Map<SmartAbp.CodeGenerator.UserProfile, UserProfileDto>(profile);
        }
        
        /// <summary>
        /// 获取行业推荐
        /// </summary>
        public virtual async Task<IndustryRecommendationDto> GetIndustryRecommendationAsync()
        {
            // ✅ 处理用户未登录的情况，返回null
            if (!_currentUser.IsAuthenticated)
            {
                return null;
            }
            
            var userId = _currentUser.GetId();
            var queryable = await _profileRepository.GetQueryableAsync();
            var profile = queryable.FirstOrDefault(x => x.UserId == userId);
            
            if (profile?.Industry == null)
            {
                return null;
            }
            
            return profile.Industry switch
            {
                "manufacturing" => new IndustryRecommendationDto
                {
                    Template = "saas-mes",
                    Name = "SaaS云MES系统",
                    Reason = "检测到您的企业是制造业",
                    Benefits = "30分钟生成完整MES系统，包含生产管理、设备监控、质量追溯、移动报工APP和实时监控大屏"
                },
                "construction" => new IndustryRecommendationDto
                {
                    Template = "smart-construction",
                    Name = "智慧工地管理系统",
                    Reason = "检测到您的企业是建筑施工业",
                    Benefits = "1小时生成智慧工地平台，包含人员管理、安全监控、进度管理、环境监测、移动APP和数字大屏"
                },
                _ => null
            };
        }
    }
}

