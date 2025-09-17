using System;
using System.Text.Json;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Domain;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.CodeGenerator.Services
{
    public class MetadataAppService : ApplicationService, IMetadataAppService
    {
        private readonly IRepository<MetadataStore, Guid> _metadataRepository;

        public MetadataAppService(IRepository<MetadataStore, Guid> metadataRepository)
        {
            _metadataRepository = metadataRepository;
        }

        public async Task<ModuleMetadataDto> GetAsync(string moduleName)
        {
            var metadataStore = await _metadataRepository.FindAsync(x => x.ModuleName == moduleName);
            if (metadataStore == null)
            {
                return null;
            }

            return JsonSerializer.Deserialize<ModuleMetadataDto>(metadataStore.MetadataJson);
        }

        public async Task<ModuleMetadataDto> CreateAsync(ModuleMetadataDto input)
        {
            var metadataJson = JsonSerializer.Serialize(input);
            var metadataStore = new MetadataStore(
                GuidGenerator.Create(),
                input.Name,
                metadataJson);

            await _metadataRepository.InsertAsync(metadataStore);

            return input;
        }

        public async Task<ModuleMetadataDto> UpdateAsync(ModuleMetadataDto input)
        {
            var metadataStore = await _metadataRepository.GetAsync(x => x.ModuleName == input.Name);

            var metadataJson = JsonSerializer.Serialize(input);
            metadataStore.SetMetadataJson(metadataJson);
            metadataStore.IncrementVersion();

            await _metadataRepository.UpdateAsync(metadataStore);

            return input;
        }

        public async Task DeleteAsync(string moduleName)
        {
            var metadataStore = await _metadataRepository.GetAsync(x => x.ModuleName == moduleName);
            await _metadataRepository.DeleteAsync(metadataStore);
        }
    }
}
