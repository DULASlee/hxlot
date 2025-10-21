using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartAbp.Migrations.SqlServer
{
    /// <inheritdoc />
    public partial class AddMESEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Trigger",
                table: "AppValidationRules",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "EntityDefinitionId",
                table: "AppEntityRelations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ColumnName",
                table: "AppEntityFields",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ColumnType",
                table: "AppEntityFields",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "DetailVisible",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Disabled",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "AppEntityFields",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Filterable",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "FormVisible",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "GroupName",
                table: "AppEntityFields",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsAuditField",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsReadonly",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSoftDeleteField",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantField",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsVisible",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ListVisible",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxValue",
                table: "AppEntityFields",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinLength",
                table: "AppEntityFields",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinValue",
                table: "AppEntityFields",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pattern",
                table: "AppEntityFields",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Precision",
                table: "AppEntityFields",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Scale",
                table: "AppEntityFields",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Searchable",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Sortable",
                table: "AppEntityFields",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "BaseClass",
                table: "AppEntityDefinitions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsAggregateRoot",
                table: "AppEntityDefinitions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsAudited",
                table: "AppEntityDefinitions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMultiTenant",
                table: "AppEntityDefinitions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSoftDelete",
                table: "AppEntityDefinitions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Schema",
                table: "AppEntityDefinitions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SchemaVersion",
                table: "AppEntityDefinitions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Version",
                table: "AppEntityDefinitions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityRelations_EntityDefinitionId",
                table: "AppEntityRelations",
                column: "EntityDefinitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityRelations_AppEntityDefinitions_EntityDefinitionId",
                table: "AppEntityRelations",
                column: "EntityDefinitionId",
                principalTable: "AppEntityDefinitions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityRelations_AppEntityDefinitions_EntityDefinitionId",
                table: "AppEntityRelations");

            migrationBuilder.DropIndex(
                name: "IX_AppEntityRelations_EntityDefinitionId",
                table: "AppEntityRelations");

            migrationBuilder.DropColumn(
                name: "Trigger",
                table: "AppValidationRules");

            migrationBuilder.DropColumn(
                name: "EntityDefinitionId",
                table: "AppEntityRelations");

            migrationBuilder.DropColumn(
                name: "ColumnName",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "ColumnType",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "DetailVisible",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "Disabled",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "Filterable",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "FormVisible",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "GroupName",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "IsAuditField",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "IsReadonly",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "IsSoftDeleteField",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "IsTenantField",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "IsVisible",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "ListVisible",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "MaxValue",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "MinLength",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "MinValue",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "Pattern",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "Precision",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "Scale",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "Searchable",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "Sortable",
                table: "AppEntityFields");

            migrationBuilder.DropColumn(
                name: "BaseClass",
                table: "AppEntityDefinitions");

            migrationBuilder.DropColumn(
                name: "IsAggregateRoot",
                table: "AppEntityDefinitions");

            migrationBuilder.DropColumn(
                name: "IsAudited",
                table: "AppEntityDefinitions");

            migrationBuilder.DropColumn(
                name: "IsMultiTenant",
                table: "AppEntityDefinitions");

            migrationBuilder.DropColumn(
                name: "IsSoftDelete",
                table: "AppEntityDefinitions");

            migrationBuilder.DropColumn(
                name: "Schema",
                table: "AppEntityDefinitions");

            migrationBuilder.DropColumn(
                name: "SchemaVersion",
                table: "AppEntityDefinitions");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "AppEntityDefinitions");
        }
    }
}
