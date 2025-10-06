using System;
using System.Text.RegularExpressions;
using Volo.Abp.DependencyInjection;
using SmartAbp.Application.Contracts.LowCode.Dtos;

namespace SmartAbp.Application.LowCode.Services
{
    /// <summary>
    /// 🔥 Schema版本验证服务
    /// 
    /// 功能:
    /// 1. 验证Schema版本格式
    /// 2. 验证版本兼容性
    /// 3. 提供版本比较功能
    /// 
    /// 版本: v1.0.0
    /// 作者: SmartAbp架构团队
    /// 日期: 2025-10-06
    /// </summary>
    public class SchemaVersionService : ITransientDependency
    {
        /// <summary>
        /// 当前Schema版本
        /// </summary>
        public const string CURRENT_VERSION = "1.0.0";

        /// <summary>
        /// 最低支持版本
        /// </summary>
        public const string MIN_SUPPORTED_VERSION = "1.0.0";

        /// <summary>
        /// 版本号正则表达式 (格式: major.minor.patch)
        /// </summary>
        private static readonly Regex VersionRegex = new Regex(
            @"^(\d+)\.(\d+)\.(\d+)$",
            RegexOptions.Compiled
        );

        /// <summary>
        /// 验证Schema版本格式
        /// </summary>
        /// <param name="version">版本号字符串</param>
        /// <returns>是否有效</returns>
        public bool IsValidVersion(string version)
        {
            if (string.IsNullOrWhiteSpace(version))
            {
                return false;
            }

            return VersionRegex.IsMatch(version);
        }

        /// <summary>
        /// 验证版本兼容性
        /// </summary>
        /// <param name="clientVersion">客户端版本</param>
        /// <returns>是否兼容</returns>
        public bool IsCompatible(string clientVersion)
        {
            if (!IsValidVersion(clientVersion))
            {
                return false;
            }

            var clientVer = ParseVersion(clientVersion);
            var minVer = ParseVersion(MIN_SUPPORTED_VERSION);
            var currentVer = ParseVersion(CURRENT_VERSION);

            // 客户端版本必须 >= 最低支持版本
            // 客户端版本必须 <= 当前版本
            return CompareVersions(clientVer, minVer) >= 0 &&
                   CompareVersions(clientVer, currentVer) <= 0;
        }

        /// <summary>
        /// 比较两个版本号
        /// </summary>
        /// <param name="version1">版本1</param>
        /// <param name="version2">版本2</param>
        /// <returns>-1: v1 < v2, 0: v1 == v2, 1: v1 > v2</returns>
        public int CompareVersions(string version1, string version2)
        {
            var v1 = ParseVersion(version1);
            var v2 = ParseVersion(version2);

            return CompareVersions(v1, v2);
        }

        /// <summary>
        /// 解析版本号
        /// </summary>
        private (int Major, int Minor, int Patch) ParseVersion(string version)
        {
            var match = VersionRegex.Match(version);
            if (!match.Success)
            {
                throw new ArgumentException($"Invalid version format: {version}");
            }

            return (
                Major: int.Parse(match.Groups[1].Value),
                Minor: int.Parse(match.Groups[2].Value),
                Patch: int.Parse(match.Groups[3].Value)
            );
        }

        /// <summary>
        /// 比较版本元组
        /// </summary>
        private int CompareVersions(
            (int Major, int Minor, int Patch) v1,
            (int Major, int Minor, int Patch) v2)
        {
            // 比较Major版本
            if (v1.Major != v2.Major)
            {
                return v1.Major > v2.Major ? 1 : -1;
            }

            // 比较Minor版本
            if (v1.Minor != v2.Minor)
            {
                return v1.Minor > v2.Minor ? 1 : -1;
            }

            // 比较Patch版本
            if (v1.Patch != v2.Patch)
            {
                return v1.Patch > v2.Patch ? 1 : -1;
            }

            return 0;
        }

        /// <summary>
        /// 获取当前Schema版本信息
        /// </summary>
        public SchemaVersionDto GetCurrentVersion()
        {
            return new SchemaVersionDto
            {
                Version = CURRENT_VERSION,
                PublishedAt = new DateTime(2025, 10, 6, 0, 0, 0, DateTimeKind.Utc),
                IsBackwardCompatible = true,
                MinCompatibleVersion = MIN_SUPPORTED_VERSION,
                ChangeLog = "Initial unified schema release",
                IsActive = true
            };
        }

        /// <summary>
        /// 验证并抛出异常(如果不兼容)
        /// </summary>
        /// <param name="clientVersion">客户端版本</param>
        /// <exception cref="ArgumentException">版本不兼容时抛出</exception>
        public void ValidateOrThrow(string clientVersion)
        {
            if (!IsValidVersion(clientVersion))
            {
                throw new ArgumentException(
                    $"Invalid schema version format: {clientVersion}. " +
                    $"Expected format: major.minor.patch (e.g., 1.0.0)"
                );
            }

            if (!IsCompatible(clientVersion))
            {
                throw new ArgumentException(
                    $"Schema version {clientVersion} is not compatible with server. " +
                    $"Current version: {CURRENT_VERSION}, " +
                    $"Min supported version: {MIN_SUPPORTED_VERSION}"
                );
            }
        }
    }
}

