# AI Guardian v1.4.0 智能重试策略测试指南

## 📋 版本信息

- **版本**: v1.4.0
- **发布日期**: 2025-10-05
- **核心功能**: 智能重试策略、交替聊天框、30秒AI检测、5次重试、干净卸载

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ 安装验证

### 步骤1：确认版本

```powershell
# 查看已安装的插件版本
Get-Content "$env:USERPROFILE\.vscode\extensions\extensions.json" | Select-String "ai-guardian" -Context 2
```

**预期结果**:
```json
{"identifier":{"id":"smartabp.ai-guardian"},"version":"1.4.0",...}
```

### 步骤2：查看插件状态

1. 打开VSCode
2. 查看右下角状态栏：应该显示 `🛡️ AI: 在线`
3. 点击状态栏图标，选择 `AI Guardian 状态`

**预期结果**:
```
AI状态: 在线 | 最后活动: X秒前 | 活动次数: X
执行引擎: 已加载 | 上次检查: XXXX-XX-XX XX:XX:XX
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🧪 功能测试

### 测试1：连按两次Ctrl+L

**测试目的**: 验证PowerShell脚本能够正确发送两次Ctrl+L

**测试步骤**:
1. 打开VSCode
2. 手动执行PowerShell脚本：
   ```powershell
   pwsh -NoProfile -ExecutionPolicy Bypass -File "D:\BAOBAB\Baobab.SmartAbp\hxlot\tools\ai-guardian\restart-auto-input.ps1" -Mode normal -DelaySeconds 2
   ```
3. 观察聊天框是否获得焦点

**预期结果**:
- ✅ 脚本执行后，聊天框获得焦点
- ✅ 自动输入 "请继续推进" 并发送

**注意事项**:
- 测试时请关闭其他应用，确保Cursor窗口在前台

---

### 测试2：智能重试策略（模拟断线）

**测试目的**: 验证AI断线后自动重启+智能重试功能

**测试步骤**:
1. 打开VSCode，确保AI Guardian插件已激活
2. 打开 `输出` 面板，选择 `AI Guardian`
3. 停止与AI的所有交互，等待90秒（模拟断线）
4. 观察日志输出

**预期结果**:
```
[AI Guardian] ⚠️ AI已断线超过90秒
[AI Guardian] 🔄 [Level 3] 正在重启Cursor IDE...
[AI Guardian] 🔄 [Restart] 正在重启Cursor IDE...
[AI Guardian] ✅ [Restart] IDE重启命令已执行

(等待IDE重启...)

[AI Guardian] 🧠 [Smart Retry] 开始智能重试策略...
[AI Guardian] 🔄 [Smart Retry] 第1次尝试 - 向正常聊天框发送消息
[AI Guardian] ✅ [Smart Retry] 消息已发送到正常聊天框

(等待30秒...)

[AI Guardian] ⏰ [Smart Retry] 30秒后AI未回复，准备下次重试
[AI Guardian] 🔄 [Smart Retry] 第2次尝试 - 向新会话对话框发送消息
[AI Guardian] ✅ [Smart Retry] 消息已发送到新会话对话框

(等待30秒...)

