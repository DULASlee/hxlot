# AI代码质量增强规则

## 🎯 核心目标
确保AI生成的代码符合设计模式最佳实践和业界标准，避免功能不完整的问题。

## 📋 强制执行规则

### 1. 代码生成前置检查
在生成任何代码之前，AI必须：

```markdown
✅ 分析需求完整性
- 明确功能边界和业务规则
- 识别所有必需的操作和状态
- 确定异常处理场景
- 规划测试用例

✅ 选择合适的设计模式
- 根据功能类型选择对应模式
- 确保模式应用的一致性
- 验证模式间的协调性

✅ 确定技术栈和标准
- 遵循项目现有技术选型
- 应用相应的编码规范
- 确保安全性最佳实践
```

### 2. 代码生成规则

#### 前端代码生成规则
```typescript
// Vue组件必须包含的元素
interface VueComponentRequirements {
  // 1. 组件结构完整性
  template: {
    semanticHTML: true,        // 语义化HTML
    accessibility: true,       // 可访问性支持
    responsiveDesign: true     // 响应式设计
  },
  
  // 2. 脚本逻辑完整性
  script: {
    compositionAPI: true,      // 使用Composition API
    propsValidation: true,     // Props类型验证
    emitsDefinition: true,     // 事件定义
    errorHandling: true,       // 错误处理
    loadingStates: true,       // 加载状态
    edgeCases: true           // 边界情况处理
  },
  
  // 3. 样式规范
  style: {
    scoped: true,             // 样式隔离
    bemNaming: true,          // BEM命名规范
    responsive: true          // 响应式样式
  }
}
```

#### 后端代码生成规则
```csharp
// ABP服务必须包含的元素
public interface IAbpServiceRequirements
{
    // 1. 基础结构
    bool InheritsFromApplicationService { get; }
    bool ImplementsInterface { get; }
    bool HasDependencyInjection { get; }
    
    // 2. 业务逻辑完整性
    bool HasCompleteOperations { get; }    // 完整的CRUD操作
    bool HasValidation { get; }            // 输入验证
    bool HasAuthorization { get; }         // 权限验证
    bool HasErrorHandling { get; }         // 异常处理
    bool HasLogging { get; }               // 日志记录
    bool HasTransactionManagement { get; } // 事务管理
    
    // 3. 性能和安全
    bool HasAsyncMethods { get; }          // 异步方法
    bool HasCaching { get; }               // 缓存策略
    bool HasInputSanitization { get; }     // 输入清理
}
```

### 3. 功能完整性检查清单

#### CRUD功能必备要素
```markdown
✅ Create (创建)
- [ ] 输入验证
- [ ] 业务规则检查
- [ ] 数据持久化
- [ ] 成功/失败反馈
- [ ] 异常处理

✅ Read (读取)
- [ ] 分页支持
- [ ] 搜索过滤
- [ ] 排序功能
- [ ] 数据格式化
- [ ] 权限控制

✅ Update (更新)
- [ ] 数据验证
- [ ] 并发控制
- [ ] 部分更新支持
- [ ] 审计日志
- [ ] 回滚机制

✅ Delete (删除)
- [ ] 软删除实现
- [ ] 关联数据处理
- [ ] 确认机制
- [ ] 批量删除
- [ ] 权限验证
```

#### 表单功能必备要素
```markdown
✅ 表单验证
- [ ] 实时验证
- [ ] 提交验证
- [ ] 自定义规则
- [ ] 错误提示
- [ ] 国际化支持

✅ 用户体验
- [ ] 加载状态
- [ ] 禁用状态
- [ ] 重置功能
- [ ] 自动保存
- [ ] 键盘导航

✅ 数据处理
- [ ] 格式化输入
- [ ] 数据转换
- [ ] 默认值设置
- [ ] 数据回显
- [ ] 提交优化
```

### 4. 设计模式强制应用

#### 前端设计模式
```markdown
✅ 组合式函数模式 (Composables)
- 状态逻辑复用
- 副作用管理
- 生命周期处理

✅ 状态管理模式 (Pinia)
- 全局状态管理
- 模块化设计
- 持久化策略

✅ 组件通信模式
- Props/Emits
- Provide/Inject
- 事件总线
```

#### 后端设计模式
```markdown
✅ 仓储模式 (Repository)
- 数据访问抽象
- 查询规约实现
- 缓存集成

✅ 服务模式 (Service)
- 业务逻辑封装
- 依赖注入
- 事务管理

✅ 领域驱动设计 (DDD)
- 实体设计
- 值对象
- 领域服务
```

### 5. 质量门禁标准

#### 代码质量评分标准
```markdown
🟢 优秀 (90-100分)
- 所有必备功能完整实现
- 设计模式正确应用
- 异常处理全面覆盖
- 性能优化到位

🟡 良好 (70-89分)
- 核心功能完整
- 基本设计模式应用
- 主要异常处理
- 基础性能考虑

🔴 需改进 (<70分)
- 功能不完整
- 设计模式缺失
- 异常处理不足
- 性能问题明显
```

#### 自动检查触发条件
```markdown
✅ 代码生成后自动检查
✅ 文件保存时触发检查
✅ 提交前强制检查
✅ 定期质量审计
```

## 🔧 实施方法

### 1. 集成到.cursorrules
```markdown
# 在.cursorrules中添加质量检查规则
QUALITY_CHECK_ENABLED=true
DESIGN_PATTERN_ENFORCEMENT=true
COMPLETENESS_VALIDATION=true
INDUSTRY_STANDARDS_COMPLIANCE=true
```

### 2. 自动化工具集成
```bash
# 代码生成后自动运行质量检查（CLI 包装器）
node tools/quality-assurance/quality-gates-cli.js --threshold 85 --directory src
```

### 3. 强制前置流程（Serena/ADR/计划→编码→质量→推送）
```markdown
1) 检索 Serena（符号/模式/相似实现）
2) 查阅 ADR：doc/architecture/adr/index.json + 相关 ADR
3) 制定并审批开发计划（sequential thinking）
4) 编码完成后：模板校验 + 质量门
5) 通过后再 git commit/push
```

### 4. 持续改进机制
```markdown
✅ 收集质量问题反馈
✅ 更新检查规则
✅ 优化模式库
✅ 培训AI模型
```

## 📊 效果预期

通过实施这套质量保证体系，预期达到：

- **功能完整性**: 95%以上的生成代码功能完整
- **设计模式符合性**: 90%以上符合最佳实践
- **代码质量**: 平均质量评分85分以上
- **维护性**: 显著提升代码可维护性
- **安全性**: 消除常见安全漏洞