/**
 * 负载测试和并发测试模块导出
 */

// 负载测试
export { LoadTestEngine, type TestProgress, type LoadTestResult } from './LoadTestEngine'
export { LoadTestScenario, LoadTestScenarioBuilder, type LoadTestScenarioConfig, type TestEndpoint, type HttpMethod } from './LoadTestScenario'
export { VirtualUser, type VirtualUserConfig, type RequestResult, type VirtualUserStats } from './VirtualUser'

// 并发测试
export { ConcurrencyTestEngine, type ConcurrencyTestResult, type OperationResult } from './ConcurrencyTestEngine'
export { ConcurrencyTestScenario, ConcurrencyTestScenarioBuilder, type ConcurrencyTestScenarioConfig, type ConcurrentOperation, type SharedResource, type ExpectedBehavior, type ConcurrentOperationType } from './ConcurrencyScenario'
export { RaceConditionDetector, type RaceCondition, type Deadlock, type LockContention, type RaceDetectionResult, type ResourceAccessRecord } from './RaceConditionDetector'