[AI Guardian] 🎉 [Smart Retry] AI已回复！停止重试循环
```

**关键观察点**:
- ✅ IDE是否在90秒后自动重启
- ✅ 是否交替向两个聊天框发送消息
- ✅ 是否每次等待30秒检测AI回复
- ✅ AI回复后是否立即停止重试

---

### 测试3：30秒AI回复检测

**测试目的**: 验证AI回复检测机制

**测试步骤**:
1. 触发智能重试（参考测试2）
2. 在重试过程中，手动在聊天框输入任何内容并发送（模拟AI回复）
3. 观察日志是否立即显示 "AI已回复！停止重试循环"

**预期结果**:
- ✅ 检测到AI活动后，立即停止重试
- ✅ 日志输出: `🎉 [Smart Retry] AI已回复！停止重试循环`

---

### 测试4：5次重试上限

**测试目的**: 验证最大重试次数限制

**测试步骤**:
1. 修改测试环境，确保AI无法回复（例如：断网）
2. 触发智能重试
3. 观察是否在5次重试后停止

**预期结果**:
```
[AI Guardian] 🔄 [Smart Retry] 第1次尝试 - 向正常聊天框发送消息
(等待30秒，无回复)
[AI Guardian] 🔄 [Smart Retry] 第2次尝试 - 向新会话对话框发送消息
(等待30秒，无回复)
[AI Guardian] 🔄 [Smart Retry] 第3次尝试 - 向正常聊天框发送消息
(等待30秒，无回复)
[AI Guardian] 🔄 [Smart Retry] 第4次尝试 - 向新会话对话框发送消息
(等待30秒，无回复)
[AI Guardian] 🔄 [Smart Retry] 第5次尝试 - 向正常聊天框发送消息
(等待30秒，无回复)
[AI Guardian] ❌ [Smart Retry] 达到最大重试次数，停止重试
```

---

### 测试5：干净卸载

**测试目的**: 验证插件卸载后不会继续重启IDE

**测试步骤**:
1. 触发智能重试（让重试循环进行中）
2. 立即执行卸载命令：
   ```powershell
   code --uninstall-extension smartabp.ai-guardian
   ```
3. 观察IDE是否继续重启

**预期结果**:
- ✅ 卸载后，IDE立即停止重启
- ✅ 不会再自动执行PowerShell脚本
- ✅ 所有定时器已清理

**验证方法**:
```powershell
# 检查是否还有残留进程
Get-Process | Where-Object { $_.ProcessName -like "*powershell*" -and $_.CommandLine -like "*restart-auto-input*" }
```

预期输出：空（无残留进程）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔧 故障排查

### 问题1：脚本执行失败

**症状**: PowerShell脚本执行出错

**排查步骤**:
1. 检查脚本权限：
   ```powershell
   Get-ExecutionPolicy
   ```
   应该是 `RemoteSigned` 或 `Unrestricted`

2. 手动执行脚本查看错误：
   ```powershell
   pwsh -File "D:\BAOBAB\Baobab.SmartAbp\hxlot\tools\ai-guardian\restart-auto-input.ps1" -Mode normal -DelaySeconds 2
   ```

---

### 问题2：AI无法检测到回复

**症状**: 重试一直进行，无法停止

**排查步骤**:
1. 检查 `isAIConnected()` 方法的日志输出
2. 查看 `lastActivity` 时间戳是否更新
3. 手动在聊天框输入并发送消息，观察日志

---

### 问题3：IDE重启后聊天框无焦点

**症状**: 脚本执行了，但消息没有发送到聊天框

**解决方案**:
1. 使用锁屏脚本重新捕获聊天框坐标：
   ```powershell
   pwsh -File "D:\BAOBAB\Baobab.SmartAbp\hxlot\tools\ai-guardian\capture-chatbox-position.ps1"
   ```
2. 更新 `chatbox-config.json` 文件

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📊 性能指标

### 预期性能

- **IDE重启时间**: 8-10秒
- **首次消息发送**: 重启后12秒内
- **重试间隔**: 30秒
- **最大重试时间**: 约2.5分钟（5次×30秒）
- **AI检测延迟**: <1秒

### 资源占用

- **内存占用**: <50MB（插件本身）
- **CPU占用**: <5%（正常监控状态）
- **磁盘占用**: <100KB（日志文件）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 成功标准

**插件功能正常的标志**:

✅ 1. 安装后立即激活，状态栏显示AI状态
✅ 2. AI断线90秒后自动重启IDE
✅ 3. 重启后自动向两个聊天框交替发送消息
✅ 4. 每次发送后等待30秒检测AI回复
✅ 5. AI回复后立即停止重试
✅ 6. 达到5次重试上限后停止
✅ 7. 卸载后不会继续重启IDE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💡 使用建议

1. **日常使用**: 保持插件激活状态，它会在后台默默守护
2. **测试环境**: 建议在测试项目中先验证功能
3. **生产环境**: 确认测试通过后再在生产项目中启用
4. **日志监控**: 定期查看 `AI Guardian` 输出通道，了解插件运行状态
5. **坐标校准**: 如果更换屏幕分辨率，需要重新捕获聊天框坐标

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🎉 AI Guardian v1.4.0 - 让您的AI永不断线！**


