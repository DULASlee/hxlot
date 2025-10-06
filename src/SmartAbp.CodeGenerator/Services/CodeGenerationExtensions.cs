using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 代码生成器扩展方法 - 提供会话管理和状态追踪功能
    /// </summary>
    public static class CodeGenerationExtensions
    {
        // 内存中存储生成会话状态（仅用于演示，生产应使用分布式缓存）
        private static readonly ConcurrentDictionary<string, GenerationStatusDto> GenerationSessions = new ConcurrentDictionary<string, GenerationStatusDto>();

        // 内存中存储生成的文件（仅用于演示，生产应使用分布式文件存储）
        private static readonly ConcurrentDictionary<string, List<GeneratedFileInfo>> GeneratedFiles = new ConcurrentDictionary<string, List<GeneratedFileInfo>>();

        /// <summary>
        /// 创建新的生成会话
        /// </summary>
        public static string CreateGenerationSession(string moduleName)
        {
            string sessionId = $"{moduleName}-{Guid.NewGuid():N}";
            
            var session = new GenerationStatusDto
            {
                SessionId = sessionId,
                ModuleName = moduleName,
                Status = "pending",
                Percentage = 0,
                CurrentStep = "Initializing",
                StartedAt = DateTime.Now
            };
            
            GenerationSessions[sessionId] = session;
            GeneratedFiles[sessionId] = new List<GeneratedFileInfo>();
            
            return sessionId;
        }

        /// <summary>
        /// 更新生成会话状态
        /// </summary>
        public static void UpdateGenerationStatus(string sessionId, int percentage, string currentStep)
        {
            if (GenerationSessions.TryGetValue(sessionId, out var session))
            {
                session.Percentage = percentage;
                session.CurrentStep = currentStep;
                session.Status = "processing";
            }
        }

        /// <summary>
        /// 标记生成会话为完成
        /// </summary>
        public static void CompleteGenerationSession(string sessionId, List<string> generatedFiles)
        {
            if (GenerationSessions.TryGetValue(sessionId, out var session))
            {
                session.Percentage = 100;
                session.Status = "completed";
                session.CompletedAt = DateTime.Now;
                session.CurrentStep = "Generation completed";
                session.CompletedFiles = generatedFiles;
            }
        }

        /// <summary>
        /// 标记生成会话为失败
        /// </summary>
        public static void FailGenerationSession(string sessionId, string error)
        {
            if (GenerationSessions.TryGetValue(sessionId, out var session))
            {
                session.Status = "error";
                session.CompletedAt = DateTime.Now;
                session.Error = error;
            }
        }

        /// <summary>
        /// 获取生成会话状态
        /// </summary>
        public static GenerationStatusDto GetGenerationStatus(string sessionId)
        {
            if (GenerationSessions.TryGetValue(sessionId, out var session))
            {
                return session;
            }
            
            throw new UserFriendlyException($"Generation session not found: {sessionId}");
        }

        /// <summary>
        /// 添加生成的文件
        /// </summary>
        public static void AddGeneratedFile(string sessionId, string path, string content)
        {
            if (GeneratedFiles.TryGetValue(sessionId, out var files))
            {
                files.Add(new GeneratedFileInfo
                {
                    Path = path,
                    Content = content,
                    CreatedAt = DateTime.Now
                });
            }
        }

        /// <summary>
        /// 将生成的文件打包为ZIP
        /// </summary>
        public static ZipPackageDto CreateZipPackage(string sessionId)
        {
            if (!GeneratedFiles.TryGetValue(sessionId, out var files))
            {
                throw new UserFriendlyException($"No generated files found for session: {sessionId}");
            }

            if (files.Count == 0)
            {
                throw new UserFriendlyException($"No files were generated in session: {sessionId}");
            }

            using var memoryStream = new MemoryStream();
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                foreach (var file in files)
                {
                    var entry = archive.CreateEntry(file.Path);
                    using var entryStream = entry.Open();
                    using var writer = new StreamWriter(entryStream);
                    writer.Write(file.Content);
                }
            }

            return new ZipPackageDto
            {
                Content = memoryStream.ToArray(),
                FileName = $"generated-code-{sessionId}.zip",
                CreatedAt = DateTime.Now
            };
        }
    }

    /// <summary>
    /// 生成的文件信息
    /// </summary>
    public class GeneratedFileInfo
    {
        public string Path { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
