/**
 * 运行ComponentGenie集成示例
 * 🚀 快速测试AI增强的组件注册系统
 */

import { runComponentGenieExample } from './ComponentGenieExample'

// 运行示例
runComponentGenieExample().catch(console.error)

/**
 * 💡 如何运行这个示例：
 * 
 * 1. 在终端中运行：
 *    cd src/SmartAbp.Vue
 *    npx tsx examples/run-example.ts
 * 
 * 2. 或者在Vue项目启动时调用：
 *    import { runComponentGenieExample } from '@/examples/ComponentGenieExample'
 *    await runComponentGenieExample()
 * 
 * 3. 预期输出：
 *    🚀 ComponentGenie集成示例开始...
 *    🧠 ComponentGenie已初始化，内置智能模式已加载
 *    🧠 ComponentGenie分析完成: UserForm (0.23ms)
 *    🤔 AI建议分类: UserForm -> form (当前: form, 置信度: 85.0%)
 *    💡 UserForm AI优化建议 (2个):
 *       1. [structure] 建议添加Props接口提高组件复用性 (影响: 3/5, 难度: 2/5)
 *       2. [maintainability] 考虑提取表单验证逻辑到独立文件 (影响: 2/5, 难度: 3/5)
 *    
 *    🧠 ComponentGenie分析完成: UserTable (0.18ms)
 *    🤔 AI建议分类: UserTable -> data (当前: basic, 置信度: 92.3%)
 *    💡 UserTable AI优化建议 (1个):
 *       1. [reusability] 建议添加Props接口提高组件复用性 (影响: 3/5, 难度: 2/5)
 *    
 *    📈 整体AI统计:
 *       已分析组件: 2个
 *       平均置信度: 88.7%
 *       总优化建议: 3个
 *       高置信度组件: UserTable
 *       分类分布: { FORM_COMPONENT: 1, DATA_DISPLAY: 1 }
 *    
 *    🔧 需要优化的组件:
 *       UserForm: 2个建议 (置信度: 85.0%)
 *       UserTable: 1个建议 (置信度: 92.3%)
 *    
 *    ✅ ComponentGenie集成示例完成！
 */
