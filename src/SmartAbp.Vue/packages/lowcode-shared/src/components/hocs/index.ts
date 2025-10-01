/**
 * 高阶组件（HOCs）统一导出
 * High-Order Components Exports
 */

// WithLoading
export { WithLoading, useLoading } from './WithLoading'
export type { WithLoadingProps } from './WithLoading'

// WithError
export { WithError, useErrorHandler } from './WithError'
export type { WithErrorProps } from './WithError'

// WithValidation
export { WithValidation, useValidation } from './WithValidation'
export type { WithValidationProps } from './WithValidation'
// ValidationResult 从 validators/common 导出，避免重复

// WithPermission
export { WithPermission, usePermission } from './WithPermission'
export type { WithPermissionProps } from './WithPermission'

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
