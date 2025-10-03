/**
 * 负载测试模块导出
 */

export { LoadTestEngine, type TestProgress, type LoadTestResult } from './LoadTestEngine'
export { LoadTestScenario, LoadTestScenarioBuilder, type LoadTestScenarioConfig, type TestEndpoint, type HttpMethod } from './LoadTestScenario'
export { VirtualUser, type VirtualUserConfig, type RequestResult, type VirtualUserStats } from './VirtualUser'
