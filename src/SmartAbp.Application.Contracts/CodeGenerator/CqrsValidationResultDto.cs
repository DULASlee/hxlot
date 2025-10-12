using System.Collections.Generic;

namespace SmartAbp.Application.Contracts.CodeGenerator
{
    public class CqrsValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<ValidationErrorDto> Errors { get; set; } = new();
    }

    public class ValidationErrorDto
    {
        public required string Field { get; set; }
        public required string Message { get; set; }
        public string Severity { get; set; } = "Error"; // "Error" or "Warning"
    }
}

