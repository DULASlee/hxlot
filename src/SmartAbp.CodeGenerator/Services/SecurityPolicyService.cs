using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 安全策略服务 - Day 12
    /// 提供网络策略、RBAC配置生成等功能
    /// </summary>
    public class SecurityPolicyService : ApplicationService
    {
        private readonly ILogger<SecurityPolicyService> _logger;

        public SecurityPolicyService(ILogger<SecurityPolicyService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 验证安全策略
        /// </summary>
        public Task<(bool IsValid, List<string> Errors)> ValidateSecurityPolicyAsync(SecurityPolicyDto policy)
        {
            _logger.LogInformation("🔍 验证安全策略");

            var errors = new List<string>();

            // 验证网络策略
            if (policy.NetworkPolicy.IngressRules.Count == 0 && policy.NetworkPolicy.EgressRules.Count == 0)
            {
                errors.Add("网络策略至少需要配置一条Ingress或Egress规则");
            }

            // 验证RBAC
            if (policy.Authorization.Type == "RBAC" && policy.Authorization.Roles.Count == 0)
            {
                errors.Add("RBAC模式下至少需要定义一个角色");
            }

            // 验证密钥管理
            if (policy.Secrets.Provider == "AzureKeyVault" && string.IsNullOrEmpty(policy.Secrets.KeyVaultUri))
            {
                errors.Add("使用Azure Key Vault时必须提供KeyVaultUri");
            }

            // 验证API安全
            if (policy.ApiSecurity.EnableRateLimiting && policy.ApiSecurity.RateLimitPerMinute <= 0)
            {
                errors.Add("限流速率必须大于0");
            }

            if (policy.ApiSecurity.EnableCORS && policy.ApiSecurity.AllowedOrigins.Count == 0)
            {
                errors.Add("启用CORS时必须配置允许的源");
            }

            var isValid = errors.Count == 0;

            _logger.LogInformation(isValid 
                ? "✅ 安全策略验证通过" 
                : $"❌ 安全策略验证失败，发现 {errors.Count} 个错误");

            return Task.FromResult((isValid, errors));
        }

        /// <summary>
        /// 生成Kubernetes NetworkPolicy
        /// </summary>
        public Task<GeneratedNetworkPolicyDto> GenerateNetworkPolicyAsync(
            string serviceName,
            NetworkPolicyDto networkPolicy)
        {
            _logger.LogInformation("🚀 生成网络策略: {ServiceName}", serviceName);

            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: networking.k8s.io/v1");
            yaml.AppendLine("kind: NetworkPolicy");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-network-policy");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");
            yaml.AppendLine("spec:");

            // PodSelector
            if (networkPolicy.EnablePodSelector && networkPolicy.PodSelector.Count > 0)
            {
                yaml.AppendLine("  podSelector:");
                yaml.AppendLine("    matchLabels:");
                foreach (var selector in networkPolicy.PodSelector)
                {
                    yaml.AppendLine($"      {selector.Key}: {selector.Value}");
                }
            }
            else
            {
                yaml.AppendLine("  podSelector: {}"); // 选择所有Pod
            }

            // PolicyTypes
            var policyTypes = new List<string>();
            if (networkPolicy.IngressRules.Count > 0) policyTypes.Add("Ingress");
            if (networkPolicy.EgressRules.Count > 0) policyTypes.Add("Egress");

            yaml.AppendLine("  policyTypes:");
            foreach (var type in policyTypes)
            {
                yaml.AppendLine($"  - {type}");
            }

            // Ingress Rules
            if (networkPolicy.IngressRules.Count > 0)
            {
                yaml.AppendLine("  ingress:");
                foreach (var rule in networkPolicy.IngressRules)
                {
                    yaml.AppendLine("  - ports:");
                    foreach (var port in rule.Ports)
                    {
                        yaml.AppendLine($"    - protocol: {rule.Protocol}");
                        yaml.AppendLine($"      port: {port}");
                    }

                    yaml.AppendLine("    from:");
                    if (rule.FromCIDR.Count > 0)
                    {
                        foreach (var cidr in rule.FromCIDR)
                        {
                            yaml.AppendLine("    - ipBlock:");
                            yaml.AppendLine($"        cidr: {cidr}");
                        }
                    }
                    if (rule.FromPodSelector.Count > 0)
                    {
                        yaml.AppendLine("    - podSelector:");
                        yaml.AppendLine("        matchLabels:");
                        foreach (var selector in rule.FromPodSelector)
                        {
                            yaml.AppendLine($"          {selector.Key}: {selector.Value}");
                        }
                    }
                }
            }

            // Egress Rules
            if (networkPolicy.EgressRules.Count > 0)
            {
                yaml.AppendLine("  egress:");
                foreach (var rule in networkPolicy.EgressRules)
                {
                    yaml.AppendLine("  - ports:");
                    foreach (var port in rule.Ports)
                    {
                        yaml.AppendLine($"    - protocol: {rule.Protocol}");
                        yaml.AppendLine($"      port: {port}");
                    }

                    yaml.AppendLine("    to:");
                    if (rule.ToCIDR.Count > 0)
                    {
                        foreach (var cidr in rule.ToCIDR)
                        {
                            yaml.AppendLine("    - ipBlock:");
                            yaml.AppendLine($"        cidr: {cidr}");
                        }
                    }
                    if (rule.ToPodSelector.Count > 0)
                    {
                        yaml.AppendLine("    - podSelector:");
                        yaml.AppendLine("        matchLabels:");
                        foreach (var selector in rule.ToPodSelector)
                        {
                            yaml.AppendLine($"          {selector.Key}: {selector.Value}");
                        }
                    }
                }
            }

            var result = new GeneratedNetworkPolicyDto
            {
                PolicyName = $"{serviceName}-network-policy",
                YamlContent = yaml.ToString()
            };

            _logger.LogInformation("✅ 网络策略生成完成");
            return Task.FromResult(result);
        }

        /// <summary>
        /// 生成Kubernetes RBAC配置
        /// </summary>
        public Task<GeneratedRBACManifestDto> GenerateRBACManifestAsync(
            string serviceName,
            AuthorizationDto authorization)
        {
            _logger.LogInformation("🚀 生成RBAC配置: {ServiceName}", serviceName);

            var manifests = new Dictionary<string, string>();

            // 生成ServiceAccount
            var serviceAccount = GenerateServiceAccount(serviceName);
            manifests[$"serviceaccount-{serviceName}.yaml"] = serviceAccount;

            // 生成Roles
            foreach (var role in authorization.Roles)
            {
                var roleYaml = GenerateRole(serviceName, role);
                manifests[$"role-{role.Name}.yaml"] = roleYaml;
            }

            // 生成RoleBindings
            foreach (var binding in authorization.RoleBindings)
            {
                var bindingYaml = GenerateRoleBinding(serviceName, binding);
                manifests[$"rolebinding-{binding.Name}.yaml"] = bindingYaml;
            }

            var result = new GeneratedRBACManifestDto
            {
                Manifests = manifests,
                RoleCount = authorization.Roles.Count,
                RoleBindingCount = authorization.RoleBindings.Count
            };

            _logger.LogInformation("✅ RBAC配置生成完成，共 {Count} 个资源", manifests.Count);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Methods
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateServiceAccount(string serviceName)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: v1");
            yaml.AppendLine("kind: ServiceAccount");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-sa");
            yaml.AppendLine($"  labels:");
            yaml.AppendLine($"    app: {serviceName}");

            return yaml.ToString();
        }

        private string GenerateRole(string serviceName, RoleDto role)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: rbac.authorization.k8s.io/v1");
            yaml.AppendLine("kind: Role");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-{role.Name}");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");
            foreach (var label in role.Labels)
            {
                yaml.AppendLine($"    {label.Key}: {label.Value}");
            }

            yaml.AppendLine("rules:");
            foreach (var permission in role.Permissions)
            {
                // 解析权限格式：apiGroup:resource:verb
                var parts = permission.Split(':');
                if (parts.Length >= 3)
                {
                    yaml.AppendLine($"- apiGroups: [\"{parts[0]}\"]");
                    yaml.AppendLine($"  resources: [\"{parts[1]}\"]");
                    yaml.AppendLine($"  verbs: [\"{parts[2]}\"]");
                }
            }

            return yaml.ToString();
        }

        private string GenerateRoleBinding(string serviceName, RoleBindingDto binding)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: rbac.authorization.k8s.io/v1");
            yaml.AppendLine("kind: RoleBinding");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-{binding.Name}");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");

            yaml.AppendLine("roleRef:");
            yaml.AppendLine("  apiGroup: rbac.authorization.k8s.io");
            yaml.AppendLine("  kind: Role");
            yaml.AppendLine($"  name: {serviceName}-{binding.RoleName}");

            yaml.AppendLine("subjects:");
            foreach (var subject in binding.Subjects)
            {
                yaml.AppendLine($"- kind: {binding.SubjectType}");
                yaml.AppendLine($"  name: {subject}");
                yaml.AppendLine("  namespace: default");
            }

            return yaml.ToString();
        }
    }
}

