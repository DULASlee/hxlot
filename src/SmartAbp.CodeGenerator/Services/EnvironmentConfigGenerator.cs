using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 环境配置生成器 - Day 10
    /// 生成Kubernetes Manifests和Helm Charts
    /// </summary>
    public class EnvironmentConfigGenerator
    {
        private readonly ILogger<EnvironmentConfigGenerator> _logger;

        public EnvironmentConfigGenerator(ILogger<EnvironmentConfigGenerator> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 生成Kubernetes Deployment manifest
        /// </summary>
        public Task<GeneratedKubernetesManifestDto> GenerateKubernetesManifestAsync(
            string serviceName,
            EnvironmentConfigDto envConfig)
        {
            _logger.LogInformation("🚀 生成Kubernetes Manifest: {ServiceName} - {Environment}",
                serviceName, envConfig.Environment);

            var manifests = new Dictionary<string, string>();

            // 生成Deployment
            var deployment = GenerateDeployment(serviceName, envConfig);
            manifests[$"deployment-{serviceName}.yaml"] = deployment;

            // 生成Service
            var service = GenerateService(serviceName, envConfig);
            manifests[$"service-{serviceName}.yaml"] = service;

            // 如果启用自动扩缩容,生成HPA
            if (envConfig.EnableAutoScaling && envConfig.AutoScaling != null)
            {
                var hpa = GenerateHPA(serviceName, envConfig.AutoScaling);
                manifests[$"hpa-{serviceName}.yaml"] = hpa;
            }

            var result = new GeneratedKubernetesManifestDto
            {
                Environment = envConfig.Environment,
                Manifests = manifests,
                ResourceCount = manifests.Count
            };

            _logger.LogInformation("✅ Kubernetes Manifest生成完成，共 {Count} 个资源", result.ResourceCount);
            return Task.FromResult(result);
        }

        /// <summary>
        /// 生成Helm Chart
        /// </summary>
        public Task<GeneratedHelmChartDto> GenerateHelmChartAsync(
            string chartName,
            List<string> services,
            Dictionary<string, EnvironmentConfigDto> environments)
        {
            _logger.LogInformation("📦 生成Helm Chart: {ChartName}", chartName);

            var files = new Dictionary<string, string>();

            // 生成Chart.yaml
            files["Chart.yaml"] = GenerateChartYaml(chartName);

            // 生成values.yaml（包含所有环境配置）
            files["values.yaml"] = GenerateValuesYaml(services, environments);

            // 生成deployment模板
            files["templates/deployment.yaml"] = GenerateDeploymentTemplate();

            // 生成service模板
            files["templates/service.yaml"] = GenerateServiceTemplate();

            // 生成HPA模板
            files["templates/hpa.yaml"] = GenerateHPATemplate();

            var result = new GeneratedHelmChartDto
            {
                ChartName = chartName,
                ChartVersion = "1.0.0",
                Files = files,
                TemplateCount = 3
            };

            _logger.LogInformation("✅ Helm Chart生成完成，共 {Count} 个文件", result.Files.Count);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Kubernetes Manifest生成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateDeployment(string serviceName, EnvironmentConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: apps/v1");
            yaml.AppendLine("kind: Deployment");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");
            yaml.AppendLine($"    environment: {config.Environment.ToLower()}");
            yaml.AppendLine("spec:");
            yaml.AppendLine($"  replicas: {config.DefaultReplicas}");
            yaml.AppendLine("  selector:");
            yaml.AppendLine("    matchLabels:");
            yaml.AppendLine($"      app: {serviceName}");
            yaml.AppendLine("  strategy:");
            yaml.AppendLine($"    type: {config.DeploymentStrategy.Type}");
            yaml.AppendLine("    rollingUpdate:");
            yaml.AppendLine($"      maxSurge: {config.DeploymentStrategy.MaxSurge}");
            yaml.AppendLine($"      maxUnavailable: {config.DeploymentStrategy.MaxUnavailable}");
            yaml.AppendLine("  template:");
            yaml.AppendLine("    metadata:");
            yaml.AppendLine("      labels:");
            yaml.AppendLine($"        app: {serviceName}");
            yaml.AppendLine("    spec:");
            yaml.AppendLine("      containers:");
            yaml.AppendLine($"      - name: {serviceName}");
            yaml.AppendLine($"        image: {serviceName}:latest");
            yaml.AppendLine("        ports:");
            yaml.AppendLine("        - containerPort: 8080");
            yaml.AppendLine("        resources:");
            yaml.AppendLine("          requests:");
            yaml.AppendLine($"            cpu: {config.Resources.CpuRequest}");
            yaml.AppendLine($"            memory: {config.Resources.MemoryRequest}");
            yaml.AppendLine("          limits:");
            yaml.AppendLine($"            cpu: {config.Resources.CpuLimit}");
            yaml.AppendLine($"            memory: {config.Resources.MemoryLimit}");

            // 环境变量
            if (config.EnvironmentVariables.Count > 0)
            {
                yaml.AppendLine("        env:");
                foreach (var env in config.EnvironmentVariables)
                {
                    yaml.AppendLine($"        - name: {env.Key}");
                    yaml.AppendLine($"          value: \"{env.Value}\"");
                }
            }

            // 健康检查
            if (config.Features.EnableHealthChecks)
            {
                yaml.AppendLine("        livenessProbe:");
                yaml.AppendLine("          httpGet:");
                yaml.AppendLine("            path: /health");
                yaml.AppendLine("            port: 8080");
                yaml.AppendLine("          initialDelaySeconds: 30");
                yaml.AppendLine("          periodSeconds: 10");
                yaml.AppendLine("        readinessProbe:");
                yaml.AppendLine("          httpGet:");
                yaml.AppendLine("            path: /health/ready");
                yaml.AppendLine("            port: 8080");
                yaml.AppendLine("          initialDelaySeconds: 5");
                yaml.AppendLine("          periodSeconds: 5");
            }

            return yaml.ToString();
        }

        private string GenerateService(string serviceName, EnvironmentConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: v1");
            yaml.AppendLine("kind: Service");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  type: ClusterIP");
            yaml.AppendLine("  ports:");
            yaml.AppendLine("  - port: 80");
            yaml.AppendLine("    targetPort: 8080");
            yaml.AppendLine("    protocol: TCP");
            yaml.AppendLine("    name: http");
            yaml.AppendLine("  selector:");
            yaml.AppendLine($"    app: {serviceName}");

            return yaml.ToString();
        }

        private string GenerateHPA(string serviceName, AutoScalingConfigDto autoScaling)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: autoscaling/v2");
            yaml.AppendLine("kind: HorizontalPodAutoscaler");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  scaleTargetRef:");
            yaml.AppendLine("    apiVersion: apps/v1");
            yaml.AppendLine("    kind: Deployment");
            yaml.AppendLine($"    name: {serviceName}");
            yaml.AppendLine($"  minReplicas: {autoScaling.MinReplicas}");
            yaml.AppendLine($"  maxReplicas: {autoScaling.MaxReplicas}");
            yaml.AppendLine("  metrics:");
            yaml.AppendLine("  - type: Resource");
            yaml.AppendLine("    resource:");
            yaml.AppendLine("      name: cpu");
            yaml.AppendLine("      target:");
            yaml.AppendLine("        type: Utilization");
            yaml.AppendLine($"        averageUtilization: {autoScaling.TargetCPUUtilization}");
            yaml.AppendLine("  - type: Resource");
            yaml.AppendLine("    resource:");
            yaml.AppendLine("      name: memory");
            yaml.AppendLine("      target:");
            yaml.AppendLine("        type: Utilization");
            yaml.AppendLine($"        averageUtilization: {autoScaling.TargetMemoryUtilization}");

            return yaml.ToString();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Helm Chart生成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateChartYaml(string chartName)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: v2");
            yaml.AppendLine($"name: {chartName}");
            yaml.AppendLine("description: Auto-generated Helm chart for microservices");
            yaml.AppendLine("type: application");
            yaml.AppendLine("version: 1.0.0");
            yaml.AppendLine("appVersion: \"1.0\"");

            return yaml.ToString();
        }

        private string GenerateValuesYaml(List<string> services, Dictionary<string, EnvironmentConfigDto> environments)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("# Default values for microservices");
            yaml.AppendLine();
            yaml.AppendLine("# Global configuration");
            yaml.AppendLine("global:");
            yaml.AppendLine("  imagePullPolicy: IfNotPresent");
            yaml.AppendLine();

            yaml.AppendLine("# Environment-specific configurations");
            yaml.AppendLine("environments:");

            foreach (var env in environments)
            {
                yaml.AppendLine($"  {env.Key.ToLower()}:");
                yaml.AppendLine($"    replicas: {env.Value.DefaultReplicas}");
                yaml.AppendLine("    resources:");
                yaml.AppendLine("      requests:");
                yaml.AppendLine($"        cpu: {env.Value.Resources.CpuRequest}");
                yaml.AppendLine($"        memory: {env.Value.Resources.MemoryRequest}");
                yaml.AppendLine("      limits:");
                yaml.AppendLine($"        cpu: {env.Value.Resources.CpuLimit}");
                yaml.AppendLine($"        memory: {env.Value.Resources.MemoryLimit}");
                yaml.AppendLine();
            }

            yaml.AppendLine("# Service list");
            yaml.AppendLine("services:");
            foreach (var service in services)
            {
                yaml.AppendLine($"  - name: {service}");
                yaml.AppendLine("    enabled: true");
            }

            return yaml.ToString();
        }

        private string GenerateDeploymentTemplate()
        {
            return @"{{- range .Values.services }}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .name }}
  labels:
    app: {{ .name }}
spec:
  replicas: {{ $.Values.environments.development.replicas }}
  selector:
    matchLabels:
      app: {{ .name }}
  template:
    metadata:
      labels:
        app: {{ .name }}
    spec:
      containers:
      - name: {{ .name }}
        image: {{ .name }}:latest
        ports:
        - containerPort: 8080
        resources:
          {{- toYaml $.Values.environments.development.resources | nindent 10 }}
{{- end }}";
        }

        private string GenerateServiceTemplate()
        {
            return @"{{- range .Values.services }}
---
apiVersion: v1
kind: Service
metadata:
  name: {{ .name }}
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  selector:
    app: {{ .name }}
{{- end }}";
        }

        private string GenerateHPATemplate()
        {
            return @"{{- range .Values.services }}
{{- if $.Values.environments.production.autoscaling.enabled }}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .name }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .name }}
  minReplicas: {{ $.Values.environments.production.autoscaling.minReplicas }}
  maxReplicas: {{ $.Values.environments.production.autoscaling.maxReplicas }}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: {{ $.Values.environments.production.autoscaling.targetCPU }}
{{- end }}
{{- end }}";
        }
    }
}

