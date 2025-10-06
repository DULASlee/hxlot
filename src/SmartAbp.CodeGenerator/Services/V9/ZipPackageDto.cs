using System;

namespace SmartAbp.CodeGenerator.Services.V9
{
    /// <summary>
    /// 代表ZIP包输出格式
    /// </summary>
    public class ZipPackageDto
    {
        /// <summary>
        /// ZIP包的二进制内容
        /// </summary>
        public byte[] Content { get; set; }
        
        /// <summary>
        /// 文件名
        /// </summary>
        public string FileName { get; set; }
        
        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// 文件大小（字节）
        /// </summary>
        public long FileSize => Content?.Length ?? 0;

        public ZipPackageDto()
        {
            Content = Array.Empty<byte>();
            FileName = string.Empty;
            CreatedAt = DateTime.Now;
        }
    }
}
