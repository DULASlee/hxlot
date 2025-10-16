namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    public class CodeGenerationConfigDto
    {
        public bool GenerateEntity { get; set; }
        public bool GenerateDto { get; set; }
        public bool GenerateAppService { get; set; }
        public bool GenerateController { get; set; }
        public bool GenerateRepository { get; set; }
        public bool GenerateFrontend { get; set; }
        public bool GenerateTests { get; set; }
    }
}


