// 添加DOM类型定义
/// <reference lib="dom" />

import { onUnmounted, onMounted } from 'vue';

/**
 * 🛡️ 安全事件监听器 - 防止内存泄露
 * 
 * 🎯 核心功能: 在 Vue 组件中安全地添加全局事件监听器，并在组件卸载时自动清理
 * 🚨 解决问题: Vue应用中最常见的内存泄露源 - "组件生命周期与全局事件监听器脱钩"
 * 
 * @param target 事件目标 (window, document, element等)
 * @param event 事件名称 (click, scroll, resize等)
 * @param listener 事件处理函数
 * @param options 事件监听选项
 * 
 * @example
 * // 在 Vue 组合式 API 中使用
 * import { useSafeEventListener } from '@smartabp/lowcode-shared'
 * 
 * export default defineComponent({
 *   setup() {
 *     // 监听窗口大小变化 - 自动在组件卸载时清理
 *     useSafeEventListener(window, 'resize', () => {
 *       console.log('Window resized')
 *     })
 * 
 *     // 监听文档点击 - 自动在组件卸载时清理
 *     useSafeEventListener(document, 'click', (event) => {
 *       console.log('Document clicked', event.target)
 *     })
 * 
 *     return {}
 *   }
 * })
 */
export function useSafeEventListener(
  target: EventTarget,
  event: string,
  listener: (event: Event) => void,
  options?: boolean | { passive?: boolean; capture?: boolean; once?: boolean }
) {
  // 🔧 在组件挂载时添加事件监听器
  onMounted(() => {
    target.addEventListener(event, listener, options);
  });

  // 🧹 在组件卸载时自动移除事件监听器，防止内存泄露
  onUnmounted(() => {
    target.removeEventListener(event, listener, options);
  });
}

/**
 * 🛡️ 安全事件总线监听器 - 防止事件总线内存泄露
 * 
 * 🎯 核心功能: 安全地监听事件总线事件，并在组件卸载时自动取消订阅
 * 🚨 解决问题: EventBus/EventEmitter 事件监听器未清理导致的内存泄露
 * 
 * @param eventBus 事件总线实例
 * @param event 事件名称
 * @param listener 事件处理函数
 * 
 * @example
 * // 在 Vue 组合式 API 中使用
 * import { useSafeEventBusListener } from '@smartabp/lowcode-shared'
 * // 事件总线应通过@smartabp别名引用 - 遵循packages黑盒原则
 * 
 * export default defineComponent({
 *   setup() {
 *     // 监听业务事件 - 自动在组件卸载时取消订阅
 *     useSafeEventBusListener(eventBus, 'user-updated', (userData) => {
 *       console.log('User updated:', userData)
 *     })
 * 
 *     return {}
 *   }
 * })
 */
export function useSafeEventBusListener<T = any>(
  eventBus: { on: (event: string, listener: (data: T) => void) => void; off: (event: string, listener: (data: T) => void) => void },
  event: string,
  listener: (data: T) => void
) {
  // 🔧 在组件挂载时订阅事件
  onMounted(() => {
    eventBus.on(event, listener);
  });

  // 🧹 在组件卸载时自动取消订阅，防止内存泄露
  onUnmounted(() => {
    eventBus.off(event, listener);
  });
}

/**
 * 🛡️ 安全定时器 - 防止定时器内存泄露
 * 
 * 🎯 核心功能: 创建定时器并在组件卸载时自动清理
 * 🚨 解决问题: setTimeout/setInterval 未清理导致的内存泄露和意外执行
 * 
 * @param callback 回调函数
 * @param delay 延迟时间 (毫秒)
 * @param type 定时器类型: 'timeout' 或 'interval'
 * @returns 定时器ID (可选，用于手动清理)
 * 
 * @example
 * // 在 Vue 组合式 API 中使用
 * import { useSafeTimer } from '@smartabp/lowcode-shared'
 * 
 * export default defineComponent({
 *   setup() {
 *     // 延迟执行 - 自动在组件卸载时清理
 *     useSafeTimer(() => {
 *       console.log('Delayed execution')
 *     }, 1000, 'timeout')
 * 
 *     // 定期执行 - 自动在组件卸载时清理
 *     useSafeTimer(() => {
 *       console.log('Periodic execution')
 *     }, 1000, 'interval')
 * 
 *     return {}
 *   }
 * })
 */
export function useSafeTimer(
  callback: () => void,
  delay: number,
  type: 'timeout' | 'interval' = 'timeout'
): number | undefined {
  let timerId: number | undefined;

  // 🔧 在组件挂载时创建定时器
  onMounted(() => {
    if (type === 'timeout') {
      timerId = window.setTimeout(callback, delay);
    } else {
      timerId = window.setInterval(callback, delay);
    }
  });

  // 🧹 在组件卸载时自动清理定时器
  onUnmounted(() => {
    if (timerId !== undefined) {
      if (type === 'timeout') {
        clearTimeout(timerId);
      } else {
        clearInterval(timerId);
      }
    }
  });

  return timerId;
}
