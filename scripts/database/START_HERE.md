# 🖱️ 双击即用 - SmartAbp数据库切换工具

## 🎯 最简单的使用方式

### macOS用户（您现在看到的）

**方法1：双击桌面应用 ⭐推荐**

```
📍 查看您的桌面
👉 找到 "SmartAbp数据库切换.app"
🖱️ 双击它！
```

**首次使用**：如果提示安全警告
1. 右键点击应用
2. 选择"打开"
3. 在弹出框中再次点击"打开"
4. 以后就可以直接双击了！

---

**方法2：双击.command文件**

```
📍 打开Finder
👉 导航到: SmartAbp/hxlot/scripts/database/
🖱️ 双击 "switch-database.command"
```

---

### Windows用户

**方法1：右键运行PowerShell**

```
📍 打开文件资源管理器
👉 导航到: SmartAbp\hxlot\scripts\database\
🖱️右键点击 "switch-database.ps1"
👉 选择 "使用PowerShell运行"
```

**首次使用**：如果提示执行策略错误
```powershell
# 以管理员身份打开PowerShell，运行：
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# 然后重试
```

---

**方法2：创建桌面快捷方式**

1. 右键桌面 → 新建 → 快捷方式
2. 位置输入：
   ```
   powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\SmartAbp\hxlot\scripts\database\switch-database.ps1"
   ```
3. 命名为 "数据库切换"
4. 双击使用！

---

### Linux用户

**创建桌面快捷方式**

```bash
# 复制以下命令到终端运行
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

然后双击桌面上的图标！

---

## 📚 完整文档

如果需要更详细的说明：

- **双击使用指南**: `README-双击使用说明.md`
- **快速开始**: `../../docs/deployment/快速开始-一键切换数据库.md`
- **完整文档**: `../../docs/deployment/一键切换数据库部署指南.md`

---

## 🚀 使用流程

1. **双击运行** 数据库切换工具
2. **选择数据库** 类型（推荐SQLite零配置）
3. **运行迁移**
   ```bash
   cd src/SmartAbp.DbMigrator && dotnet run
   ```
4. **启动服务**
   ```bash
   cd src/SmartAbp.Web && dotnet run
   cd src/SmartAbp.Vue && npm run dev
   ```
5. **访问应用** http://localhost:11369

---

## 💡 提示

### macOS最佳体验

- 将应用拖到**应用程序文件夹**
- 将应用拖到**Dock栏**固定
- 可以用Spotlight搜索"SmartAbp"快速启动

### Windows最佳体验

- 将快捷方式固定到**任务栏**
- 将快捷方式放到**开始菜单**
- 可以搜索"数据库切换"快速启动

---

## ❓ 遇到问题？

### macOS: "无法打开，因为它来自身份不明的开发者"

**解决**:
1. 右键点击应用
2. 选择"打开"（不是双击）
3. 点击"打开"按钮确认
4. 或：系统偏好设置 → 安全性与隐私 → 点击"仍要打开"

### Windows: "无法加载，因为在此系统上禁止运行脚本"

**解决**:
```powershell
# 管理员PowerShell运行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 双击后闪一下就关闭了？

**解决**: 使用我们提供的`.command`文件（macOS）或创建批处理文件（Windows），它们会保持窗口打开。

---

## 🎉 开始使用

**现在就试试吧！**

1. 在桌面找到 **SmartAbp数据库切换.app**
2. 双击它
3. 选择SQLite
4. 开始开发！

**就是这么简单！** 🚀

---

**📍 当前位置**: `SmartAbp/hxlot/scripts/database/START_HERE.md`

