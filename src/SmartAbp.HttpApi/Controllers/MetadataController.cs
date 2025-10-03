using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.Controllers
{
    [RemoteService(Name = "Metadata")]
    [Area("app")]
    [Route("api/metadata")] 
    public class MetadataController : AbpController
    {
        private readonly IMetadataAppService _service;

        public MetadataController(IMetadataAppService service)
        {
            _service = service;
        }

        /// <summary>
        /// 幂等的模块注册：存在则更新，不存在则创建。
        /// </summary>
        [HttpPost("register-module")]
        public async Task<ModuleMetadataDto> RegisterAsync([FromBody] ModuleMetadataDto input)
        {
            // 优先尝试更新，若不存在则创建
            try
            {
                return await _service.UpdateAsync(input);
            }
            catch (EntityNotFoundException)
            {
                return await _service.CreateAsync(input);
            }
        }

        [HttpPost]
        public Task<ModuleMetadataDto> CreateAsync([FromBody] ModuleMetadataDto input) => _service.CreateAsync(input);

        [HttpPut]
        public Task<ModuleMetadataDto> UpdateAsync([FromBody] ModuleMetadataDto input) => _service.UpdateAsync(input);

        [HttpGet("{moduleName}")]
        public Task<ModuleMetadataDto> GetAsync(string moduleName) => _service.GetAsync(moduleName);
    }
}


