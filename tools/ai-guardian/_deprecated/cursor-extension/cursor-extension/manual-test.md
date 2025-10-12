# 🧪 AI Guardian插件手动测试步骤

## 当前状态
- ✅ 插件已安装: smartabp.ai-guardian
- ✅ 版本: v1.2.0
- ✅ 编译成功
- ✅ 打包完成

## 立即测试步骤

### 第1步: 验证插件安装

**操作**:
1. 在Cursor IDE中，按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Extensions: Show Installed Extensions"
3. 搜索 "AI Guardian"

**预期结果**:
- ✅ 看到 "AI Guardian - 断线守护" 插件
- ✅ 版本显示为 1.2.0
- ✅ 描述: "AI大模型断线检测与自动恢复插件 - 支持IDE重启后自动恢复"

---

### 第2步: 检查状态栏

**操作**:
1. 查看Cursor IDE右下角状态栏
2. 寻找AI Guardian的状态图标

**预期结果**:
- ✅ 状态栏显示AI Guardian图标
- ✅ 显示当前AI连接状态
- ✅ 点击后显示详细信息

---

### 第3步: 测试命令可用性

**操作**:
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "AI Guardian"
3. 查看所有可用命令

**预期结果**:
应该看到以下命令:
- ✅ AI Guardian: 启动AI守护
- ✅ AI Guardian: 停止AI守护
- ✅ AI Guardian: 查看AI状态
- ✅ AI Guardian: 手动恢复AI
- ✅ AI Guardian: 检查执行引擎
- ✅ AI Guardian: 加载执行引擎
- ✅ AI Guardian: 重置守护状态
- ✅ AI Guardian: 强制重启IDE ⭐ (新增)
- ✅ AI Guardian: 自我检查 ⭐ (新增)

---

### 第4步: 测试自我检查功能

**操作**:
1. 按 `Ctrl+Shift+P`
2. 输入并执行 "AI Guardian: 自我检查"
3. 查看输出面板 (View → Output → AI Guardian)

**预期结果**:
```
🔍 [Self Check] 开始自我检查...
✅ [Self Check] 自我检查完成，所有组件正常
```
- ✅ 弹出消息: "AI Guardian 自我检查完成"

---

### 第5步: 测试查看AI状态

**操作**:
1. 按 `Ctrl+Shift+P`
2. 执行 "AI Guardian: 查看AI状态"

**预期结果**:
- ✅ 显示AI连接状态
- ✅ 显示最后活动时间
- ✅ 显示活动计数

---

### 第6步: 测试输出日志

**操作**:
1. 点击菜单 View → Output
2. 在下拉菜单中选择 "AI Guardian"
3. 查看日志输出

**预期结果**:
应该看到类似以下日志:
```
🛡️ AI Guardian 插件已启动
🔍 [Self Check] 开始自我检查...
✅ [Self Check] 自我检查完成，所有组件正常
🔄 [Self Monitoring] 自我监控已启动 (间隔: 5分钟)
```

---

### 第7步: 测试配置

**操作**:
1. 按 `Ctrl+,` 打开设置
2. 搜索 "AI Guardian"
3. 查看所有配置项

**预期结果**:
应该看到以下配置:
- ✅ AI Guardian: Enabled (启用AI断线检测)
- ✅ AI Guardian: Check Interval (检测间隔: 30秒)
- ✅ AI Guardian: Offline Threshold (离线阈值: 90秒)
- ✅ AI Guardian: Auto Recover (自动恢复: true)
- ✅ AI Guardian: Engine Check Interval (引擎检查间隔: 30分钟)

---

### 第8步: 模拟AI断线测试 (可选)

**操作**:
1. 停止与AI的所有交互
2. 等待90秒 (离线阈值)
3. 观察插件反应

**预期结果**:
- ✅ 检测到AI断线
- ✅ 自动尝试恢复
- ✅ 状态栏显示变化
- ✅ 输出日志记录恢复过程

---

### 第9步: 测试强制重启 (谨慎)

**⚠️ 警告**: 此测试会重启IDE，请先保存所有工作！

**操作**:
1. 保存所有文件
2. 按 `Ctrl+Shift+P`
3. 执行 "AI Guardian: 强制重启IDE"
4. 等待IDE重启

**预期结果**:
- ✅ IDE成功重启
- ✅ 重启后插件自动恢复
- ✅ 聊天框自动打开
- ✅ 自动发送"请继续推进"消息
- ✅ 显示恢复成功提示

---

## 测试检查清单

### 基础功能
- [ ] 插件正确安装并显示在扩展列表
- [ ] 状态栏显示AI Guardian图标
- [ ] 命令面板显示所有命令
- [ ] 输出面板显示日志

### 新增功能 (v1.2.0)
- [ ] 自我检查命令可用
- [ ] 自我检查执行成功
- [ ] 强制重启命令可用
- [ ] 自我监控每5分钟执行

### 配置功能
- [ ] 所有配置项可见
- [ ] 配置可以修改
- [ ] 修改后生效

### 日志功能
- [ ] 输出面板显示详细日志
- [ ] 日志格式清晰
- [ ] 包含时间戳和状态

---

## 快速验证命令

在Cursor IDE的终端中执行:

```bash
# 检查插件是否安装
code --list-extensions | findstr ai-guardian

# 查看插件详情
code --show-versions smartabp.ai-guardian
```

---

## 测试报告模板

```
测试时间: [填写当前时间]
测试版本: v1.2.0
测试环境: Windows + Cursor IDE

✅ 通过的测试:
- [列出通过的测试项]

❌ 失败的测试:
- [列出失败的测试项]

🐛 发现的问题:
- [列出发现的问题]

💡 改进建议:
- [列出改进建议]
```

---

## 下一步

完成以上测试后，请反馈:
1. 哪些功能正常工作
2. 哪些功能有问题
3. 是否需要调整或改进

**开始测试吧！** 🚀
