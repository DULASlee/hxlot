using System.Collections.Generic;
using SmartAbp.CodeGenerator.Services.Generators;
using SmartAbp.CodeGenerator.Services.V9;
using Xunit;
using Xunit.Abstractions;
using Shouldly;

namespace SmartAbp.Application.Tests.CodeGeneration
{
    /// <summary>
    /// 🧪 P0-2: 导航属性生成器单元测试
    /// </summary>
    public class NavigationPropertyGeneratorTests
    {
        private readonly ITestOutputHelper _output;
        private readonly NavigationPropertyGenerator _generator;

        public NavigationPropertyGeneratorTests(ITestOutputHelper output)
        {
            _output = output;
            _generator = new NavigationPropertyGenerator();
        }

        [Fact]
        public void Should_Generate_ManyToOne_NavigationProperty()
        {
            // Arrange - Tenant.Parent关系
            var relationship = new EntityRelationshipDto
            {
                Name = "Parent",
                DisplayName = "父租户",
                Type = "ManyToOne",
                SourceNavigationProperty = "Parent",
                TargetEntity = "Tenant",
                ForeignKeyProperty = "ParentId",
                IsRequired = false
            };

            // Act
            var code = _generator.GenerateNavigationProperty(relationship);

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("/// 父租户");
            code.ShouldContain("[ForeignKey(nameof(ParentId))]");
            code.ShouldContain("public virtual Tenant? Parent { get; set; }");

            _output.WriteLine("✅ ManyToOne导航属性生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_OneToMany_NavigationProperty()
        {
            // Arrange - Tenant.Children关系
            var relationship = new EntityRelationshipDto
            {
                Name = "Children",
                DisplayName = "子租户集合",
                Type = "OneToMany",
                TargetNavigationProperty = "Children",
                TargetEntity = "Tenant"
            };

            // Act
            var code = _generator.GenerateNavigationProperty(relationship);

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("/// 子租户集合");
            code.ShouldContain("public virtual List<Tenant> Children { get; set; } = new();");

            _output.WriteLine("✅ OneToMany导航属性生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_ForeignKey_Property()
        {
            // Arrange
            var relationship = new EntityRelationshipDto
            {
                Name = "SubscriptionPlan",
                DisplayName = "订阅计划",
                ForeignKeyProperty = "SubscriptionPlanId",
                IsRequired = false
            };

            // Act
            var code = _generator.GenerateForeignKeyProperty(relationship);

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("/// 外键：订阅计划");
            code.ShouldContain("public Guid? SubscriptionPlanId { get; set; }");

            _output.WriteLine("✅ 外键属性生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_Required_ForeignKey()
        {
            // Arrange
            var relationship = new EntityRelationshipDto
            {
                Name = "Tenant",
                DisplayName = "所属租户",
                ForeignKeyProperty = "TenantId",
                IsRequired = true,
                IsForeignKeyRequired = true
            };

            // Act
            var code = _generator.GenerateForeignKeyProperty(relationship);

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("public Guid TenantId { get; set; }");
            code.ShouldNotContain("Guid?"); // 不应该有问号

            _output.WriteLine("✅ 必需外键生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_Entity_Navigation_Properties()
        {
            // Arrange
            var entity = CreateTenantEntity();

            // Act
            var result = _generator.GenerateEntityNavigationProperties(entity);

            // Assert
            result.ShouldNotBeNull();
            result.EntityName.ShouldBe("Tenant");
            result.ForeignKeyProperties.Count.ShouldBe(2); // ParentId, SubscriptionPlanId
            result.NavigationProperties.Count.ShouldBe(3); // Parent, Children, SubscriptionPlan
            result.RequiredUsings.ShouldContain("System.ComponentModel.DataAnnotations.Schema");

            _output.WriteLine($"✅ 成功生成{result.NavigationProperties.Count}个导航属性:");
            foreach (var nav in result.NavigationProperties)
            {
                _output.WriteLine(nav);
            }
        }

        [Fact]
        public void Should_Generate_Fluent_API_Configuration()
        {
            // Arrange - OneToMany关系
            var relationship = new EntityRelationshipDto
            {
                Name = "Children",
                Type = "OneToMany",
                TargetNavigationProperty = "Children",
                SourceNavigationProperty = "Parent",
                ForeignKeyProperty = "ParentId",
                CascadeDelete = false,
                OnDeleteBehavior = RelationshipDeleteBehavior.Restrict
            };

            // Act
            var code = _generator.GenerateFluentApiConfiguration(relationship, "Tenant");

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("builder.HasMany(e => e.Children)");
            code.ShouldContain(".WithOne(e => e.Parent)");
            code.ShouldContain(".HasForeignKey(e => e.ParentId)");
            code.ShouldContain(".OnDelete(DeleteBehavior.Restrict)");

            _output.WriteLine("✅ Fluent API配置生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_EntityTypeConfiguration_Class()
        {
            // Arrange
            var entity = CreateTenantEntity();

            // Act
            var code = _generator.GenerateEntityTypeConfiguration(entity, "SmartAbp.EntityFrameworkCore.Configurations");

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("namespace SmartAbp.EntityFrameworkCore.Configurations");
            code.ShouldContain("public class TenantConfiguration : IEntityTypeConfiguration<Tenant>");
            code.ShouldContain("builder.ToTable(\"Tenants\")");
            code.ShouldContain("builder.HasMany(e => e.Children)");
            code.ShouldContain("builder.HasOne(e => e.SubscriptionPlan)");

            _output.WriteLine("✅ EntityTypeConfiguration类生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_TypeScript_NavigationProperty()
        {
            // Arrange
            var relationship = new EntityRelationshipDto
            {
                Name = "SubscriptionPlan",
                DisplayName = "订阅计划",
                Type = "ManyToOne",
                SourceNavigationProperty = "SubscriptionPlan",
                TargetEntity = "SubscriptionPlan",
                IsRequired = false
            };

            // Act
            var code = _generator.GenerateTypeScriptNavigationProperty(relationship);

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("/** 订阅计划 */");
            code.ShouldContain("subscriptionPlan?: SubscriptionPlanDto");

            _output.WriteLine("✅ TypeScript导航属性生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Handle_SelfReferencing_Relationship()
        {
            // Arrange - 自引用关系（Tenant.Parent → Tenant）
            var parentRelationship = new EntityRelationshipDto
            {
                Name = "Parent",
                DisplayName = "父租户",
                Type = "ManyToOne",
                SourceNavigationProperty = "Parent",
                TargetEntity = "Tenant",
                ForeignKeyProperty = "ParentId",
                IsRequired = false
            };

            var childrenRelationship = new EntityRelationshipDto
            {
                Name = "Children",
                DisplayName = "子租户",
                Type = "OneToMany",
                TargetNavigationProperty = "Children",
                SourceNavigationProperty = "Parent",
                TargetEntity = "Tenant",
                ForeignKeyProperty = "ParentId"
            };

            // Act
            var parentCode = _generator.GenerateNavigationProperty(parentRelationship);
            var childrenCode = _generator.GenerateNavigationProperty(childrenRelationship);

            // Assert
            parentCode.ShouldContain("public virtual Tenant? Parent { get; set; }");
            childrenCode.ShouldContain("public virtual List<Tenant> Children { get; set; } = new();");

            _output.WriteLine("✅ 自引用关系处理成功");
        }

        #region Test Data Helpers

        private EnhancedEntityModelDto CreateTenantEntity()
        {
            return new EnhancedEntityModelDto
            {
                Name = "Tenant",
                DisplayName = "租户",
                TableName = "Tenants",
                Relationships = new List<EntityRelationshipDto>
                {
                    // 父租户（自引用 - ManyToOne）
                    new()
                    {
                        Name = "Parent",
                        DisplayName = "父租户",
                        Type = "ManyToOne",
                        SourceNavigationProperty = "Parent",
                        TargetEntity = "Tenant",
                        ForeignKeyProperty = "ParentId",
                        IsRequired = false,
                        CascadeDelete = false,
                        OnDeleteBehavior = RelationshipDeleteBehavior.Restrict
                    },
                    // 子租户（自引用 - OneToMany）
                    new()
                    {
                        Name = "Children",
                        DisplayName = "子租户集合",
                        Type = "OneToMany",
                        TargetNavigationProperty = "Children",
                        SourceNavigationProperty = "Parent",
                        TargetEntity = "Tenant",
                        ForeignKeyProperty = "ParentId",
                        CascadeDelete = false,
                        OnDeleteBehavior = RelationshipDeleteBehavior.Restrict
                    },
                    // 订阅计划（ManyToOne）
                    new()
                    {
                        Name = "SubscriptionPlan",
                        DisplayName = "订阅计划",
                        Type = "ManyToOne",
                        SourceNavigationProperty = "SubscriptionPlan",
                        TargetEntity = "SubscriptionPlan",
                        ForeignKeyProperty = "SubscriptionPlanId",
                        IsRequired = false,
                        CascadeDelete = false,
                        OnDeleteBehavior = RelationshipDeleteBehavior.SetNull
                    }
                }
            };
        }

        #endregion
    }
}

