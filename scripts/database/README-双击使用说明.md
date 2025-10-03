# 🖱️ SmartAbp 数据库切换工具 - 双击使用说明

## ⚡ 快速使用

### macOS用户

**方法1：双击 `.command` 文件（推荐）**

1. 找到文件：`scripts/database/switch-database.command`
2. **双击**此文件
3. 系统会自动打开终端并运行切换工具
4. 按照提示选择数据库类型即可

**首次使用可能需要**:
- 如果提示"无法打开，因为它来自身份不明的开发者"
- 右键点击文件 → 选择"打开" → 点击"打开"确认
- 或者在系统偏好设置 → 安全性与隐私 → 点击"仍要打开"

---

**方法2：创建桌面快捷方式**

```bash
# 在终端运行以下命令
ln -s "$(pwd)/scripts/database/switch-database.command" ~/Desktop/数据库切换.command

# 现在您可以直接双击桌面上的"数据库切换.command"
```

---

**方法3：添加到Finder侧边栏**

1. 在Finder中找到 `scripts/database/switch-database.command`
2. 拖动文件到Finder侧边栏的"个人收藏"区域
3. 现在可以随时点击运行

---

**方法4：创建Alfred/Raycast快捷方式**

如果您使用Alfred或Raycast:

1. 创建自定义工作流/脚本
2. 命令: `bash ~/SmartAbp/hxlot/scripts/database/switch-database.sh`
3. 设置快捷键，如 `⌘⇧D`

---

### Windows用户

**方法1：双击 `.ps1` 文件**

1. 找到文件：`scripts/database/switch-database.ps1`
2. **右键** → **使用PowerShell运行**

**首次使用需要设置执行策略**:
```powershell
# 以管理员身份运行PowerShell，执行：
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**方法2：创建桌面快捷方式**

1. 右键桌面 → 新建 → 快捷方式
2. 位置输入：
   ```
   powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\SmartAbp\hxlot\scripts\database\switch-database.ps1"
   ```
3. 命名为"数据库切换"
4. 点击完成

---

**方法3：创建批处理文件（.bat）**

创建 `数据库切换.bat`:
```batch
@echo off
powershell.exe -ExecutionPolicy Bypass -File "%~dp0switch-database.ps1"
pause
```

双击此`.bat`文件即可运行。

---

### Linux用户

**方法1：设置文件关联**

```bash
# 1. 设置执行权限
chmod +x scripts/database/switch-database.sh

# 2. 创建桌面快捷方式
cat > ~/Desktop/数据库切换.desktop << 'EOF'
[Desktop Entry]
Name=SmartAbp数据库切换
Exec=bash /path/to/SmartAbp/hxlot/scripts/database/switch-database.sh
Icon=utilities-terminal
Terminal=true
Type=Application
EOF

chmod +x ~/Desktop/数据库切换.desktop
```

---

**方法2：创建可执行的Shell脚本**

创建 `~/bin/smartabp-db`:
```bash
#!/bin/bash
cd ~/SmartAbp/hxlot
bash scripts/database/switch-database.sh
```

设置权限：
```bash
chmod +x ~/bin/smartabp-db
```

现在可以在终端直接输入 `smartabp-db` 运行。

---

## 🎯 演示脚本

如果想快速演示功能：

```bash
# macOS/Linux - 双击或运行
bash scripts/database/demo-switch.sh

# Windows
.\scripts\database\demo-switch.ps1
```

---

## 💡 提示

### macOS最佳实践

**创建应用包（最优雅的方式）**:

1. 打开"自动操作"（Automator）
2. 创建新文稿 → 应用程序
3. 添加操作"运行Shell脚本"
4. 输入：
   ```bash
   cd ~/SmartAbp/hxlot
   bash scripts/database/switch-database.sh
   ```
5. 保存为"SmartAbp数据库切换.app"
6. 拖到应用程序文件夹或Dock

**现在可以像普通应用一样双击运行！**

---

### Windows最佳实践

**创建开始菜单快捷方式**:

1. 创建`.ps1`文件的快捷方式
2. 移动到：`C:\ProgramData\Microsoft\Windows\Start Menu\Programs\`
3. 现在可以从开始菜单搜索"数据库切换"

---

## 🚀 快速命令参考

### 非交互式使用

如果不想每次都通过菜单选择，可以直接指定数据库类型：

```bash
# macOS/Linux
bash scripts/database/switch-database.sh sqlite
bash scripts/database/switch-database.sh postgresql localhost 5432 smartabp user pass

# Windows
.\scripts\database\switch-database.ps1 sqlite
.\scripts\database\switch-database.ps1 postgresql localhost 5432 smartabp user pass
```

---

## ❓ 常见问题

### Q: 双击后终端闪一下就关闭了？

**A**: 使用 `.command` 文件（macOS）或创建批处理文件（Windows），它们会保持终端窗口打开。

---

### Q: macOS提示"无法打开，因为它来自身份不明的开发者"？

**A**: 
1. 右键点击文件
2. 选择"打开"
3. 在弹出对话框中再次点击"打开"
4. 或者：系统偏好设置 → 安全性与隐私 → 点击"仍要打开"

---

### Q: Windows提示"无法加载，因为在此系统上禁止运行脚本"？

**A**: 
```powershell
# 管理员PowerShell运行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Q: 如何在VS Code中直接运行？

**A**: 
1. 打开VS Code终端（`` Ctrl+` ``）
2. 运行：`bash scripts/database/switch-database.sh`
3. 或添加到任务（Tasks）配置

---

## 🎨 更多个性化

### 自定义图标（macOS）

1. 下载或创建图标（.icns格式）
2. 使用"显示简介"（⌘I）
3. 将图标拖到窗口左上角的小图标上

---

### 固定到任务栏（Windows）

1. 创建快捷方式
2. 右键 → 固定到任务栏
3. 现在可以一键访问

---

## 📚 完整文档

- **快速开始**: `docs/deployment/快速开始-一键切换数据库.md`
- **完整指南**: `docs/deployment/一键切换数据库部署指南.md`
- **技术架构**: `docs/architecture/SmartAbp企业级多数据库支持架构说明.md`

---

**🎉 现在您可以像使用普通应用一样，双击切换数据库了！**

