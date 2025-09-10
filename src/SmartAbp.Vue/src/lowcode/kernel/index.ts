/**
 * 低代码引擎微内核统一导出
 */

// 主内核
export { LowCodeKernel } from './core';
export type { LowCodeKernelConfig, GenerationOptions, GenerationResult, KernelHealthInfo } from './core';

// 插件系统
export { PluginManager, PluginValidator, DependencyResolver } from './plugins';
export type { PluginStatus, PluginInfo } from './plugins';

// 事件系统
export { EventBus } from './events';

// 缓存系统
export { CacheManager, LRUStrategy, LFUStrategy } from './cache';

// 日志系统
export { StructuredLogger, ConsoleTransport, FileTransport } from './logger';

// 性能监控
export { PerformanceMonitor, Timer, MetricStorage, AlertManager } from './monitor';

// 类型定义
export * from './types';
