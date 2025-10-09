/**
 * 铁律2守护者：组件注册强制执行
 * 
 * 核心职责：
 * 1. 拦截未注册组件的访问（运行时）
 * 2. 提供清晰的错误提示和修复指导
 * 3. 自动发现并建议注册
 */

import { globalComponentRegistry } from '../components/ComponentRegistry'

/**
 * 组件注册守护者
 */
export class ComponentRegistryGuard {
  
  /**
   * 增强VirtualAssembly以强制执行铁律2
   * 
   * 在开发者访问Components.XXX时：
   * 1. 检查组件是否已注册
   * 2. 如果未注册，抛出清晰的错误并提供修复指导
   * 3. 阻断未注册组件的使用
   */
  enhanceVirtualAssembly() {
    // 注意：这个方法会在VirtualAssembly创建时调用
    // 实际的拦截逻辑已经在VirtualAssembly.ts中实现
    
    // 这里我们添加额外的监控和统计
    this.setupMonitoring()
  }
  
  /**
   * 设置监控
   */
  private setupMonitoring() {
    // 监控组件访问
    const originalGet = globalComponentRegistry.getMetadata.bind(globalComponentRegistry)
    
    globalComponentRegistry.getMetadata = (name: string) => {
      const metadata = originalGet(name)
      
      if (!metadata) {
        // 记录未注册组件的访问尝试
        this.logUnregisteredAccess(name)
      }
      
      return metadata
    }
  }
  
  /**
   * 记录未注册组件的访问
   */
  private logUnregisteredAccess(componentName: string) {
    const timestamp = new Date().toISOString()
    const stack = new Error().stack
    
    console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 铁律2违规：未注册组件访问
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 时间: ${timestamp}
📦 组件: ${componentName}
🚫 状态: 未注册到ComponentRegistry

💡 修复方法：

1️⃣  手动注册（推荐）:
   
   import { registerComponent } from '@smartabp/lowcode-shared'
   
   registerComponent({
     name: '${componentName}',
     displayName: '${componentName}',
     category: 'business',  // 根据实际情况修改
     priority: 'medium',
     bundle: '@app/components',
     path: './src/components/${componentName}.vue',
     lazy: true,
     version: '1.0.0',
     tags: ['${componentName.toLowerCase()}']
   })

2️⃣  使用自动注册脚本:
   
   npm run register-component ${componentName}

3️⃣  批量扫描注册:
   
   npm run scan-components

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 详细文档: .cursor/rules/03_项目架构指南.mdc

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `)
    
    // 统计未注册组件（用于后续分析）
    this.recordViolation({
      componentName,
      timestamp,
      stack
    })
  }
  
  /**
   * 记录违规数据
   */
  private recordViolation(data: {
    componentName: string
    timestamp: string
    stack?: string
  }) {
    // 这里可以将数据发送到统计系统
    // 暂时只记录到console
    if (typeof window !== 'undefined' && window.__ARCH_VIOLATIONS__) {
      window.__ARCH_VIOLATIONS__.push(data)
    } else if (typeof window !== 'undefined') {
      window.__ARCH_VIOLATIONS__ = [data]
    }
  }
  
  /**
   * 生成注册代码
   */
  generateRegistrationCode(componentName: string, componentPath?: string): string {
    return `
import { registerComponent } from '@smartabp/lowcode-shared'

registerComponent({
  name: '${componentName}',
  displayName: '${componentName}',
  category: 'business',
  priority: 'medium',
  bundle: '@app/components',
  path: '${componentPath || `./src/components/${componentName}.vue`}',
  lazy: true,
  version: '1.0.0',
  tags: ['${componentName.toLowerCase()}']
})
    `.trim()
  }
}

