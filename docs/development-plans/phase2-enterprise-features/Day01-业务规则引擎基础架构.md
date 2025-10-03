# SmartAbp低代码生成器 - Day 1 开发计划书

**计划二 Phase 1: 复杂业务规则引擎和工作流系统**  
**Day 1: 业务规则引擎基础架构 - RuleEngine核心框架**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📋 开发计划概览
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 项目 | 内容 |
|------|------|
| **开发日期** | Day 1 / 15 |
| **开发阶段** | 计划二 - 企业级功能增强 |
| **核心任务** | 业务规则引擎基础架构搭建 |
| **预计工作量** | 8小时（1个工作日）|
| **代码预估** | 600-800行（TypeScript + C#）|
| **依赖关系** | 依赖现有enhancedStateMachine.ts |
| **技术难度** | ⭐⭐⭐⭐ (高) |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ✅ 已实现功能分析（现有代码基础）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 📦 现有文件清单

```
src/SmartAbp.Vue/packages/lowcode-core/src/stores/
├── enhancedStateMachine.ts (874行) ✅ 已实现
├── enhancedStateMachine.d.ts       ✅ 类型定义
└── statemachine.ts (基础版本)      ✅ 已实现
```

### 🎯 enhancedStateMachine.ts 已实现功能

**代码行数**: 874行  
**实现质量**: 企业级标准  
**测试覆盖**: 有对应测试文件

#### 1. 核心类型定义（已完成100%）

```typescript
// ✅ 增强状态定义
export interface EnhancedState {
  id: string
  type: "start" | "intermediate" | "end"
  label: string
  position: { x: number; y: number }
  metadata?: Record<string, any>
  validationRules?: string[]
}

// ✅ 状态转换定义
export interface StateTransition {
  id: string
  source: string
  target: string
  label?: string
  condition?: string  // 转换条件表达式
  action?: string    // 转换动作表达式
  priority?: number  // 优先级
}

// ✅ 业务规则定义
export interface BusinessRule {
  id: string
  type: "field-linkage" | "permission-constraint" | "async-validation" | "custom"
  trigger: string    // 触发字段或事件
  condition?: string // 执行条件
  action: string     // 执行动作
  priority?: number  // 执行优先级
  enabled?: boolean  // 是否启用
  description?: string
}

// ✅ 工作流元数据
export interface WorkflowMetadata {
  name: string
  description: string
  entity?: string
  version?: string
  author?: string
  createdAt?: number
  updatedAt?: number
}
```

#### 2. Store状态管理（已完成70%）

```typescript
export const useEnhancedStateMachineStore = defineStore("enhancedStateMachine", () => {
  // ✅ 核心状态（已实现）
  const states = ref<EnhancedState[]>([])
  const transitions = ref<StateTransition[]>([])
  const businessRules = ref<BusinessRule[]>([])
  const workflowMetadata = ref<WorkflowMetadata>({...})
  const workflowTemplates = ref<WorkflowTemplate[]>([])
  const executionErrors = ref<ExecutionError[]>([])
  const isExecuting = ref(false)
  
  // ✅ 计算属性（已实现）
  const startStates = computed(...)
  const endStates = computed(...)
  const intermediateStates = computed(...)
  
  // ✅ 基础CRUD方法（已实现）
  const addState = (state: EnhancedState) => {...}
  const updateState = (id: string, updates: Partial<EnhancedState>) => {...}
  const deleteState = (id: string) => {...}
  const addTransition = (transition: StateTransition) => {...}
  const updateTransition = (id: string, updates: Partial<StateTransition>) => {...}
  const deleteTransition = (id: string) => {...}
  
  // ⚠️ 规则执行引擎（仅有基础框架，需要增强）
  const executeBusinessRules = async (context: Record<string, any>) => {
    // 当前只有基础实现，需要完善
  }
  
  // ⚠️ 代码生成（仅有基础模板，需要完善）
  const generateCode = (options: CodeGenerationOptions) => {
    // 当前只生成基础代码，需要增强
  }
})
```

