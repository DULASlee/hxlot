using System;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 统一API响应包装 (带Schema版本)
    /// 
    /// 功能: 确保所有API响应都包含Schema版本信息
    /// 对应前端: UnifiedApiResponse<T> in unified-schema.ts
    /// 版本: v1.0.0
    /// </summary>
    /// <typeparam name="T">响应数据类型</typeparam>
    public class UnifiedApiResponseDto<T>
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; } = true;

        /// <summary>
        /// 响应数据
        /// </summary>
        public T? Data { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string? Error { get; set; }

        /// <summary>
        /// Schema版本号
        /// </summary>
        public string SchemaVersion { get; set; } = "1.0.0";

        /// <summary>
        /// 响应时间戳
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 创建成功响应
        /// </summary>
        public static UnifiedApiResponseDto<T> CreateSuccess(T data, string schemaVersion = "1.0.0")
        {
            return new UnifiedApiResponseDto<T>
            {
                Success = true,
                Data = data,
                Error = null,
                SchemaVersion = schemaVersion,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// 创建错误响应
        /// </summary>
        public static UnifiedApiResponseDto<T> CreateError(string error, string schemaVersion = "1.0.0")
        {
            return new UnifiedApiResponseDto<T>
            {
                Success = false,
                Data = default,
                Error = error,
                SchemaVersion = schemaVersion,
                Timestamp = DateTime.UtcNow
            };
        }
    }
}

