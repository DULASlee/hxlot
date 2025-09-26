using System;
using System.Text.Json;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Domain;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Permissions; // 🔥 权限集成：引用权限常量定义

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 🔥 SmartAbp元数据管理应用服务 - ABP深度集成版
    /// 已正确使用Repository模式，现添加RemoteService自动API支持
    /// </summary>
    [RemoteService(Name = "Metadata")]
    // 🔥 权限集成修复：使用标准权限常量（遵循ABP最佳实践）
    [Authorize(SmartAbpPermissions.Metadata.Default)]
    public class MetadataAppService : ApplicationService, IMetadataAppService
    {
        private readonly IRepository<MetadataStore, Guid> _metadataRepository;

        public MetadataAppService(IRepository<MetadataStore, Guid> metadataRepository)
        {
            _metadataRepository = metadataRepository;
        }

        public async Task<ModuleMetadataDto> GetAsync(string moduleName)
        {
            var metadataStore = await _metadataRepository.FirstOrDefaultAsync(x => x.ModuleName == moduleName);
            if (metadataStore == null)
            {
                throw new EntityNotFoundException(typeof(MetadataStore), moduleName);
            }
            return JsonSerializer.Deserialize<ModuleMetadataDto>(metadataStore.MetadataJson)!;
        }

        public async Task<ModuleMetadataDto> CreateAsync(ModuleMetadataDto input)
        {
            var existing = await _metadataRepository.FirstOrDefaultAsync(x => x.ModuleName == input.Name);
            if (existing != null)
            {
                throw new UserFriendlyException($"Module with name '{input.Name}' already exists.");
            }

            var json = JsonSerializer.Serialize(input);
            var newMetadata = new MetadataStore(GuidGenerator.Create(), input.Name, json);
            await _metadataRepository.InsertAsync(newMetadata);

            return JsonSerializer.Deserialize<ModuleMetadataDto>(newMetadata.MetadataJson) 
                   ?? throw new AbpException("Failed to deserialize metadata after creation.");
        }

        public async Task<ModuleMetadataDto> UpdateAsync(ModuleMetadataDto input)
        {
            var metadataStore = await _metadataRepository.FirstOrDefaultAsync(x => x.ModuleName == input.Name);
            if (metadataStore == null)
            {
                throw new EntityNotFoundException(typeof(MetadataStore), input.Name);
            }

            var json = JsonSerializer.Serialize(input);
            metadataStore.SetMetadataJson(json);
            await _metadataRepository.UpdateAsync(metadataStore);

            return JsonSerializer.Deserialize<ModuleMetadataDto>(metadataStore.MetadataJson)!;
        }

        public async Task DeleteAsync(string moduleName)
        {
            var metadataStore = await _metadataRepository.GetAsync(x => x.ModuleName == moduleName);
            await _metadataRepository.DeleteAsync(metadataStore);
        }
    }
}
