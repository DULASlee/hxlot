using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using SmartAbp.CodeGenerator.Dtos;

namespace SmartAbp.Application.CodeGenerator
{
    /// <summary>
    /// 代码生成统计服务
    /// </summary>
    public class CodeGenStatsAppService : ApplicationService
    {
        private readonly IRepository<SmartAbp.CodeGenerator.CodeGenStat, Guid> _statsRepository;
        private readonly IRepository<SmartAbp.CodeGenerator.GenerationHistory, Guid> _historyRepository;
        private readonly ICurrentUser _currentUser;
        
        public CodeGenStatsAppService(
            IRepository<SmartAbp.CodeGenerator.CodeGenStat, Guid> statsRepository,
            IRepository<SmartAbp.CodeGenerator.GenerationHistory, Guid> historyRepository,
            ICurrentUser currentUser)
        {
            _statsRepository = statsRepository;
            _historyRepository = historyRepository;
            _currentUser = currentUser;
        }
        
        /// <summary>
        /// 获取当前用户的统计数据
        /// </summary>
        public virtual async Task<CodeGenStatsDto> GetMyStatsAsync()
        {
            var userId = _currentUser.GetId();
            
            // 获取或创建统计记录
            var stats = await _statsRepository
                .FirstOrDefaultAsync(x => x.UserId == userId);
                
            if (stats == null)
            {
                // 首次访问，创建初始统计
                stats = new SmartAbp.CodeGenerator.CodeGenStat(
                    GuidGenerator.Create(),
                    userId,
                    totalProjects: 0,
                    monthlyGenerations: 0,
                    savedHours: 0,
                    qualityScore: 0
                );
                await _statsRepository.InsertAsync(stats);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            else
            {
                // 实时计算当月生成次数
                var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                var monthlyCount = await _historyRepository
                    .CountAsync(x => x.UserId == userId && x.CreationTime >= monthStart);
                    
                stats.MonthlyGenerations = monthlyCount;
                
                // 计算平均质量评分
                var recentHistory = await _historyRepository
                    .Where(x => x.UserId == userId && x.Status == "success")
                    .OrderByDescending(x => x.CreationTime)
                    .Take(10)
                    .ToListAsync();
                    
                if (recentHistory.Any())
                {
                    // 简化评分：基于成功率和生成速度
                    var avgDuration = recentHistory.Average(x => x.GenerationDuration);
                    var qualityScore = 100m - (avgDuration > 60 ? 10m : 0m);
                    stats.QualityScore = Math.Round(qualityScore, 1);
                }
                
                await _statsRepository.UpdateAsync(stats);
            }
            
            return new CodeGenStatsDto
            {
                TotalProjects = stats.TotalProjects,
                MonthlyGenerations = stats.MonthlyGenerations,
                SavedHours = stats.SavedHours,
                QualityScore = stats.QualityScore,
                LastUpdated = stats.LastUpdated
            };
        }
        
        /// <summary>
        /// 生成完成后更新统计
        /// </summary>
        public virtual async Task UpdateStatsAfterGenerationAsync(
            int entityCount,
            int fileCount,
            int durationSeconds)
        {
            var userId = _currentUser.GetId();
            var stats = await _statsRepository.FirstOrDefaultAsync(x => x.UserId == userId);
            
            if (stats == null)
            {
                stats = new SmartAbp.CodeGenerator.CodeGenStat(GuidGenerator.Create(), userId);
                await _statsRepository.InsertAsync(stats);
            }
            
            // 预估节省时间：每个实体手动编写约2小时
            var savedHours = entityCount * 2;
            var qualityScore = durationSeconds < 60 ? 95m : 90m;
            
            stats.UpdateStats(1, savedHours, qualityScore);
            await _statsRepository.UpdateAsync(stats);
        }
    }
}

