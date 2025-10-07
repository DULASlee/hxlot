using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartAbp.Migrations.SqlServer
{
    /// <inheritdoc />
    public partial class AddCodeGenStatsAndUserProfileTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppCodeGenStats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalProjects = table.Column<int>(type: "int", nullable: false),
                    MonthlyGenerations = table.Column<int>(type: "int", nullable: false),
                    SavedHours = table.Column<int>(type: "int", nullable: false),
                    QualityScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppCodeGenStats", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppGenerationHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Mode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    TemplateName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    ProjectName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EntityCount = table.Column<int>(type: "int", nullable: false),
                    GeneratedFileCount = table.Column<int>(type: "int", nullable: false),
                    GenerationDuration = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Metadata = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppGenerationHistories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppUserProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CompanySize = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    LastUsedMode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IsFirstVisit = table.Column<bool>(type: "bit", nullable: false),
                    Preferences = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserProfiles", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppCodeGenStats_UserId",
                table: "AppCodeGenStats",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppGenerationHistories_Mode",
                table: "AppGenerationHistories",
                column: "Mode");

            migrationBuilder.CreateIndex(
                name: "IX_AppGenerationHistories_Status",
                table: "AppGenerationHistories",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AppGenerationHistories_UserId",
                table: "AppGenerationHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AppGenerationHistories_UserId_CreationTime",
                table: "AppGenerationHistories",
                columns: new[] { "UserId", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_AppGenerationHistories_UserId_Status",
                table: "AppGenerationHistories",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_AppUserProfiles_Industry",
                table: "AppUserProfiles",
                column: "Industry");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserProfiles_UserId",
                table: "AppUserProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppCodeGenStats");

            migrationBuilder.DropTable(
                name: "AppGenerationHistories");

            migrationBuilder.DropTable(
                name: "AppUserProfiles");
        }
    }
}
