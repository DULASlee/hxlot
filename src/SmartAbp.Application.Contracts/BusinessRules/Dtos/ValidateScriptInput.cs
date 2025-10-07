using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts.BusinessRules.Dtos
{
    /// <summary>
    /// 脚本验证输入DTO
    /// </summary>
    public class ValidateScriptInput
    {
        /// <summary>
        /// 脚本内容
        /// </summary>
        [Required]
        [MaxLength(10000)]
        public string Script { get; set; } = string.Empty;

        /// <summary>
        /// 脚本类型 (javascript, csharp, expression)
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string ScriptType { get; set; } = "javascript";
    }
}