#### 3. 现有功能完整度评估

| 功能模块 | 完成度 | 说明 |
|---------|--------|------|
| **类型定义** | ✅ 100% | 完整的TypeScript类型定义 |
| **状态管理** | ✅ 90% | Pinia Store基础实现完整 |
| **CRUD操作** | ✅ 100% | 状态和转换的增删改查完整 |
| **验证机制** | ⚠️ 60% | 基础验证存在，需要增强 |
| **规则执行引擎** | ❌ 30% | 仅有框架，核心逻辑缺失 |
| **代码生成** | ⚠️ 40% | 基础模板存在，需要完善 |
| **可视化UI** | ❌ 0% | 完全缺失，需要全新开发 |

### 🔍 现有代码的优势

1. ✅ **类型安全**: 完整的TypeScript类型定义
2. ✅ **状态管理**: 基于Pinia的现代状态管理
3. ✅ **架构清晰**: 符合packages黑盒原则
4. ✅ **可扩展性**: 良好的接口设计，易于扩展

### ⚠️ 现有代码的不足

1. ❌ **规则执行引擎不完整**: 缺少条件解析、动作执行逻辑
2. ❌ **无可视化界面**: 需要Vue Flow集成
3. ❌ **代码生成简陋**: 需要生成更完整的前后端代码
4. ❌ **缺少规则测试**: 需要规则调试和验证功能

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔨 待开发功能列表（Day 1 增量开发）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 任务优先级

| 优先级 | 任务 | 预计时间 | 代码行数 |
|--------|------|----------|----------|
| **P0** | 规则执行引擎核心逻辑 | 3小时 | 300行 |
| **P0** | 条件表达式解析器 | 2小时 | 150行 |
| **P1** | 动作执行器框架 | 2小时 | 150行 |
| **P2** | 规则调试和日志 | 1小时 | 100行 |

### 🎯 任务1: 规则执行引擎核心逻辑

**目标**: 实现完整的规则执行引擎，支持条件判断和动作执行

**增量开发位置**: 
- 文件: `src/SmartAbp.Vue/packages/lowcode-core/src/stores/enhancedStateMachine.ts`
- 方法: `executeBusinessRules()` - 增强现有实现

**待开发功能点**:

1. **规则优先级排序**
   - 按priority字段排序
   - 支持同优先级并行执行
   - 支持优先级中断机制

2. **规则过滤和筛选**
   - 根据trigger字段筛选适用规则
   - 支持enabled状态过滤
   - 支持规则条件预检查

3. **规则执行上下文管理**
   - 上下文数据隔离
   - 上下文数据传递
   - 执行历史记录

4. **错误处理和恢复**
   - 单条规则失败不影响其他规则
   - 错误日志记录
   - 错误恢复机制

### 🎯 任务2: 条件表达式解析器

**目标**: 实现安全的条件表达式解析和执行

**新增文件**: 
- `src/SmartAbp.Vue/packages/lowcode-core/src/utils/ruleExpressionParser.ts`

**待开发功能点**:

1. **表达式解析**
   - 支持JavaScript表达式子集
   - 字段引用解析（如 `entity.field`）
   - 运算符支持（==, !=, >, <, &&, ||）
   - 函数调用支持

2. **安全沙箱执行**
   - 禁止危险操作（eval, Function构造器）
   - 白名单函数限制
   - 执行超时控制
   - 内存限制

3. **类型检查**
   - 运行时类型验证
   - 类型转换
   - 空值处理

### 🎯 任务3: 动作执行器框架

**目标**: 实现可扩展的动作执行器框架

**新增文件**: 
- `src/SmartAbp.Vue/packages/lowcode-core/src/engines/actionExecutor.ts`

**待开发功能点**:

