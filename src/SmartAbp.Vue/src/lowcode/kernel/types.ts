/**
 * 核心类型定义
 */

// ============= 基础类型 =============
export interface Schema {
  id: string;
  version: string;
  type: 'component' | 'page' | 'layout' | 'module';
  metadata: Record<string, any>;
  [key: string]: any;
}

// ============= 元数据模型（P0） =============
export interface RawMetadata {
  // 宽松输入：来源于设计器/导入/扫描
  id?: string;
  version?: string;
  type?: string;
  [key: string]: any;
}

export interface UnifiedMetadata {
  // 强约束、可版本化、稳定可哈希
  id: string;
  version: string;
  type: 'component' | 'page' | 'layout' | 'module';
  i18n?: Record<string, string>;
  a11y?: Record<string, any>;
  dependencies?: string[];
  capabilities?: string[];
  runtime?: {
    auth?: { required?: boolean; roles?: string[] };
    tenant?: { required?: boolean };
    persist?: { router?: boolean; store?: boolean };
    lazy?: boolean;
    degrade?: boolean;
  };
  generator?: {
    targets?: Array<'vue3' | 'react' | 'uniapp' | 'abp' | 'vite' | 'webpack'>;
    qualityGates?: { type?: boolean; lint?: boolean; test?: boolean };
  };
  // 扩展信息
  extra?: Record<string, any>;
  // P1: 跨平台配置占位
  platform?: {
    vite?: Record<string, any>;
    webpack?: Record<string, any>;
    uniapp?: Record<string, any>;
    abp?: Record<string, any>;
  };
}

export interface GeneratedCode {
  code: string;
  sourceMap?: string;
  dependencies: string[];
  metadata: CodeMetadata;
}

export interface CodeMetadata {
  framework: string;
  language: 'typescript' | 'javascript';
  generatedAt: number;
  checksum: string;
  size: number;
}

// ============= 插件系统 =============
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies: string[];
  peerDependencies: string[];
  target: FrameworkTarget[];
  capabilities: PluginCapability[];
}

export type FrameworkTarget = 'vue3' | 'react' | 'angular' | 'svelte' | 'vanilla';
export type PluginCapability = 'generator' | 'transformer' | 'validator' | 'optimizer';

export interface PluginLifecycle {
  onInit?(): Promise<void>;
  onDestroy?(): Promise<void>;
  onError?(error: Error): Promise<void>;
}

export interface CodegenPlugin<TSchema = Schema, TConfig = any, TResult = GeneratedCode>
  extends PluginLifecycle {
  readonly metadata: PluginMetadata;

  canHandle(schema: TSchema): boolean | Promise<boolean>;
  validate?(schema: TSchema): ValidationResult | Promise<ValidationResult>;
  generate(
    schema: TSchema,
    config: TConfig,
    context: PluginContext
  ): Promise<TResult>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning';
}

// ============= 插件上下文 =============
export interface PluginContext {
  readonly eventBus: EventBus;
  readonly cache: CacheManager;
  readonly logger: StructuredLogger;
  readonly monitor: PerformanceMonitor;
  readonly config: ConfigManager;

  getPlugin<T extends CodegenPlugin>(name: string): T | undefined;
  executePlugin<T>(name: string, ...args: any[]): Promise<T>;
  createChildContext(namespace: string): PluginContext;
}

// ============= 事件系统 =============
export interface LowCodeEventMap {
  // 插件生命周期
  'plugin:registered': PluginRegisteredEvent;
  'plugin:initialized': PluginInitializedEvent;
  'plugin:error': PluginErrorEvent;
  'plugin:destroyed': PluginDestroyedEvent;

  // 代码生成
  'generation:start': GenerationStartEvent;
  'generation:progress': GenerationProgressEvent;
  'generation:end': GenerationEndEvent;
  'generation:error': GenerationErrorEvent;

  // 缓存事件
  'cache:hit': CacheHitEvent;
  'cache:miss': CacheMissEvent;
  'cache:evicted': CacheEvictedEvent;

  // 性能监控
  'performance:metric': PerformanceMetricEvent;
  'performance:alert': PerformanceAlertEvent;

  // 元数据处理
  'metadata:processed': MetadataProcessedEvent;
  'metadata:error': MetadataErrorEvent;
  'metadata:recovered': MetadataRecoveredEvent;

