/**
 * WithPermission HOC Storybook Stories
 * 权限控制高阶组件可视化文档
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { WithPermission, usePermission } from './WithPermission'

// 测试组件
const SecretContent = {
  name: 'SecretContent',
  template: `
    <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px; background: #f0f9ff;">
      <h3 style="color: #67c23a;">🔐 受保护的内容</h3>
      <p>这是需要权限才能查看的内容</p>
      <ul>
        <li>敏感数据项 1</li>
        <li>敏感数据项 2</li>
        <li>敏感数据项 3</li>
      </ul>
    </div>
  `
}

const WrappedContent = WithPermission(SecretContent)

const meta: Meta<typeof WrappedContent> = {
  title: 'Packages/lowcode-shared/HOCs/WithPermission',
  component: WrappedContent,
  tags: ['autodocs'],
  argTypes: {
    permission: {
      control: 'object',
      description: '所需权限（字符串或数组）',
    },
    matchMode: {
      control: 'select',
      options: ['any', 'all'],
      description: '权限匹配模式',
      table: {
        type: { summary: 'PermissionMatchMode' },
        defaultValue: { summary: 'any' },
      },
    },
    unauthorizedBehavior: {
      control: 'select',
      options: ['hide', 'disable', 'placeholder'],
      description: '无权限时的行为',
      table: {
        type: { summary: 'UnauthorizedBehavior' },
        defaultValue: { summary: 'hide' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof WrappedContent>

/**
 * 基础示例 - 有权限
 */
export const WithPermissionGranted: Story = {
  render: () => ({
    components: { WithPermission: WrappedContent },
    setup() {
      // 模拟用户拥有admin权限
      const currentPermissions = ['admin', 'user']
      // 临时设置权限检查函数
      ;(window as any).__testPermissions = currentPermissions
      return {}
    },
    template: `
      <div style="padding: 20px;">
        <p style="margin-bottom: 15px; color: #67c23a;">✓ 当前用户权限: admin, user</p>
        <WithPermission permission="admin">
          <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px; background: #f0f9ff;">
            <h3 style="color: #67c23a;">🔐 管理员内容</h3>
            <p>这是只有管理员才能看到的内容</p>
          </div>
        </WithPermission>
      </div>
    `,
  }),
}

/**
 * 无权限 - 隐藏
 */
export const WithoutPermissionHide: Story = {
  render: () => ({
    components: { WithPermission: WrappedContent },
    setup() {
      const currentPermissions = ['user']
      ;(window as any).__testPermissions = currentPermissions
      return {}
    },
    template: `
      <div style="padding: 20px;">
        <p style="margin-bottom: 15px; color: #909399;">⚠️ 当前用户权限: user</p>
        <div style="border: 2px dashed #e4e7ed; border-radius: 4px; padding: 20px; background: #fafafa;">
          <p style="color: #909399; margin-bottom: 10px;">下方应该看不到任何内容（unauthorized-behavior="hide"）</p>
          <WithPermission permission="admin" unauthorized-behavior="hide">
            <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px;">
              <h3>这段内容不会显示</h3>
            </div>
          </WithPermission>
        </div>
      </div>
    `,
  }),
}

/**
 * 无权限 - 占位符
 */
export const WithoutPermissionPlaceholder: Story = {
  render: () => ({
    components: { WithPermission: WrappedContent },
    setup() {
      const currentPermissions = ['user']
      ;(window as any).__testPermissions = currentPermissions
      return {}
    },
    template: `
      <div style="padding: 20px;">
        <p style="margin-bottom: 15px; color: #909399;">⚠️ 当前用户权限: user</p>
        <WithPermission 
          permission="admin" 
          unauthorized-behavior="placeholder"
          unauthorized-message="您没有权限查看此内容，请联系管理员"
        >
          <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px;">
            <h3>这段内容不会显示</h3>
          </div>
        </WithPermission>
      </div>
    `,
  }),
}

/**
 * 多权限 - Any模式
 */
export const MultiplePermissionsAny: Story = {
  render: () => ({
    components: { WithPermission: WrappedContent },
    setup() {
      const currentPermissions = ['editor']
      ;(window as any).__testPermissions = currentPermissions
      return {}
    },
    template: `
      <div style="padding: 20px;">
        <p style="margin-bottom: 15px; color: #67c23a;">✓ 当前用户权限: editor</p>
        <WithPermission 
          :permission="['admin', 'editor']" 
          match-mode="any"
        >
          <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px; background: #f0f9ff;">
            <h3 style="color: #67c23a;">📝 编辑器内容</h3>
            <p>需要admin或editor权限之一（any模式）</p>
            <p style="color: #67c23a;">✓ 用户有editor权限，可以访问</p>
          </div>
        </WithPermission>
      </div>
    `,
  }),
}

/**
 * 多权限 - All模式
 */
export const MultiplePermissionsAll: Story = {
  render: () => ({
    components: { WithPermission: WrappedContent },
    setup() {
      const currentPermissions = ['editor']
      ;(window as any).__testPermissions = currentPermissions
      return {}
    },
    template: `
      <div style="padding: 20px;">
        <p style="margin-bottom: 15px; color: #f56c6c;">✗ 当前用户权限: editor（缺少admin权限）</p>
        <WithPermission 
          :permission="['admin', 'editor']" 
          match-mode="all"
          unauthorized-behavior="placeholder"
          unauthorized-message="需要同时拥有admin和editor权限"
        >
          <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px;">
            <h3>这段内容不会显示</h3>
            <p>需要admin和editor权限（all模式）</p>
          </div>
        </WithPermission>
      </div>
    `,
  }),
}

/**
 * usePermission Composable示例
 */
export const UsePermissionComposable: Story = {
  render: () => ({
    setup() {
      const currentPermissions = ref(['user', 'editor'])
      ;(window as any).__testPermissions = currentPermissions.value
      
      const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
      
      const checkAdmin = () => hasPermission('admin')
      const checkEditor = () => hasPermission('editor')
      const checkAny = () => hasAnyPermission(['admin', 'superuser'])
      const checkAll = () => hasAllPermissions(['user', 'editor'])
      
      return {
        currentPermissions,
        checkAdmin,
        checkEditor,
        checkAny,
        checkAll,
      }
    },
    template: `
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-radius: 4px;">
          <h4>当前权限</h4>
          <p>{{ currentPermissions.join(', ') }}</p>
        </div>
        
        <div style="display: flex; gap: 10px; flex-direction: column;">
          <div style="padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px;">
            hasPermission('admin'): 
            <span :style="{ color: checkAdmin() ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
              {{ checkAdmin() ? '✓ true' : '✗ false' }}
            </span>
          </div>
          
          <div style="padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px;">
            hasPermission('editor'): 
            <span :style="{ color: checkEditor() ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
              {{ checkEditor() ? '✓ true' : '✗ false' }}
            </span>
          </div>
          
          <div style="padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px;">
            hasAnyPermission(['admin', 'superuser']): 
            <span :style="{ color: checkAny() ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
              {{ checkAny() ? '✓ true' : '✗ false' }}
            </span>
          </div>
          
          <div style="padding: 10px; border: 1px solid #dcdfe6; border-radius: 4px;">
            hasAllPermissions(['user', 'editor']): 
            <span :style="{ color: checkAll() ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
              {{ checkAll() ? '✓ true' : '✗ false' }}
            </span>
          </div>
        </div>
      </div>
    `,
  }),
}
