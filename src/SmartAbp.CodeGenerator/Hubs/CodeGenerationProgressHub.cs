using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Volo.Abp.AspNetCore.SignalR;

namespace SmartAbp.CodeGenerator.Hubs
{
    /// <summary>
    /// SignalR Hub for real-time code generation progress tracking
    /// </summary>
    [Authorize]
    public class CodeGenerationProgressHub : Hub
    {
        private readonly ILogger<CodeGenerationProgressHub> _logger;

        public CodeGenerationProgressHub(ILogger<CodeGenerationProgressHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Joins a code generation session group
        /// </summary>
        public async Task JoinGenerationSession(string sessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"generation_{sessionId}");
            _logger.LogInformation("User {UserId} joined generation session {SessionId}", 
                Context.UserIdentifier, sessionId);
        }

        /// <summary>
        /// Leaves a code generation session group
        /// </summary>
        public async Task LeaveGenerationSession(string sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"generation_{sessionId}");
            _logger.LogInformation("User {UserId} left generation session {SessionId}", 
                Context.UserIdentifier, sessionId);
        }

        /// <summary>
        /// Called when client connects
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("User {UserId} connected to CodeGenerationProgressHub", 
                Context.UserIdentifier);
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when client disconnects
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("User {UserId} disconnected from CodeGenerationProgressHub. Reason: {Reason}", 
                Context.UserIdentifier, exception?.Message ?? "Normal disconnection");
            await base.OnDisconnectedAsync(exception);
        }
    }

    /// <summary>
    /// Progress notification model for real-time updates
    /// </summary>
    public class CodeGenerationProgressModel
    {
        public string SessionId { get; set; } = string.Empty;
        public string GenerationType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ProgressPercentage { get; set; }
        public string CurrentStep { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Message { get; set; }
        public int FilesGenerated { get; set; }
        public int TotalFiles { get; set; }
        public TimeSpan ElapsedTime { get; set; }
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// Code generation completion model
    /// </summary>
    public class CodeGenerationCompletionModel
    {
        public string SessionId { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string GenerationType { get; set; } = string.Empty;
        public int FilesGenerated { get; set; }
        public int LinesOfCode { get; set; }
        public TimeSpan TotalTime { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        public string? ErrorMessage { get; set; }
        public object? Result { get; set; }
    }
}