using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SmartAbp.Migrations.SqlServer
{
    /// <summary>
    /// 添加代码生成器用户相关表 (SqlServer版本)
    /// </summary>
    public partial class AddCodeGenUserTables_SqlServer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // CodeGenStats - 代码生成统计表
            migrationBuilder.CreateTable(
                name: "AppCodeGenStats",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    TotalProjects = table.Column<int>(nullable: false, defaultValue: 0),
                    MonthlyGenerations = table.Column<int>(nullable: false, defaultValue: 0),
                    SavedHours = table.Column<int>(nullable: false, defaultValue: 0),
                    QualityScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false, defaultValue: 0),
                    LastUpdated = table.Column<DateTime>(nullable: false),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorId = table.Column<Guid>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppCodeGenStats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppCodeGenStats_AbpUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
                
            migrationBuilder.CreateIndex(
                name: "IX_AppCodeGenStats_UserId",
                table: "AppCodeGenStats",
                column: "UserId");
                
            // UserProfiles - 用户配置表
            migrationBuilder.CreateTable(
                name: "AppUserProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    Industry = table.Column<string>(maxLength: 50, nullable: true),
                    CompanyName = table.Column<string>(maxLength: 200, nullable: true),
                    CompanySize = table.Column<string>(maxLength: 20, nullable: true),
                    LastUsedMode = table.Column<string>(maxLength: 20, nullable: true),
                    IsFirstVisit = table.Column<bool>(nullable: false, defaultValue: true),
                    Preferences = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorId = table.Column<Guid>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierId = table.Column<Guid>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppUserProfiles_AbpUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
                
            migrationBuilder.CreateIndex(
                name: "IX_AppUserProfiles_UserId",
                table: "AppUserProfiles",
                column: "UserId",
                unique: true);
                
            migrationBuilder.CreateIndex(
                name: "IX_AppUserProfiles_Industry",
                table: "AppUserProfiles",
                column: "Industry");
                
            // GenerationHistories - 生成历史表
            migrationBuilder.CreateTable(
                name: "AppGenerationHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    Mode = table.Column<string>(maxLength: 20, nullable: false),
                    TemplateName = table.Column<string>(maxLength: 100, nullable: true),
                    ProjectName = table.Column<string>(maxLength: 200, nullable: false),
                    EntityCount = table.Column<int>(nullable: false, defaultValue: 0),
                    GeneratedFileCount = table.Column<int>(nullable: false, defaultValue: 0),
                    GenerationDuration = table.Column<int>(nullable: false),
                    Status = table.Column<string>(maxLength: 20, nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorId = table.Column<Guid>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppGenerationHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppGenerationHistories_AbpUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
                
            migrationBuilder.CreateIndex(
                name: "IX_AppGenerationHistories_UserId",
                table: "AppGenerationHistories",
                column: "UserId");
                
            migrationBuilder.CreateIndex(
                name: "IX_AppGenerationHistories_CreationTime",
                table: "AppGenerationHistories",
                column: "CreationTime");
        }
        
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "AppCodeGenStats");
            migrationBuilder.DropTable(name: "AppUserProfiles");
            migrationBuilder.DropTable(name: "AppGenerationHistories");
        }
    }
}

