using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 本地开发环境自动化服务 - Development Environment Automation Service
    /// </summary>
    public class DevEnvironmentService
    {
        private readonly ILogger<DevEnvironmentService> _logger;

        public DevEnvironmentService(ILogger<DevEnvironmentService> logger)
        {
            _logger = logger;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Docker Compose 生成 - Docker Compose Generation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成Docker Compose配置
        /// </summary>
        public Task<GeneratedDockerComposeDto> GenerateDockerComposeAsync(DevEnvironmentConfigDto config)
        {
            var sb = new StringBuilder();
            
            // Docker Compose文件头
            sb.AppendLine("version: '3.8'");
            sb.AppendLine();
            sb.AppendLine("services:");
            
            // 常用基础服务
            var services = new List<DockerComposeServiceDto>();
            
            if (config.Services.Contains("postgresql"))
            {
                services.Add(GeneratePostgreSQLService());
            }
            
            if (config.Services.Contains("redis"))
            {
                services.Add(GenerateRedisService());
            }
            
            if (config.Services.Contains("rabbitmq"))
            {
                services.Add(GenerateRabbitMQService());
            }
            
            if (config.Services.Contains("elasticsearch"))
            {
                services.Add(GenerateElasticsearchService());
            }
            
            if (config.Services.Contains("seq"))
            {
                services.Add(GenerateSeqService());
            }

            // 生成每个服务的YAML
            foreach (var service in services)
            {
                sb.AppendLine($"  {service.ServiceName}:");
                sb.AppendLine($"    image: {service.Image}");
                sb.AppendLine("    container_name: " + $"{config.ProjectName}_{service.ServiceName}");
                
                if (service.Ports.Any())
                {
                    sb.AppendLine("    ports:");
                    foreach (var port in service.Ports)
                    {
                        sb.AppendLine($"      - \"{port}\"");
                    }
                }
                
                if (service.Environment.Any())
                {
                    sb.AppendLine("    environment:");
                    foreach (var env in service.Environment)
                    {
                        sb.AppendLine($"      {env.Key}: {env.Value}");
                    }
                }
                
                if (service.Volumes.Any())
                {
                    sb.AppendLine("    volumes:");
                    foreach (var volume in service.Volumes)
                    {
                        sb.AppendLine($"      - {volume}");
                    }
                }
                
                if (config.EnableHealthCheck && service.HealthCheck.Any())
                {
                    sb.AppendLine("    healthcheck:");
                    foreach (var check in service.HealthCheck)
                    {
                        if (check.Value is List<string> list)
                        {
                            sb.AppendLine($"      {check.Key}:");
                            foreach (var item in list)
                            {
                                sb.AppendLine($"        - {item}");
                            }
                        }
                        else
                        {
                            sb.AppendLine($"      {check.Key}: {check.Value}");
                        }
                    }
                }
                
                sb.AppendLine("    networks:");
                sb.AppendLine($"      - {config.ProjectName}_network");
                sb.AppendLine();
            }
            
            // 网络配置
            sb.AppendLine("networks:");
            sb.AppendLine($"  {config.ProjectName}_network:");
            sb.AppendLine("    driver: bridge");

            return Task.FromResult(new GeneratedDockerComposeDto
            {
                YamlContent = sb.ToString(),
                FileName = "docker-compose.dev.yml",
                Services = services,
                Instructions = new List<string>
                {
                    "将此文件保存到项目根目录",
                    $"运行 'docker-compose -f docker-compose.dev.yml up -d' 启动所有服务",
                    $"运行 'docker-compose -f docker-compose.dev.yml down' 停止所有服务",
                    "服务启动后，请等待健康检查通过",
                    $"查看日志: docker-compose -f docker-compose.dev.yml logs -f"
                }
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 服务配置生成 - Service Configuration Generation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private DockerComposeServiceDto GeneratePostgreSQLService()
        {
            return new DockerComposeServiceDto
            {
                ServiceName = "postgres",
                Image = "postgres:15-alpine",
                Ports = new List<string> { "5432:5432" },
                Environment = new Dictionary<string, string>
                {
                    { "POSTGRES_USER", "postgres" },
                    { "POSTGRES_PASSWORD", "postgres" },
                    { "POSTGRES_DB", "SmartAbpDb" }
                },
                Volumes = new List<string> { "postgres_data:/var/lib/postgresql/data" },
                HealthCheck = new Dictionary<string, object>
                {
                    { "test", new List<string> { "CMD-SHELL", "pg_isready -U postgres" } },
                    { "interval", "10s" },
                    { "timeout", "5s" },
                    { "retries", 5 }
                }
            };
        }

        private DockerComposeServiceDto GenerateRedisService()
        {
            return new DockerComposeServiceDto
            {
                ServiceName = "redis",
                Image = "redis:7-alpine",
                Ports = new List<string> { "6379:6379" },
                Environment = new Dictionary<string, string>(),
                Volumes = new List<string> { "redis_data:/data" },
                HealthCheck = new Dictionary<string, object>
                {
                    { "test", new List<string> { "CMD", "redis-cli", "ping" } },
                    { "interval", "10s" },
                    { "timeout", "3s" },
                    { "retries", 5 }
                }
            };
        }

        private DockerComposeServiceDto GenerateRabbitMQService()
        {
            return new DockerComposeServiceDto
            {
                ServiceName = "rabbitmq",
                Image = "rabbitmq:3-management-alpine",
                Ports = new List<string> { "5672:5672", "15672:15672" },
                Environment = new Dictionary<string, string>
                {
                    { "RABBITMQ_DEFAULT_USER", "guest" },
                    { "RABBITMQ_DEFAULT_PASS", "guest" }
                },
                Volumes = new List<string> { "rabbitmq_data:/var/lib/rabbitmq" },
                HealthCheck = new Dictionary<string, object>
                {
                    { "test", new List<string> { "CMD", "rabbitmq-diagnostics", "-q", "ping" } },
                    { "interval", "30s" },
                    { "timeout", "10s" },
                    { "retries", 5 }
                }
            };
        }

        private DockerComposeServiceDto GenerateElasticsearchService()
        {
            return new DockerComposeServiceDto
            {
                ServiceName = "elasticsearch",
                Image = "docker.elastic.co/elasticsearch/elasticsearch:8.11.0",
                Ports = new List<string> { "9200:9200", "9300:9300" },
                Environment = new Dictionary<string, string>
                {
                    { "discovery.type", "single-node" },
                    { "xpack.security.enabled", "false" },
                    { "ES_JAVA_OPTS", "-Xms512m -Xmx512m" }
                },
                Volumes = new List<string> { "elasticsearch_data:/usr/share/elasticsearch/data" },
                HealthCheck = new Dictionary<string, object>
                {
                    { "test", new List<string> { "CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1" } },
                    { "interval", "30s" },
                    { "timeout", "10s" },
                    { "retries", 5 }
                }
            };
        }

        private DockerComposeServiceDto GenerateSeqService()
        {
            return new DockerComposeServiceDto
            {
                ServiceName = "seq",
                Image = "datalust/seq:latest",
                Ports = new List<string> { "5341:80" },
                Environment = new Dictionary<string, string>
                {
                    { "ACCEPT_EULA", "Y" }
                },
                Volumes = new List<string> { "seq_data:/data" },
                HealthCheck = new Dictionary<string, object>
                {
                    { "test", new List<string> { "CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:80/api || exit 1" } },
                    { "interval", "30s" },
                    { "timeout", "10s" },
                    { "retries", 3 }
                }
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 启动脚本生成 - Startup Script Generation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成启动脚本
        /// </summary>
        public Task<GeneratedStartupScriptDto> GenerateStartupScriptAsync(StartupScriptConfigDto config)
        {
            var sb = new StringBuilder();
            string fileName;
            
            switch (config.ScriptType.ToLower())
            {
                case "bash":
                    fileName = "start-dev.sh";
                    GenerateBashScript(sb, config);
                    break;
                case "powershell":
                    fileName = "start-dev.ps1";
                    GeneratePowerShellScript(sb, config);
                    break;
                case "batch":
                    fileName = "start-dev.bat";
                    GenerateBatchScript(sb, config);
                    break;
                default:
                    fileName = "start-dev.sh";
                    GenerateBashScript(sb, config);
                    break;
            }

            return Task.FromResult(new GeneratedStartupScriptDto
            {
                ScriptContent = sb.ToString(),
                FileName = fileName,
                ScriptType = config.ScriptType,
                Instructions = new List<string>
                {
                    $"将此文件保存到项目根目录，命名为 {fileName}",
                    config.ScriptType == "bash" ? "运行 'chmod +x start-dev.sh && ./start-dev.sh' 启动开发环境" : 
                    config.ScriptType == "powershell" ? "运行 '.\\start-dev.ps1' 启动开发环境" :
                    "运行 'start-dev.bat' 启动开发环境",
                    "脚本将自动启动所有服务并等待健康检查通过",
                    "按 Ctrl+C 停止所有服务"
                }
            });
        }

        private void GenerateBashScript(StringBuilder sb, StartupScriptConfigDto config)
        {
            sb.AppendLine("#!/bin/bash");
            sb.AppendLine("set -e");
            sb.AppendLine();
            sb.AppendLine("echo \"🚀 启动SmartAbp开发环境...\"");
            sb.AppendLine();
            
            // 前置命令
            if (config.PreStartCommands.Any())
            {
                sb.AppendLine("# 前置命令");
                foreach (var cmd in config.PreStartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            // 启动Docker Compose
            sb.AppendLine("# 启动Docker服务");
            sb.AppendLine("docker-compose -f docker-compose.dev.yml up -d");
            sb.AppendLine();
            
            // 健康检查
            sb.AppendLine("# 等待服务健康检查");
            sb.AppendLine($"echo \"⏳ 等待服务启动（最多{config.HealthCheckTimeout}秒）...\"");
            sb.AppendLine($"sleep {config.HealthCheckTimeout}");
            sb.AppendLine();
            
            // 启动命令
            if (config.StartCommands.Any())
            {
                sb.AppendLine("# 启动应用");
                foreach (var cmd in config.StartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            // 后置命令
            if (config.PostStartCommands.Any())
            {
                sb.AppendLine("# 后置命令");
                foreach (var cmd in config.PostStartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            sb.AppendLine("echo \"✅ 开发环境启动完成！\"");
        }

        private void GeneratePowerShellScript(StringBuilder sb, StartupScriptConfigDto config)
        {
            sb.AppendLine("# SmartAbp开发环境启动脚本");
            sb.AppendLine("$ErrorActionPreference = \"Stop\"");
            sb.AppendLine();
            sb.AppendLine("Write-Host \"🚀 启动SmartAbp开发环境...\" -ForegroundColor Green");
            sb.AppendLine();
            
            if (config.PreStartCommands.Any())
            {
                sb.AppendLine("# 前置命令");
                foreach (var cmd in config.PreStartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            sb.AppendLine("# 启动Docker服务");
            sb.AppendLine("docker-compose -f docker-compose.dev.yml up -d");
            sb.AppendLine();
            
            sb.AppendLine("# 等待服务健康检查");
            sb.AppendLine($"Write-Host \"⏳ 等待服务启动（最多{config.HealthCheckTimeout}秒）...\" -ForegroundColor Yellow");
            sb.AppendLine($"Start-Sleep -Seconds {config.HealthCheckTimeout}");
            sb.AppendLine();
            
            if (config.StartCommands.Any())
            {
                sb.AppendLine("# 启动应用");
                foreach (var cmd in config.StartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            if (config.PostStartCommands.Any())
            {
                sb.AppendLine("# 后置命令");
                foreach (var cmd in config.PostStartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            sb.AppendLine("Write-Host \"✅ 开发环境启动完成！\" -ForegroundColor Green");
        }

        private void GenerateBatchScript(StringBuilder sb, StartupScriptConfigDto config)
        {
            sb.AppendLine("@echo off");
            sb.AppendLine("echo 🚀 启动SmartAbp开发环境...");
            sb.AppendLine();
            
            if (config.PreStartCommands.Any())
            {
                sb.AppendLine("REM 前置命令");
                foreach (var cmd in config.PreStartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            sb.AppendLine("REM 启动Docker服务");
            sb.AppendLine("docker-compose -f docker-compose.dev.yml up -d");
            sb.AppendLine();
            
            sb.AppendLine("REM 等待服务健康检查");
            sb.AppendLine($"echo ⏳ 等待服务启动（最多{config.HealthCheckTimeout}秒）...");
            sb.AppendLine($"timeout /t {config.HealthCheckTimeout} /nobreak >nul");
            sb.AppendLine();
            
            if (config.StartCommands.Any())
            {
                sb.AppendLine("REM 启动应用");
                foreach (var cmd in config.StartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            if (config.PostStartCommands.Any())
            {
                sb.AppendLine("REM 后置命令");
                foreach (var cmd in config.PostStartCommands)
                {
                    sb.AppendLine(cmd);
                }
                sb.AppendLine();
            }
            
            sb.AppendLine("echo ✅ 开发环境启动完成！");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 环境变量生成 - Environment Variables Generation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成环境变量文件
        /// </summary>
        public Task<GeneratedEnvFileDto> GenerateEnvFileAsync(string environment, EnvironmentVariablesDto envVars)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"# SmartAbp {environment.ToUpper()} Environment Variables");
            sb.AppendLine($"# Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            sb.AppendLine();
            
            Dictionary<string, string> vars = environment.ToLower() switch
            {
                "development" => envVars.Development,
                "staging" => envVars.Staging,
                "production" => envVars.Production,
                _ => envVars.Development
            };
            
            foreach (var (key, value) in vars)
            {
                // 对于敏感信息，添加注释
                if (envVars.SecretKeys.Contains(key))
                {
                    sb.AppendLine($"# ⚠️  SENSITIVE: {key}");
                }
                sb.AppendLine($"{key}={value}");
            }

            return Task.FromResult(new GeneratedEnvFileDto
            {
                Content = sb.ToString(),
                FileName = $".env.{environment.ToLower()}",
                Environment = environment,
                Instructions = new List<string>
                {
                    $"将此文件保存到项目根目录，命名为 .env.{environment.ToLower()}",
                    "⚠️  注意：不要将此文件提交到Git仓库",
                    "在.gitignore中添加 .env.* 排除环境变量文件",
                    $"加载环境变量: source .env.{environment.ToLower()} (Linux/Mac) 或在应用启动时自动加载"
                }
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 配置验证 - Configuration Validation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 验证开发环境配置
        /// </summary>
        public Task<DevEnvironmentValidationResultDto> ValidateConfigAsync(DevEnvironmentConfigDto config)
        {
            var result = new DevEnvironmentValidationResultDto
            {
                IsValid = true
            };

            // 验证项目名称
            if (string.IsNullOrWhiteSpace(config.ProjectName))
            {
                result.Errors.Add("项目名称不能为空");
                result.IsValid = false;
            }

            // 验证服务选择
            if (!config.Services.Any())
            {
                result.Warnings.Add("未选择任何服务，将生成空的Docker Compose配置");
            }

            // 验证服务组合
            if (config.Services.Contains("elasticsearch") && !config.Services.Contains("seq"))
            {
                result.Suggestions["Logging"] = "建议同时启用Seq日志服务，以便更好地查看Elasticsearch日志";
            }

            if (config.Services.Contains("rabbitmq") && !config.Services.Contains("redis"))
            {
                result.Suggestions["Cache"] = "建议同时启用Redis缓存服务，以提升消息队列性能";
            }

            return Task.FromResult(result);
        }
    }
}

