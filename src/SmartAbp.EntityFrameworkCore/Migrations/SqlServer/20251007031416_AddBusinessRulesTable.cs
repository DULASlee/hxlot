using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartAbp.Migrations.SqlServer
{
    /// <inheritdoc />
    public partial class AddBusinessRulesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppBusinessRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    HasError = table.Column<bool>(type: "bit", nullable: false),
                    Conditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExecutionTiming = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastExecutionResult = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    LastExecutionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExecutionCount = table.Column<int>(type: "int", nullable: false),
                    SuccessCount = table.Column<int>(type: "int", nullable: false),
                    FailureCount = table.Column<int>(type: "int", nullable: false),
                    AverageExecutionTime = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    CreatorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppBusinessRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppEntityDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    TableName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BaseType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Namespace = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Module = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    EnableSoftDelete = table.Column<bool>(type: "bit", nullable: false),
                    EnableAudit = table.Column<bool>(type: "bit", nullable: false),
                    EnableMultiTenant = table.Column<bool>(type: "bit", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppEntityRelations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromEntity = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    ToEntity = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    RelationType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ForeignKey = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    NavigationProperty = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    JoinTable = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CascadeDelete = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityRelations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppEntityFields",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Length = table.Column<int>(type: "int", nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    IsPrimaryKey = table.Column<bool>(type: "bit", nullable: false),
                    IsUnique = table.Column<bool>(type: "bit", nullable: false),
                    IsIndexed = table.Column<bool>(type: "bit", nullable: false),
                    DefaultValue = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityFields_AppEntityDefinitions_EntityDefinitionId",
                        column: x => x.EntityDefinitionId,
                        principalTable: "AppEntityDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppValidationRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    RuleType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    RuleValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppValidationRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppValidationRules_AppEntityDefinitions_EntityDefinitionId",
                        column: x => x.EntityDefinitionId,
                        principalTable: "AppEntityDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRules_EntityName",
                table: "AppBusinessRules",
                column: "EntityName");

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRules_EntityName_IsActive",
                table: "AppBusinessRules",
                columns: new[] { "EntityName", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRules_IsActive",
                table: "AppBusinessRules",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRules_Priority",
                table: "AppBusinessRules",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRules_Type",
                table: "AppBusinessRules",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRules_Type_IsActive",
                table: "AppBusinessRules",
                columns: new[] { "Type", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityDefinitions_Category",
                table: "AppEntityDefinitions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityDefinitions_Module",
                table: "AppEntityDefinitions",
                column: "Module");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityDefinitions_Name",
                table: "AppEntityDefinitions",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityFields_EntityDefinitionId",
                table: "AppEntityFields",
                column: "EntityDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityFields_EntityDefinitionId_Name",
                table: "AppEntityFields",
                columns: new[] { "EntityDefinitionId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityRelations_FromEntity",
                table: "AppEntityRelations",
                column: "FromEntity");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityRelations_FromEntity_ToEntity",
                table: "AppEntityRelations",
                columns: new[] { "FromEntity", "ToEntity" });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityRelations_ToEntity",
                table: "AppEntityRelations",
                column: "ToEntity");

            migrationBuilder.CreateIndex(
                name: "IX_AppValidationRules_EntityDefinitionId",
                table: "AppValidationRules",
                column: "EntityDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppValidationRules_EntityDefinitionId_FieldName",
                table: "AppValidationRules",
                columns: new[] { "EntityDefinitionId", "FieldName" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppBusinessRules");

            migrationBuilder.DropTable(
                name: "AppEntityFields");

            migrationBuilder.DropTable(
                name: "AppEntityRelations");

            migrationBuilder.DropTable(
                name: "AppValidationRules");

            migrationBuilder.DropTable(
                name: "AppEntityDefinitions");
        }
    }
}
