/**
 * 高阶组件（HOCs）统一导出
 * High-Order Components Exports
 */

// WithLoading
export { WithLoading, useLoading } from './WithLoading.js'
export type { WithLoadingProps } from './WithLoading.js'

// WithError
export { WithError, useErrorHandler } from './WithError.js'
export type { WithErrorProps } from './WithError.js'

// WithValidation
export { WithValidation, useValidation } from './WithValidation.js'
export type { WithValidationProps } from './WithValidation.js'
// ValidationResult 从 validators/common 导出，避免重复

// WithPermission
export { WithPermission, usePermission } from './WithPermission.js'
export type { WithPermissionProps } from './WithPermission.js'

/**
 * 组合多个HOCs
 * 
 * @example
 * ```typescript
 * import { compose } from '@smartabp/lowcode-shared/components/hocs'
 * import { WithLoading, WithError, WithValidation } from '@smartabp/lowcode-shared/components/hocs'
 * 
 * const EnhancedComponent = compose(
 *   WithLoading,
 *   WithError,
 *   WithValidation
 * )(MyComponent)
 * ```
 */
export function compose(...hocs: Array<(component: any) => any>) {
  return (component: any) => {
    return hocs.reduceRight((acc, hoc) => hoc(acc), component)
  }
}
