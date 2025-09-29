# 🎯 MCP工具使用实例指南

## 📚 21个已实现工具的实际使用场景

### 🔍 基础分析工具 (4个)

#### 1. `mcp_serena_get_symbols_overview` - 文件符号分析
**使用场景**: 分析文件结构，了解类、接口、函数定义
```bash
# 分析Vue组件结构
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_serena_get_symbols_overview", "arguments": {"filePath": "src/SmartAbp.Vue/src/views/lowcode/LowCodeStudioView.vue"}}}' | node .serena/mcp-server-standard.js
```

#### 2. `mcp_serena_list_dir` - 目录结构分析
**使用场景**: 了解项目结构，递归扫描目录
```bash
# 分析packages目录结构
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_serena_list_dir", "arguments": {"dirPath": "src/SmartAbp.Vue/packages", "recursive": true}}}' | node .serena/mcp-server-standard.js
```

#### 3. `mcp_serena_find_symbol` - 符号搜索
**使用场景**: 查找重复组件，避免重复开发
```bash
# 搜索用户相关组件
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_serena_find_symbol", "arguments": {"symbolName": "User", "symbolType": "class"}}}' | node .serena/mcp-server-standard.js
```

#### 4. `mcp_serena_update_index` - 更新代码索引
**使用场景**: 保持代码索引最新，提高搜索准确性
```bash
# 更新项目索引
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_serena_update_index", "arguments": {}}}' | node .serena/mcp-server-standard.js
```

---

### 🔗 依赖分析工具 (3个)

#### 5. `mcp_dependency_analyze_full` - 全面依赖分析
**使用场景**: 架构重构前的依赖关系分析
```bash
# 全面分析项目依赖
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_dependency_analyze_full", "arguments": {"analysisScope": "project"}}}' | node .serena/mcp-server-standard.js
```

#### 6. `mcp_dependency_check_violations` - 依赖违规检查
**使用场景**: 检查相对路径违规、循环依赖等
```bash
# 快速检查依赖违规
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_dependency_check_violations", "arguments": {"checkScope": "packages"}}}' | node .serena/mcp-server-standard.js
```

#### 7. `mcp_dependency_graph` - 依赖关系图
**使用场景**: 可视化项目依赖关系
```bash
# 生成依赖关系图
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_dependency_graph", "arguments": {"graphType": "module_dependencies"}}}' | node .serena/mcp-server-standard.js
```

---

### 🔬 代码质量检查工具 (3个)

#### 8. `mcp_code_quality_analyze_full` - 全面质量分析
**使用场景**: 项目整体质量评估
```bash
# 全面代码质量分析
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_code_quality_analyze_full", "arguments": {"includeMetrics": ["complexity", "duplication", "maintainability"]}}}' | node .serena/mcp-server-standard.js
```

#### 9. `mcp_code_quality_check_specific` - 特定问题检查
**使用场景**: 针对性检查特定质量问题
```bash
# 检查代码复杂度问题
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_code_quality_check_specific", "arguments": {"checkTypes": ["complexity", "naming"], "threshold": 10}}}' | node .serena/mcp-server-standard.js
```

#### 10. `mcp_code_quality_get_score` - 质量评分
**使用场景**: 获取项目质量综合评分
```bash
# 获取质量评分
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_code_quality_get_score", "arguments": {"includeAllMetrics": true}}}' | node .serena/mcp-server-standard.js
```

---

### 🛡️ 安全扫描工具 (5个)

#### 11. `mcp_security_vulnerability_scanner` - 漏洞扫描
**使用场景**: 全面安全漏洞检测
```bash
# 全面安全漏洞扫描
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_security_vulnerability_scanner", "arguments": {"scanDepth": "comprehensive", "includeThirdParty": true}}}' | node .serena/mcp-server-standard.js
```

#### 12. `mcp_security_sensitive_data_detector` - 敏感信息检测
**使用场景**: 检测硬编码密码、API密钥泄露
```bash
# 敏感信息泄露检测
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_security_sensitive_data_detector", "arguments": {"scanScope": "all_files", "sensitivityLevel": "high"}}}' | node .serena/mcp-server-standard.js
```

#### 13. `mcp_security_authentication_analyzer` - 认证安全分析
**使用场景**: JWT、OAuth、会话管理安全检查
```bash
# 身份认证安全分析
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_security_authentication_analyzer", "arguments": {"analysisScope": "authentication_flow"}}}' | node .serena/mcp-server-standard.js
```