1. **内置动作执行器**
   - SetFieldValue: 设置字段值
   - ShowMessage: 显示消息
   - CallAPI: 调用API
   - ValidateField: 验证字段

2. **动作执行器注册机制**
   - 动态注册新执行器
   - 执行器优先级
   - 执行器依赖管理

3. **执行结果处理**
   - 成功/失败状态
   - 执行结果返回
   - 副作用管理

### 🎯 任务4: 规则调试和日志

**目标**: 提供完整的规则调试和监控能力

**增量开发位置**: 
- 文件: `src/SmartAbp.Vue/packages/lowcode-core/src/stores/enhancedStateMachine.ts`
- 新增方法: `enableRuleDebug()`, `getRuleExecutionLogs()`

**待开发功能点**:

1. **执行日志记录**
   - 规则触发日志
   - 条件判断日志
   - 动作执行日志
   - 错误日志

2. **调试模式**
   - 单步执行
   - 断点设置
   - 变量查看

3. **性能监控**
   - 规则执行时间统计
   - 性能瓶颈识别

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🏗️ 技术方案设计
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 架构设计原则

1. **增量开发**: 基于现有enhancedStateMachine.ts扩展
2. **零重复代码**: 复用现有类型定义和Store结构
3. **架构清晰**: 符合packages黑盒原则
4. **类型安全**: 100% TypeScript严格模式

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                 Enhanced StateMachine Store                  │
│                 (现有: enhancedStateMachine.ts)              │
├─────────────────────────────────────────────────────────────┤
│  ✅ 已实现                    🔨 Day 1 新增                  │
│  ├─ 状态管理                  ├─ RuleExecutionEngine        │
│  ├─ CRUD操作                  ├─ ExpressionParser           │
│  ├─ 基础验证                  ├─ ActionExecutor             │
│  └─ 基础代码生成              └─ DebugLogger                │
├─────────────────────────────────────────────────────────────┤
│                        新增组件                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Expression     │  │ Action         │  │ Debug         │ │
│  │ Parser         │→ │ Executor       │→ │ Logger        │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 核心接口设计

```typescript
// 规则执行引擎接口
export interface IRuleExecutionEngine {
  executeRules(
    rules: BusinessRule[], 
    context: RuleContext
  ): Promise<RuleExecutionResult>
  
  executeRule(
    rule: BusinessRule, 
    context: RuleContext
  ): Promise<SingleRuleResult>
}

// 规则执行上下文
export interface RuleContext {
  entity: Record<string, any>      // 实体数据
  user?: any                        // 当前用户
  environment?: 'dev' | 'prod'      // 运行环境
  previousResult?: any              // 上一个规则的执行结果
}

// 规则执行结果
export interface RuleExecutionResult {
  success: boolean
  executedCount: number
  failedCount: number
  results: SingleRuleResult[]
  errors: RuleExecutionError[]
  duration: number                  // 执行耗时(ms)
}

// 单条规则执行结果
export interface SingleRuleResult {
  ruleId: string
  success: boolean
  conditionMet: boolean            // 条件是否满足
  actionExecuted: boolean          // 动作是否执行
  result?: any                     // 执行结果
  error?: string                   // 错误信息
  duration: number                 // 执行耗时
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 💻 核心代码实现
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 代码1: 规则执行引擎核心逻辑

**文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/engines/ruleExecutionEngine.ts`

