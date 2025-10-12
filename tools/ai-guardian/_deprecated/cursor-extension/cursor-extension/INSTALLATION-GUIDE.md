# AI Guardian Cursor插件安装指南

## 📦 插件包信息

**插件名称**: AI Guardian  
**版本**: v1.0.0  
**文件大小**: 39.45KB  
**打包时间**: 2025-01-27  
**插件文件**: `ai-guardian-1.0.0.vsix`

## 🚀 安装方法

### 方法1: 通过Cursor IDE安装（推荐）

1. **打开Cursor IDE**
2. **打开扩展面板**
   - 按 `Ctrl+Shift+X` (Windows/Linux) 或 `Cmd+Shift+X` (Mac)
   - 或点击左侧活动栏的扩展图标
3. **安装VSIX文件**
   - 点击扩展面板右上角的 `...` 菜单
   - 选择 `Install from VSIX...`
   - 选择 `ai-guardian-1.0.0.vsix` 文件
   - 点击 `Install`
4. **重启Cursor IDE**
   - 安装完成后重启Cursor IDE以激活插件

### 方法2: 通过命令行安装

```bash
# 使用Cursor命令行工具安装
cursor --install-extension ai-guardian-1.0.0.vsix

# 或使用VSCode命令行工具（如果已安装）
code --install-extension ai-guardian-1.0.0.vsix
```

## ⚙️ 配置选项

安装完成后，可以在Cursor IDE的设置中配置以下选项：

```json
{
  "aiGuardian.enabled": true,
  "aiGuardian.checkInterval": 30,
  "aiGuardian.offlineThreshold": 60,
  "aiGuardian.autoRecover": true,
  "aiGuardian.engineCheckInterval": 5
}
```

### 配置说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `aiGuardian.enabled` | `true` | 启用AI守护功能 |
| `aiGuardian.checkInterval` | `30` | 检测间隔（秒） |
| `aiGuardian.offlineThreshold` | `60` | 离线判断阈值（秒） |
| `aiGuardian.autoRecover` | `true` | 自动恢复AI连接 |
| `aiGuardian.engineCheckInterval` | `5` | 执行引擎检查间隔（分钟） |

## 🎯 使用方法

### 自动启动
插件安装后会自动启动，无需手动操作。

### 手动操作
可以通过命令面板执行以下操作：

1. **启动AI守护**
   - 按 `Ctrl+Shift+P` 打开命令面板
   - 输入 `AI Guardian: 启动AI守护`
   - 或使用命令 `aiGuardian.start`

2. **停止AI守护**
   - 命令面板输入 `AI Guardian: 停止AI守护`
   - 或使用命令 `aiGuardian.stop`

3. **手动恢复AI**
   - 命令面板输入 `AI Guardian: 手动恢复AI`
   - 或使用命令 `aiGuardian.recover`

4. **查看AI状态**
   - 命令面板输入 `AI Guardian: 查看AI状态`
   - 或使用命令 `aiGuardian.status`

5. **重置守护状态**
   - 命令面板输入 `AI Guardian: 重置守护状态`
   - 或使用命令 `aiGuardian.resetState`

## 📊 状态栏显示

插件会在Cursor IDE的状态栏右侧显示AI状态：

- 🟢 **AI在线**: AI正常工作
- 🟡 **AI恢复中**: 正在尝试恢复AI连接
- 🔴 **AI离线**: AI已断开连接
- 🔧 **执行引擎已加载**: 执行引擎状态正常
- ⚠️ **执行引擎未加载**: 执行引擎需要加载

## 🔧 功能特性

### 1. 智能三级恢复策略
- **第一阶段**: 在当前会话中尝试3次恢复
- **第二阶段**: 开启新会话尝试3次恢复
- **第三阶段**: 重载窗口或重启IDE

### 2. 对话框自动关闭
- 自动检测并关闭弹出的对话框
- 支持ESC键序列发送
- 支持5种关闭方法

### 3. 连接状态检测
- 30秒内无活动判断为离线
- 实时监控AI连接状态
- 自动触发恢复机制

### 4. 智能恢复消息
- 构建智能恢复上下文
- 直接与AI模型通信
- 支持阶段化恢复策略

## 🐛 故障排除

### 常见问题

1. **插件无法启动**
   - 检查Cursor IDE版本是否支持
   - 重启Cursor IDE
   - 检查插件是否正确安装

2. **AI状态检测不准确**
   - 调整 `aiGuardian.offlineThreshold` 配置
   - 检查网络连接
   - 查看输出面板的日志信息

3. **恢复功能不工作**
   - 确保 `aiGuardian.autoRecover` 为 `true`
   - 检查AI模型是否可用
   - 查看错误日志

### 日志查看

1. **打开输出面板**
   - 按 `Ctrl+Shift+U` (Windows/Linux) 或 `Cmd+Shift+U` (Mac)
   - 或选择 `View > Output`

2. **选择AI Guardian日志**
   - 在输出面板的下拉菜单中选择 `AI Guardian`
   - 查看详细的运行日志

## 📝 更新日志

### v1.0.0 (2025-01-27)
- ✅ 初始版本发布
- ✅ 集成Python脚本功能
- ✅ 智能三级恢复策略
- ✅ 对话框自动关闭
- ✅ ESC键序列发送
- ✅ 新会话开启
- ✅ 连接状态检测
- ✅ 智能恢复消息发送

## 🔗 相关链接

- **项目仓库**: `tools/ai-guardian/cursor-extension/`
- **测试报告**: `TEST-REPORT.md`
- **集成报告**: `README-INTEGRATION.md`
- **最终总结**: `FINAL-SUMMARY.md`

## 📞 技术支持

如果遇到问题或需要技术支持，请：

1. 查看输出面板的日志信息
2. 检查配置选项是否正确
3. 重启Cursor IDE
4. 重新安装插件

## 🎉 开始使用

安装完成后，AI Guardian插件将自动开始工作：

1. **监控AI状态**: 实时监控AI连接状态
2. **自动恢复**: 检测到断线时自动尝试恢复
3. **状态显示**: 在状态栏显示当前状态
4. **智能策略**: 使用三级恢复策略确保恢复成功

**祝您使用愉快！** 🚀
