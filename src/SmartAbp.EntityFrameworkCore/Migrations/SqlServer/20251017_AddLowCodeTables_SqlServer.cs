using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SmartAbp.Migrations.SqlServer
{
    /// <summary>
    /// 🔥 Phase 1核心迁移：添加4张低代码核心表 (SqlServer版本)
    /// 迁移日期：2025-10-17
    /// 设计文档：数据库设计实施方案-分阶段务实版.md
    /// 架构决策：后端SSOT（Single Source of Truth）
    /// </summary>
    public partial class AddLowCodeTables_SqlServer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 表1：LC_Modules（模块管理）
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            migrationBuilder.CreateTable(
                name: "LC_Modules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Version = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "1.0.0"),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON数组
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LC_Modules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LC_Modules_SystemName_TenantId",
                table: "LC_Modules",
                columns: new[] { "SystemName", "TenantId" },
                unique: true,
                filter: "[TenantId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LC_Modules_TenantId",
                table: "LC_Modules",
                column: "TenantId");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 表2：LC_Entities（实体定义）
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            migrationBuilder.CreateTable(
                name: "LC_Entities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TableName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON数组
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LC_Entities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LC_Entities_LC_Modules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "LC_Modules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LC_Entities_ModuleId",
                table: "LC_Entities",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_LC_Entities_SystemName_TenantId",
                table: "LC_Entities",
                columns: new[] { "SystemName", "TenantId" },
                unique: true,
                filter: "[TenantId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LC_Entities_TenantId",
                table: "LC_Entities",
                column: "TenantId");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 表3：LC_Properties（属性定义 + UI配置）⭐核心
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            migrationBuilder.CreateTable(
                name: "LC_Properties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsUnique = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsIndexed = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DefaultValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MinLength = table.Column<int>(type: "int", nullable: true),
                    MaxLength = table.Column<int>(type: "int", nullable: true),
                    MinValue = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    MaxValue = table.Column<decimal>(type: "decimal(18,4)", nullable: true),
                    RegexPattern = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    // 🔥 UI配置JSON字段（核心）
                    UIConfig = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LC_Properties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LC_Properties_LC_Entities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "LC_Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LC_Properties_EntityId",
                table: "LC_Properties",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_LC_Properties_EntityId_SystemName",
                table: "LC_Properties",
                columns: new[] { "EntityId", "SystemName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LC_Properties_TenantId",
                table: "LC_Properties",
                column: "TenantId");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 表4：LC_PageConfigs（页面配置）⭐⭐⭐ 核心
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            migrationBuilder.CreateTable(
                name: "LC_PageConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    // 🔥🔥🔥 页面配置JSON字段（最核心）
                    PageConfig = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: true), // JSON
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LC_PageConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LC_PageConfigs_LC_Entities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "LC_Entities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LC_PageConfigs_EntityId",
                table: "LC_PageConfigs",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_LC_PageConfigs_EntityId_PageType",
                table: "LC_PageConfigs",
                columns: new[] { "EntityId", "PageType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LC_PageConfigs_TenantId",
                table: "LC_PageConfigs",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "LC_PageConfigs");
            migrationBuilder.DropTable(name: "LC_Properties");
            migrationBuilder.DropTable(name: "LC_Entities");
            migrationBuilder.DropTable(name: "LC_Modules");
        }
    }
}

