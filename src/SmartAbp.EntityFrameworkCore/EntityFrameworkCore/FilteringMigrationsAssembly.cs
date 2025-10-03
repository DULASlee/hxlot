using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;

namespace SmartAbp.EntityFrameworkCore;

/// <summary>
/// 基于命名空间过滤的 IMigrationsAssembly 实现，仅暴露当前数据库类型的迁移与快照
/// </summary>
public class FilteringMigrationsAssembly : IMigrationsAssembly
{
    private readonly ICurrentDbContext _currentDbContext;
    private readonly Assembly _assembly;
    private readonly string _requiredNamespace;

    private IReadOnlyDictionary<string, TypeInfo>? _cachedMigrations;
    private ModelSnapshot? _cachedSnapshot;

    public FilteringMigrationsAssembly(
        ICurrentDbContext currentDbContext,
        IConfiguration configuration)
    {
        _currentDbContext = currentDbContext;
        _assembly = _currentDbContext.Context.GetType().Assembly;

        var dbType = MultiDatabaseMigrationManager.GetDatabaseType(configuration);
        _requiredNamespace = dbType switch
        {
            DatabaseType.SqlServer => "SmartAbp.Migrations.SqlServer",
            DatabaseType.PostgreSQL => "SmartAbp.Migrations.PostgreSQL",
            DatabaseType.SQLite => "SmartAbp.Migrations.SQLite",
            DatabaseType.MySQL => "SmartAbp.Migrations.MySQL",
            _ => "SmartAbp.Migrations.SqlServer"
        };
    }

    public Assembly Assembly => _assembly;

    public IReadOnlyDictionary<string, TypeInfo> Migrations
        => _cachedMigrations ??= LoadMigrations();

    public ModelSnapshot? ModelSnapshot
        => _cachedSnapshot ??= LoadModelSnapshot();

    public string? FindMigrationId(string nameOrId)
    {
        if (string.IsNullOrWhiteSpace(nameOrId)) return null;

        // 精确匹配Id
        if (Migrations.ContainsKey(nameOrId)) return nameOrId;

        // 按名称匹配（类名、去除后缀）
        var match = Migrations.Keys
            .FirstOrDefault(id => id.Equals(nameOrId, StringComparison.OrdinalIgnoreCase)
                               || id.EndsWith("_" + nameOrId, StringComparison.OrdinalIgnoreCase));
        return match;
    }

    public Migration CreateMigration(TypeInfo migrationClass, string activeProvider)
    {
        var instance = (Migration)Activator.CreateInstance(migrationClass.AsType())!;
        instance.ActiveProvider = activeProvider;
        return instance;
    }

    public ModelSnapshot CreateModelSnapshot(TypeInfo modelSnapshotClass)
    {
        return (ModelSnapshot)Activator.CreateInstance(modelSnapshotClass.AsType())!;
    }

    private IReadOnlyDictionary<string, TypeInfo> LoadMigrations()
    {
        var migrationTypes = _assembly
            .DefinedTypes
            .Where(t => t.IsClass && !t.IsAbstract && t.IsSubclassOf(typeof(Migration)))
            .Where(t => t.Namespace != null && t.Namespace.StartsWith(_requiredNamespace, StringComparison.Ordinal))
            .Select(t => new
            {
                Type = t,
                Id = t.GetCustomAttribute<MigrationAttribute>()?.Id
            })
            .Where(x => !string.IsNullOrEmpty(x.Id))
            .ToDictionary(x => x.Id!, x => x.Type);

        return migrationTypes;
    }

    private ModelSnapshot? LoadModelSnapshot()
    {
        var snapshotType = _assembly
            .DefinedTypes
            .FirstOrDefault(t => t.IsClass && !t.IsAbstract && t.IsSubclassOf(typeof(ModelSnapshot))
                                 && t.Namespace != null && t.Namespace.StartsWith(_requiredNamespace, StringComparison.Ordinal));

        return snapshotType != null
            ? (ModelSnapshot)Activator.CreateInstance(snapshotType.AsType())!
            : null;
    }
}