#### 14. `mcp_security_dependency_audit` - 依赖安全审计
**使用场景**: 第三方包安全风险评估
```bash
# 依赖安全审计
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_security_dependency_audit", "arguments": {"includeTransitive": true, "severityThreshold": "medium"}}}' | node .serena/mcp-server-standard.js
```

#### 15. `mcp_security_compliance_checker` - 合规性检查
**使用场景**: GDPR、OWASP合规验证
```bash
# 安全合规性检查
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_security_compliance_checker", "arguments": {"standards": ["GDPR", "OWASP_TOP10"], "generateReport": true}}}' | node .serena/mcp-server-standard.js
```

---

### ⚡ 性能分析工具 (6个)

#### 16. `mcp_performance_bundle_analyzer` - Bundle分析
**使用场景**: 前端打包优化分析
```bash
# Bundle性能分析
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_performance_bundle_analyzer", "arguments": {"analysisType": "size_optimization", "includeSourceMaps": true}}}' | node .serena/mcp-server-standard.js
```

#### 17. `mcp_performance_memory_analyzer` - 内存分析
**使用场景**: 内存泄露检测和优化
```bash
# 内存使用分析
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_performance_memory_analyzer", "arguments": {"analysisDepth": "comprehensive"}}}' | node .serena/mcp-server-standard.js
```

#### 18. `mcp_performance_runtime_profiler` - 运行时分析
**使用场景**: 性能瓶颈识别
```bash
# 运行时性能分析
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_performance_runtime_profiler", "arguments": {"profileType": "cpu_memory", "duration": 60}}}' | node .serena/mcp-server-standard.js
```

#### 19. `mcp_performance_load_test_generator` - 压力测试生成
**使用场景**: 自动化性能测试
```bash
# 生成压力测试脚本
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_performance_load_test_generator", "arguments": {"testType": "api_load_test", "concurrentUsers": 100}}}' | node .serena/mcp-server-standard.js
```

#### 20. `mcp_performance_database_optimizer` - 数据库优化
**使用场景**: 数据库性能调优
```bash
# 数据库性能优化
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_performance_database_optimizer", "arguments": {"analysisScope": "slow_queries", "optimizationLevel": "aggressive"}}}' | node .serena/mcp-server-standard.js
```

#### 21. `mcp_performance_monitoring_setup` - 监控配置
**使用场景**: APM监控体系搭建
```bash
# 性能监控配置
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mcp_performance_monitoring_setup", "arguments": {"monitoringType": "full_stack", "alertThresholds": {"response_time": 500, "error_rate": 1}}}}' | node .serena/mcp-server-standard.js
```

---

## 🎯 AI智能使用场景示例

### 场景1: 创建新组件前的智能检查
```typescript
// AI检测到用户要创建"用户管理"组件
async function preCreateComponent(componentName) {
  // 1. 检查是否已有类似组件
  const existingComponents = await callMCP('mcp_serena_find_symbol', {
    symbolName: componentName,
    symbolType: 'vue-component'
  });
  
  if (existingComponents.matchCount > 0) {
    return `⚠️ 发现${existingComponents.matchCount}个相似组件，建议复用：${existingComponents.matches.map(m => m.name).join(', ')}`;
  }
  
  // 2. 分析当前代码质量
  const qualityScore = await callMCP('mcp_code_quality_get_score');
  if (qualityScore.score < 95) {
    return `⚠️ 当前项目质量评分${qualityScore.score}/100，建议先优化现有代码`;
  }
  
  return `✅ 可以安全创建新组件，项目质量良好`;
}
```

### 场景2: 性能问题诊断
```typescript
// AI检测到性能相关问题
async function diagnosePerformanceIssue(errorMessage) {
  // 1. 内存分析
  const memoryAnalysis = await callMCP('mcp_performance_memory_analyzer', {
    analysisDepth: 'deep'
  });
  
  // 2. 运行时分析
  const runtimeAnalysis = await callMCP('mcp_performance_runtime_profiler', {
    profileType: 'cpu_memory'
  });
  
  // 3. 生成诊断报告
  return {
    memoryLeaks: memoryAnalysis.leakSources || [],
    performanceBottlenecks: runtimeAnalysis.bottlenecks || [],
    recommendations: [
      ...memoryAnalysis.recommendations || [],
      ...runtimeAnalysis.optimizations || []
    ]
  };
}
```

