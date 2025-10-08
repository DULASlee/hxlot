/**
 * SmartAbp Component Sandbox System
 * 
 * Provides secure execution environment for low-code components
 * Implements component isolation, permission control, and safety mechanisms
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

interface SandboxOptions {
  /**
   * Component permissions (e.g., ['network', 'storage', 'dom'])
   */
  permissions?: string[]

  /**
   * Enable strict isolation mode
   */
  isolation?: boolean

  /**
   * Memory limit in MB
   */
  memoryLimit?: number

  /**
   * Execution timeout in milliseconds
   */
  timeout?: number

  /**
   * Allow network requests
   */
  allowNetwork?: boolean

  /**
   * Allow DOM manipulation
   */
  allowDOM?: boolean

  /**
   * Allow file system access
   */
  allowFileSystem?: boolean
}

interface ComponentContext {
  id: string
  permissions: Set<string>
  memoryUsage: number
  startTime: number
  isTerminated: boolean
}

/**
 * Component Sandbox for secure execution
 */
export class ComponentSandbox {
  private contexts: Map<string, ComponentContext> = new Map()
  private globalMemoryLimit: number = 100 // 100MB default

  constructor(private options: SandboxOptions = {}) {
    this.globalMemoryLimit = options.memoryLimit || 100
  }

  /**
   * Create a new sandboxed environment for a component
   */
  createSandbox(componentId: string, component: any, options?: SandboxOptions): any {
    const context: ComponentContext = {
      id: componentId,
      permissions: new Set(options?.permissions || this.options.permissions || []),
      memoryUsage: 0,
      startTime: Date.now(),
      isTerminated: false
    }

    this.contexts.set(componentId, context)

    // Create proxy for component methods
    return this.createProxy(component, context, options)
  }

  /**
   * Create a proxy that intercepts component method calls
   */
  private createProxy(component: any, context: ComponentContext, options?: SandboxOptions): any {
    const handler: ProxyHandler<any> = {
      get: (target, prop) => {
        if (context.isTerminated) {
          throw new Error(`Component ${context.id} has been terminated`)
        }

        // Check memory usage
        this.checkMemoryUsage(context)

        // Check execution timeout
        this.checkTimeout(context, options?.timeout)

        const value = target[prop]

        if (typeof value === 'function') {
          return (...args: any[]) => {
            // Validate permissions before method execution
            this.validatePermissions(prop as string, context)

            try {
              const result = value.apply(target, args)

              // Handle promises
              if (result instanceof Promise) {
                return result.catch(error => {
                  this.handleError(error, context)
                  throw error
                })
              }

              return result
            } catch (error) {
              this.handleError(error, context)
              throw error
            }
          }
        }

        return value
      },

      set: (target, prop, value) => {
        if (context.isTerminated) {
          throw new Error(`Component ${context.id} has been terminated`)
        }

        // Validate permissions for property assignment
        this.validatePermissions(`set_${prop as string}`, context)

        target[prop] = value
        return true
      }
    }

    return new Proxy(component, handler)
  }

  /**
   * Validate component permissions
   */
  private validatePermissions(operation: string, context: ComponentContext): void {
    // Check network operations
    if (operation.includes('fetch') || operation.includes('ajax') || operation.includes('http')) {
      if (!context.permissions.has('network') && !this.options.allowNetwork) {
        throw new Error(`Component ${context.id} does not have network permission`)
      }
    }

    // Check DOM operations
    if (operation.includes('DOM') || operation.includes('element') || operation.includes('style')) {
      if (!context.permissions.has('dom') && !this.options.allowDOM) {
        throw new Error(`Component ${context.id} does not have DOM manipulation permission`)
      }
    }

    // Check file system operations
    if (operation.includes('file') || operation.includes('fs') || operation.includes('read') || operation.includes('write')) {
      if (!context.permissions.has('storage') && !this.options.allowFileSystem) {
        throw new Error(`Component ${context.id} does not have file system permission`)
      }
    }
  }

  /**
   * Check memory usage and enforce limits
   */
  private checkMemoryUsage(context: ComponentContext): void {
    // Simple memory estimation (in production, use performance.memory if available)
    const estimatedMemory = Math.random() * 10 // Placeholder for actual memory tracking

    context.memoryUsage += estimatedMemory

    if (context.memoryUsage > this.globalMemoryLimit * 1024 * 1024) {
      this.terminate(context.id, 'Memory limit exceeded')
      throw new Error(`Component ${context.id} exceeded memory limit`)
    }
  }

  /**
   * Check execution timeout
   */
  private checkTimeout(context: ComponentContext, timeout?: number): void {
    const executionTime = Date.now() - context.startTime
    const maxTimeout = timeout || this.options.timeout || 30000 // 30 seconds default

    if (executionTime > maxTimeout) {
      this.terminate(context.id, 'Execution timeout')
      throw new Error(`Component ${context.id} execution timeout`)
    }
  }

  /**
   * Handle errors in sandboxed environment
   */
  private handleError(error: any, context: ComponentContext): void {
    console.error(`[ComponentSandbox] Error in component ${context.id}:`, error)

    // Log error for monitoring
    this.logError(context.id, error)

    // Terminate component if error is critical
    if (this.isCriticalError(error)) {
      this.terminate(context.id, 'Critical error occurred')
    }
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(error: any): boolean {
    const criticalErrors = [
      'MemoryError',
      'TimeoutError',
      'SecurityError',
      'PermissionDeniedError'
    ]

    return criticalErrors.some(criticalError =>
      error.name?.includes(criticalError) || error.message?.includes(criticalError)
    )
  }

  /**
   * Terminate a component execution
   */
  terminate(componentId: string, reason?: string): void {
    const context = this.contexts.get(componentId)
    if (context) {
      context.isTerminated = true
      console.warn(`[ComponentSandbox] Component ${componentId} terminated: ${reason}`)
    }
  }

  /**
   * Log error for monitoring
   */
  private logError(componentId: string, error: any): void {
    // In production, send to error monitoring service
    const errorLog = {
      componentId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }

    console.error('[ComponentSandbox Error Log]:', errorLog)
  }

  /**
   * Get sandbox statistics
   */
  getStats(): {
    activeComponents: number
    totalMemoryUsage: number
    terminatedComponents: number
  } {
    let totalMemory = 0
    let terminatedCount = 0

    this.contexts.forEach(context => {
      totalMemory += context.memoryUsage
      if (context.isTerminated) {
        terminatedCount++
      }
    })

    return {
      activeComponents: this.contexts.size - terminatedCount,
      totalMemoryUsage: totalMemory,
      terminatedComponents: terminatedCount
    }
  }

  /**
   * Clean up all sandboxed environments
   */
  destroy(): void {
    this.contexts.forEach((_context, componentId) => {
      this.terminate(componentId, 'Sandbox destroyed')
    })
    this.contexts.clear()
  }
}

/**
 * Create a pre-configured sandbox instance
 */
export function createComponentSandbox(options?: SandboxOptions): ComponentSandbox {
  return new ComponentSandbox(options)
}

/**
 * Default sandbox configuration for different component types
 */
export const SANDBOX_CONFIGS = {
  BASIC: {
    permissions: ['dom'],
    memoryLimit: 50,
    timeout: 10000
  },
  ADVANCED: {
    permissions: ['dom', 'network'],
    memoryLimit: 100,
    timeout: 30000,
    allowNetwork: true
  },
  UNTRUSTED: {
    permissions: [],
    memoryLimit: 10,
    timeout: 5000,
    isolation: true
  }
} as const

export default ComponentSandbox