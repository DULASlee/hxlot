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
        
        public CodeGenerationAppService(
            CodeWriterService codeWriterService,
            SolutionIntegrationService solutionIntegrationService,
            CrudArchitectureGenerator crudGenerator,
            ILogger<CodeGenerationAppService> logger,
            FrontendGenerator frontendGenerator,
            IConfiguration configuration,
            DefaultUIConfigGenerator defaultUiConfigGenerator,
            FrontendIntegrationService frontendIntegrationService)
        {
            _codeWriterService = codeWriterService;
            _solutionIntegrationService = solutionIntegrationService;
            _crudGenerator = crudGenerator;
            _logger = logger;
            _frontendGenerator = frontendGenerator;
            _configuration = configuration;
            _defaultUiConfigGenerator = defaultUiConfigGenerator;
            _frontendIntegrationService = frontendIntegrationService;
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

            foreach (var file in filesToGenerate)
            {
                await WriteAndTrackFileAsync(file.Key, file.Value, generatedFiles);
            }
        }

        private async Task OrchestrateDatabaseMigrationAsync(ModuleMetadataDto metadata, string solutionRoot)
        {
            _logger.LogInformation("Orchestrating database migration for module {ModuleName}...", metadata.Name);

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

                // Proceed to update the database
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
            foreach (var file in filesToGenerate)
            {
                await WriteAndTrackFileAsync(file.Key, file.Value, generatedFiles);
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
            await _codeWriterService.WriteFileAsync(filePath, content);
            generatedFiles.Add(filePath);
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
