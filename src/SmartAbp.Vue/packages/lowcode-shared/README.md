# @smartabp/lowcode-shared

SmartAbp低代码引擎共享库 - 提供基础工具、类型定义和通用功能。

## 📦 安装

```bash
npm install @smartabp/lowcode-shared
```

## ✨ 特性

- 🎨 **HOC高阶组件**: WithLoading, WithError, WithValidation, WithPermission
- 🔧 **工具函数**: 字符串、对象、数组等工具
- ✅ **验证器**: 常用数据验证函数
- 🎭 **主题系统**: ThemeManager, DesignTokens
- 📝 **日志系统**: EnhancedLogger
- 🔐 **错误处理**: BaseError, GlobalErrorHandler
- 💾 **内存管理**: GlobalMemoryMonitor

## 🚀 快速开始

```typescript
import { WithLoading, useLoading } from '@smartabp/lowcode-shared/components/hocs'
import { isRequired, isEmail } from '@smartabp/lowcode-shared/validators'

// 使用HOC
const MyComponent = WithLoading(YourComponent)

// 使用Composable
const { isLoading, startLoading, stopLoading } = useLoading()

// 使用验证器
const emailValid = isEmail('test@example.com')
```

## 📚 文档

- [完整文档](https://github.com/DULASlee/hxlot/tree/main/docs/packages)
- [Storybook](https://your-org.github.io/hxlot/storybook)

## 📄 License

MIT © SmartAbp Team
