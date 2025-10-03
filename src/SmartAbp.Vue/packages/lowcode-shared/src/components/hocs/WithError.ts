/**
 * WithError 高阶组件
 * 为任何组件添加错误边界和错误处理功能
 */

import type { BaseComponentProps } from '../../types';
import { defineComponent, h, onErrorCaptured, ref, type Component } from 'vue';

/**
 * WithError Props扩展
 */
export interface WithErrorProps extends BaseComponentProps {
  /**
   * 错误信息
   */
  error?: Error | string | null;

  /**
   * 错误显示模式
   */
  errorMode?: 'inline' | 'toast' | 'modal' | 'silent';

  /**
   * 自定义错误组件
   */
  errorComponent?: Component;

  /**
   * 错误回调
   */
  onError?: (error: Error) => void;

  /**
   * 是否显示错误详情
   */
  showErrorDetails?: boolean;

  /**
   * 错误恢复回调
   */
  onRecover?: () => void;

  /**
   * 是否允许重试
   */
  allowRetry?: boolean;
}

/**
 * 默认错误组件
 */
const DefaultErrorComponent = defineComponent({
  name: 'DefaultError',
  props: {
    error: {
      type: [Error, String],
      required: true
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    onRetry: {
      type: Function,
      default: undefined
    },
    allowRetry: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const errorMessage = typeof props.error === 'string'
      ? props.error
      : props.error.message;

    const errorStack = props.error instanceof Error
      ? props.error.stack
      : undefined;

    return () => h('div', { class: 'with-error-boundary' }, [
      h('div', { class: 'error-header' }, [
        h('i', { class: 'error-icon' }, '⚠️'),
        h('h3', '发生错误')
      ]),
      h('div', { class: 'error-message' }, errorMessage),
      props.showDetails && errorStack && h('details', { class: 'error-details' }, [
        h('summary', '查看详情'),
        h('pre', errorStack)
      ]),
      props.allowRetry && props.onRetry && h('button', {
        class: 'error-retry-btn',
        onClick: props.onRetry
      }, '重试')
    ]);
  }
});

/**
 * WithError 高阶组件工厂函数
 *
 * @param WrappedComponent 被包装的组件
 * @returns 增强后的组件
 *
 * @example
 * ```typescript
 * import { WithError } from '@smartabp/lowcode-shared/components/hocs'
 * import MyComponent from './MyComponent.vue'
 *
 * const SafeComponent = WithError(MyComponent)
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <SafeComponent
 *     :error="error"
 *     error-mode="inline"
 *     :show-error-details="true"
 *     :allow-retry="true"
 *     @recover="handleRecover"
 *   />
 * </template>
 * ```
 */
export function WithError(
  WrappedComponent: Component
) {
  return defineComponent({
    // ✅ 正确：使用类型守卫替代as any
    name: `WithError(${typeof WrappedComponent === 'object' && WrappedComponent !== null && 'name' in WrappedComponent ? (WrappedComponent as { name?: string; }).name || 'Component' : 'Component'})`,

    emits: ['recover'],

    props: {
      // ✅ 正确：使用PropType替代as any
      error: {
        type: [Error, String, null] as import('vue').PropType<Error | string | null>,
        default: null
      },
      errorMode: {
        type: String as () => 'inline' | 'toast' | 'modal' | 'silent',
        default: 'inline'
      },
      errorComponent: {
        type: Object as () => Component,
        default: undefined
      },
      onError: {
        type: Function as unknown as () => (error: Error) => void,
        default: undefined
      },
      showErrorDetails: {
        type: Boolean,
        default: false
      },
      onRecover: {
        type: Function as unknown as () => () => void,
        default: undefined
      },
      allowRetry: {
        type: Boolean,
        default: true
      }
    },

    setup(props, { attrs, slots, emit }) {
      const componentError = ref<Error | null>(null);
      const hasError = ref(false);

      // 捕获子组件错误
      onErrorCaptured((err: Error, _instance, info) => {
        componentError.value = err;
        hasError.value = true;

        // 记录错误到控制台
        console.error('[WithError]', {
          // ✅ 正确：使用类型守卫替代as any
          component: typeof WrappedComponent === 'object' && WrappedComponent !== null && 'name' in WrappedComponent ? (WrappedComponent as { name?: string; }).name || 'Unknown' : 'Unknown',
          error: err,
          info
        });

        // 调用用户提供的错误回调
        if (props.onError) {
          props.onError(err);
        }

        // 阻止错误继续向上传播（错误边界）
        return false;
      });

      // 重试函数
      const handleRetry = () => {
        componentError.value = null;
        hasError.value = false;

        if (props.onRecover) {
          props.onRecover();
        }

        emit('recover');
      };

      return () => {
        // 优先使用外部传入的error
        const displayError = props.error || componentError.value;

        // 如果有错误且不是silent模式
        if (displayError && props.errorMode !== 'silent') {
          const ErrorComp = props.errorComponent || DefaultErrorComponent;

          return h(ErrorComp, {
            error: displayError,
            showDetails: props.showErrorDetails,
            onRetry: props.allowRetry ? handleRetry : undefined,
            allowRetry: props.allowRetry
          });
        }

        // 正常渲染组件
        return h(WrappedComponent, {
          ...attrs,
          error: displayError
        }, slots);
      };
    }
  });
}

/**
 * 错误处理组合式函数
 *
 * @example
 * ```typescript
 * import { useErrorHandler } from '@smartabp/lowcode-shared/components/hocs'
 *
 * const { error, handleError, clearError, withErrorHandling } = useErrorHandler()
 *
 * // 异步操作包装
 * await withErrorHandling(async () => {
 *   await riskyOperation()
 * })
 * ```
 */
export function useErrorHandler() {
  const error = ref<Error | null>(null);
  const errorCount = ref(0);

  const handleError = (err: Error | string, context?: Record<string, any>) => {
    const errorObj = typeof err === 'string' ? new Error(err) : err;
    error.value = errorObj;
    errorCount.value++;

    // 记录错误到控制台
    console.error('[useErrorHandler]', { error: errorObj, context });
  };

  const clearError = () => {
    error.value = null;
  };

  /**
   * 包装异步函数，自动捕获错误
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error);

      if (onError) {
        onError(error);
      }

      return null;
    }
  };

  return {
    error,
    errorCount,
    handleError,
    clearError,
    withErrorHandling
  };
}
