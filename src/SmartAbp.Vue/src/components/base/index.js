/**
 * 基础组件统一导出
 */
import BaseButton from './BaseButton.vue';
import BaseCard from './BaseCard.vue';
import BaseDialog from './BaseDialog.vue';
// 组件列表
const components = [
    BaseButton,
    BaseCard,
    BaseDialog
];
/**
 * 安装基础组件
 */
export function installBaseComponents(app) {
    components.forEach(component => {
        const name = component.name || component.__name || 'UnknownComponent';
        app.component(name, component);
    });
}
// 单独导出
export { BaseButton, BaseCard, BaseDialog };
// 默认导出
export default {
    install: installBaseComponents
};
