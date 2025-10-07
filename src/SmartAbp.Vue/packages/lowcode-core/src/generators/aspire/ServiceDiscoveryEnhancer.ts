// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 Aspire服务发现增强器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/generators/aspire/ServiceDiscoveryEnhancer
//
// 📋 功能：
//   - Consul服务发现集成
//   - Eureka服务注册中心集成
//   - 动态负载均衡
//   - 服务健康检查集成
//   - 多数据中心支持
//   - 服务版本管理
//
// 🎯 目标：
//   - 企业级服务发现能力
//   - 多种服务发现机制支持
//   - 高可用性和容错能力
//   - 零配置自动发现
//
// 🏆 质量标准：
//   - 代码质量 ≥95分
//   - TypeScript类型安全 100%
//   - 业界最佳实践（参考Spring Cloud、Consul）
//
// ⚠️ 重构说明（2025-10-07）：
//   原文件753行，违反300行限制，已重构为模块化结构：
//   - service-discovery/types.ts：类型定义
//   - service-discovery/load-balancer.ts：负载均衡
//   - service-discovery/service-discovery-enhancer.ts：核心逻辑
//   - service-discovery/index.ts：统一导出
//
//   本文件保留以维持向后兼容性，重新导出新模块
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 重新导出服务发现模块
 * 
 * 所有类型和实现已迁移到 service-discovery/ 子目录
 * 以符合300行代码限制和模块化架构原则
 */
export * from './service-discovery';

