using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using SmartAbp.CodeGenerator.Dtos;

namespace SmartAbp.Application.CodeGenerator
{
    /// <summary>
    /// 生成历史服务
    /// </summary>
    public class GenerationHistoryAppService : ApplicationService
    {
        private readonly IRepository<SmartAbp.CodeGenerator.GenerationHistory, Guid> _historyRepository;
        private readonly IRepository<SmartAbp.CodeGenerator.CodeGenStat, Guid> _statsRepository;
        private readonly ICurrentUser _currentUser;
        
        public GenerationHistoryAppService(
            IRepository<SmartAbp.CodeGenerator.GenerationHistory, Guid> historyRepository,
            IRepository<SmartAbp.CodeGenerator.CodeGenStat, Guid> statsRepository,
            ICurrentUser currentUser)
        {
            _historyRepository = historyRepository;
            _statsRepository = statsRepository;
            _currentUser = currentUser;
        }
        
        /// <summary>
        /// 获取最近的项目列表
        /// </summary>
        public virtual async Task<List<GenerationHistoryDto>> GetRecentProjectsAsync(int limit = 5)
        {
            var userId = _currentUser.GetId();
            
            var queryable = await _historyRepository.GetQueryableAsync();
            var histories = queryable
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreationTime)
                .Take(limit)
                .ToList();
                
            return ObjectMapper.Map<List<SmartAbp.CodeGenerator.GenerationHistory>, List<GenerationHistoryDto>>(histories);
        }
        
        /// <summary>
        /// 获取所有项目列表（分页）
        /// </summary>
        public virtual async Task<List<GenerationHistoryDto>> GetAllProjectsAsync(int skipCount = 0, int maxResultCount = 20)
        {
            var userId = _currentUser.GetId();
            
            var queryable = await _historyRepository.GetQueryableAsync();
            var histories = queryable
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreationTime)
                .Skip(skipCount)
                .Take(maxResultCount)
                .ToList();
                
            return ObjectMapper.Map<List<SmartAbp.CodeGenerator.GenerationHistory>, List<GenerationHistoryDto>>(histories);
        }
        
        /// <summary>
        /// 创建生成历史记录
        /// </summary>
        public virtual async Task<GenerationHistoryDto> CreateAsync(CreateGenerationHistoryDto input)
        {
            var userId = _currentUser.GetId();
            
            var history = new SmartAbp.CodeGenerator.GenerationHistory(
                GuidGenerator.Create(),
                userId,
                input.Mode,
                input.ProjectName,
                input.EntityCount,
                input.GeneratedFileCount,
                input.GenerationDuration,
                input.Status
            );
            
            history.TemplateName = input.TemplateName;
            history.ErrorMessage = input.ErrorMessage;
            history.Metadata = input.Metadata;
            
            await _historyRepository.InsertAsync(history);
            await CurrentUnitOfWork.SaveChangesAsync();
            
            // 同时更新统计数据
            await UpdateStatsAsync(input.EntityCount, input.GenerationDuration, input.Status);
            
            return ObjectMapper.Map<SmartAbp.CodeGenerator.GenerationHistory, GenerationHistoryDto>(history);
        }
        
        /// <summary>
        /// 删除项目历史
        /// </summary>
        public virtual async Task DeleteAsync(Guid id)
        {
            var userId = _currentUser.GetId();
            var queryable = await _historyRepository.GetQueryableAsync();
            var history = queryable.FirstOrDefault(x => x.Id == id && x.UserId == userId);
            
            if (history == null)
            {
                throw new Volo.Abp.UserFriendlyException("项目不存在或无权限删除");
            }
            
            await _historyRepository.DeleteAsync(history);
        }
        
        /// <summary>
        /// 更新统计数据
        /// </summary>
        private async Task UpdateStatsAsync(int entityCount, int duration, string status)
        {
            if (status != "success") return;
            
            var userId = _currentUser.GetId();
            var statsQueryable = await _statsRepository.GetQueryableAsync();
            var stats = statsQueryable.FirstOrDefault(x => x.UserId == userId);
            
            if (stats == null)
            {
                stats = new SmartAbp.CodeGenerator.CodeGenStat(GuidGenerator.Create(), userId);
                await _statsRepository.InsertAsync(stats);
            }
            
            var savedHours = entityCount * 2;
            var qualityScore = duration < 60 ? 95m : 90m;
            
            stats.UpdateStats(1, savedHours, qualityScore);
            await _statsRepository.UpdateAsync(stats);
        }
    }
}

