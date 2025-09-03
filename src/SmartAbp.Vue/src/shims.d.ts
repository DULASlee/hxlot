/**
 * 全局类型声明（用于解决 .vue 导入与某些本地 JS 模块的隐式 any 问题）
 * 目的：
 *  - 让 .vue 文件在 TS 环境中有默认导出类型
 *  - 为本地的 useTheme.js 提供简单声明，避免 ts-plugin 的“找不到声明文件”错误
 */

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/* 针对本地 composables/useTheme.js 提供简易声明（如果您后续改为 TS 可删除此声明） */
declare module './composables/useTheme.js' {
  export function useTheme(): any;
  export const themes: any;
  export default useTheme;
}