  // 联邦加载事件
  'load:start': FederationLoadStartEvent;
  'load:success': FederationLoadSuccessEvent;
  'load:error': FederationLoadErrorEvent;
  'cache:cleanup': FederationCacheCleanupEvent;

  // 系统事件
  'system:ready': SystemReadyEvent;
  'system:shutdown': SystemShutdownEvent;
  'system:error': SystemErrorEvent;
}

export interface PluginRegisteredEvent {
  plugin: PluginMetadata;
  timestamp: number;
}

export interface PluginInitializedEvent {
  pluginName: string;
  initTime: number;
  timestamp: number;
}

export interface PluginErrorEvent {
  pluginName: string;
  error: Error;
  context: string;
  timestamp: number;
}

export interface PluginDestroyedEvent {
  pluginName: string;
  timestamp: number;
}

export interface GenerationStartEvent {
  schemaId: string;
  pluginName: string;
  timestamp: number;
}

export interface GenerationProgressEvent {
  schemaId: string;
  progress: number; // 0-100
  stage: string;
  timestamp: number;
}

export interface GenerationEndEvent {
  schemaId: string;
  pluginName: string;
  duration: number;
  codeSize: number;
  timestamp: number;
}

export interface GenerationErrorEvent {
  schemaId: string;
  pluginName: string;
  error: Error;
  timestamp: number;
}

export interface CacheHitEvent {
  key: string;
  size: number;
  timestamp: number;
}

export interface CacheMissEvent {
  key: string;
  timestamp: number;
}

export interface CacheEvictedEvent {
  key: string;
  reason: 'ttl' | 'memory' | 'manual';
  timestamp: number;
}

export interface PerformanceMetricEvent {
  name: string;
  value: number;
  unit: string;
  labels: Record<string, string>;
  timestamp: number;
}

export interface PerformanceAlertEvent {
  name: string;
  threshold: number;
  actual: number;
  severity: 'warning' | 'critical';
  timestamp: number;
}

// 联邦加载事件定义
export interface FederationLoadStartEvent {
  scope: string;
  module: string;
  url: string;
  timestamp: number;
}

export interface FederationLoadSuccessEvent {
  scope: string;
  module: string;
  loadTime: number;
  loadMethod: 'esm' | 'script';
  fromCache: boolean;
  timestamp: number;
}

export interface FederationLoadErrorEvent {
  scope: string;
  module: string;
  error: Error;
  errorType: string;
  timestamp: number;
}

export interface FederationCacheCleanupEvent {
  removedCount: number;
  timestamp: number;
}

export interface MetadataProcessedEvent {
  key: string;
  duration: number;
  cacheHit: boolean;
  timestamp: number;
}

export interface MetadataErrorEvent {
  error: Error;
  timestamp: number;
}

export interface MetadataRecoveredEvent {
  duration: number;
  strategy: 'minimal' | 'skip-ai' | 'use-cache';
  timestamp: number;
}

export interface SystemReadyEvent {
  pluginsLoaded: number;
  initTime: number;
  timestamp: number;
}

export interface SystemShutdownEvent {
  reason: string;
  timestamp: number;
}

export interface SystemErrorEvent {
  error: Error;
  context: string;
  timestamp: number;
}

// ============= 事件处理器 =============
export type EventHandler<T> = (event: T) => void | Promise<void>;
export type EventUnsubscriber = () => void;

export interface EventBus {
  on<K extends keyof LowCodeEventMap>(
    event: K,
    handler: EventHandler<LowCodeEventMap[K]>,
    options?: EventListenerOptions
  ): EventUnsubscriber;

  once<K extends keyof LowCodeEventMap>(
    event: K,
    handler: EventHandler<LowCodeEventMap[K]>
  ): EventUnsubscriber;

  off<K extends keyof LowCodeEventMap>(
    event: K,
    handler: EventHandler<LowCodeEventMap[K]>
  ): void;

  emit<K extends keyof LowCodeEventMap>(
    event: K,
    data: LowCodeEventMap[K]
  ): Promise<void>;

  emitSync<K extends keyof LowCodeEventMap>(
    event: K,
    data: LowCodeEventMap[K]
  ): void;
}

