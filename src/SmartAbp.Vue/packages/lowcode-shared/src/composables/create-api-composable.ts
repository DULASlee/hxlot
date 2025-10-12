/**
 * API Composable 工厂函数
 * 自动生成标准的 API composable，消除样板代码重复
 */

import { ref, type Ref } from 'vue'

/**
 * API 方法配置
 */
export interface ApiMethodConfig<TParams = any, TResult = any> {
  /** API 端点 */
  endpoint: string
  /** HTTP 方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** 默认错误消息 */
  errorMessage?: string
  /** 请求前处理 */
  beforeRequest?: (params: TParams) => TParams | Promise<TParams>
  /** 响应后处理 */
  afterResponse?: (response: TResult) => TResult | Promise<TResult>
}

/**
 * API 方法配置集合
 */
export interface ApiMethodsConfig {
  [methodName: string]: ApiMethodConfig
}

/**
 * API Composable 返回类型
 */
export interface ApiComposable<T extends ApiMethodsConfig> {
  loading: Ref<boolean>
  error: Ref<string | null>
  [key: string]: any
}

/**
 * 创建 API Composable
 * 
 * @example
 * ```typescript
 * // 定义 API 方法配置
 * const apiConfig = {
 *   initializeRepository: {
 *     endpoint: '/api/git-workflow/initialize',
 *     method: 'POST' as const,
 *     errorMessage: 'Git仓库初始化失败'
 *   },
 *   createBranch: {
 *     endpoint: '/api/git-workflow/create-branch',
 *     method: 'POST' as const,
 *     errorMessage: '创建分支失败'
 *   }
 * }
 * 
 * // 创建 composable
 * export function useGitWorkflow() {
 *   return createApiComposable(apiConfig, http)
 * }
 * 
 * // 使用
 * const { loading, error, methods } = useGitWorkflow()
 * await methods.initializeRepository(config)
 * ```
 */
export function createApiComposable<T extends ApiMethodsConfig>(
  config: T,
  httpClient: any
) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 动态生成所有 API 方法
  const methods = Object.entries(config).reduce<Record<string, (params: any) => Promise<any>>>((acc, [methodName, methodConfig]) => {
    acc[methodName] = async (params: any) => {
      loading.value = true
      error.value = null

      try {
        // 请求前处理
        let processedParams = params
        if (methodConfig.beforeRequest) {
          processedParams = await methodConfig.beforeRequest(params)
        }

        // 执行 HTTP 请求
        const httpMethod = (methodConfig.method || 'POST').toLowerCase()
        let response: any

        if (httpMethod === 'get') {
          response = await httpClient.get(methodConfig.endpoint, { params: processedParams })
        } else if (httpMethod === 'delete') {
          response = await httpClient.delete(methodConfig.endpoint, { params: processedParams })
        } else {
          response = await httpClient[httpMethod](methodConfig.endpoint, processedParams)
        }

        // 响应后处理
        if (methodConfig.afterResponse) {
          return await methodConfig.afterResponse(response)
        }

        return response
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : (methodConfig.errorMessage || '操作失败')
        error.value = errorMsg
        throw err
      } finally {
        loading.value = false
      }
    }

    return acc
  }, {})

  return {
    loading,
    error,
    ...methods
  }
}

/**
 * 创建简单的 API Composable（无复杂配置）
 * 
 * @example
 * ```typescript
 * export function useSimpleApi() {
 *   return createSimpleApiComposable({
 *     getData: { endpoint: '/api/data', method: 'GET' },
 *     postData: { endpoint: '/api/data', method: 'POST' }
 *   }, http)
 * }
 * ```
 */
export function createSimpleApiComposable<
  T extends Record<string, { endpoint: string; method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; errorMessage?: string }>
>(
  endpoints: T,
  httpClient: any
) {
  const config: ApiMethodsConfig = Object.entries(endpoints).reduce((acc, [key, value]) => {
    acc[key] = {
      endpoint: value.endpoint,
      method: value.method || 'POST',
      errorMessage: value.errorMessage
    }
    return acc
  }, {} as ApiMethodsConfig)

  return createApiComposable(config, httpClient)
}

/**
 * 创建批量 API 调用 Composable
 * 用于批量执行多个相关 API 调用
 * 
 * @example
 * ```typescript
 * const { loading, error, executeBatch } = createBatchApiComposable([
 *   { endpoint: '/api/user', method: 'GET' },
 *   { endpoint: '/api/settings', method: 'GET' }
 * ], http)
 * 
 * const results = await executeBatch([
 *   { endpoint: '/api/user', params: {} },
 *   { endpoint: '/api/settings', params: {} }
 * ])
 * ```
 */
export function createBatchApiComposable(
  endpoints: Array<{ endpoint: string; method?: string; errorMessage?: string }>,
  httpClient: any
) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const executeBatch = async (requests: Array<{ endpoint: string; params?: any }>) => {
    loading.value = true
    error.value = null

    try {
      const promises = requests.map(async (request) => {
        const config = endpoints.find(e => e.endpoint === request.endpoint)
        if (!config) {
          throw new Error(`未找到端点配置: ${request.endpoint}`)
        }

        const method = (config.method || 'POST').toLowerCase()
        
        if (method === 'get') {
          return await httpClient.get(request.endpoint, { params: request.params })
        } else if (method === 'delete') {
          return await httpClient.delete(request.endpoint, { params: request.params })
        } else {
          return await httpClient[method](request.endpoint, request.params)
        }
      })

      return await Promise.all(promises)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量操作失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    executeBatch
  }
}