### 场景3: 安全审计流程
```typescript
// AI执行全面安全检查
async function comprehensiveSecurityAudit() {
  // 1. 漏洞扫描
  const vulnerabilities = await callMCP('mcp_security_vulnerability_scanner', {
    scanDepth: 'comprehensive'
  });
  
  // 2. 敏感信息检测
  const sensitiveData = await callMCP('mcp_security_sensitive_data_detector', {
    scanScope: 'all_files'
  });
  
  // 3. 依赖安全审计
  const dependencySecurity = await callMCP('mcp_security_dependency_audit', {
    includeTransitive: true
  });
  
  // 4. 合规性检查
  const compliance = await callMCP('mcp_security_compliance_checker', {
    standards: ['GDPR', 'OWASP_TOP10']
  });
  
  return {
    securityScore: calculateSecurityScore([vulnerabilities, sensitiveData, dependencySecurity, compliance]),
    criticalIssues: extractCriticalIssues([vulnerabilities, sensitiveData]),
    complianceStatus: compliance.complianceResults,
    actionItems: generateSecurityActionItems([vulnerabilities, sensitiveData, dependencySecurity])
  };
}
```

### 场景4: 提交前质量门禁
```typescript
// AI执行Git提交前的全面检查
async function preCommitQualityGate() {
  console.log("🚨 执行提交前四重强制质量保证检查...");
  
  // 1. 架构整洁检查
  const architectureCheck = await callMCP('mcp_dependency_check_violations', {
    checkScope: 'packages'
  });
  
  // 2. 代码质量检查
  const qualityCheck = await callMCP('mcp_code_quality_get_score', {
    includeAllMetrics: true
  });
  
  // 3. 安全扫描
  const securityCheck = await callMCP('mcp_security_vulnerability_scanner', {
    scanDepth: 'quick'
  });
  
  // 4. 性能影响评估
  const performanceCheck = await callMCP('mcp_performance_memory_analyzer', {
    analysisDepth: 'basic'
  });
  
  // 评估是否可以提交
  const canCommit = (
    architectureCheck.violations.length === 0 &&
    qualityCheck.score >= 95 &&
    securityCheck.criticalVulnerabilities.length === 0 &&
    performanceCheck.riskLevel !== 'high'
  );
  
  return {
    canCommit: canCommit,
    qualityGateResults: {
      architecture: architectureCheck,
      quality: qualityCheck,
      security: securityCheck,
      performance: performanceCheck
    },
    blockers: canCommit ? [] : extractBlockers([architectureCheck, qualityCheck, securityCheck, performanceCheck])
  };
}
```

---

## 🔄 工具组合使用模式

### 模式1: 渐进式分析（从基础到深度）
```
基础检查 → 符号搜索 + 目录分析
↓
质量评估 → 代码质量分析 + 依赖检查
↓  
深度分析 → 性能分析 + 安全扫描
↓
综合决策 → 基于所有分析结果的智能建议
```

### 模式2: 并行批量分析（提高效率）
```typescript
const parallelAnalysis = await Promise.all([
  callMCP('mcp_code_quality_analyze_full'),
  callMCP('mcp_security_vulnerability_scanner'), 
  callMCP('mcp_performance_memory_analyzer'),
  callMCP('mcp_dependency_analyze_full')
]);
```

### 模式3: 条件触发分析（智能选择）
```typescript
// 基于错误类型选择合适的分析工具
if (error.includes('memory')) {
  return await callMCP('mcp_performance_memory_analyzer');
} else if (error.includes('module')) {
  return await callMCP('mcp_dependency_check_violations');
} else if (error.includes('security')) {
  return await callMCP('mcp_security_vulnerability_scanner');
}
```

---

## 🎖️ 最佳实践总结

### 1. **工具选择策略**
- **高频使用**: 符号搜索、质量评分、依赖检查
- **定期使用**: 安全扫描、性能分析、技术债务评估
- **按需使用**: 专项分析工具（如数据库优化、合规检查）

### 2. **性能优化建议**
- 使用`Promise.all`进行并行调用
- 根据场景选择合适的分析深度
- 缓存分析结果，避免重复计算

### 3. **错误处理机制**
- 每个工具调用都要有错误处理
- 提供降级方案（如工具不可用时的备选方案）
- 记录工具调用日志，便于问题排查

### 4. **结果解析和展示**
- 统一的结果格式化函数
- 人类友好的建议生成
- 可操作的修复步骤提供

---

## 🚀 下一步计划

完成剩余14个工具后，您将拥有：
- **35个企业级MCP工具**完整生态系统
- **7个架构健康检查工具**确保DDD/CQRS/微服务架构合规
- **7个技术债务评估工具**智能债务管理和ROI优化
- **史上最强AI编程辅助系统**🏆

**准备好继续实现剩余的14个工具吗？** 💪
