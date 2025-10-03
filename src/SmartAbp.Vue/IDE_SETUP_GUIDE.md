# 🛠️ SmartAbp Vue IDE 配置指南

## 📋 概述

本指南帮助您配置VS Code和Cursor IDE，确保**自动保存代码修改**，避免丢失代码修改的效果，并提供最佳的开发体验。

## 🚀 快速配置

### 1. 自动配置（推荐）

项目已包含完整的IDE配置文件：

```bash
# 配置文件已就绪
.vscode/settings.json     # VS Code主配置
.vscode/extensions.json   # 推荐插件
.vscode/launch.json       # 调试配置
.vscode/tasks.json        # 任务配置
.vscode/snippets/vue.json # Vue代码片段

.cursor/settings.json     # Cursor AI配置
.editorconfig            # 跨IDE统一配置
```

### 2. 验证配置生效

重启IDE后，检查以下功能：

- ✅ **自动保存**: 修改文件后1秒自动保存
- ✅ **格式化**: 保存时自动格式化代码
- ✅ **错误修复**: 保存时自动修复ESLint错误
- ✅ **导入整理**: 保存时自动整理导入语句

## 🔧 核心功能说明

### 自动保存配置

```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.saveConflictResolution": "askUser",
  "files.hotExit": "onExitAndWindowClose",
  "files.restoreUndoStack": true
}
```

**特性**:
- 📝 修改后1秒自动保存
- 🔄 意外关闭时保留未保存文件
- 📚 恢复撤销历史
- ⚠️ 冲突时询问用户

### 代码保护功能

```json
{
  "workbench.editor.restoreViewState": true,
  "workbench.editor.revealIfOpen": true,
  "window.restoreWindows": "all",
  "window.restoreFullscreen": true
}
```

**特性**:
- 🔖 恢复编辑器状态
- 🪟 恢复所有窗口
- 📍 恢复光标位置
- 🔍 恢复折叠状态

### 保存时自动操作

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit",
    "source.removeUnusedImports": "explicit"
  }
}
```

**特性**:
- 🎨 自动格式化代码
- 🔧 自动修复ESLint错误
- 📦 自动整理导入
- 🧹 移除未使用导入

## 📦 推荐插件

### 必备插件

1. **Vue.volar** - Vue 3官方插件
2. **Vue.vscode-typescript-vue-plugin** - TypeScript增强
3. **esbenp.prettier-vscode** - 代码格式化
4. **dbaeumer.vscode-eslint** - 代码质量检查

### 增强插件

1. **eamodio.gitlens** - Git增强
2. **christian-kohler.path-intellisense** - 路径智能提示
3. **formulahendry.auto-rename-tag** - 标签自动重命名
4. **aaron-bond.better-comments** - 更好的注释

## 🎯 快捷键和工作流

### 常用快捷键

- `Ctrl+S` / `Cmd+S`: 手动保存（通常不需要）
- `Ctrl+Shift+P` / `Cmd+Shift+P`: 命令面板
- `Ctrl+Shift+F` / `Cmd+Shift+F`: 全局搜索
- `F5`: 开始调试

### 开发工作流

1. **启动开发服务器**: `Ctrl+Shift+P` → "任务: 运行任务" → "🚀 开发服务器"
2. **运行测试**: `Ctrl+Shift+P` → "任务: 运行任务" → "🧪 运行测试"
3. **代码检查**: `Ctrl+Shift+P` → "任务: 运行任务" → "🧹 代码检查和修复"
4. **构建项目**: `Ctrl+Shift+P` → "任务: 运行任务" → "🏗️ 构建项目"

## 🔍 故障排除

### 自动保存不工作

1. 检查设置是否正确加载:
   ```bash
   # VS Code
   按 Ctrl+, 打开设置，搜索 "auto save"

   # Cursor
   检查 .cursor/settings.json 是否存在
   ```

2. 重启IDE确保配置生效

3. 检查文件权限，确保可写

### 插件不工作

1. 检查插件是否安装:
   ```bash
   # VS Code
   按 Ctrl+Shift+X 打开插件面板

   # 查看推荐插件
   文件名: .vscode/extensions.json
   ```

2. 重新加载窗口: `Ctrl+Shift+P` → "重新加载窗口"

### 格式化问题

1. 检查Prettier配置:
   ```json
   {
     "prettier.singleQuote": true,
     "prettier.semi": false,
     "prettier.tabWidth": 2
   }
   ```

2. 检查ESLint配置:
   ```json
   {
     "eslint.enable": true,
     "eslint.run": "onSave"
   }
   ```

## 🛡️ 数据安全

### 配置的数据保护

- ✅ **自动备份**: IDE会自动备份未保存文件
- ✅ **版本控制**: Git跟踪所有代码变更
- ✅ **冲突处理**: 自动检测和处理保存冲突
- ✅ **恢复机制**: 意外关闭后可恢复工作状态

### 最佳实践

1. **定期提交**: 重要修改及时commit
2. **使用分支**: 实验性修改使用feature分支
3. **备份配置**: 重要配置文件加入版本控制
4. **监控状态**: 关注IDE状态栏的保存提示

## 📞 技术支持

如果遇到问题：

1. **查看日志**: `Ctrl+Shift+P` → "开发者: 重新加载窗口"
2. **重置配置**: 删除 `.vscode/settings.json` 后重启
3. **清除缓存**: `Ctrl+Shift+P` → "开发者: 重新加载窗口"

---

**💡 提示**: 所有配置都遵循SmartAbp企业级开发标准，确保团队开发的一致性和代码质量。
