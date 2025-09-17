using System;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.CodeGenerator.Domain
{
    public class MetadataStore : AggregateRoot<Guid>
    {
        public string ModuleName { get; protected set; }
        
        public string MetadataJson { get; protected set; }
        
        public int Version { get; protected set; }

        protected MetadataStore()
        {
        }

        public MetadataStore(
            Guid id,
            string moduleName,
            string metadataJson,
            int version = 1) : base(id)
        {
            ModuleName = moduleName;
            MetadataJson = metadataJson;
            Version = version;
        }

        public void SetMetadataJson(string metadataJson)
        {
            MetadataJson = metadataJson;
        }
        
        public void IncrementVersion()
        {
            Version++;
        }
    }
}
