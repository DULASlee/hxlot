using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Pluralize.NET;
using System.Diagnostics;
using SmartAbp.CodeGenerator.Core.Generation.Frontend;
using Microsoft.Extensions.Configuration;
using Volo.Abp.Domain.Entities;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace SmartAbp.CodeGenerator.Services
{
    public class CodeGenerationAppService : ApplicationService, ICodeGenerationAppService
    {
        private readonly CodeWriterService _codeWriterService;
        private readonly SolutionIntegrationService _solutionIntegrationService;
        private readonly CrudArchitectureGenerator _crudGenerator;
        private readonly ILogger<CodeGenerationAppService> _logger;
        private readonly FrontendGenerator _frontendGenerator;
        private readonly IConfiguration _configuration;
        private readonly DefaultUIConfigGenerator _defaultUiConfigGenerator;
        private readonly FrontendIntegrationService _frontendIntegrationService;
        private readonly SchemaVersioningService _schemaVersioningService;
        
        public CodeGenerationAppService(
            CodeWriterService codeWriterService,
            SolutionIntegrationService solutionIntegrationService,
            CrudArchitectureGenerator crudGenerator,
            ILogger<CodeGenerationAppService> logger,
            FrontendGenerator frontendGenerator,
            IConfiguration configuration,
            DefaultUIConfigGenerator defaultUiConfigGenerator,
            FrontendIntegrationService frontendIntegrationService,
            SchemaVersioningService schemaVersioningService)
        {
            _codeWriterService = codeWriterService;
            _solutionIntegrationService = solutionIntegrationService;
            _crudGenerator = crudGenerator;
            _logger = logger;
            _frontendGenerator = frontendGenerator;
            _configuration = configuration;
            _defaultUiConfigGenerator = defaultUiConfigGenerator;
            _frontendIntegrationService = frontendIntegrationService;
            _schemaVersioningService = schemaVersioningService;
        }
        
        public async Task<GeneratedModuleDto> GenerateModuleAsync(ModuleMetadataDto input)
        {
            Check.NotNull(input, nameof(input));
            Check.NotNull(input.Entities, nameof(input.Entities));

            var generatedFiles = new List<string>();
            var solutionRoot = FindSolutionRoot();
            if (solutionRoot == null)
            {
                throw new AbpException("Could not find the solution root directory.");
            }

            // Generate default UI configuration based on metadata before any codegen
            _defaultUiConfigGenerator.ApplyDefaults(input);

            await GenerateBackendForModuleAsync(input, solutionRoot, generatedFiles);

            // Wait for all files to be written before proceeding
            await Task.Delay(500); // A small delay to ensure file system is updated

            await IntegrateModuleIntoSolutionAsync(input, solutionRoot);

            // Wait for solution/project files to be updated
            await Task.Delay(500);

            await OrchestrateDatabaseMigrationAsync(input, solutionRoot);

            await GenerateFrontendAsync(input, solutionRoot, generatedFiles);

            // Integrate routes/menus into frontend project
            await _frontendIntegrationService.IntegrateAsync(input, solutionRoot);

            // await GenerateTestProjectsAsync(testInput, solutionRoot);

            return new GeneratedModuleDto
            {
                ModuleName = input.Name,
                GeneratedFiles = generatedFiles,
                GenerationReport = "Module generation completed successfully."
            };
        }

        public Task<EntityUIConfigDto> GetUiConfigAsync(string moduleName, string entityName)
        {
            var solutionRoot = FindSolutionRoot() ?? Directory.GetCurrentDirectory();
            var uiDir = Path.Combine(solutionRoot, "src", "SmartAbp.Vue", "src", "appshell", "ui-config");
            var file = Path.Combine(uiDir, $"{moduleName}.{entityName}.ui.json");
            if (File.Exists(file))
            {
                var json = File.ReadAllText(file);
                var cfg = JsonSerializer.Deserialize<EntityUIConfigDto>(json) ?? new EntityUIConfigDto();
                return Task.FromResult(cfg);
            }
            var def = new EntityUIConfigDto
            {
                ListConfig = new ListConfigDto { DefaultPageSize = 10 },
                FormConfig = new FormConfigDto { Layout = "grid", ColumnCount = 2 },
                DetailConfig = new DetailConfigDto { Layout = "basic" }
            };
            return Task.FromResult(def);
        }

        public Task SaveUiConfigAsync(string moduleName, string entityName, EntityUIConfigDto config)
        {
            var solutionRoot = FindSolutionRoot() ?? Directory.GetCurrentDirectory();
            var uiDir = Path.Combine(solutionRoot, "src", "SmartAbp.Vue", "src", "appshell", "ui-config");
            Directory.CreateDirectory(uiDir);
            var file = Path.Combine(uiDir, $"{moduleName}.{entityName}.ui.json");
            var json = JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(file, json);
            return Task.CompletedTask;
        }

        public Task<List<string>> GetConnectionStringNamesAsync()
        {
            var connectionStrings = _configuration.GetSection("ConnectionStrings").GetChildren().Select(x => x.Key).ToList();
            return Task.FromResult(connectionStrings);
        }

        public Task<List<MenuItemDto>> GetMenuTreeAsync()
        {
            // This is a mock implementation. In a real application, you would fetch this from a database or a service.
            var menuTree = new List<MenuItemDto>
            {
                new MenuItemDto
                {
                    Id = "1",
                    Label = "System Management",
                    Children = new List<MenuItemDto>
                    {
                        new MenuItemDto { Id = "101", Label = "Users" },
                        new MenuItemDto { Id = "102", Label = "Roles" },
                    }
                },
                new MenuItemDto
                {
                    Id = "2",
                    Label = "Business Modules",
                    Children = new List<MenuItemDto>()
                }
            };
            return Task.FromResult(menuTree);
        }

        // Unified schema entrypoint: frontend sends unified schema, backend converts to ModuleMetadataDto
        public async Task<GeneratedModuleDto> GenerateFromUnifiedSchemaAsync(UnifiedModuleSchemaDto unified)
        {
            var migrated = _schemaVersioningService.MigrateToCurrent(unified);
            var input = ConvertUnified(migrated);
            return await GenerateModuleAsync(input);
        }

        public Task<ValidationReportDto> ValidateUnifiedAsync(UnifiedModuleSchemaDto unified)
        {
            var migrated = _schemaVersioningService.MigrateToCurrent(unified);
            var input = ConvertUnified(migrated);
            return ValidateModuleAsync(input);
        }

        public Task<GenerationDryRunResultDto> DryRunUnifiedAsync(UnifiedModuleSchemaDto unified)
        {
            var migrated = _schemaVersioningService.MigrateToCurrent(unified);
            var input = ConvertUnified(migrated);
            return DryRunGenerateAsync(input);
        }

        private ModuleMetadataDto ConvertUnified(UnifiedModuleSchemaDto unified)
        {
            return new ModuleMetadataDto
            {
                Id = unified.Id,
                SystemName = unified.SystemName,
                Name = unified.Name,
                DisplayName = unified.DisplayName,
                Description = unified.Description,
                Version = unified.Version,
                ArchitecturePattern = unified.ArchitecturePattern,
                DatabaseInfo = new DatabaseConfigDto
                {
                    ConnectionStringName = unified.DatabaseInfo.ConnectionStringName,
                    Provider = unified.DatabaseInfo.Provider,
                    Schema = unified.DatabaseInfo.Schema,
                },
                FeatureManagement = new FeatureManagementDto { IsEnabled = unified.FeatureManagement.IsEnabled, DefaultPolicy = unified.FeatureManagement.DefaultPolicy },
                Frontend = new FrontendConfigDto { ParentId = unified.Frontend.ParentId ?? string.Empty, RoutePrefix = unified.Frontend.RoutePrefix ?? string.Empty },
                GenerateMobilePages = unified.GenerateMobilePages,
                Dependencies = unified.Dependencies.ToList(),
                Entities = unified.Entities.Select(e => new EnhancedEntityModelDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    DisplayName = e.DisplayName ?? e.Name,
                    Description = e.Description,
                    Module = e.Module,
                    Namespace = e.Namespace,
                    TableName = e.TableName,
                    Schema = e.Schema,
                    IsAggregateRoot = e.IsAggregateRoot,
                    IsMultiTenant = e.IsMultiTenant,
                    IsSoftDelete = e.IsSoftDelete,
                    BaseClass = e.BaseClass,
                    Properties = e.Properties.Select(p => new EntityPropertyDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        DisplayName = p.Name,
                        Type = p.Type,
                        IsRequired = p.IsRequired,
                        IsKey = p.IsPrimaryKey,
                        IsUnique = p.IsUnique,
                        MaxLength = p.MaxLength,
                        MinLength = p.MinLength,
                        DefaultValue = p.DefaultValue,
                        Description = p.Description ?? string.Empty,
                    }).ToList(),
                    Relationships = e.Relationships.Select(r => new EntityRelationshipDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Type = r.Type,
                        SourceEntityId = r.SourceEntityId,
                        TargetEntityId = r.TargetEntityId,
                        SourceProperty = r.SourcePropertyName ?? string.Empty,
                        TargetProperty = r.TargetPropertyName ?? string.Empty,
                        CascadeDelete = r.CascadeDelete,
                        IsRequired = r.IsRequired,
                    }).ToList(),
                    Indexes = new List<EntityIndexDto>(),
                    Constraints = new List<EntityConstraintDto>(),
                    BusinessRules = new List<BusinessRuleDto>(),
                    Permissions = new List<EntityPermissionDto>(),
                    CodeGeneration = new CodeGenerationConfigDto { GenerateEntity = true, GenerateRepository = true, GenerateService = true, GenerateController = true, GenerateDto = true, GenerateTests = false, CustomTemplates = new Dictionary<string, string>(), Options = new CodeGenerationOptionsDto { UseAutoMapper = true, GenerateValidation = true, GenerateSwaggerDoc = true, GeneratePermissions = true, GenerateAuditLog = true } },
                    UiConfig = new EntityUIConfigDto { ListConfig = new ListConfigDto { DefaultPageSize = 10 }, FormConfig = new FormConfigDto { Layout = "grid", ColumnCount = 2 }, DetailConfig = new DetailConfigDto { Layout = "basic" } },
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Version = unified.Version,
                    Tags = new List<string>(),
                }).ToList(),
                PermissionConfig = new PermissionConfigDto
                {
                    CustomActions = unified.PermissionConfig.CustomActions
                        .Where(a => !string.Equals(a.ActionKey, "Create", StringComparison.OrdinalIgnoreCase)
                                 && !string.Equals(a.ActionKey, "Read", StringComparison.OrdinalIgnoreCase)
                                 && !string.Equals(a.ActionKey, "Update", StringComparison.OrdinalIgnoreCase)
                                 && !string.Equals(a.ActionKey, "Delete", StringComparison.OrdinalIgnoreCase))
                        .Select(a => new CustomPermissionActionDto { EntityName = a.EntityName, ActionKey = a.ActionKey, DisplayName = a.DisplayName })
                        .ToList(),
                },
            };
        }

        public async Task<DatabaseSchemaDto> IntrospectDatabaseAsync(DatabaseIntrospectionRequestDto request)
        {
            Check.NotNullOrWhiteSpace(request.ConnectionStringName, nameof(request.ConnectionStringName));
            var cs = _configuration.GetConnectionString(request.ConnectionStringName);
            if (string.IsNullOrWhiteSpace(cs))
            {
                throw new AbpException($"Connection string '{request.ConnectionStringName}' not found");
            }

            var provider = (request.Provider ?? "SqlServer").Trim();
            var schema = new DatabaseSchemaDto();

            if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
            {
                using var conn = new Microsoft.Data.SqlClient.SqlConnection(cs);
                await conn.OpenAsync();
                var cmd = conn.CreateCommand();
                cmd.CommandText = @"SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'";
                if (!string.IsNullOrWhiteSpace(request.Schema))
                {
                    cmd.CommandText += " AND TABLE_SCHEMA = @schema";
                    cmd.Parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@schema", request.Schema));
                }
                var tableList = new List<(string Schema, string Name)>();
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        tableList.Add((reader.GetString(0), reader.GetString(1)));
                    }
                }

                foreach (var (sch, name) in tableList)
                {
                    if (request.Tables != null && request.Tables.Count > 0 && !request.Tables.Contains(name)) continue;
                    var table = new TableSchemaDto { Schema = sch, Name = name };

                    // columns
                    using (var colCmd = conn.CreateCommand())
                    {
                        colCmd.CommandText = @"SELECT c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA=@s AND c.TABLE_NAME=@t";
                        colCmd.Parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@s", sch));
                        colCmd.Parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@t", name));
                        using var r = await colCmd.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.Columns.Add(new ColumnSchemaDto
                            {
                                Name = r.GetString(0),
                                DataType = r.GetString(1),
                                IsNullable = string.Equals(r.GetString(2), "YES", StringComparison.OrdinalIgnoreCase),
                                MaxLength = r.IsDBNull(3) ? null : r.GetInt32(3),
                            });
                        }
                    }

                    // PK
                    using (var pkCmd = conn.CreateCommand())
                    {
                        pkCmd.CommandText = @"SELECT c.COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE c ON c.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
WHERE tc.TABLE_SCHEMA=@s AND tc.TABLE_NAME=@t AND tc.CONSTRAINT_TYPE='PRIMARY KEY'";
                        pkCmd.Parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@s", sch));
                        pkCmd.Parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@t", name));
                        using var r = await pkCmd.ExecuteReaderAsync();
                        var pkCols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                        while (await r.ReadAsync()) pkCols.Add(r.GetString(0));
                        foreach (var c in table.Columns) c.IsPrimaryKey = pkCols.Contains(c.Name);
                    }

                    // FKs
                    using (var fkCmd = conn.CreateCommand())
                    {
                        fkCmd.CommandText = @"SELECT 
    fk_tab.TABLE_SCHEMA AS FK_SCHEMA, fk_tab.TABLE_NAME AS FK_TABLE, fk_col.COLUMN_NAME AS FK_COLUMN,
    pk_tab.TABLE_SCHEMA AS PK_SCHEMA, pk_tab.TABLE_NAME AS PK_TABLE, pk_col.COLUMN_NAME AS PK_COLUMN
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS fk ON rc.CONSTRAINT_NAME = fk.CONSTRAINT_NAME
JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS pk ON rc.UNIQUE_CONSTRAINT_NAME = pk.CONSTRAINT_NAME
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk_col ON rc.CONSTRAINT_NAME = fk_col.CONSTRAINT_NAME
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE pk_col ON pk.CONSTRAINT_NAME = pk_col.CONSTRAINT_NAME AND fk_col.ORDINAL_POSITION = pk_col.ORDINAL_POSITION
JOIN INFORMATION_SCHEMA.TABLES fk_tab ON fk.TABLE_SCHEMA = fk_tab.TABLE_SCHEMA AND fk.TABLE_NAME = fk_tab.TABLE_NAME
JOIN INFORMATION_SCHEMA.TABLES pk_tab ON pk.TABLE_SCHEMA = pk_tab.TABLE_SCHEMA AND pk.TABLE_NAME = pk_tab.TABLE_NAME
WHERE fk_tab.TABLE_SCHEMA=@s AND fk_tab.TABLE_NAME=@t";
                        fkCmd.Parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@s", sch));
                        fkCmd.Parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@t", name));
                        using var r = await fkCmd.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.ForeignKeys.Add(new ForeignKeySchemaDto
                            {
                                Column = r.GetString(2),
                                ReferencedSchema = r.GetString(3),
                                ReferencedTable = r.GetString(4),
                                ReferencedColumn = r.GetString(5),
                            });
                        }
                    }

                    schema.Tables.Add(table);
                }
            }
            else if (provider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
            {
                await using var conn = new Npgsql.NpgsqlConnection(cs);
                await conn.OpenAsync();
                var tableList = new List<(string Schema, string Name)>();
                await using (var cmd = new Npgsql.NpgsqlCommand(@"SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema')" + (string.IsNullOrWhiteSpace(request.Schema) ? "" : " AND table_schema=@s"), conn))
                {
                    if (!string.IsNullOrWhiteSpace(request.Schema)) cmd.Parameters.AddWithValue("@s", request.Schema);
                    await using var reader = await cmd.ExecuteReaderAsync();
                    while (await reader.ReadAsync()) tableList.Add((reader.GetString(0), reader.GetString(1)));
                }
                foreach (var (sch, name) in tableList)
                {
                    if (request.Tables != null && request.Tables.Count > 0 && !request.Tables.Contains(name)) continue;
                    var table = new TableSchemaDto { Schema = sch, Name = name };
                    await using (var col = new Npgsql.NpgsqlCommand(@"SELECT column_name, data_type, is_nullable, character_maximum_length FROM information_schema.columns WHERE table_schema=@s AND table_name=@t", conn))
                    {
                        col.Parameters.AddWithValue("@s", sch); col.Parameters.AddWithValue("@t", name);
                        await using var r = await col.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.Columns.Add(new ColumnSchemaDto
                            {
                                Name = r.GetString(0),
                                DataType = r.GetString(1),
                                IsNullable = string.Equals(r.GetString(2), "YES", StringComparison.OrdinalIgnoreCase),
                                MaxLength = r.IsDBNull(3) ? null : r.GetInt32(3),
                            });
                        }
                    }
                    await using (var pk = new Npgsql.NpgsqlCommand(@"SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = to_regclass(@tbl) AND i.indisprimary", conn))
                    {
                        pk.Parameters.AddWithValue("@tbl", $"\"{sch}\".\"{name}\"");
                        await using var r = await pk.ExecuteReaderAsync();
                        var pkCols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                        while (await r.ReadAsync()) pkCols.Add(r.GetString(0));
                        foreach (var c in table.Columns) c.IsPrimaryKey = pkCols.Contains(c.Name);
                    }
                    await using (var fk = new Npgsql.NpgsqlCommand(@"SELECT kcu.column_name, ccu.table_schema AS ref_schema, ccu.table_name AS ref_table, ccu.column_name AS ref_column FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema=@s AND tc.table_name=@t", conn))
                    {
                        fk.Parameters.AddWithValue("@s", sch); fk.Parameters.AddWithValue("@t", name);
                        await using var r = await fk.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.ForeignKeys.Add(new ForeignKeySchemaDto
                            {
                                Column = r.GetString(0),
                                ReferencedSchema = r.GetString(1),
                                ReferencedTable = r.GetString(2),
                                ReferencedColumn = r.GetString(3),
                            });
                        }
                    }
                    schema.Tables.Add(table);
                }
            }
            else if (provider.Equals("MySql", StringComparison.OrdinalIgnoreCase))
            {
                await using var conn = new MySqlConnector.MySqlConnection(cs);
                await conn.OpenAsync();
                var tableList = new List<(string Schema, string Name)>();
                var dbName = conn.Database;
                await using (var cmd = new MySqlConnector.MySqlCommand(@"SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema=@db" + (string.IsNullOrWhiteSpace(request.Schema) ? "" : " AND table_schema=@s"), conn))
                {
                    cmd.Parameters.AddWithValue("@db", dbName);
                    if (!string.IsNullOrWhiteSpace(request.Schema)) cmd.Parameters.AddWithValue("@s", request.Schema);
                    await using var reader = await cmd.ExecuteReaderAsync();
                    while (await reader.ReadAsync()) tableList.Add((reader.GetString(0), reader.GetString(1)));
                }
                foreach (var (sch, name) in tableList)
                {
                    if (request.Tables != null && request.Tables.Count > 0 && !request.Tables.Contains(name)) continue;
                    var table = new TableSchemaDto { Schema = sch, Name = name };
                    await using (var col = new MySqlConnector.MySqlCommand(@"SELECT column_name, data_type, is_nullable, character_maximum_length FROM information_schema.columns WHERE table_schema=@s AND table_name=@t", conn))
                    {
                        col.Parameters.AddWithValue("@s", sch); col.Parameters.AddWithValue("@t", name);
                        await using var r = await col.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.Columns.Add(new ColumnSchemaDto
                            {
                                Name = r.GetString(0),
                                DataType = r.GetString(1),
                                IsNullable = string.Equals(r.GetString(2), "YES", StringComparison.OrdinalIgnoreCase),
                                MaxLength = r.IsDBNull(3) ? null : r.GetInt32(3),
                            });
                        }
                    }
                    await using (var pk = new MySqlConnector.MySqlCommand(@"SELECT k.COLUMN_NAME FROM information_schema.table_constraints t JOIN information_schema.key_column_usage k ON k.table_name = t.table_name AND k.table_schema = t.table_schema AND k.constraint_name = t.constraint_name WHERE t.constraint_type = 'PRIMARY KEY' AND t.table_schema=@s AND t.table_name=@t", conn))
                    {
                        pk.Parameters.AddWithValue("@s", sch); pk.Parameters.AddWithValue("@t", name);
                        await using var r = await pk.ExecuteReaderAsync();
                        var pkCols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                        while (await r.ReadAsync()) pkCols.Add(r.GetString(0));
                        foreach (var c in table.Columns) c.IsPrimaryKey = pkCols.Contains(c.Name);
                    }
                    await using (var fk = new MySqlConnector.MySqlCommand(@"SELECT k.COLUMN_NAME, k.REFERENCED_TABLE_SCHEMA, k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME FROM information_schema.key_column_usage k WHERE k.TABLE_SCHEMA=@s AND k.TABLE_NAME=@t AND k.REFERENCED_TABLE_NAME IS NOT NULL", conn))
                    {
                        fk.Parameters.AddWithValue("@s", sch); fk.Parameters.AddWithValue("@t", name);
                        await using var r = await fk.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.ForeignKeys.Add(new ForeignKeySchemaDto
                            {
                                Column = r.GetString(0),
                                ReferencedSchema = r.IsDBNull(1) ? sch : r.GetString(1),
                                ReferencedTable = r.GetString(2),
                                ReferencedColumn = r.GetString(3),
                            });
                        }
                    }
                    schema.Tables.Add(table);
                }
            }
            else if (provider.Equals("Oracle", StringComparison.OrdinalIgnoreCase))
            {
                await using var conn = new Oracle.ManagedDataAccess.Client.OracleConnection(cs);
                await conn.OpenAsync();
                var tableList = new List<(string Schema, string Name)>();
                string? owner = request.Schema;
                await using (var cmd = new Oracle.ManagedDataAccess.Client.OracleCommand(@"SELECT OWNER, TABLE_NAME FROM ALL_TABLES WHERE (:owner IS NULL OR OWNER = :owner)", conn))
                {
                    cmd.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(":owner", (object?)owner ?? DBNull.Value));
                    await using var reader = await cmd.ExecuteReaderAsync();
                    while (await reader.ReadAsync()) tableList.Add((reader.GetString(0), reader.GetString(1)));
                }
                foreach (var (sch, name) in tableList)
                {
                    if (request.Tables != null && request.Tables.Count > 0 && !request.Tables.Contains(name)) continue;
                    var table = new TableSchemaDto { Schema = sch, Name = name };
                    await using (var col = new Oracle.ManagedDataAccess.Client.OracleCommand(@"SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_LENGTH FROM ALL_TAB_COLUMNS WHERE OWNER=:s AND TABLE_NAME=:t", conn))
                    {
                        col.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(":s", sch));
                        col.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(":t", name));
                        await using var r = await col.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.Columns.Add(new ColumnSchemaDto
                            {
                                Name = r.GetString(0),
                                DataType = r.GetString(1),
                                IsNullable = r.GetString(2) == "Y",
                                MaxLength = r.IsDBNull(3) ? null : Convert.ToInt32(r.GetDecimal(3)),
                            });
                        }
                    }
                    await using (var pk = new Oracle.ManagedDataAccess.Client.OracleCommand(@"SELECT cols.COLUMN_NAME FROM ALL_CONSTRAINTS cons, ALL_CONS_COLUMNS cols WHERE cons.CONSTRAINT_TYPE = 'P' AND cons.CONSTRAINT_NAME = cols.CONSTRAINT_NAME AND cols.OWNER = :s AND cols.TABLE_NAME = :t", conn))
                    {
                        pk.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(":s", sch));
                        pk.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(":t", name));
                        await using var r = await pk.ExecuteReaderAsync();
                        var pkCols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                        while (await r.ReadAsync()) pkCols.Add(r.GetString(0));
                        foreach (var c in table.Columns) c.IsPrimaryKey = pkCols.Contains(c.Name);
                    }
                    await using (var fk = new Oracle.ManagedDataAccess.Client.OracleCommand(@"SELECT a.COLUMN_NAME, c_owner.R_OWNER AS REF_OWNER, c_owner.PKTABLE_NAME AS REF_TABLE, c_owner.PKCOLUMN_NAME AS REF_COLUMN FROM ALL_CONSTRAINTS c JOIN ALL_CONS_COLUMNS a ON c.CONSTRAINT_NAME = a.CONSTRAINT_NAME JOIN (SELECT a.OWNER, a.CONSTRAINT_NAME, b.OWNER R_OWNER, b.TABLE_NAME PKTABLE_NAME, b.COLUMN_NAME PKCOLUMN_NAME FROM ALL_CONS_COLUMNS a JOIN ALL_CONS_COLUMNS b ON a.POSITION = b.POSITION WHERE a.CONSTRAINT_NAME IN (SELECT CONSTRAINT_NAME FROM ALL_CONSTRAINTS WHERE CONSTRAINT_TYPE = 'R')) c_owner ON c.CONSTRAINT_NAME = c_owner.CONSTRAINT_NAME WHERE c.CONSTRAINT_TYPE = 'R' AND c.OWNER = :s AND c.TABLE_NAME = :t", conn))
                    {
                        fk.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(":s", sch));
                        fk.Parameters.Add(new Oracle.ManagedDataAccess.Client.OracleParameter(":t", name));
                        await using var r = await fk.ExecuteReaderAsync();
                        while (await r.ReadAsync())
                        {
                            table.ForeignKeys.Add(new ForeignKeySchemaDto
                            {
                                Column = r.GetString(0),
                                ReferencedSchema = r.GetString(1),
                                ReferencedTable = r.GetString(2),
                                ReferencedColumn = r.GetString(3),
                            });
                        }
                    }
                    schema.Tables.Add(table);
                }
            }
            else
            {
                throw new AbpException($"Provider '{provider}' not supported");
            }

            return schema;
        }

        public Task<ValidationReportDto> ValidateModuleAsync(ModuleMetadataDto input)
        {
            Check.NotNull(input, nameof(input));
            var report = new ValidationReportDto { IsValid = true };

            if (string.IsNullOrWhiteSpace(input.SystemName))
            {
                report.IsValid = false;
                report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = "SystemName 不能为空", Path = "systemName" });
            }
            if (string.IsNullOrWhiteSpace(input.Name))
            {
                report.IsValid = false;
                report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = "Module Name 不能为空", Path = "name" });
            }
            if (input.Entities == null || input.Entities.Count == 0)
            {
                report.IsValid = false;
                report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = "必须至少定义一个实体", Path = "entities" });
                return Task.FromResult(report);
            }

            // 基础校验：实体重名、字段必填、字段重名等
            var entityNameSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            report.EntitiesCount = input.Entities.Count;
            foreach (var entity in input.Entities)
            {
                if (string.IsNullOrWhiteSpace(entity.Name))
                {
                    report.IsValid = false;
                    report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = "实体名称不能为空", Path = $"entities[{input.Entities.IndexOf(entity)}].name" });
                    continue;
                }
                if (!entityNameSet.Add(entity.Name))
                {
                    report.IsValid = false;
                    report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = $"实体名称重复: {entity.Name}", Path = $"entities[{input.Entities.IndexOf(entity)}].name" });
                }

                if (entity.Properties == null || entity.Properties.Count == 0)
                {
                    report.IsValid = false;
                    report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = $"实体 {entity.Name} 必须至少有一个属性", Path = $"entities[{input.Entities.IndexOf(entity)}].properties" });
                    continue;
                }

                var propNameSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var prop in entity.Properties)
                {
                    if (string.IsNullOrWhiteSpace(prop.Name))
                    {
                        report.IsValid = false;
                        report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = $"实体 {entity.Name} 存在属性名称为空", Path = $"entities[{input.Entities.IndexOf(entity)}].properties[*].name" });
                        continue;
                    }
                    if (!propNameSet.Add(prop.Name))
                    {
                        report.IsValid = false;
                        report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = $"实体 {entity.Name} 的属性重名: {prop.Name}", Path = $"entities[{input.Entities.IndexOf(entity)}].properties.{prop.Name}" });
                    }
                }

                // UI 配置基本一致性校验
                var displayCols = entity.UiConfig?.ListConfig?.DisplayColumns ?? new List<string>();
                foreach (var col in displayCols)
                {
                    if (!propNameSet.Contains(col))
                    {
                        report.Issues.Add(new ValidationIssueDto { Severity = "warning", Message = $"列表展示列 {col} 不存在于实体 {entity.Name} 属性中", Path = $"entities[{input.Entities.IndexOf(entity)}].uiConfig.listConfig.displayColumns" });
                    }
                }
            }

            report.PropertiesCount = input.Entities.SelectMany(e => e.Properties ?? new List<EntityPropertyDto>()).Count();

            // 权限动作校验：过滤默认 CRUD 的自定义重复
            var dupCustom = input.PermissionConfig?.CustomActions
                ?.Where(a => a != null)
                ?.GroupBy(a => ($"{a.EntityName}::{a.ActionKey}"))
                ?.Where(g => g.Count() > 1)
                ?.ToList();
            if (dupCustom != null && dupCustom.Count > 0)
            {
                report.IsValid = false;
                foreach (var g in dupCustom)
                {
                    report.Issues.Add(new ValidationIssueDto { Severity = "error", Message = $"自定义权限动作重复: {g.Key.Split("::")[0]}.{g.Key.Split("::")[1]}", Path = "permissionConfig.customActions" });
                }
            }

            return Task.FromResult(report);
        }

        public async Task<GenerationDryRunResultDto> DryRunGenerateAsync(ModuleMetadataDto input)
        {
            Check.NotNull(input, nameof(input));
            var solutionRoot = FindSolutionRoot() ?? Directory.GetCurrentDirectory();

            // 统一填充默认 UI 配置，保证生成器一致
            _defaultUiConfigGenerator.ApplyDefaults(input);

            Dictionary<string, string> backendFiles;
            switch (input.ArchitecturePattern)
            {
                case "Crud":
                    backendFiles = await _crudGenerator.GenerateAsync(input, solutionRoot);
                    break;
                default:
                    backendFiles = new Dictionary<string, string>();
                    break;
            }

            var frontendFiles = _frontendGenerator.Generate(input, solutionRoot);

            var combined = new Dictionary<string, string>(backendFiles);
            foreach (var kv in frontendFiles)
            {
                combined[kv.Key] = kv.Value;
            }

            var totalLines = combined.Sum(kv => kv.Value?.Split('\n').Length ?? 0);

            return new GenerationDryRunResultDto
            {
                Success = true,
                ModuleName = input.Name,
                TotalFiles = combined.Count,
                TotalLines = totalLines,
                Files = combined.Keys.ToList(),
                GenerationReport = "Dry run successful",
                GeneratedAt = DateTime.UtcNow,
            };
        }

        private async Task GenerateBackendForModuleAsync(ModuleMetadataDto metadata, string solutionRoot, List<string> generatedFiles)
        {
            Dictionary<string, string> filesToGenerate;

            switch (metadata.ArchitecturePattern)
            {
                case "Crud":
                    filesToGenerate = await _crudGenerator.GenerateAsync(metadata, solutionRoot);
                    break;
                case "DDD":
                case "CQRS":
                default:
                     _logger.LogWarning("{Pattern} architecture pattern generation is not yet implemented.", metadata.ArchitecturePattern);
                    filesToGenerate = new Dictionary<string, string>();
                    break;
            }

            // Quality gates before writing any backend files
            await RunQualityGatesAsync(filesToGenerate, "backend");

            foreach (var file in filesToGenerate)
            {
                await WriteAndTrackFileAsync(file.Key, file.Value, generatedFiles);
            }
        }

        private async Task OrchestrateDatabaseMigrationAsync(ModuleMetadataDto metadata, string solutionRoot)
        {
            _logger.LogInformation("Orchestrating database migration for module {ModuleName}...", metadata.Name);

            var mode = _configuration["CodeGenerator:MigrationMode"] ?? Environment.GetEnvironmentVariable("CODEGEN_MIGRATION_MODE") ?? "Script"; // Script | Apply | None
            if (string.Equals(mode, "None", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Database migration mode is 'None'; skipping migration orchestration.");
                return;
            }

            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            var migrationName = $"Generated_{moduleName}_{DateTime.Now:yyyyMMddHHmmss}";
            var efProjectPath = Path.Combine(solutionRoot, $"src\\SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore");
            var startupProjectPath = Path.Combine(solutionRoot, "src\\SmartAbp.DbMigrator");

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "dotnet",
                    Arguments = $"ef migrations add {migrationName} --project \"{efProjectPath}\" --startup-project \"{startupProjectPath}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WorkingDirectory = solutionRoot,
                }
            };

            process.Start();
            string output = await process.StandardOutput.ReadToEndAsync();
            string error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode == 0)
            {
                _logger.LogInformation("Successfully created EF Core migration '{MigrationName}'. Output: {Output}", migrationName, output);
                if (string.Equals(mode, "Script", StringComparison.OrdinalIgnoreCase))
                {
                    var artifactsDir = Path.Combine(solutionRoot, "artifacts", "migrations", systemName, moduleName);
                    Directory.CreateDirectory(artifactsDir);
                    var scriptPath = Path.Combine(artifactsDir, $"{migrationName}.sql");

                    var scriptProcess = new Process
                    {
                        StartInfo = new ProcessStartInfo
                        {
                            FileName = "dotnet",
                            Arguments = $"ef migrations script --idempotent --project \"{efProjectPath}\" --startup-project \"{startupProjectPath}\" -o \"{scriptPath}\"",
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            UseShellExecute = false,
                            CreateNoWindow = true,
                            WorkingDirectory = solutionRoot,
                        }
                    };

                    scriptProcess.Start();
                    string scriptOut = await scriptProcess.StandardOutput.ReadToEndAsync();
                    string scriptErr = await scriptProcess.StandardError.ReadToEndAsync();
                    await scriptProcess.WaitForExitAsync();

                    if (scriptProcess.ExitCode == 0)
                    {
                        _logger.LogInformation("Generated idempotent migration script at {Path}. Output: {Output}", scriptPath, scriptOut);
                    }
                    else
                    {
                        _logger.LogError("Failed to generate migration script. Error: {Error}", scriptErr);
                    }

                    // Do not apply DB updates in Script mode
                    return;
                }

                // Apply mode: proceed to update the database
                var updateProcess = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "dotnet",
                        Arguments = $"ef database update --project \"{efProjectPath}\" --startup-project \"{startupProjectPath}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        WorkingDirectory = solutionRoot,
                    }
                };

                updateProcess.Start();
                string updateOutput = await updateProcess.StandardOutput.ReadToEndAsync();
                string updateError = await updateProcess.StandardError.ReadToEndAsync();
                await updateProcess.WaitForExitAsync();

                if (updateProcess.ExitCode == 0)
                {
                    _logger.LogInformation("Successfully updated database for module '{ModuleName}'. Output: {Output}", metadata.Name, updateOutput);
                }
                else
                {
                    _logger.LogError("Failed to update database for module '{ModuleName}'. Error: {Error}", metadata.Name, updateError);
                }
            }
            else
            {
                _logger.LogError("Failed to create EF Core migration '{MigrationName}'. Error: {Error}", migrationName, error);
                // We are not throwing an exception here to allow the rest of the generation to continue,
                // but in a production scenario, this might need to be a blocking error.
            }
        }
        
        private async Task GenerateFrontendAsync(ModuleMetadataDto metadata, string solutionRoot, List<string> generatedFiles)
        {
            _logger.LogInformation("Generating Frontend for module {ModuleName}...", metadata.Name);
            var filesToGenerate = _frontendGenerator.Generate(metadata, solutionRoot);

            // Quality gates before writing any frontend files
            await RunQualityGatesAsync(filesToGenerate, "frontend");
            foreach (var file in filesToGenerate)
            {
                // Hybrid for Vue SFC: write <name>.generated.vue; create <name>.vue if missing and re-export/compose
                if (file.Key.EndsWith(".vue", StringComparison.OrdinalIgnoreCase))
                {
                    var generatedPath = Path.Combine(Path.GetDirectoryName(file.Key)!,
                        Path.GetFileNameWithoutExtension(file.Key) + ".generated.vue");
                    await _codeWriterService.WriteFileAsync(generatedPath, file.Value);
                    generatedFiles.Add(generatedPath);

                    var manualPath = file.Key;
                    if (!File.Exists(manualPath))
                    {
                        var componentName = Path.GetFileNameWithoutExtension(file.Key);
                        var manualSfc = @"<template>
  <div class=""manual-wrapper"">
    <!-- You can customize header, slots, and composition here -->
    <component :is=""Generated"" />
  </div>
</template>

<script setup lang=""ts"">
import Generated from './__COMPONENT__.generated.vue'
</script>

<style scoped>
.manual-wrapper { width: 100%; }
</style>
";
                        manualSfc = manualSfc.Replace("__COMPONENT__", componentName);
                        await _codeWriterService.WriteFileAsync(manualPath, manualSfc);
                        generatedFiles.Add(manualPath);
                    }
                }
                else
                {
                    await WriteAndTrackFileAsync(file.Key, file.Value, generatedFiles);
                }
            }
        }

        private async Task RunQualityGatesAsync(Dictionary<string, string> files, string lane)
        {
            // Synchronous checks; keep async signature for future IO-based analyzers
            await Task.Yield();

            var issues = new List<string>();

            // 1) C# syntax diagnostics and simple banned patterns
            foreach (var (path, content) in files)
            {
                var lower = path.ToLowerInvariant();
                if (lower.EndsWith(".cs"))
                {
                    try
                    {
                        var tree = CSharpSyntaxTree.ParseText(content);
                        var diags = tree.GetDiagnostics();
                        foreach (var d in diags)
                        {
                            if (d.Severity == DiagnosticSeverity.Error)
                            {
                                issues.Add($"[C#] {path}: {d.Id} {d.GetMessage()}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        issues.Add($"[C#] {path}: parse exception {ex.Message}");
                    }

                    // crude SQL string interpolation detector
                    if (Regex.IsMatch(content, @"\$""\s*SELECT[\n\r\s\S]*?\{.+?\}", RegexOptions.IgnoreCase))
                    {
                        issues.Add($"[C#] {path}: possible SQL injection via interpolated string");
                    }
                }
                else if (lower.EndsWith(".ts") || lower.EndsWith(".vue"))
                {
                    // 2) JS/TS/Vue banned patterns
                    if (Regex.IsMatch(content, @"\beval\s*\(", RegexOptions.IgnoreCase))
                    {
                        issues.Add($"[TS] {path}: usage of eval()");
                    }
                    if (Regex.IsMatch(content, @"\bnew\s+Function\s*\(", RegexOptions.IgnoreCase))
                    {
                        issues.Add($"[TS] {path}: usage of new Function()");
                    }
                }
            }

            if (issues.Count > 0)
            {
                var message = $"Quality gates failed in lane '{lane}':\n" + string.Join("\n", issues);
                _logger.LogError(message);
                throw new AbpException(message);
            }
        }
        
        private async Task GenerateTestProjectsAsync(ModuleMetadataDto metadata, string solutionRoot)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            var solutionFile = Path.Combine(solutionRoot, "SmartAbp.sln");
            
            var appTestsProjectDir = Path.Combine(solutionRoot, $"tests/SmartAbp.{systemName}.{moduleName}.Application.Tests");
            Directory.CreateDirectory(appTestsProjectDir);
            
            var appTestsProjectPath = Path.Combine(appTestsProjectDir, $"SmartAbp.{systemName}.{moduleName}.Application.Tests.csproj");
            
            // TODO: Re-implement test project generation using Roslyn/templates
            var appTestsProjectContent = ""; 
            await WriteAndTrackFileAsync(appTestsProjectPath, appTestsProjectContent, new List<string>());

            await _solutionIntegrationService.AddProjectToSolutionAsync(solutionFile, appTestsProjectPath);

            foreach (var entity in metadata.Entities)
            {
                // TODO: Re-implement test class generation using Roslyn/templates
                var testClassContent = "";
                var testClassPath = Path.Combine(appTestsProjectDir, "Services", $"{entity.Name}AppService_Tests.cs");
                await WriteAndTrackFileAsync(testClassPath, testClassContent, new List<string>());
            }
        }

        private async Task IntegrateModuleIntoSolutionAsync(ModuleMetadataDto metadata, string solutionRoot)
        {
            var systemName = metadata.SystemName;
            var moduleName = metadata.Name;
            var solutionFile = Path.Combine(solutionRoot, "SmartAbp.sln");

            var projectPaths = new[]
            {
                Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Application.Contracts/SmartAbp.{systemName}.{moduleName}.Application.Contracts.csproj"),
                Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Application/SmartAbp.{systemName}.{moduleName}.Application.csproj"),
                Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore/SmartAbp.{systemName}.{moduleName}.EntityFrameworkCore.csproj"),
            };

            foreach (var projectPath in projectPaths)
            {
                if (File.Exists(projectPath))
                {
                    await _solutionIntegrationService.AddProjectToSolutionAsync(solutionFile, projectPath);
                }
            }
            
            var webProjectPath = Path.Combine(solutionRoot, "src/SmartAbp.Web/SmartAbp.Web.csproj");
            var appProjectPath = Path.Combine(solutionRoot, $"src/SmartAbp.{systemName}.{moduleName}.Application/SmartAbp.{systemName}.{moduleName}.Application.csproj");

            if (File.Exists(webProjectPath) && File.Exists(appProjectPath))
            {
                await _solutionIntegrationService.AddProjectReferenceAsync(webProjectPath, appProjectPath);
            }
        }
        
        private string Pluralize(string word) => new Pluralizer().Pluralize(word);

        private async Task GenerateFrontendHybridAsync(ModuleMetadataDto metadata, string solutionRoot, List<string> generatedFiles)
        {
            // TODO: Re-implement frontend generation
            await Task.CompletedTask;
        }
        
        private async Task WriteAndTrackFileAsync(string filePath, string content, List<string> generatedFiles)
        {
            try
            {
                if (filePath.EndsWith(".cs", StringComparison.OrdinalIgnoreCase) && !filePath.EndsWith(".generated.cs", StringComparison.OrdinalIgnoreCase))
                {
                    var ns = TryExtractNamespace(content);
                    var cls = TryExtractPartialClassName(content);
                    if (!string.IsNullOrWhiteSpace(ns) && !string.IsNullOrWhiteSpace(cls) && content.Contains("partial class "))
                    {
                        var result = await _codeWriterService.WriteHybridCodeAsync(filePath, content, ns!, cls!);
                        generatedFiles.Add(result.generatedFilePath);
                        if (File.Exists(result.manualFilePath)) generatedFiles.Add(result.manualFilePath);
                        return;
                    }
                }

                await _codeWriterService.WriteFileAsync(filePath, content);
                generatedFiles.Add(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write file {Path}", filePath);
                throw;
            }
        }

        private string? FindSolutionRoot()
        {
            var currentDir = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (currentDir != null)
            {
                if (currentDir.GetFiles("*.sln").Any())
            {
                    return currentDir.FullName;
                }
                currentDir = currentDir.Parent;
            }
            return null;
        }

        private static string? TryExtractNamespace(string content)
        {
            foreach (var line in content.Split('\n'))
            {
                var t = line.Trim();
                if (t.StartsWith("namespace "))
                {
                    return t.Substring("namespace ".Length).Trim().Trim('{', ' ', '\r');
                }
            }
            return null;
        }

        private static string? TryExtractPartialClassName(string content)
        {
            foreach (var line in content.Split('\n'))
            {
                var t = line.Trim();
                var idx = t.IndexOf("partial class ", StringComparison.Ordinal);
                if (idx >= 0)
                {
                    var rest = t.Substring(idx + "partial class ".Length).Trim();
                    var name = new string(rest.TakeWhile(ch => char.IsLetterOrDigit(ch) || ch == '_').ToArray());
                    return string.IsNullOrWhiteSpace(name) ? null : name;
                }
            }
            return null;
        }
        
        private ModuleMetadataDto CreateProjectManagementTestData()
        {
            return new ModuleMetadataDto
            {
                Id = Guid.NewGuid().ToString(),
                SystemName = "SmartConstruction",
                Name = "ProjectManagement",
                DisplayName = "项目管理",
                Version = "1.0.0",
                ArchitecturePattern = "Crud",
                DatabaseInfo = new DatabaseConfigDto { Schema = "sm_project" },
                FeatureManagement = new FeatureManagementDto { IsEnabled = true, DefaultPolicy = "SmartConstruction.ProjectManagement" },
                Entities = new List<EnhancedEntityModelDto>
                {
                    new EnhancedEntityModelDto { Name = "Project", DisplayName = "项目", Properties = new List<EntityPropertyDto> { new EntityPropertyDto { Name = "Name", Type = "string", IsRequired = true, MaxLength = 128 }, new EntityPropertyDto { Name = "StartDate", Type = "DateTime"} } },
                    new EnhancedEntityModelDto { Name = "Team", DisplayName = "班组", Properties = new List<EntityPropertyDto> { new EntityPropertyDto { Name = "Name", Type = "string", IsRequired = true, MaxLength = 64} } }
                }
            };
        }

        public Task<SchemaVersionManifestDto> GetSchemaVersionManifestAsync()
        {
            var v = new Version(_schemaVersioningService.CurrentVersion);
            var dto = new SchemaVersionManifestDto
            {
                CurrentVersion = _schemaVersioningService.CurrentVersion,
                CurrentMajor = v.Major,
                MinSupportedMajor = v.Major,
                MaxSupportedMajor = v.Major,
            };
            return Task.FromResult(dto);
        }

        #region Unimplemented Interface Methods
        
        public Task<GeneratedCodeDto> GenerateEntityAsync(EntityDefinitionDto input)
        {
            throw new NotImplementedException("This method is deprecated and will be removed. Use GenerateModuleAsync instead.");
        }

        public Task<GeneratedDddSolutionDto> GenerateDddDomainAsync(DddDefinitionDto input)
        {
            throw new NotImplementedException("DDD pattern generation will be implemented in a future iteration using the new Roslyn-based architecture.");
        }

        public Task<GeneratedCqrsSolutionDto> GenerateCqrsAsync(CqrsDefinitionDto input)
        {
            throw new NotImplementedException("CQRS pattern generation will be implemented in a future iteration using the new Roslyn-based architecture.");
        }

        public Task<GeneratedApplicationLayerDto> GenerateApplicationServicesAsync(ApplicationServiceDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<GeneratedInfrastructureLayerDto> GenerateInfrastructureAsync(InfrastructureDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<GeneratedAspireSolutionDto> GenerateAspireSolutionAsync(AspireSolutionDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<GeneratedCachingSolutionDto> GenerateCachingSolutionAsync(CachingDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<GeneratedMessagingSolutionDto> GenerateMessagingSolutionAsync(MessagingDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<GeneratedTestSuiteDto> GenerateTestSuiteAsync(TestSuiteDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<GeneratedTelemetrySolutionDto> GenerateTelemetrySolutionAsync(TelemetryDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<GeneratedQualitySolutionDto> GenerateQualitySolutionAsync(QualityDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<EnterpriseSolutionDto> GenerateEnterpriseSolutionAsync(EnterpriseSolutionDefinitionDto input)
        {
            throw new NotImplementedException();
        }

        public Task<CodeGenerationStatisticsDto> GetStatisticsAsync()
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}