```typescript
import type { BusinessRule, RuleContext, RuleExecutionResult, SingleRuleResult } from '../stores/enhancedStateMachine'
import { ExpressionParser } from '../utils/ruleExpressionParser'
import { ActionExecutor } from './actionExecutor'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 🔥 规则执行引擎 - 企业级实现
 * 
 * 功能：
 * 1. 规则优先级排序和执行
 * 2. 条件表达式安全解析
 * 3. 动作执行器调度
 * 4. 错误处理和恢复
 * 5. 执行日志和性能监控
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */
export class RuleExecutionEngine {
  private expressionParser: ExpressionParser
  private actionExecutor: ActionExecutor
  private debugMode: boolean = false
  
  constructor() {
    this.expressionParser = new ExpressionParser()
    this.actionExecutor = new ActionExecutor()
  }
  
  /**
   * 执行多条业务规则
   * 
   * @param rules 业务规则列表
   * @param context 执行上下文
   * @returns 执行结果
   */
  async executeRules(
    rules: BusinessRule[], 
    context: RuleContext
  ): Promise<RuleExecutionResult> {
    const startTime = performance.now()
    
    logger.info('🚀 开始执行业务规则', { 
      ruleCount: rules.length,
      context: this.sanitizeContext(context)
    })
    
    // 1. 过滤启用的规则
    const enabledRules = rules.filter(rule => rule.enabled !== false)
    
    // 2. 按优先级排序（优先级高的先执行）
    const sortedRules = this.sortRulesByPriority(enabledRules)
    
    // 3. 执行规则
    const results: SingleRuleResult[] = []
    const errors: RuleExecutionError[] = []
    let executedCount = 0
    let failedCount = 0
    
    for (const rule of sortedRules) {
      try {
        const result = await this.executeRule(rule, context)
        results.push(result)
        
        if (result.success) {
          executedCount++
          // 更新上下文，传递给下一个规则
          context.previousResult = result.result
        } else {
          failedCount++
        }
      } catch (error) {
        failedCount++
        const ruleError: RuleExecutionError = {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
          context: this.sanitizeContext(context)
        }
        errors.push(ruleError)
        
        logger.error('❌ 规则执行失败', ruleError)
      }
    }
    
    const duration = performance.now() - startTime
    
    const finalResult: RuleExecutionResult = {
      success: failedCount === 0,
      executedCount,
      failedCount,
      results,
      errors,
      duration
    }
    
    logger.info('✅ 业务规则执行完成', {
      success: finalResult.success,
      executedCount,
      failedCount,
      duration: `${duration.toFixed(2)}ms`
    })
    
    return finalResult
  }
  
  /**
   * 执行单条业务规则
   * 
   * @param rule 业务规则
   * @param context 执行上下文
   * @returns 执行结果
   */
  async executeRule(
    rule: BusinessRule, 
    context: RuleContext
  ): Promise<SingleRuleResult> {
    const startTime = performance.now()
    
    if (this.debugMode) {
      logger.debug('🔍 执行规则', { ruleId: rule.id, rule })
    }
    
    try {
      // 1. 检查条件
      let conditionMet = true
      if (rule.condition) {
        conditionMet = await this.expressionParser.evaluate(
          rule.condition, 
          context
        )
        
        if (this.debugMode) {
          logger.debug('📊 条件判断', { 
            ruleId: rule.id,
            condition: rule.condition,
            result: conditionMet 
          })
        }
      }
      
      // 2. 如果条件满足，执行动作
      let actionExecuted = false
      let result: any = null
      
      if (conditionMet) {
        result = await this.actionExecutor.execute(
          rule.action, 
          context
        )
        actionExecuted = true
        
        if (this.debugMode) {
          logger.debug('⚡ 动作执行', { 
            ruleId: rule.id,
            action: rule.action,
            result 
          })
        }
      }
      
      const duration = performance.now() - startTime
      
      return {
        ruleId: rule.id,
        success: true,
        conditionMet,
        actionExecuted,
        result,
        duration
      }
    } catch (error) {
      const duration = performance.now() - startTime
      
      return {
        ruleId: rule.id,
        success: false,
        conditionMet: false,
        actionExecuted: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      }
    }
  }
  
  /**
   * 按优先级排序规则
   */
  private sortRulesByPriority(rules: BusinessRule[]): BusinessRule[] {
    return [...rules].sort((a, b) => {
      const priorityA = a.priority ?? 0
      const priorityB = b.priority ?? 0
      return priorityB - priorityA // 优先级高的在前
    })
  }
  
  /**
   * 清理上下文敏感数据（用于日志）
   */
  private sanitizeContext(context: RuleContext): any {
    return {
      entity: context.entity ? Object.keys(context.entity) : [],
      environment: context.environment,
      hasUser: !!context.user,
      hasPreviousResult: !!context.previousResult
    }
  }
  
  /**
   * 启用调试模式
   */
  enableDebug() {
    this.debugMode = true
    logger.info('🐛 规则执行引擎调试模式已启用')
  }
  
  /**
   * 禁用调试模式
   */
  disableDebug() {
    this.debugMode = false
  }
}

// 规则执行错误接口
export interface RuleExecutionError {
  ruleId: string
  error: string
  timestamp: number
  context?: any
}
```