export interface EventListenerOptions {
  priority?: number; // 0-100, 高优先级先执行
  once?: boolean;
  capture?: boolean;
}

// ============= 缓存系统 =============
export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  ttl?: number;
  size: number;
  metadata: Record<string, any>;
}

export interface CacheStrategy {
  name: string;
  shouldEvict(entry: CacheEntry, currentTime: number): boolean;
  getEvictionCandidates(
    entries: Map<string, CacheEntry>,
    targetSize: number
  ): string[];
}

export interface CacheManager {
  get<T>(key: string): T | undefined;
  set(key: string, value: any, options?: CacheOptions): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;

  // 高级功能
  mget(keys: string[]): Array<{ key: string; value: any }>;
  mset(entries: Array<{ key: string; value: any; options?: CacheOptions }>): void;
  getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T>;

  // 统计信息
  getStats(): CacheStats;
  getMemoryUsage(): CacheMemoryInfo;
}

export interface CacheOptions {
  ttl?: number; // 生存时间(ms)
  priority?: number; // 优先级
  tags?: string[]; // 标签，用于批量清理
  compress?: boolean; // 是否压缩
  metadata?: Record<string, any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
  evictions: number;
}

export interface CacheMemoryInfo {
  used: number;
  limit: number;
  usage: number; // 百分比
  entries: number;
}

// ============= 日志系统 =============
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context: Record<string, any>;
  error?: Error;
  traceId?: string;
  spanId?: string;
  metadata: Record<string, any>;
}

export interface StructuredLogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  fatal(message: string, error?: Error, context?: Record<string, any>): void;
  success?(message: string, context?: Record<string, any>): void;

  // 上下文管理
  child(context: Record<string, any>): StructuredLogger;
  withContext(context: Record<string, any>): StructuredLogger;

  // 批量日志
  batch(entries: LogEntry[]): void;

  // 性能追踪
  trackOperation?<T>(name: string, operation: () => Promise<T> | T): Promise<T>;

  // 配置
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

// ============= 性能监控 =============
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  labels: Record<string, string>;
}

export interface PerformanceMonitor {
  recordMetric(metric: PerformanceMetric): void;
  startTimer(name: string, labels?: Record<string, string>): PerformanceTimer;
  recordDuration(name: string, duration: number, labels?: Record<string, string>): void;
  recordCount(name: string, count: number, labels?: Record<string, string>): void;
  recordGauge(name: string, value: number, labels?: Record<string, string>): void;

  getMetrics(name?: string): PerformanceMetric[];
  getAggregatedMetrics(
    name: string,
    timeRange: { start: number; end: number }
  ): AggregatedMetrics;

  // 健康检查和销毁方法
  getHealthMetrics(): Record<string, any>;
  destroy(): void;
}

export interface PerformanceTimer {
  end(labels?: Record<string, string>): number;
  getCurrentDuration(): number;
}

export interface AggregatedMetrics {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

// ============= 配置管理 =============
export interface ConfigManager {
  get<T = any>(key: string, defaultValue?: T): T;
  set(key: string, value: any): void;
  has(key: string): boolean;
  delete(key: string): boolean;

  // 环境配置
  getEnv(): string;
  isDevelopment(): boolean;
  isProduction(): boolean;

  // 配置监听
  watch(key: string, callback: (newValue: any, oldValue: any) => void): () => void;

  // 配置验证
  validate(schema: any): ValidationResult;

  // 配置热更新
  reload(): Promise<void>;
}

// ============= 任务队列 =============
export interface Task<T = any> {
  id: string;
  name: string;
  data: T;
  priority: number;
  createdAt: number;
  maxRetries: number;
  retryCount: number;
  timeout: number;
}

export interface TaskQueue {
  add<T>(task: Omit<Task<T>, 'id' | 'createdAt' | 'retryCount'>): Promise<string>;
  process<T>(
    processor: (task: Task<T>) => Promise<any>,
    options?: QueueProcessOptions
  ): Promise<void>;

  pause(): void;
  resume(): void;
  stop(): void;

  getStats(): QueueStats;
}

export interface QueueProcessOptions {
  concurrency?: number;
  timeout?: number;
  retryDelay?: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  throughput: number; // tasks/second
}
