# SmartAbp微服务编排设计器 - Phase 1 API参考文档

**版本**: v2.0 - Phase 1
**API基础URL**: `https://api.smartabp.com/api/app`
**认证方式**: Bearer Token (JWT)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📖 目录

1. [认证与授权](#认证与授权)
2. [环境管理API](#环境管理api)
3. [安全策略API](#安全策略api)
4. [可观测性API](#可观测性api)
5. [错误码参考](#错误码参考)
6. [SDK与示例](#sdk与示例)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. 认证与授权

### 1.1 获取访问令牌

**端点**: `POST /connect/token`

**请求体**:
```json
{
  "grant_type": "password",
  "username": "admin",
  "password": "********",
  "client_id": "SmartAbp_App",
  "scope": "SmartAbp offline_access"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}
```

### 1.2 使用访问令牌

所有API请求必须在Headers中携带访问令牌：

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2. 环境管理API

### 2.1 获取环境列表

**端点**: `GET /environment-management/environments`

**请求**:
```http
GET /api/app/environment-management/environments HTTP/1.1
Host: api.smartabp.com
Authorization: Bearer {token}
```

**响应**:
```json
{
  "environments": [
    "Development",
    "Staging",
    "Production"
  ]
}
```

---

### 2.2 获取环境配置

**端点**: `GET /environment-management/config/{environment}`

**路径参数**:
- `environment` (string, required): 环境名称（Development/Staging/Production）

**请求**:
```http
GET /api/app/environment-management/config/Production HTTP/1.1
Host: api.smartabp.com
Authorization: Bearer {token}
```

**响应**:
```json
{
  "environment": "Production",
  "defaultReplicas": 3,
  "resources": {
    "cpuRequest": "500m",
    "cpuLimit": "2000m",
    "memoryRequest": "512Mi",
    "memoryLimit": "2Gi",
    "storageRequest": "10Gi",
    "storageLimit": "50Gi"
  },
  "features": {
    "enableTelemetry": true,
    "enableMetrics": true,
    "enableTracing": true,
    "enableLogging": true,
    "enableHealthChecks": true,
    "enableSwagger": false
  },
  "deploymentStrategy": {
    "type": "RollingUpdate",
    "maxSurge": "25%",
    "maxUnavailable": "0",
    "minReadySeconds": 10,
    "progressDeadlineSeconds": 600
  },
  "enableAutoScaling": true,
  "autoScaling": {
    "minReplicas": 3,
    "maxReplicas": 20,
    "targetCPUUtilization": 60,
    "targetMemoryUtilization": 70
  },
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Production",
    "LOG_LEVEL": "Warning"
  }
}
```

---

### 2.3 保存环境配置

**端点**: `POST /environment-management/config/{environment}`

**路径参数**:
- `environment` (string, required): 环境名称

**请求体**:
```json
{
  "environment": "Production",
  "defaultReplicas": 3,
  "resources": {
    "cpuRequest": "500m",
    "cpuLimit": "2000m",
    "memoryRequest": "512Mi",
    "memoryLimit": "2Gi"
  },
  "features": {
    "enableTelemetry": true,
    "enableMetrics": true,
    "enableTracing": true,
    "enableLogging": true,
    "enableHealthChecks": true,
    "enableSwagger": false
  },
  "deploymentStrategy": {
    "type": "RollingUpdate",
    "maxSurge": "25%",
    "maxUnavailable": "0"
  },
  "enableAutoScaling": true,
  "autoScaling": {
    "minReplicas": 3,
    "maxReplicas": 20,
    "targetCPUUtilization": 60,
    "targetMemoryUtilization": 70
  },
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Production",
    "LOG_LEVEL": "Warning"
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "环境配置保存成功",
  "config": { /* 保存后的配置 */ }
}
```

---

### 2.4 对比环境配置

**端点**: `GET /environment-management/compare`

**查询参数**:
- `env1` (string, required): 第一个环境名称
- `env2` (string, required): 第二个环境名称

**请求**:
```http
GET /api/app/environment-management/compare?env1=Development&env2=Production HTTP/1.1
Host: api.smartabp.com
Authorization: Bearer {token}
```

**响应**:
```json
{
  "environment1": "Development",
  "environment2": "Production",
  "totalDifferences": 8,
  "differences": [
    {
      "path": "DefaultReplicas",
      "property": "副本数",
      "value1": "1",
      "value2": "3",
      "differenceType": "Modified"
    },
    {
      "path": "Resources.CpuLimit",
      "property": "CPU限制",
      "value1": "500m",
      "value2": "2000m",
      "differenceType": "Modified"
    },
    {
      "path": "Features.EnableSwagger",
      "property": "Swagger开关",
      "value1": "true",
      "value2": "false",
      "differenceType": "Modified"
    }
  ]
}
```

---

### 2.5 生成Kubernetes Manifest

**端点**: `POST /environment-config-generator/kubernetes-manifest`

**请求体**:
```json
{
  "serviceName": "my-service",
  "environment": "Production"
}
```

**响应**:
```json
{
  "environment": "Production",
  "resourceCount": 3,
  "manifests": {
    "deployment-my-service.yaml": "apiVersion: apps/v1\nkind: Deployment\n...",
    "service-my-service.yaml": "apiVersion: v1\nkind: Service\n...",
    "hpa-my-service.yaml": "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\n..."
  }
}
```

---

### 2.6 生成Helm Chart

**端点**: `POST /environment-config-generator/helm-chart`

**请求体**:
```json
{
  "chartName": "my-microservices",
  "services": ["service1", "service2", "service3"],
  "environments": {
    "Development": { /* 环境配置 */ },
    "Production": { /* 环境配置 */ }
  }
}
```

**响应**:
```json
{
  "chartName": "my-microservices",
  "chartVersion": "1.0.0",
  "templateCount": 3,
  "files": {
    "Chart.yaml": "apiVersion: v2\nname: my-microservices\n...",
    "values.yaml": "# Default values\nglobal:\n...",
    "templates/deployment.yaml": "{{- range .Values.services }}\n...",
    "templates/service.yaml": "{{- range .Values.services }}\n...",
    "templates/hpa.yaml": "{{- range .Values.services }}\n..."
  }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. 安全策略API

### 3.1 验证安全策略

**端点**: `POST /security-policy/validate`

**请求体**:
```json
{
  "networkPolicy": {
    "policyType": "Allow",
    "ingressRules": [
      {
        "name": "allow-http",
        "ports": ["80", "443"],
        "protocol": "TCP"
      }
    ],
    "egressRules": []
  },
  "authorization": {
    "type": "RBAC",
    "roles": [
      {
        "name": "developer",
        "permissions": ["get", "list", "watch", "create", "update"]
      }
    ]
  },
  "secrets": {
    "provider": "Kubernetes",
    "secrets": [
      {
        "name": "app-secrets",
        "key": "api-key",
        "type": "Opaque"
      }
    ]
  }
}
```

**响应**:
```json
{
  "isValid": true,
  "errors": []
}
```

**响应（失败）**:
```json
{
  "isValid": false,
  "errors": [
    "网络策略至少需要配置一条Ingress或Egress规则",
    "RBAC模式下至少需要定义一个角色"
  ]
}
```

---

### 3.2 生成网络策略

**端点**: `POST /security-policy/network-policy`

**请求体**:
```json
{
  "serviceName": "my-service",
  "networkPolicy": {
    "policyType": "Allow",
    "ingressRules": [
      {
        "name": "allow-http",
        "ports": ["80", "443"],
        "protocol": "TCP",
        "from": {
          "namespaceSelector": {"name": "default"},
          "podSelector": {"app": "frontend"}
        }
      }
    ],
    "egressRules": [
      {
        "name": "allow-database",
        "ports": ["5432"],
        "protocol": "TCP",
        "to": {
          "namespaceSelector": {"name": "database"},
          "podSelector": {"app": "postgres"}
        }
      }
    ]
  }
}
```

**响应**:
```json
{
  "yamlContent": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\n..."
}
```

---

### 3.3 生成RBAC Manifest

**端点**: `POST /security-policy/rbac-manifest`

**请求体**:
```json
{
  "namespace": "production",
  "authorization": {
    "type": "RBAC",
    "roles": [
      {
        "name": "developer",
        "permissions": ["get", "list", "watch", "create", "update"],
        "resources": ["pods", "services", "deployments", "configmaps"]
      }
    ]
  }
}
```

**响应**:
```json
{
  "roleCount": 1,
  "roleBindingCount": 1,
  "manifests": {
    "role-developer.yaml": "apiVersion: rbac.authorization.k8s.io/v1\nkind: Role\n...",
    "rolebinding-developer.yaml": "apiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\n..."
  }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. 可观测性API

### 4.1 生成Prometheus配置

**端点**: `POST /observability-config/prometheus`

**请求体**:
```json
{
  "serviceName": "my-service",
  "prometheusConfig": {
    "scrapeInterval": "15s",
    "enableServiceMonitor": true,
    "scrapeConfigs": [
      {
        "jobName": "my-service",
        "metricsPath": "/metrics",
        "targets": ["my-service:8080"]
      }
    ],
    "alertRules": [
      {
        "name": "HighErrorRate",
        "expression": "rate(http_requests_total{status=~\"5..\"}[5m]) > 0.05",
        "duration": "5m",
        "severity": "critical",
        "description": "HTTP 5xx错误率超过5%"
      }
    ]
  }
}
```

**响应**:
```json
{
  "configYaml": "global:\n  scrape_interval: 15s\n...",
  "serviceMonitorYaml": "apiVersion: monitoring.coreos.com/v1\nkind: ServiceMonitor\n...",
  "alertRulesYaml": "groups:\n- name: my-service-alerts\n..."
}
```

---

### 4.2 生成Grafana仪表板

**端点**: `POST /observability-config/grafana-dashboard`

**请求体**:
```json
{
  "title": "My Service Dashboard",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "queries": [
        {
          "expression": "rate(http_requests_total[5m])",
          "legend": "RPS"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "queries": [
        {
          "expression": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
          "legend": "Error Rate"
        }
      ]
    }
  ]
}
```

**响应**:
```json
{
  "dashboardJson": "{\n  \"dashboard\": {\n    \"title\": \"My Service Dashboard\",\n    \"panels\": [...]\n  }\n}",
  "panelCount": 2
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5. 错误码参考

### 5.1 HTTP状态码

| 状态码 | 说明 |
|-------|------|
| 200 OK | 请求成功 |
| 201 Created | 资源创建成功 |
| 400 Bad Request | 请求参数错误 |
| 401 Unauthorized | 未授权，需要登录 |
| 403 Forbidden | 权限不足 |
| 404 Not Found | 资源不存在 |
| 409 Conflict | 资源冲突 |
| 422 Unprocessable Entity | 实体无法处理（验证失败） |
| 500 Internal Server Error | 服务器内部错误 |

### 5.2 业务错误码

| 错误码 | 说明 |
|-------|------|
| ENV_001 | 不支持的环境类型 |
| ENV_002 | 环境配置验证失败 |
| ENV_003 | 副本数不能小于1 |
| ENV_004 | 启用自动扩缩容时必须提供AutoScaling配置 |
| SEC_001 | 安全策略验证失败 |
| SEC_002 | 网络策略至少需要配置一条规则 |
| SEC_003 | RBAC模式下至少需要定义一个角色 |
| SEC_004 | Azure Key Vault URI缺失 |
| OBS_001 | Prometheus配置生成失败 |
| OBS_002 | Grafana仪表板生成失败 |
| OBS_003 | Jaeger配置生成失败 |

### 5.3 错误响应格式

```json
{
  "error": {
    "code": "ENV_002",
    "message": "环境配置验证失败",
    "details": "副本数不能小于1",
    "validationErrors": [
      {
        "field": "DefaultReplicas",
        "message": "副本数不能小于1"
      }
    ]
  }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6. SDK与示例

### 6.1 C# SDK

**安装**:
```bash
dotnet add package SmartAbp.AspireDesigner.Client
```

**使用示例**:
```csharp
using SmartAbp.AspireDesigner.Client;

var client = new AspireDesignerClient(new Uri("https://api.smartabp.com"));
client.SetBearerToken("your-access-token");

// 获取环境配置
var config = await client.Environment.GetConfigAsync("Production");
Console.WriteLine($"副本数: {config.DefaultReplicas}");

// 生成Kubernetes Manifest
var manifest = await client.Environment.GenerateKubernetesManifestAsync(
    "my-service", 
    "Production");
Console.WriteLine($"生成了 {manifest.ResourceCount} 个资源");

// 保存到文件
foreach (var (fileName, content) in manifest.Manifests)
{
    await File.WriteAllTextAsync(fileName, content);
}
```

### 6.2 TypeScript/JavaScript SDK

**安装**:
```bash
npm install @smartabp/aspire-designer-client
```

**使用示例**:
```typescript
import { AspireDesignerClient } from '@smartabp/aspire-designer-client'

const client = new AspireDesignerClient({
  baseUrl: 'https://api.smartabp.com',
  accessToken: 'your-access-token'
})

// 获取环境配置
const config = await client.environment.getConfig('Production')
console.log(`副本数: ${config.defaultReplicas}`)

// 生成Kubernetes Manifest
const manifest = await client.environment.generateKubernetesManifest({
  serviceName: 'my-service',
  environment: 'Production'
})
console.log(`生成了 ${manifest.resourceCount} 个资源`)

// 保存到文件
import fs from 'fs/promises'
for (const [fileName, content] of Object.entries(manifest.manifests)) {
  await fs.writeFile(fileName, content)
}
```

### 6.3 Python SDK

**安装**:
```bash
pip install smartabp-aspire-designer
```

**使用示例**:
```python
from smartabp.aspire_designer import AspireDesignerClient

client = AspireDesignerClient(
    base_url='https://api.smartabp.com',
    access_token='your-access-token'
)

# 获取环境配置
config = client.environment.get_config('Production')
print(f"副本数: {config['defaultReplicas']}")

# 生成Kubernetes Manifest
manifest = client.environment.generate_kubernetes_manifest(
    service_name='my-service',
    environment='Production'
)
print(f"生成了 {manifest['resourceCount']} 个资源")

# 保存到文件
for file_name, content in manifest['manifests'].items():
    with open(file_name, 'w') as f:
        f.write(content)
```

### 6.4 cURL示例

**获取访问令牌**:
```bash
curl -X POST https://api.smartabp.com/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=admin&password=********&client_id=SmartAbp_App&scope=SmartAbp offline_access"
```

**获取环境配置**:
```bash
curl -X GET https://api.smartabp.com/api/app/environment-management/config/Production \
  -H "Authorization: Bearer {access_token}"
```

**生成Kubernetes Manifest**:
```bash
curl -X POST https://api.smartabp.com/api/app/environment-config-generator/kubernetes-manifest \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "my-service",
    "environment": "Production"
  }'
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 附录：数据模型

### EnvironmentConfigDto
```typescript
interface EnvironmentConfigDto {
  environment: string
  defaultReplicas: number
  resources: ResourceLimitsDto
  features: FeatureFlagsDto
  deploymentStrategy: DeploymentStrategyConfigDto
  enableAutoScaling: boolean
  autoScaling?: AutoScalingConfigDto
  environmentVariables: Record<string, string>
}
```

### SecurityPolicyDto
```typescript
interface SecurityPolicyDto {
  networkPolicy: NetworkPolicyDto
  authorization: AuthorizationDto
  secrets: SecretsManagementDto
}
```

### PrometheusConfigDto
```typescript
interface PrometheusConfigDto {
  scrapeInterval: string
  enableServiceMonitor: boolean
  scrapeConfigs: ScrapeConfigDto[]
  alertRules: AlertRuleDto[]
}
```

---

**版权所有 © 2025 SmartAbp. All rights reserved.**

