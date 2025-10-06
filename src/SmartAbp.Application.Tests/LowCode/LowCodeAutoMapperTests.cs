using System;
using System.Collections.Generic;
using AutoMapper;
using Shouldly;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Application.LowCode.Mapping;
using SmartAbp.Domain.Entities.LowCode;
using Xunit;

namespace SmartAbp.Application.Tests.LowCode
{
    /// <summary>
    /// 🔥 LowCode AutoMapper映射测试
    /// 
    /// 功能: 验证Entity ↔ DTO双向映射的正确性
    /// 版本: v1.0.0
    /// </summary>
    public class LowCodeAutoMapperTests
    {
        private readonly IMapper _mapper;

        public LowCodeAutoMapperTests()
        {
            // 配置AutoMapper
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<LowCodeAutoMapperProfile>();
            });

            config.AssertConfigurationIsValid();
            _mapper = config.CreateMapper();
        }

        #region EntityDefinition映射测试

        [Fact]
        public void EntityDefinition_To_EntityDefinitionDto_Should_Map_Correctly()
        {
            // Arrange
            var entity = new EntityDefinition(Guid.NewGuid(), "User", "用户")
            {
                Description = "系统用户实体",
                TableName = "Users",
                PrimaryKey = "Id",
                BaseEntity = "AuditedEntity",
                GenerateRepository = true,
                GenerateAppService = true,
                Category = "System"
            };

            // Act
            var dto = _mapper.Map<EntityDefinitionDto>(entity);

            // Assert
            dto.ShouldNotBeNull();
            dto.Id.ShouldBe(entity.Id);
            dto.Name.ShouldBe(entity.Name);
            dto.DisplayName.ShouldBe(entity.DisplayName);
            dto.Description.ShouldBe(entity.Description);
            dto.TableName.ShouldBe(entity.TableName);
            dto.PrimaryKey.ShouldBe(entity.PrimaryKey);
            dto.BaseEntity.ShouldBe(entity.BaseEntity);
            dto.GenerateRepository.ShouldBe(entity.GenerateRepository);
            dto.GenerateAppService.ShouldBe(entity.GenerateAppService);
            dto.Category.ShouldBe(entity.Category);
        }

        [Fact]
        public void EntityDefinitionDto_To_EntityDefinition_Should_Map_Correctly()
        {
            // Arrange
            var dto = new EntityDefinitionDto
            {
                Id = Guid.NewGuid(),
                Name = "Product",
                DisplayName = "产品",
                Description = "产品实体",
                TableName = "Products",
                PrimaryKey = "Id",
                BaseEntity = "Entity",
                GenerateRepository = true,
                GenerateAppService = false,
                Category = "Business"
            };

            // Act
            var entity = _mapper.Map<EntityDefinition>(dto);

            // Assert
            entity.ShouldNotBeNull();
            entity.Id.ShouldBe(dto.Id);
            entity.Name.ShouldBe(dto.Name);
            entity.DisplayName.ShouldBe(dto.DisplayName);
            entity.Description.ShouldBe(dto.Description);
            entity.TableName.ShouldBe(dto.TableName);
            entity.PrimaryKey.ShouldBe(dto.PrimaryKey);
            entity.BaseEntity.ShouldBe(dto.BaseEntity);
            entity.GenerateRepository.ShouldBe(dto.GenerateRepository);
            entity.GenerateAppService.ShouldBe(dto.GenerateAppService);
            entity.Category.ShouldBe(dto.Category);
        }

        #endregion

        #region EntityField映射测试

        [Fact]
        public void EntityField_To_EntityFieldDto_Should_Map_Correctly()
        {
            // Arrange
            var field = new EntityField(Guid.NewGuid(), "Name", "姓名", "string")
            {
                IsRequired = true,
                MaxLength = 100,
                MinLength = 2,
                IsIndexed = true,
                IsUnique = false,
                DefaultValue = "",
                Comment = "用户姓名字段"
            };

            // Act
            var dto = _mapper.Map<EntityFieldDto>(field);

            // Assert
            dto.ShouldNotBeNull();
            dto.Id.ShouldBe(field.Id);
            dto.Name.ShouldBe(field.Name);
            dto.DisplayName.ShouldBe(field.DisplayName);
            dto.Type.ShouldBe(field.Type);
            dto.IsRequired.ShouldBe(field.IsRequired);
            dto.MaxLength.ShouldBe(field.MaxLength);
            dto.MinLength.ShouldBe(field.MinLength);
            dto.IsIndexed.ShouldBe(field.IsIndexed);
            dto.IsUnique.ShouldBe(field.IsUnique);
            dto.DefaultValue.ShouldBe(field.DefaultValue);
            dto.Comment.ShouldBe(field.Comment);
        }

        #endregion

        #region EntityRelation映射测试

        [Fact]
        public void EntityRelation_To_EntityRelationDto_Should_Map_Correctly()
        {
            // Arrange
            var relation = new EntityRelation(
                Guid.NewGuid(),
                "User",
                "Order",
                "OneToMany",
                "UserId",
                "Orders"
            )
            {
                Cascade = "Delete",
                JoinTable = null,
                IsBidirectional = true
            };

            // Act
            var dto = _mapper.Map<EntityRelationDto>(relation);

            // Assert
            dto.ShouldNotBeNull();
            dto.Id.ShouldBe(relation.Id);
            dto.FromEntity.ShouldBe(relation.FromEntity);
            dto.ToEntity.ShouldBe(relation.ToEntity);
            dto.RelationType.ShouldBe(relation.RelationType);
            dto.ForeignKey.ShouldBe(relation.ForeignKey);
            dto.NavigationProperty.ShouldBe(relation.NavigationProperty);
            dto.Cascade.ShouldBe(relation.Cascade);
            dto.IsBidirectional.ShouldBe(relation.IsBidirectional);
        }

        #endregion

        #region ValidationRule映射测试

        [Fact]
        public void ValidationRule_To_ValidationRuleDto_Should_Map_Correctly()
        {
            // Arrange
            var rule = new ValidationRule(Guid.NewGuid(), "MaxLength", "最大长度100")
            {
                ErrorMessage = "姓名长度不能超过100个字符",
                Value = "100",
                IsEnabled = true
            };

            // Act
            var dto = _mapper.Map<ValidationRuleDto>(rule);

            // Assert
            dto.ShouldNotBeNull();
            dto.Id.ShouldBe(rule.Id);
            dto.RuleType.ShouldBe(rule.RuleType);
            dto.ErrorMessage.ShouldBe(rule.ErrorMessage);
            dto.Value.ShouldBe(rule.Value);
            dto.Description.ShouldBe(rule.Description);
            dto.IsEnabled.ShouldBe(rule.IsEnabled);
        }

        #endregion

        #region 复杂映射测试

        [Fact]
        public void EntityDefinition_With_Fields_Should_Map_Correctly()
        {
            // Arrange
            var entity = new EntityDefinition(Guid.NewGuid(), "User", "用户")
            {
                Description = "系统用户",
                Fields = new List<EntityField>
                {
                    new EntityField(Guid.NewGuid(), "Name", "姓名", "string"),
                    new EntityField(Guid.NewGuid(), "Age", "年龄", "int"),
                    new EntityField(Guid.NewGuid(), "Email", "邮箱", "string")
                }
            };

            // Act
            var dto = _mapper.Map<EntityDefinitionDto>(entity);

            // Assert
            dto.ShouldNotBeNull();
            dto.Fields.ShouldNotBeNull();
            dto.Fields.Count.ShouldBe(3);
            dto.Fields[0].Name.ShouldBe("Name");
            dto.Fields[1].Name.ShouldBe("Age");
            dto.Fields[2].Name.ShouldBe("Email");
        }

        #endregion

        #region AutoMapper配置验证

        [Fact]
        public void AutoMapper_Configuration_Should_Be_Valid()
        {
            // Assert
            Should.NotThrow(() =>
            {
                var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfile<LowCodeAutoMapperProfile>();
                });

                config.AssertConfigurationIsValid();
            });
        }

        #endregion
    }
}

