/**
 * WithLoading 高阶组件
 * 为任何组件添加加载状态管理功能
 */

import { defineComponent, h, ref, type Component } from 'vue';
import type { BaseComponentProps } from '../../types';

/**
 * WithLoading Props扩展
 */
export interface WithLoadingProps extends BaseComponentProps {
  /**
   * 是否处于加载状态
   */
  loading?: boolean;

  /**
   * 加载提示文本
   */
  loadingText?: string;

  /**
   * 加载图标
   */
  loadingIcon?: string;

  /**
   * 加载组件自定义渲染
   */
  loadingComponent?: Component;

  /**
   * 最小加载时间（毫秒）
   * 防止加载状态闪烁
   */
  minLoadingTime?: number;
}

/**
 * 默认加载组件
 */
const DefaultLoadingComponent = defineComponent({
  name: 'DefaultLoading',
  props: {
    text: {
      type: String,
      default: '加载中...'
    },
    icon: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    return () => h('div', { class: 'with-loading-spinner' }, [
      props.icon && h('i', { class: props.icon }),
      h('span', { class: 'loading-text' }, props.text)
    ]);
  }
});

/**
 * WithLoading 高阶组件工厂函数
 *
 * @param WrappedComponent 被包装的组件
 * @returns 增强后的组件
 *
 * @example
 * ```typescript
 * import { WithLoading } from '@smartabp/lowcode-shared/components/hocs'
 * import MyComponent from './MyComponent.vue'
 *
 * const EnhancedComponent = WithLoading(MyComponent)
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <EnhancedComponent
 *     :loading="isLoading"
 *     loading-text="数据加载中..."
 *     :min-loading-time="300"
 *   />
 * </template>
 * ```
 */
export function WithLoading(
  WrappedComponent: Component
) {
  return defineComponent({
    // ✅ 正确：使用类型守卫替代as any
    name: `WithLoading(${typeof WrappedComponent === 'object' && WrappedComponent !== null && 'name' in WrappedComponent ? (WrappedComponent as { name?: string; }).name || 'Component' : 'Component'})`,

    props: {
      loading: {
        type: Boolean,
        default: false
      },
      loadingText: {
        type: String,
        default: '加载中...'
      },
      loadingIcon: {
        type: String,
        default: ''
      },
      loadingComponent: {
        type: Object as () => Component,
        default: undefined
      },
      minLoadingTime: {
        type: Number,
        default: 0
      }
    },

    setup(props, { attrs, slots }) {
      const isActuallyLoading = ref(props.loading);
      const loadingStartTime = ref<number | null>(null);

      // 监听loading状态变化，实现最小加载时间
      const handleLoadingChange = async (newLoading: boolean) => {
        if (newLoading) {
          // 开始加载
          loadingStartTime.value = Date.now();
          isActuallyLoading.value = true;
        } else {
          // 结束加载
          if (loadingStartTime.value && props.minLoadingTime > 0) {
            const elapsed = Date.now() - loadingStartTime.value;
            if (elapsed < props.minLoadingTime) {
              // 等待最小加载时间
              await new Promise(resolve =>
                setTimeout(resolve, props.minLoadingTime - elapsed)
              );
            }
          }
          isActuallyLoading.value = false;
          loadingStartTime.value = null;
        }
      };

      // 同步loading状态
      if (props.loading !== isActuallyLoading.value) {
        handleLoadingChange(props.loading);
      }

      return () => {
        // 如果正在加载，显示加载组件
        if (isActuallyLoading.value) {
          const LoadingComp = props.loadingComponent || DefaultLoadingComponent;
          return h(LoadingComp, {
            text: props.loadingText,
            icon: props.loadingIcon
          });
        }

        // 否则渲染原组件
        return h(WrappedComponent, {
          ...attrs,
          loading: props.loading
        }, slots);
      };
    }
  });
}

/**
 * 加载状态组合式函数
 *
 * @example
 * ```typescript
 * import { useLoading } from '@smartabp/lowcode-shared/components/hocs'
 *
 * const { isLoading, startLoading, stopLoading, withLoading } = useLoading()
 *
 * // 异步操作包装
 * await withLoading(async () => {
 *   await fetchData()
 * })
 * ```
 */
export function useLoading(initialState = false) {
  const isLoading = ref(initialState);
  const loadingCount = ref(0);

  const startLoading = () => {
    loadingCount.value++;
    isLoading.value = true;
  };

  const stopLoading = () => {
    loadingCount.value = Math.max(0, loadingCount.value - 1);
    if (loadingCount.value === 0) {
      isLoading.value = false;
    }
  };

  /**
   * 包装异步函数，自动管理加载状态
   */
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      return await fn();
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
}
