# Vite 代理最佳实践与故障排查

## 概述

本文档记录了在 SmartAbp 项目中使用 Vite 开发服务器代理的最佳实践，以及常见问题的排查方法。

## 当前代理配置

```typescript
// vite.config.ts
proxy: {
  "^/(connect|api|abp|swagger|health-status|Account|codegen|metadata|database|db|hubs|signalr)(/.*)?": {
    target: "https://localhost:9002",
    changeOrigin: true,
    secure: false,
    ws: true,
    timeout: 10000,
  },
}
```

## 已知问题

### 问题 1: 浏览器 POST JSON 请求返回 400 Bad Request

**现象：**
- curl 和 Node.js 测试通过 Vite 代理成功
- 浏览器 fetch/axios 请求失败，响应体为空
- GET 请求和 `application/x-www-form-urlencoded` POST 请求正常

**测试结果：**
| 测试方式 | 结果 |
|----------|------|
| curl → https://localhost:9002 | ✅ 成功 |
| curl → http://localhost:9001 (代理) | ✅ 成功 |
| Node.js → http://localhost:9001 (代理) | ✅ 成功 |
| 浏览器 fetch → https://localhost:9002 | ✅ 成功 |
| 浏览器 fetch/axios → /api/... (代理) | ❌ 失败 |

**根因分析：**
Vite 的 http-proxy 在处理浏览器发送的 POST JSON 请求时存在未知的边界情况。
尝试过的修复方案（均无效）：
- 显式配置 `transformRequest`
- 手动设置 `Content-Length`
- 使用原生 `fetch` 替代 axios

**最终解决方案：**
使用环境判断自动选择调用方式：

```typescript
// packages/lowcode-api/src/code-generator.ts
async testDatabaseConnection(connection) {
  const requestBody = { provider: connection.provider, connectionString: connection.connectionString }

  // 开发环境直接调用后端（绕过 Vite 代理问题）
  // 生产环境使用相对路径（同域部署）
  const isDev = import.meta.env?.DEV === true

  if (isDev) {
    // 开发环境：直接调用后端 HTTPS
    const response = await fetch('https://localhost:9002/api/...', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    return await response.json()
  } else {
    // 生产环境：使用 http 客户端（相对路径）
    return http.post('/api/...', requestBody)
  }
}
```

**优点：**
- 开发环境自动绕过代理问题
- 生产环境正常使用相对路径
- 无需手动切换配置

### 问题 2: 请求超时

**解决方案：**
- 增加 `timeout` 配置（当前为 10000ms）
- 对于长时间运行的 API，在 axios 请求中单独设置 timeout

### 问题 3: WebSocket 连接失败

**解决方案：**
确保 `ws: true` 配置存在，并且路径包含 SignalR 端点。

## 诊断工具

运行诊断脚本检查代理状态：

```bash
node src/SmartAbp.Vue/scripts/diagnose-proxy.cjs
```

## 最佳实践

### 1. 请求体格式
- 始终使用 `JSON.stringify()` 序列化请求体
- 确保 `Content-Type: application/json` 正确设置

### 2. 代理路径配置
- 使用正则表达式匹配多个 API 前缀
- 避免过于宽泛的匹配规则

### 3. 错误处理
- 在代理配置中添加 `proxy.on('error', ...)` 监听错误
- 记录代理请求日志便于调试

### 4. HTTPS 后端
- 设置 `secure: false` 允许自签名证书
- 确保后端 HTTPS 端口正确配置

## 降级方案

如果代理仍然无法工作，可以临时使用以下降级方案：

```typescript
// 直接调用后端地址（仅开发环境）
const response = await fetch('https://localhost:9002/api/...', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

**注意：** 此方案仅用于临时调试，生产环境应使用代理或同域部署。

## 相关文件

- `src/SmartAbp.Vue/vite.config.ts` - Vite 配置
- `src/SmartAbp.Vue/packages/lowcode-api/src/http-client.ts` - HTTP 客户端
- `src/SmartAbp.Vue/scripts/diagnose-proxy.cjs` - 诊断脚本