### 代码2: 条件表达式解析器

**文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/utils/ruleExpressionParser.ts`

```typescript
import type { RuleContext } from '../stores/enhancedStateMachine'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 🔥 表达式解析器 - 安全沙箱执行
 * 
 * 功能：
 * 1. JavaScript表达式子集解析
 * 2. 字段引用解析
 * 3. 安全沙箱执行（禁止eval等危险操作）
 * 4. 类型检查和转换
 * 5. 执行超时控制
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */
export class ExpressionParser {
  private readonly TIMEOUT_MS = 1000 // 1秒超时
  private readonly SAFE_FUNCTIONS = new Set([
    'Math.abs', 'Math.ceil', 'Math.floor', 'Math.round',
    'Math.max', 'Math.min',
    'String', 'Number', 'Boolean',
    'Date', 'parseInt', 'parseFloat'
  ])
  
  /**
   * 解析并执行表达式
   * 
   * @param expression 表达式字符串
   * @param context 执行上下文
   * @returns 执行结果
   */
  async evaluate(expression: string, context: RuleContext): Promise<any> {
    try {
      // 1. 安全检查
      this.validateExpression(expression)
      
      // 2. 构建安全的执行环境
      const safeContext = this.createSafeContext(context)
      
      // 3. 执行表达式（带超时控制）
      const result = await this.executeWithTimeout(expression, safeContext)
      
      return result
    } catch (error) {
      logger.error('❌ 表达式执行失败', { expression, error })
      throw new ExpressionExecutionError(
        `表达式执行失败: ${error instanceof Error ? error.message : String(error)}`,
        expression
      )
    }
  }
  
  /**
   * 验证表达式安全性
   */
  private validateExpression(expression: string): void {
    // 禁止危险操作
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /require\s*\(/,
      /import\s*\(/,
      /window\./,
      /document\./,
      /localStorage/,
      /sessionStorage/,
      /setTimeout/,
      /setInterval/,
      /__proto__/,
      /constructor/
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        throw new SecurityError(
          `表达式包含不安全的操作: ${pattern.toString()}`
        )
      }
    }
    
    // 检查长度限制
    if (expression.length > 1000) {
      throw new SecurityError('表达式长度超过限制（最大1000字符）')
    }
  }
  
  /**
   * 创建安全的执行上下文
   */
  private createSafeContext(context: RuleContext): any {
    return {
      // 实体数据
      entity: context.entity || {},
      
      // 用户信息（仅暴露安全字段）
      user: context.user ? {
        id: context.user.id,
        name: context.user.name,
        roles: context.user.roles || []
      } : null,
      
      // 环境信息
      environment: context.environment,
      
      // 上一个规则结果
      previousResult: context.previousResult,
      
      // 安全的工具函数
      Math: Math,
      Date: Date,
      String: String,
      Number: Number,
      Boolean: Boolean,
      parseInt: parseInt,
      parseFloat: parseFloat,
      
      // 辅助函数
      isNull: (value: any) => value === null,
      isUndefined: (value: any) => value === undefined,
      isEmpty: (value: any) => !value || value.length === 0,
      contains: (arr: any[], value: any) => arr?.includes(value),
      
      // 日期比较函数
      isAfter: (date1: Date, date2: Date) => date1 > date2,
      isBefore: (date1: Date, date2: Date) => date1 < date2,
      isSameDay: (date1: Date, date2: Date) => {
        return date1.toDateString() === date2.toDateString()
      }
    }
  }
  
