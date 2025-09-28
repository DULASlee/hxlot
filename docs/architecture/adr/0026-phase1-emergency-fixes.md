# ADR-0026: 第一阶段-紧急止血方案 - 隔离污染源，拯救开发体验

- **状态**: 已接受
- **日期**: 2025-09-29
- **决策者**: 首席架构师

## 背景

当前开发体验因IDE性能问题和高危内存泄露而严重恶化，已达到无法正常开发的程度：

### 关键问题分析
1. **IDE性能崩溃**
   - 代码生成器产生的数万文件污染了`src`目录
   - IDE（VSCode/Cursor）的TypeScript Language Server负载极高
   - 引发频繁卡顿和内存溢出，热更新时间超过10秒
   - **开发体验已严重恶化，急需紧急修复**

2. **高危内存泄露**
   - "组件生命周期与全局事件监听器脱钩"是Vue应用中最常见且隐蔽的内存泄露源
   - 复杂组件（如`lowcode-designer`）监听全局事件但未在`onUnmounted`中清理
   - 导致组件实例无法被垃圾回收，累积成大规模内存泄露
   - **这是运行时稳定性的重大威胁**

## 决策

实施"紧急止血"方案，作为重构的第一阶段，核心策略是**隔离**和**修复**。

### 决策1.1: 创建代码生成隔离区
**内容**: 所有由代码生成器产生的文件，**必须**输出到项目根目录下的`.generated`文件夹，并添加到`.gitignore`。

**技术实施**:
```bash
# 1. 创建隔离目录
mkdir .generated

# 2. 更新 .gitignore
echo "" >> .gitignore
echo "# Generated code isolation area" >> .gitignore
echo ".generated/" >> .gitignore
```

**理由**: 将机器生成代码与手写源码物理隔离，是解决IDE文件风暴问题的最直接、最有效的手段。

### 决策1.2: 建立IDE性能保护铁律
**内容**: 在`.vscode/settings.json`中，通过配置强制IDE忽略对`.generated`目录的监听和搜索。

**技术实施**:
```json
// .vscode/settings.json
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.generated/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.generated": true
  },
  "typescript.tsserver.watchOptions": {
    "exclude": [
      "**/node_modules",
      "**/dist",
      "**/.generated"
    ]
  }
}
```

**理由**: 从IDE层面切断对污染源的监控，能从根源上降低IDE负载，立即改善开发体验。

### 决策1.3: 修复高危内存泄露
**内容**: 全局排查并替换手动的全局事件监听，强制使用`useSafeEventListener`组合式函数。

**技术实施**:
```typescript
// packages/lowcode-shared/src/composables/useSafeEventListener.ts
import { onUnmounted, onMounted } from 'vue';

export function useSafeEventListener(
  target: EventTarget,
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  onMounted(() => {
    target.addEventListener(event, listener, options);
  });

  onUnmounted(() => {
    target.removeEventListener(event, listener, options);
  });
}
```

**扫描和替换策略**:
```bash
# 1. 扫描所有违规事件监听
grep -r "window.addEventListener\|document.addEventListener\|bus.on" src/ --include="*.ts" --include="*.vue"

# 2. 逐个替换为useSafeEventListener
# 例如：window.addEventListener('resize', handler) 
# 替换为：useSafeEventListener(window, 'resize', handler)
```

**理由**: 利用Vue的生命周期钩子（`onUnmounted`）自动清理事件监听器，解决最常见、最高危的内存泄露模式。

## 后果

### 正面影响
1. **立竿见影的体验改善**
   - IDE内存占用预计降低70%
   - 热更新时间从10秒+缩短至3秒内
   - 开发体验得到质的提升，团队生产力立即恢复

2. **风险隔离效果**
   - 将生成代码移出`src`目录，降低误修改风险
   - 避免生成代码与手写代码的版本冲突
   - 为后续阶段的深度重构奠定基础

3. **高性价比解决方案**
   - 以最小的改动成本（约1周时间）
   - 解决了最痛苦、最阻塞的问题
   - 投入产出比极高

### 负面影响
1. **治标不治本**
   - 并未减少生成文件的总数，只是将其隔离
   - 根本性解决需要第四阶段的增量生成策略
   - 仍需要团队遵循新的开发规范

2. **团队适应成本**
   - 需要团队成员使用配置好的IDE设置
   - 需要适应新的代码生成输出位置
   - 需要学习使用`useSafeEventListener`

## 验收标准

### 技术验收
1. **IDE性能指标**
   - [ ] IDE内存占用降低≥70%（通过任务管理器验证）
   - [ ] 热更新时间≤3秒（通过开发者工具Performance面板验证）
   - [ ] TypeScript编译时间显著缩短

2. **隔离效果验证**
   - [ ] 运行代码生成器后，所有新文件均出现在`.generated`目录内
   - [ ] `src/`目录下不再有任何机器生成的文件
   - [ ] `.gitignore`已更新，生成代码不会被提交

3. **内存泄露修复**
   - [ ] `useSafeEventListener`已创建并测试通过
   - [ ] 项目中所有手动的全局事件监听都已被替换
   - [ ] 通过Code Review确认所有调用都在`onUnmounted`中自动清理

### 业务验收
1. **开发体验**
   - [ ] 开发者反馈IDE响应速度显著提升
   - [ ] 热更新体验明显改善
   - [ ] 编码过程中无明显卡顿

2. **功能完整性**
   - [ ] 所有现有功能正常运行
   - [ ] 代码生成功能正常工作
   - [ ] 低代码引擎功能无回归

## 风险缓解

### 回滚机制
```bash
# 如需回滚，执行以下步骤：
# 1. 恢复代码生成器输出到src目录
# 2. 删除.vscode/settings.json中的排除配置
# 3. 恢复原有的事件监听方式
# 4. 删除.generated目录
```

### 监控机制
1. **性能监控**: 持续监控IDE内存使用和响应时间
2. **功能监控**: 确保所有功能正常运行
3. **团队反馈**: 收集开发者使用体验反馈

## 相关ADR
- ADR-0025: 务实重构总体方案
- ADR-0027: 第二阶段-架构边界清晰化方案

## 更新记录
- 2025-09-29: 创建第一阶段紧急止血方案ADR，基于终极版开发计划制定
