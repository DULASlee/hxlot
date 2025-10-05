# SmartAbp Aspire设计器 - API文档概览

**版本**: v1.0  
**更新日期**: 2025-10-04  

---

## 后端API端点

### 代码生成API

```http
POST /api/code-generation/aspire/solution
Content-Type: application/json

Request:
{
  "solutionName": "MyShop",
  "namespace": "MyShop.Services",
  "services": [...]
}

Response: 200 OK
{
  "solutionId": "guid",
  "generatedFiles": [...],
  "generatedAt": "2025-10-04T10:00:00Z"
}
```

### 环境配置API

```http
GET /api/code-generation/environments
Response: ["Development", "Staging", "Production"]

GET /api/code-generation/environment/{type}
Response: EnvironmentConfigDto

POST /api/code-generation/environment
Request: EnvironmentConfigDto
Response: 201 Created
```

### 安全策略API

```http
POST /api/code-generation/security/validate
Request: SecurityPolicyDto
Response: ValidationResult

POST /api/code-generation/security/network-policy
Request: { serviceName, policy }
Response: GeneratedNetworkPolicyDto

POST /api/code-generation/security/rbac
Request: { serviceName, authorization }
Response: GeneratedRBACManifestDto
```

### 可观测性API

```http
POST /api/code-generation/observability/prometheus
Request: { serviceName, config }
Response: GeneratedPrometheusConfigDto

POST /api/code-generation/observability/grafana
Request: { serviceName, dashboard }
Response: GeneratedGrafanaDashboardDto

GET /api/code-generation/observability/golden-signals/{serviceName}
Response: GoldenSignalsDto
```

---

## 前端Composables

### useAspireCodeGen

```typescript
import { useAspireCodeGen } from '@smartabp/lowcode-api'

const { loading, error, generateAspireSolution } = useAspireCodeGen()

// 生成Aspire解决方案
const result = await generateAspireSolution({
  solutionName: 'MyShop',
  services: [...]
})
```

### useEnvironmentConfig

```typescript
import { useEnvironmentConfig } from '@smartabp/lowcode-api'

const { getEnvironments, getEnvironmentConfig, saveEnvironmentConfig } = useEnvironmentConfig()

// 获取环境列表
const environments = await getEnvironments()

// 获取环境配置
const config = await getEnvironmentConfig('Production')

// 保存配置
await saveEnvironmentConfig('Production', config)
```

### useSecurityPolicy

```typescript
import { useSecurityPolicy } from '@smartabp/lowcode-api'

const { validateSecurityPolicy, generateNetworkPolicy, generateRBACManifest } = useSecurityPolicy()

// 验证安全策略
const result = await validateSecurityPolicy(policy)

// 生成NetworkPolicy
const networkPolicy = await generateNetworkPolicy('user-service', policy)
```

### useObservability

```typescript
import { useObservability } from '@smartabp/lowcode-api'

const { generatePrometheusConfig, generateGrafanaDashboard, getGoldenSignals } = useObservability()

// 生成Prometheus配置
const config = await generatePrometheusConfig('user-service', prometheusConfig)

// 生成Grafana仪表板
const dashboard = await generateGrafanaDashboard('user-service', grafanaConfig)

// 获取黄金指标
const signals = await getGoldenSignals('user-service')
```

---

完整API文档请访问: http://localhost:5000/swagger

