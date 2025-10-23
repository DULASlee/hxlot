/**
 * 🎨 SmartAbp设计系统组件库
 *
 * 统一导出所有设计系统组件
 */

export { default as SmartButton } from './SmartButton.vue'
export { default as SmartIcon } from './SmartIcon.vue'
export { default as SmartInput } from './SmartInput.vue'

/**
 * 组件注册插件（可选）
 */
import type { App } from 'vue'
import SmartButton from './SmartButton.vue'
import SmartIcon from './SmartIcon.vue'
import SmartInput from './SmartInput.vue'

export function installDesignSystem(app: App): void {
    app.component('SmartInput', SmartInput)
    app.component('SmartButton', SmartButton)
    app.component('SmartIcon', SmartIcon)
}

export default {
    install: installDesignSystem,
}
