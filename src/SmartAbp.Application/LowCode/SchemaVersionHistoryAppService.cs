using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 🔥 Schema版本历史应用服务
    ///
    /// 功能:
    /// 1. 版本历史查询
    /// 2. 版本发布管理
    /// 3. 版本弃用管理
    ///
    /// 版本: v1.0.0
    /// </summary>
    public class SchemaVersionHistoryAppService : ApplicationService
    {
        private readonly IRepository<SchemaVersionHistory, Guid> _versionHistoryRepository;

        public SchemaVersionHistoryAppService(
            IRepository<SchemaVersionHistory, Guid> versionHistoryRepository)
        {
            _versionHistoryRepository = versionHistoryRepository;
        }

        /// <summary>
        /// 获取所有版本历史
        /// Phase 1B: 遵循ABP标准模式 - 返回DTO（API契约）
        /// </summary>
        /// <param name="schemaName">Schema名称(可选)</param>
        /// <param name="includeDeprecated">是否包含已弃用版本</param>
        /// <returns></returns>
        public async Task<List<SchemaVersionHistoryDto>> GetAllVersionsAsync(
            string schemaName = null,
            bool includeDeprecated = false)
        {
            var query = await _versionHistoryRepository.GetQueryableAsync();

            // 过滤Schema名称
            if (!string.IsNullOrWhiteSpace(schemaName))
            {
                query = query.Where(v => v.SchemaName == schemaName);
            }

            // 过滤已弃用版本
            if (!includeDeprecated)
            {
                query = query.Where(v => !v.IsDeprecated);
            }

            // 按发布日期降序排序
            query = query.OrderByDescending(v => v.ReleaseDate ?? v.CreationTime);

            var versions = query.ToList();
            return ObjectMapper.Map<List<SchemaVersionHistory>, List<SchemaVersionHistoryDto>>(versions);
        }

        /// <summary>
        /// 获取已发布的版本列表
        /// </summary>
        /// <param name="schemaName">Schema名称</param>
        /// <returns></returns>
        public async Task<List<SchemaVersionHistoryDto>> GetReleasedVersionsAsync(string schemaName = null)
        {
            var query = await _versionHistoryRepository.GetQueryableAsync();

            query = query.Where(v => v.IsReleased);

            if (!string.IsNullOrWhiteSpace(schemaName))
            {
                query = query.Where(v => v.SchemaName == schemaName);
            }

            query = query.OrderByDescending(v => v.ReleaseDate);

            var versions = query.ToList();
            return ObjectMapper.Map<List<SchemaVersionHistory>, List<SchemaVersionHistoryDto>>(versions);
        }

        /// <summary>
        /// 获取指定版本详情
        /// </summary>
        /// <param name="id">版本ID</param>
        /// <returns></returns>
        public async Task<SchemaVersionHistoryDto> GetVersionByIdAsync(Guid id)
        {
            var version = await _versionHistoryRepository.GetAsync(id);
            return ObjectMapper.Map<SchemaVersionHistory, SchemaVersionHistoryDto>(version);
        }

        /// <summary>
        /// 根据版本号获取版本
        /// </summary>
        /// <param name="version">版本号</param>
        /// <param name="schemaName">Schema名称</param>
        /// <returns></returns>
        public async Task<SchemaVersionHistoryDto> GetVersionByNumberAsync(
            string version,
            string schemaName = "LowCodeEntitySchema")
        {
            var query = await _versionHistoryRepository.GetQueryableAsync();
            var versionHistory = query.FirstOrDefault(v =>
                v.Version == version && v.SchemaName == schemaName);

            if (versionHistory == null)
            {
                throw new Volo.Abp.UserFriendlyException($"版本不存在: {version}");
            }

            return ObjectMapper.Map<SchemaVersionHistory, SchemaVersionHistoryDto>(versionHistory);
        }

        /// <summary>
        /// 创建新版本记录
        /// </summary>
        /// <param name="input">创建DTO</param>
        /// <returns></returns>
        public async Task<SchemaVersionHistoryDto> CreateVersionAsync(CreateSchemaVersionHistoryDto input)
        {
            // 检查版本是否已存在
            var existingVersion = (await _versionHistoryRepository.GetQueryableAsync())
                .FirstOrDefault(v => v.Version == input.Version && v.SchemaName == input.SchemaName);

            if (existingVersion != null)
            {
                throw new Volo.Abp.UserFriendlyException(
                    $"版本已存在: {input.Version} (Schema: {input.SchemaName})");
            }

            var versionHistory = new SchemaVersionHistory(
                Guid.NewGuid(),
                input.Version,
                input.SchemaName,
                input.Description,
                input.ChangeType)
            {
                ChangeContent = input.ChangeContent,
                IsBreakingChange = input.IsBreakingChange,
                MinCompatibleVersion = input.MinCompatibleVersion,
                MaxCompatibleVersion = input.MaxCompatibleVersion
            };

            await _versionHistoryRepository.InsertAsync(versionHistory);

            return ObjectMapper.Map<SchemaVersionHistory, SchemaVersionHistoryDto>(versionHistory);
        }

        /// <summary>
        /// 发布版本
        /// </summary>
        /// <param name="input">发布DTO</param>
        /// <returns></returns>
        public async Task<SchemaVersionHistoryDto> ReleaseVersionAsync(ReleaseVersionDto input)
        {
            var versionHistory = await _versionHistoryRepository.GetAsync(input.VersionId);

            if (versionHistory.IsReleased)
            {
                throw new Volo.Abp.UserFriendlyException(
                    $"版本 {versionHistory.Version} 已经发布");
            }

            versionHistory.Release(input.ReleasedBy, input.ReleaseNotes);

            await _versionHistoryRepository.UpdateAsync(versionHistory);

            return ObjectMapper.Map<SchemaVersionHistory, SchemaVersionHistoryDto>(versionHistory);
        }

        /// <summary>
        /// 弃用版本
        /// </summary>
        /// <param name="id">版本ID</param>
        /// <returns></returns>
        public async Task<SchemaVersionHistoryDto> DeprecateVersionAsync(Guid id)
        {
            var versionHistory = await _versionHistoryRepository.GetAsync(id);

            if (versionHistory.IsDeprecated)
            {
                throw new Volo.Abp.UserFriendlyException(
                    $"版本 {versionHistory.Version} 已经弃用");
            }

            versionHistory.Deprecate();

            await _versionHistoryRepository.UpdateAsync(versionHistory);

            return ObjectMapper.Map<SchemaVersionHistory, SchemaVersionHistoryDto>(versionHistory);
        }

        /// <summary>
        /// 获取破坏性变更版本列表
        /// </summary>
        /// <param name="schemaName">Schema名称</param>
        /// <returns></returns>
        public async Task<List<SchemaVersionHistoryDto>> GetBreakingChangesAsync(string schemaName = null)
        {
            var query = await _versionHistoryRepository.GetQueryableAsync();

            query = query.Where(v => v.IsBreakingChange && v.IsReleased);

            if (!string.IsNullOrWhiteSpace(schemaName))
            {
                query = query.Where(v => v.SchemaName == schemaName);
            }

            query = query.OrderByDescending(v => v.ReleaseDate);

            var versions = query.ToList();
            return ObjectMapper.Map<List<SchemaVersionHistory>, List<SchemaVersionHistoryDto>>(versions);
        }
    }
}