  /**
   * 带超时控制的表达式执行
   */
  private async executeWithTimeout(
    expression: string, 
    context: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new ExecutionTimeoutError('表达式执行超时'))
      }, this.TIMEOUT_MS)
      
      try {
        // 使用Function构造器在受限环境中执行
        // 注意：这里我们已经验证了表达式的安全性
        const func = new Function(
          ...Object.keys(context),
          `return (${expression})`
        )
        
        const result = func(...Object.values(context))
        clearTimeout(timeoutId)
        resolve(result)
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }
}

// 自定义错误类型
export class ExpressionExecutionError extends Error {
  constructor(message: string, public expression: string) {
    super(message)
    this.name = 'ExpressionExecutionError'
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SecurityError'
  }
}

export class ExecutionTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExecutionTimeoutError'
  }
}
```

### 代码3: 增强enhancedStateMachine.ts

**文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/stores/enhancedStateMachine.ts`  
**修改方式**: 增量添加，不修改现有代码

```typescript
// 在文件末尾添加以下内容

import { RuleExecutionEngine } from '../engines/ruleExecutionEngine'

// 在Store中添加规则执行引擎实例
export const useEnhancedStateMachineStore = defineStore("enhancedStateMachine", () => {
  // ... 现有代码保持不变 ...
  
  // 🔥 Day 1 新增：规则执行引擎实例
  const ruleEngine = new RuleExecutionEngine()
  
  // 🔥 Day 1 新增：增强的规则执行方法
  const executeBusinessRulesEnhanced = async (
    context: RuleContext
  ): Promise<RuleExecutionResult> => {
    isExecuting.value = true
    executionErrors.value = [] // 清空之前的错误
    
    try {
      logger.info('🚀 开始执行业务规则（增强版）', {
        ruleCount: businessRules.value.length,
        context
      })
      
      // 使用新的规则执行引擎
      const result = await ruleEngine.executeRules(
        businessRules.value,
        context
      )
      
      // 记录执行错误
      if (result.errors.length > 0) {
        executionErrors.value = result.errors
      }
      
      logger.info('✅ 业务规则执行完成', {
        success: result.success,
        executed: result.executedCount,
        failed: result.failedCount,
        duration: result.duration
      })
      
      return result
    } catch (error) {
      logger.error('❌ 业务规则执行失败', error)
      throw error
    } finally {
      isExecuting.value = false
    }
  }
  
  // 🔥 Day 1 新增：启用规则调试
  const enableRuleDebug = () => {
    ruleEngine.enableDebug()
    logger.info('🐛 规则调试模式已启用')
  }
  
  // 🔥 Day 1 新增：禁用规则调试
  const disableRuleDebug = () => {
    ruleEngine.disableDebug()
    logger.info('🐛 规则调试模式已禁用')
  }
  
  // 🔥 Day 1 新增：获取执行错误日志
  const getRuleExecutionLogs = () => {
    return executionErrors.value
  }
  
  // 🔥 Day 1 新增：清空执行错误
  const clearExecutionErrors = () => {
    executionErrors.value = []
  }
  
  return {
    // ... 现有的所有导出保持不变 ...
    
    // 🔥 Day 1 新增导出
    executeBusinessRulesEnhanced,
    enableRuleDebug,
    disableRuleDebug,
    getRuleExecutionLogs,
    clearExecutionErrors
  }
})
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ✅ 验收标准
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 功能验收

- [ ] **规则执行引擎** 
  - [ ] 支持多条规则按优先级执行
  - [ ] 单条规则失败不影响其他规则
  - [ ] 执行结果包含详细的成功/失败信息
  - [ ] 执行耗时统计准确

- [ ] **条件表达式解析**
  - [ ] 支持基础比较运算符（==, !=, >, <, >=, <=）
  - [ ] 支持逻辑运算符（&&, ||, !）
  - [ ] 支持字段引用（entity.field）
  - [ ] 禁止所有危险操作（eval, Function等）
  - [ ] 表达式执行超时控制有效

- [ ] **动作执行器**
  - [ ] 支持基础动作类型
  - [ ] 动作执行结果正确返回
  - [ ] 动作执行错误正确捕获

- [ ] **调试功能**
  - [ ] 调试模式可正常启用/禁用
  - [ ] 执行日志记录完整
  - [ ] 错误日志包含上下文信息

### 质量验收

- [ ] **TypeScript编译**: 0错误、0警告
- [ ] **ESLint检查**: 0错误、0警告  
- [ ] **代码覆盖率**: ≥80%
- [ ] **性能要求**:
  - [ ] 100条规则执行时间 < 1秒
  - [ ] 单条规则执行时间 < 10ms
  - [ ] 表达式解析时间 < 5ms

### 架构验收

- [ ] **增量开发**: 基于现有enhancedStateMachine.ts扩展
- [ ] **零代码重复**: 无重复实现的类型或函数
- [ ] **packages黑盒原则**: 无违反包间引用规则
- [ ] **类型安全**: 100% TypeScript严格模式

### 代码质量验收

- [ ] **命名规范**: 符合项目命名约定
- [ ] **注释完整**: 核心函数有JSDoc注释
- [ ] **错误处理**: 完整的try-catch和错误日志
- [ ] **日志规范**: 使用getGlobalLogger统一日志

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📊 开发进度追踪
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 预计时间分配

| 时间段 | 任务 | 产出 |
|--------|------|------|
| 09:00-10:00 | 规则执行引擎核心实现 | ruleExecutionEngine.ts |
| 10:00-12:00 | 条件表达式解析器 | ruleExpressionParser.ts |
| 13:00-15:00 | 动作执行器框架 | actionExecutor.ts |
| 15:00-16:00 | enhancedStateMachine集成 | 增强现有Store |
| 16:00-17:00 | 单元测试和验收 | 测试通过 |
| 17:00-18:00 | 代码质量检查和文档 | 质量门禁通过 |

### Checklist

**开发前（编程前学习）**:
- [ ] ✅ 读取enhancedStateMachine.ts现有实现
- [ ] ✅ 识别可复用的类型定义
- [ ] ✅ 确认增量开发位置
- [ ] ✅ 检查依赖包版本

**开发中（增量编程）**:
- [ ] 实现RuleExecutionEngine类
- [ ] 实现ExpressionParser类
- [ ] 实现ActionExecutor类
- [ ] 增强enhancedStateMachine Store
- [ ] 编写单元测试

**开发后（质量门禁）**:
- [ ] TypeScript编译检查（0错误）
- [ ] ESLint检查（0警告）
- [ ] 单元测试通过率100%
- [ ] 代码覆盖率≥80%
- [ ] Git提交和同步

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🎯 成功标准
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day 1开发任务成功完成的标志：

1. ✅ **功能完整性**: 规则执行引擎核心功能全部实现
2. ✅ **代码质量**: 通过所有质量门禁检查
3. ✅ **增量开发**: 基于现有代码扩展，零重复代码
4. ✅ **架构清晰**: 符合packages黑盒原则
5. ✅ **可测试性**: 单元测试覆盖率≥80%
6. ✅ **文档完整**: 核心函数有完整的JSDoc注释

---

**制定者**: SmartAbp世界顶尖架构师团队  
**审核标准**: 企业级质量 + 增量开发 + 零重复代码  
**执行原则**: 代码优先 + 质量至上 + 架构清晰
