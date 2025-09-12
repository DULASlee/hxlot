using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Hubs;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// Service for tracking and broadcasting code generation progress
    /// </summary>
    public class CodeGenerationProgressService : ISingletonDependency
    {
        private readonly IHubContext<CodeGenerationProgressHub> _hubContext;
        private readonly ILogger<CodeGenerationProgressService> _logger;

        public CodeGenerationProgressService(
            IHubContext<CodeGenerationProgressHub> hubContext,
            ILogger<CodeGenerationProgressService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        /// <summary>
        /// Reports progress update for a generation session
        /// </summary>
        public async Task ReportProgressAsync(CodeGenerationProgressModel progress)
        {
            try
            {
                await _hubContext.Clients.Group($"generation_{progress.SessionId}")
                    .SendAsync("ProgressUpdate", progress);
                
                _logger.LogDebug("Progress update sent for session {SessionId}: {Status} - {Percentage}%", 
                    progress.SessionId, progress.Status, progress.ProgressPercentage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send progress update for session {SessionId}", 
                    progress.SessionId);
            }
        }

        /// <summary>
        /// Reports generation completion
        /// </summary>
        public async Task ReportCompletionAsync(CodeGenerationCompletionModel completion)
        {
            try
            {
                await _hubContext.Clients.Group($"generation_{completion.SessionId}")
                    .SendAsync("GenerationCompleted", completion);
                
                _logger.LogInformation("Generation completion sent for session {SessionId}: Success={Success}", 
                    completion.SessionId, completion.IsSuccess);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send completion notification for session {SessionId}", 
                    completion.SessionId);
            }
        }

        /// <summary>
        /// Creates a progress tracker for a specific session
        /// </summary>
        public ICodeGenerationProgressTracker CreateTracker(string sessionId, string generationType)
        {
            return new CodeGenerationProgressTracker(this, sessionId, generationType);
        }
    }

    /// <summary>
    /// Interface for progress tracking
    /// </summary>
    public interface ICodeGenerationProgressTracker
    {
        Task ReportProgress(string status, int percentage, string currentStep, string? message = null);
        Task ReportFileGenerated(string fileName);
        Task ReportError(string errorMessage);
        Task ReportCompletion(bool isSuccess, object? result = null);
    }

    /// <summary>
    /// Progress tracker implementation for individual generation sessions
    /// </summary>
    internal class CodeGenerationProgressTracker : ICodeGenerationProgressTracker
    {
        private readonly CodeGenerationProgressService _progressService;
        private readonly string _sessionId;
        private readonly string _generationType;
        private readonly DateTime _startTime;
        private int _filesGenerated;
        private int _totalFiles;

        public CodeGenerationProgressTracker(
            CodeGenerationProgressService progressService, 
            string sessionId, 
            string generationType)
        {
            _progressService = progressService;
            _sessionId = sessionId;
            _generationType = generationType;
            _startTime = DateTime.UtcNow;
            _filesGenerated = 0;
            _totalFiles = 0;
        }

        public async Task ReportProgress(string status, int percentage, string currentStep, string? message = null)
        {
            var progress = new CodeGenerationProgressModel
            {
                SessionId = _sessionId,
                GenerationType = _generationType,
                Status = status,
                ProgressPercentage = percentage,
                CurrentStep = currentStep,
                Message = message,
                FilesGenerated = _filesGenerated,
                TotalFiles = _totalFiles,
                ElapsedTime = DateTime.UtcNow - _startTime
            };

            await _progressService.ReportProgressAsync(progress);
        }

        public async Task ReportFileGenerated(string fileName)
        {
            _filesGenerated++;
            await ReportProgress("Generating", 
                _totalFiles > 0 ? (int)((_filesGenerated / (double)_totalFiles) * 100) : 0, 
                $"Generated {fileName}");
        }

        public async Task ReportError(string errorMessage)
        {
            var progress = new CodeGenerationProgressModel
            {
                SessionId = _sessionId,
                GenerationType = _generationType,
                Status = "Error",
                ProgressPercentage = 0,
                CurrentStep = "Generation failed",
                ErrorMessage = errorMessage,
                FilesGenerated = _filesGenerated,
                TotalFiles = _totalFiles,
                ElapsedTime = DateTime.UtcNow - _startTime
            };

            await _progressService.ReportProgressAsync(progress);
        }

        public async Task ReportCompletion(bool isSuccess, object? result = null)
        {
            var completion = new CodeGenerationCompletionModel
            {
                SessionId = _sessionId,
                IsSuccess = isSuccess,
                GenerationType = _generationType,
                FilesGenerated = _filesGenerated,
                LinesOfCode = result is { } r && r.GetType().GetProperty("TotalLinesOfCode") != null 
                    ? (int)(r.GetType().GetProperty("TotalLinesOfCode")?.GetValue(r) ?? 0) 
                    : 0,
                TotalTime = DateTime.UtcNow - _startTime,
                Result = result
            };

            await _progressService.ReportCompletionAsync(completion);
        }

        public void SetTotalFiles(int totalFiles)
        {
            _totalFiles = totalFiles;
        }
    }
}