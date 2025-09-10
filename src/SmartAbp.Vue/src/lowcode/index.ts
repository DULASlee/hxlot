/**
 * 低代码引擎统一导出
 * SmartAbp.Vue 集成版本
 */

// 导出核心内核
export { LowCodeKernel } from './kernel/core';
export type {
  LowCodeKernelConfig,
  GenerationOptions,
  GenerationResult,
  KernelHealthInfo
} from './kernel/core';

// 导出插件
export { Vue3Plugin } from './plugins/vue3';
export type { Vue3Schema, Vue3Config, Vue3GeneratedCode } from './plugins/vue3';

// 导出常用类型
export type {
  Schema,
  GeneratedCode,
  CodegenPlugin,
  PluginContext
} from './kernel/types';

// 重新导入以供工具函数使用
import { LowCodeKernel } from './kernel/core';
import { Vue3Plugin } from './plugins/vue3';

// 导出工具函数
export const createLowCodeKernel = (config?: any) => {
  return new LowCodeKernel(config);
};

export const createVue3Generator = async (config?: any) => {
  const kernel = new LowCodeKernel(config);
  await kernel.initialize();
  await kernel.registerPlugin(new Vue3Plugin());
  return kernel;
};

// 默认导出
export default {
  LowCodeKernel,
  Vue3Plugin,
  createLowCodeKernel,
  createVue3Generator
};
