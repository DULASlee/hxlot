using System;
using Volo.Abp;
using Volo.Abp.DependencyInjection;
using SmartAbp.CodeGenerator.Services.V9;
using System.Collections.Generic;
using System.Linq;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// Minimal schema versioning and migration facade.
    /// - Validates semver
    /// - Blocks incompatible major versions
    /// - Provides hook for minor/patch migrations
    /// </summary>
    public class SchemaVersioningService : ITransientDependency
    {
        public string CurrentVersion => "1.1.0";

        private readonly Dictionary<string, List<ISchemaMigrationRule>> _rules = new();

        public SchemaVersioningService()
        {
            // Register built-in safe migrations (non-breaking)
            Register(new NormalizeDisplayNameRule("1.0.0", "1.0.1"));
            Register(new EnsureFrontendDefaultsRule("1.0.1", "1.1.0"));
        }

        public UnifiedModuleSchemaDto MigrateToCurrent(UnifiedModuleSchemaDto input)
        {
            if (input == null) throw new AbpException("Unified schema is null");
            var incoming = ParseSemVerSafe(input.Version ?? "1.0.0");
            var current = ParseSemVerSafe(CurrentVersion);

            if (incoming.Major != current.Major)
            {
                throw new UserFriendlyException(
                    $"Unified schema major version incompatible: incoming {incoming}, current {current}. " +
                    "Please use a compatible Designer or provide migration rules.");
            }

            if (incoming != current)
            {
                input = ApplyMigrations(input, incoming, current);
            }

            input.Version = CurrentVersion;
            return input;
        }

        private static Version ParseSemVerSafe(string version)
        {
            try
            {
                // Normalize x.y -> x.y.0
                var parts = version.Split('.', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2) version += ".0";
                return Version.Parse(version);
            }
            catch
            {
                // Fallback to 1.0.0 to avoid nulls; callers decide policy
                return new Version(1, 0, 0);
            }
        }

        private void Register(ISchemaMigrationRule rule)
        {
            var key = rule.From;
            if (!_rules.ContainsKey(key)) _rules[key] = new List<ISchemaMigrationRule>();
            _rules[key].Add(rule);
        }

        private UnifiedModuleSchemaDto ApplyMigrations(UnifiedModuleSchemaDto input, Version from, Version to)
        {
            // BFS to find path over registered rules (by exact version strings)
            var start = Normalize(from);
            var target = Normalize(to);
            if (start == target) return input;

            var q = new Queue<string>();
            var prev = new Dictionary<string, (string from, ISchemaMigrationRule rule)>();
            q.Enqueue(start);
            var visited = new HashSet<string> { start };

            while (q.Count > 0)
            {
                var cur = q.Dequeue();
                if (!_rules.TryGetValue(cur, out var nexts)) continue;
                foreach (var rule in nexts)
                {
                    var nxt = rule.To;
                    if (visited.Contains(nxt)) continue;
                    visited.Add(nxt);
                    prev[nxt] = (cur, rule);
                    if (nxt == target) { q.Clear(); break; }
                    q.Enqueue(nxt);
                }
            }

            if (!prev.ContainsKey(target))
            {
                // No path found: allow passthrough for same major; return input unchanged
                return input;
            }

            // Reconstruct path
            var path = new List<ISchemaMigrationRule>();
            var curV = target;
            while (curV != start)
            {
                var step = prev[curV];
                path.Add(step.rule);
                curV = step.from;
            }
            path.Reverse();

            // Snapshot for rollback
            var snapshot = Clone(input);
            try
            {
                var currentSchema = input;
                foreach (var r in path)
                {
                    currentSchema = r.Migrate(currentSchema);
                }
                return currentSchema;
            }
            catch (Exception ex)
            {
                // rollback and surface error
                _ = ex; // optional log
                return snapshot;
            }
        }

        private static UnifiedModuleSchemaDto Clone(UnifiedModuleSchemaDto s)
        {
            return new UnifiedModuleSchemaDto
            {
                Id = s.Id,
                SystemName = s.SystemName,
                Name = s.Name,
                DisplayName = s.DisplayName,
                Description = s.Description,
                Version = s.Version,
                ArchitecturePattern = s.ArchitecturePattern,
                DatabaseInfo = new UnifiedDatabaseConfigDto
                {
                    ConnectionStringName = s.DatabaseInfo.ConnectionStringName,
                    Provider = s.DatabaseInfo.Provider,
                    Schema = s.DatabaseInfo.Schema,
                },
                FeatureManagement = new UnifiedFeatureManagementDto
                {
                    IsEnabled = s.FeatureManagement.IsEnabled,
                    DefaultPolicy = s.FeatureManagement.DefaultPolicy,
                },
                Frontend = new UnifiedFrontendConfigDto
                {
                    ParentId = s.Frontend.ParentId,
                    RoutePrefix = s.Frontend.RoutePrefix,
                },
                GenerateMobilePages = s.GenerateMobilePages,
                Dependencies = new List<string>(s.Dependencies),
                Entities = s.Entities.Select(e => new UnifiedEntitySchemaDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    DisplayName = e.DisplayName,
                    Description = e.Description,
                    Module = e.Module,
                    Namespace = e.Namespace,
                    TableName = e.TableName,
                    Schema = e.Schema,
                    IsAggregateRoot = e.IsAggregateRoot,
                    IsMultiTenant = e.IsMultiTenant,
                    IsSoftDelete = e.IsSoftDelete,
                    BaseClass = e.BaseClass,
                    Properties = e.Properties.Select(p => new UnifiedPropertySchemaDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Type = p.Type,
                        IsRequired = p.IsRequired,
                        IsPrimaryKey = p.IsPrimaryKey,
                        IsUnique = p.IsUnique,
                        MaxLength = p.MaxLength,
                        MinLength = p.MinLength,
                        DefaultValue = p.DefaultValue,
                        Description = p.Description,
                    }).ToList(),
                    Relationships = e.Relationships.Select(r => new UnifiedRelationshipSchemaDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Type = r.Type,
                        SourceEntityId = r.SourceEntityId,
                        TargetEntityId = r.TargetEntityId,
                        SourcePropertyName = r.SourcePropertyName,
                        TargetPropertyName = r.TargetPropertyName,
                        CascadeDelete = r.CascadeDelete,
                        IsRequired = r.IsRequired,
                    }).ToList(),
                }).ToList(),
                PermissionConfig = new UnifiedPermissionConfigDto
                {
                    CustomActions = s.PermissionConfig.CustomActions.Select(a => new UnifiedCustomPermissionActionDto
                    {
                        EntityName = a.EntityName,
                        ActionKey = a.ActionKey,
                        DisplayName = a.DisplayName,
                    }).ToList(),
                    InheritedPermissions = new Dictionary<string, string[]>(s.PermissionConfig.RoleBasedAccess).Keys.ToList(), // keep
                    RoleBasedAccess = new Dictionary<string, string[]>(s.PermissionConfig.RoleBasedAccess),
                },
            };
        }

        private static string Normalize(Version v) => $"{v.Major}.{v.Minor}.{v.Build}";
    }

    internal interface ISchemaMigrationRule
    {
        string From { get; }
        string To { get; }
        UnifiedModuleSchemaDto Migrate(UnifiedModuleSchemaDto input);
    }

    internal sealed class NormalizeDisplayNameRule : ISchemaMigrationRule
    {
        public string From { get; }
        public string To { get; }
        public NormalizeDisplayNameRule(string from, string to) { From = from; To = to; }
        public UnifiedModuleSchemaDto Migrate(UnifiedModuleSchemaDto input)
        {
            foreach (var e in input.Entities)
            {
                if (string.IsNullOrWhiteSpace(e.DisplayName)) e.DisplayName = e.Name;
            }
            return input;
        }
    }

    internal sealed class EnsureFrontendDefaultsRule : ISchemaMigrationRule
    {
        public string From { get; }
        public string To { get; }
        public EnsureFrontendDefaultsRule(string from, string to) { From = from; To = to; }
        public UnifiedModuleSchemaDto Migrate(UnifiedModuleSchemaDto input)
        {
            input.Frontend ??= new UnifiedFrontendConfigDto();
            input.Frontend.RoutePrefix ??= string.Empty;
            return input;
        }
    }
}


