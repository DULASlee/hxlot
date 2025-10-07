using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartAbp.Migrations.SqlServer
{
    /// <inheritdoc />
    public partial class AddBusinessRuleVersionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppBusinessRuleVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BusinessRuleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Conditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExecutionTiming = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangeType = table.Column<int>(type: "int", nullable: false),
                    ChangeDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ChangeReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsCurrent = table.Column<bool>(type: "bit", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppBusinessRuleVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppBusinessRuleVersions_AppBusinessRules_BusinessRuleId",
                        column: x => x.BusinessRuleId,
                        principalTable: "AppBusinessRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRuleVersions_BusinessRuleId",
                table: "AppBusinessRuleVersions",
                column: "BusinessRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRuleVersions_BusinessRuleId_IsCurrent",
                table: "AppBusinessRuleVersions",
                columns: new[] { "BusinessRuleId", "IsCurrent" });

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRuleVersions_BusinessRuleId_Version",
                table: "AppBusinessRuleVersions",
                columns: new[] { "BusinessRuleId", "Version" });

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRuleVersions_ChangeType",
                table: "AppBusinessRuleVersions",
                column: "ChangeType");

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRuleVersions_IsCurrent",
                table: "AppBusinessRuleVersions",
                column: "IsCurrent");

            migrationBuilder.CreateIndex(
                name: "IX_AppBusinessRuleVersions_Version",
                table: "AppBusinessRuleVersions",
                column: "Version");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppBusinessRuleVersions");
        }
    }
}
