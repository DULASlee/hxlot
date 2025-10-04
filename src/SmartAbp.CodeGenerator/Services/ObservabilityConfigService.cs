using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 可观测性配置服务 - Day 14
    /// 提供Prometheus、Grafana、Jaeger配置生成功能
    /// </summary>
    public class ObservabilityConfigService : ApplicationService
    {
        private readonly ILogger<ObservabilityConfigService> _logger;

        public ObservabilityConfigService(ILogger<ObservabilityConfigService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 生成Prometheus配置
        /// </summary>
        public Task<GeneratedPrometheusConfigDto> GeneratePrometheusConfigAsync(
            string serviceName,
            PrometheusConfigDto config)
        {
            _logger.LogInformation("🚀 生成Prometheus配置: {ServiceName}", serviceName);

            var result = new GeneratedPrometheusConfigDto
            {
                ConfigYaml = GeneratePrometheusYaml(serviceName, config),
                ServiceMonitorYaml = config.EnableServiceMonitor 
                    ? GenerateServiceMonitorYaml(serviceName, config) 
                    : string.Empty,
                AlertRulesYaml = config.AlertRules.Count > 0 
                    ? GenerateAlertRulesYaml(serviceName, config.AlertRules) 
                    : string.Empty
            };

            _logger.LogInformation("✅ Prometheus配置生成完成");
            return Task.FromResult(result);
        }

        /// <summary>
        /// 生成Grafana仪表板
        /// </summary>
        public Task<GeneratedGrafanaDashboardDto> GenerateGrafanaDashboardAsync(
            string serviceName,
            GrafanaDashboardDto dashboard)
        {
            _logger.LogInformation("🚀 生成Grafana仪表板: {ServiceName}", serviceName);

            var dashboardObj = BuildGrafanaDashboard(serviceName, dashboard);
            var json = JsonSerializer.Serialize(dashboardObj, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });

            var result = new GeneratedGrafanaDashboardDto
            {
                DashboardJson = json,
                PanelCount = dashboard.Panels.Count
            };

            _logger.LogInformation("✅ Grafana仪表板生成完成，共 {Count} 个面板", result.PanelCount);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Methods - Prometheus
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GeneratePrometheusYaml(string serviceName, PrometheusConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("global:");
            yaml.AppendLine($"  scrape_interval: {config.ScrapeInterval}");
            yaml.AppendLine($"  evaluation_interval: {config.EvaluationInterval}");
            yaml.AppendLine();

            yaml.AppendLine("scrape_configs:");
            foreach (var scrapeConfig in config.ScrapeConfigs)
            {
                yaml.AppendLine($"- job_name: '{scrapeConfig.JobName}'");
                yaml.AppendLine($"  metrics_path: {scrapeConfig.MetricsPath}");
                yaml.AppendLine("  static_configs:");
                yaml.AppendLine("  - targets:");
                foreach (var target in scrapeConfig.StaticTargets)
                {
                    yaml.AppendLine($"    - '{target}'");
                }

                if (scrapeConfig.Labels.Count > 0)
                {
                    yaml.AppendLine("    labels:");
                    foreach (var label in scrapeConfig.Labels)
                    {
                        yaml.AppendLine($"      {label.Key}: '{label.Value}'");
                    }
                }
            }

            return yaml.ToString();
        }

        private string GenerateServiceMonitorYaml(string serviceName, PrometheusConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: monitoring.coreos.com/v1");
            yaml.AppendLine("kind: ServiceMonitor");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-metrics");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  selector:");
            yaml.AppendLine("    matchLabels:");
            yaml.AppendLine($"      app: {serviceName}");
            yaml.AppendLine("  endpoints:");
            yaml.AppendLine("  - port: metrics");
            yaml.AppendLine($"    interval: {config.ScrapeInterval}");
            yaml.AppendLine("    path: /metrics");

            return yaml.ToString();
        }

        private string GenerateAlertRulesYaml(string serviceName, List<AlertRuleDto> rules)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: monitoring.coreos.com/v1");
            yaml.AppendLine("kind: PrometheusRule");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-alerts");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  groups:");
            yaml.AppendLine($"  - name: {serviceName}");
            yaml.AppendLine("    rules:");

            foreach (var rule in rules)
            {
                yaml.AppendLine($"    - alert: {rule.Name}");
                yaml.AppendLine($"      expr: {rule.Expression}");
                yaml.AppendLine($"      for: {rule.Duration}");
                yaml.AppendLine("      labels:");
                yaml.AppendLine($"        severity: {rule.Severity}");
                foreach (var label in rule.Labels)
                {
                    yaml.AppendLine($"        {label.Key}: {label.Value}");
                }
                yaml.AppendLine("      annotations:");
                foreach (var annotation in rule.Annotations)
                {
                    yaml.AppendLine($"        {annotation.Key}: {annotation.Value}");
                }
            }

            return yaml.ToString();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Methods - Grafana
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private object BuildGrafanaDashboard(string serviceName, GrafanaDashboardDto dashboard)
        {
            var panels = dashboard.Panels.Select((panel, index) => new
            {
                id = index + 1,
                title = panel.Title,
                type = panel.Type,
                gridPos = new
                {
                    x = panel.GridX,
                    y = panel.GridY,
                    w = panel.GridWidth,
                    h = panel.GridHeight
                },
                targets = panel.Queries.Select(q => new
                {
                    expr = q.Expression,
                    legendFormat = q.Legend,
                    refId = q.RefId
                }).ToList()
            }).ToList();

            return new
            {
                dashboard = new
                {
                    title = dashboard.Title,
                    description = dashboard.Description,
                    tags = dashboard.Tags,
                    refresh = $"{dashboard.RefreshInterval}s",
                    time = new
                    {
                        from = "now-1h",
                        to = "now"
                    },
                    panels = panels
                }
            };
        }
    }
}

