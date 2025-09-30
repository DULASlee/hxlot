/**
 * Storybook packages预览配置
 * 为packages组件提供可视化文档
 */

import { setup } from '@storybook/vue3'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 全局配置
setup((app) => {
  app.use(ElementPlus)
})

/** @type { import('@storybook/vue3').Preview } */
export default {
  parameters: {
    // 操作面板
    actions: { argTypesRegex: '^on[A-Z].*' },
    
    // 控制面板
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
    },
    
    // 文档
    docs: {
      toc: true,
      source: {
        state: 'open',
      },
    },
    
    // 布局
    layout: 'centered',
    
    // 视口
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },
    
    // 背景
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },
  },
  
  // 全局装饰器
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="padding: 20px;"><story /></div>',
    }),
  ],
  
  // 标签
  tags: ['autodocs'],
}
