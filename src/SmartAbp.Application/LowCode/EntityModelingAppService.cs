using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Application.LowCode.Services;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 🔥 实体建模应用服务实现
    /// 对应前端: entityModeling.ts (Store)
    /// 功能: 低代码引擎的实体建模管理
    /// </summary>
    public class EntityModelingAppService : ApplicationService, IEntityModelingAppService
    {
        private readonly IRepository<EntityDefinition, Guid> _entityRepository;
        private readonly IRepository<EntityField, Guid> _fieldRepository;
        private readonly IRepository<EntityRelation, Guid> _relationRepository;
        private readonly SchemaVersionService _schemaVersionService;

        public EntityModelingAppService(
            IRepository<EntityDefinition, Guid> entityRepository,
            IRepository<EntityField, Guid> fieldRepository,
            IRepository<EntityRelation, Guid> relationRepository,
            SchemaVersionService schemaVersionService)
        {
            _entityRepository = entityRepository;
            _fieldRepository = fieldRepository;
            _relationRepository = relationRepository;
            _schemaVersionService = schemaVersionService;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 实体定义管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        public async Task<List<EntityDefinitionDto>> GetAllEntitiesAsync()
        {
            // ABP标准方式：使用GetListAsync + 手动加载导航属性
            var entities = await _entityRepository.GetListAsync();

            // 手动加载Fields导航属性
            foreach (var entity in entities)
            {
                var fields = await _fieldRepository.GetListAsync(f => f.EntityDefinitionId == entity.Id);
                entity.Fields = fields.ToList();
            }

            return ObjectMapper.Map<List<EntityDefinition>, List<EntityDefinitionDto>>(entities);
        }

        public async Task<EntityDefinitionDto> GetEntityByIdAsync(Guid id)
        {
            var entity = await _entityRepository.GetAsync(id);

            if (entity == null)
            {
                throw new Volo.Abp.UserFriendlyException($"实体不存在: {id}");
            }

            // 手动加载Fields导航属性
            var fields = await _fieldRepository.GetListAsync(f => f.EntityDefinitionId == entity.Id);
            entity.Fields = fields.ToList();

            return ObjectMapper.Map<EntityDefinition, EntityDefinitionDto>(entity);
        }

        public async Task<EntityDefinitionDto> GetEntityByNameAsync(string name)
        {
            var entity = await _entityRepository.FirstOrDefaultAsync(e => e.Name == name);

            if (entity == null)
            {
                throw new Volo.Abp.UserFriendlyException($"实体不存在: {name}");
            }

            // 手动加载Fields导航属性
            var fields = await _fieldRepository.GetListAsync(f => f.EntityDefinitionId == entity.Id);
            entity.Fields = fields.ToList();

            return ObjectMapper.Map<EntityDefinition, EntityDefinitionDto>(entity);
        }

        public async Task<EntityDefinitionDto> CreateEntityAsync(CreateOrUpdateEntityDefinitionDto input)
        {
            // 验证实体名称唯一性
            var existingEntity = await _entityRepository
                .FirstOrDefaultAsync(e => e.Name == input.Name);

            if (existingEntity != null)
            {
                throw new Volo.Abp.UserFriendlyException($"实体名称已存在: {input.Name}");
            }

            // 创建实体
            var entity = new EntityDefinition
            {
                Name = input.Name,
                TableName = input.TableName,
                DisplayName = input.DisplayName,
                Description = input.Description,
                EntityType = input.EntityType,
                BaseType = input.BaseType,
                Namespace = input.Namespace
            };

            // 添加字段
            foreach (var fieldDto in input.Fields)
            {
                var field = new EntityField
                {
                    Name = fieldDto.Name,
                    DisplayName = fieldDto.DisplayName,
                    Type = fieldDto.Type,
                    Length = fieldDto.Length,
                    IsRequired = fieldDto.IsRequired,
                    IsUnique = fieldDto.IsUnique,
                    IsIndexed = fieldDto.IsIndexed,
                    DefaultValue = fieldDto.DefaultValue,
                    Comment = fieldDto.Comment,
                    Order = fieldDto.Order
                };

                entity.Fields.Add(field);
            }

            await _entityRepository.InsertAsync(entity, autoSave: true);

            return ObjectMapper.Map<EntityDefinition, EntityDefinitionDto>(entity);
        }

        public async Task<EntityDefinitionDto> UpdateEntityAsync(Guid id, CreateOrUpdateEntityDefinitionDto input)
        {
            var entity = await _entityRepository.GetAsync(id);

            if (entity == null)
            {
                throw new Volo.Abp.UserFriendlyException($"实体不存在: {id}");
            }

            // 更新实体基本信息
            entity.Name = input.Name;
            entity.TableName = input.TableName;
            entity.DisplayName = input.DisplayName;
            entity.Description = input.Description;
            entity.EntityType = input.EntityType;
            entity.BaseType = input.BaseType;
            entity.Namespace = input.Namespace;

            // 更新字段（先删除旧字段，再添加新字段）
            var existingFields = await _fieldRepository.GetListAsync(f => f.EntityDefinitionId == entity.Id);
            foreach (var existingField in existingFields)
            {
                await _fieldRepository.DeleteAsync(existingField);
            }

            // 添加新字段
            foreach (var fieldDto in input.Fields)
            {
                var field = new EntityField
                {
                    EntityDefinitionId = entity.Id,
                    Name = fieldDto.Name,
                    DisplayName = fieldDto.DisplayName,
                    Type = fieldDto.Type,
                    Length = fieldDto.Length,
                    IsRequired = fieldDto.IsRequired,
                    IsUnique = fieldDto.IsUnique,
                    IsIndexed = fieldDto.IsIndexed,
                    DefaultValue = fieldDto.DefaultValue,
                    Comment = fieldDto.Comment,
                    Order = fieldDto.Order
                };

                await _fieldRepository.InsertAsync(field);
            }

            await _entityRepository.UpdateAsync(entity, autoSave: true);

            // 重新加载Fields
            var fields = await _fieldRepository.GetListAsync(f => f.EntityDefinitionId == entity.Id);
            entity.Fields = fields.ToList();

            return ObjectMapper.Map<EntityDefinition, EntityDefinitionDto>(entity);
        }

        public async Task DeleteEntityAsync(Guid id)
        {
            var entity = await _entityRepository.GetAsync(id);
            await _entityRepository.DeleteAsync(entity, autoSave: true);
        }

        public async Task BatchDeleteEntitiesAsync(List<Guid> ids)
        {
            foreach (var id in ids)
            {
                await DeleteEntityAsync(id);
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 字段管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        public async Task<EntityFieldDto> AddFieldAsync(CreateOrUpdateEntityFieldDto input)
        {
            var field = new EntityField
            {
                EntityDefinitionId = input.EntityDefinitionId,
                Name = input.Name,
                DisplayName = input.DisplayName,
                Type = input.Type,
                Length = input.Length,
                IsRequired = input.IsRequired,
                IsUnique = input.IsUnique,
                IsIndexed = input.IsIndexed,
                DefaultValue = input.DefaultValue,
                Comment = input.Comment,
                Order = input.Order
            };

            await _fieldRepository.InsertAsync(field, autoSave: true);

            return ObjectMapper.Map<EntityField, EntityFieldDto>(field);
        }

        public async Task<EntityFieldDto> UpdateFieldAsync(Guid id, CreateOrUpdateEntityFieldDto input)
        {
            var field = await _fieldRepository.GetAsync(id);

            field.Name = input.Name;
            field.DisplayName = input.DisplayName;
            field.Type = input.Type;
            field.Length = input.Length;
            field.IsRequired = input.IsRequired;
            field.IsUnique = input.IsUnique;
            field.IsIndexed = input.IsIndexed;
            field.DefaultValue = input.DefaultValue;
            field.Comment = input.Comment;
            field.Order = input.Order;

            await _fieldRepository.UpdateAsync(field, autoSave: true);

            return ObjectMapper.Map<EntityField, EntityFieldDto>(field);
        }

        public async Task DeleteFieldAsync(Guid id)
        {
            await _fieldRepository.DeleteAsync(id, autoSave: true);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 关系管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        public async Task<List<EntityRelationDto>> GetAllRelationsAsync()
        {
            var relations = await _relationRepository.GetListAsync();
            return ObjectMapper.Map<List<EntityRelation>, List<EntityRelationDto>>(relations);
        }

        public async Task<EntityRelationDto> CreateRelationAsync(CreateOrUpdateEntityRelationDto input)
        {
            var relation = new EntityRelation
            {
                FromEntity = input.FromEntity,
                ToEntity = input.ToEntity,
                RelationType = input.RelationType,
                ForeignKey = input.ForeignKey,
                NavigationProperty = input.NavigationProperty,
                JoinTable = input.JoinTable,
                CascadeDelete = input.CascadeDelete
            };

            await _relationRepository.InsertAsync(relation, autoSave: true);

            return ObjectMapper.Map<EntityRelation, EntityRelationDto>(relation);
        }

        public async Task<EntityRelationDto> UpdateRelationAsync(Guid id, CreateOrUpdateEntityRelationDto input)
        {
            var relation = await _relationRepository.GetAsync(id);

            relation.FromEntity = input.FromEntity;
            relation.ToEntity = input.ToEntity;
            relation.RelationType = input.RelationType;
            relation.ForeignKey = input.ForeignKey;
            relation.NavigationProperty = input.NavigationProperty;
            relation.JoinTable = input.JoinTable;
            relation.CascadeDelete = input.CascadeDelete;

            await _relationRepository.UpdateAsync(relation, autoSave: true);

            return ObjectMapper.Map<EntityRelation, EntityRelationDto>(relation);
        }

        public async Task DeleteRelationAsync(Guid id)
        {
            await _relationRepository.DeleteAsync(id, autoSave: true);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 架构验证
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        public async Task<SchemaValidationResult> ValidateSchemaAsync()
        {
            var result = new SchemaValidationResult { IsValid = true };

            var entities = await _entityRepository.GetListAsync();
            var relations = await _relationRepository.GetListAsync();

            // 验证实体名称唯一性
            var duplicateNames = entities
                .GroupBy(e => e.Name)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateNames.Any())
            {
                result.IsValid = false;
                result.Errors.Add($"存在重复的实体名称: {string.Join(", ", duplicateNames)}");
            }

            // 验证关系的实体存在性
            foreach (var relation in relations)
            {
                if (!entities.Any(e => e.Name == relation.FromEntity))
                {
                    result.IsValid = false;
                    result.Errors.Add($"关系源实体不存在: {relation.FromEntity}");
                }

                if (!entities.Any(e => e.Name == relation.ToEntity))
                {
                    result.IsValid = false;
                    result.Errors.Add($"关系目标实体不存在: {relation.ToEntity}");
                }
            }

            // 验证循环依赖
            // TODO: 实现循环依赖检测算法

            return result;
        }
    }
}

