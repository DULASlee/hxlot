# SmartAbp 数据库切换工具 - 使用指南

## 🚀 最快使用方法（推荐）

### macOS用户

**方法1：桌面双击（最简单）**

1. 在桌面找到：`数据库切换.command`
2. **首次**：右键 → 打开 → 确认打开
3. **以后**：直接双击即可

**方法2：终端运行（最可靠）**

```bash
cd ~/SmartAbp/hxlot
bash scripts/database/switch-database.sh
```

**方法3：Spotlight快捷启动**

```
⌘ + 空格 → 输入"数据库切换" → 回车
```

---

### Windows用户

**方法1：右键运行**

```
右键 switch-database.ps1 → 使用PowerShell运行
```

**方法2：PowerShell运行**

```powershell
cd C:\path\to\SmartAbp\hxlot
.\scripts\database\switch-database.ps1
```

---

### Linux用户

```bash
cd ~/SmartAbp/hxlot
bash scripts/database/switch-database.sh
```

---

## 📚 所有可用的脚本

| 文件 | 用途 | 平台 |
|------|------|------|
| `switch-database.sh` | 主脚本（交互式+CLI） | Linux/macOS |
| `switch-database.ps1` | PowerShell版本 | Windows |
| `switch-database-stable.command` | 稳定版（不闪退） | macOS |
| `switch-database.command` | 双击版 | macOS |
| `demo-switch.sh` | 演示脚本 | Linux/macOS |
| `test-double-click.command` | 测试双击功能 | macOS |
| `create-mac-app.sh` | 创建macOS应用 | macOS |

---

## 🎯 快速命令参考

### 交互式模式

```bash
# Linux/macOS
bash scripts/database/switch-database.sh

# Windows
.\scripts\database\switch-database.ps1
```

### 非交互式模式（CLI）

**切换到SQLite**：
```bash
bash scripts/database/switch-database.sh sqlite
```

**切换到PostgreSQL**：
```bash
bash scripts/database/switch-database.sh postgresql localhost 5432 smartabp smartabp_user SmartAbp@2025
```

**切换到MySQL**：
```bash
bash scripts/database/switch-database.sh mysql localhost 3306 smartabp root SmartAbp@2025
```

**切换到SQL Server**：
```bash
bash scripts/database/switch-database.sh sqlserver localhost SmartAbp sa SmartAbp@2025
```

---

## 🔧 Docker快速启动

**启动PostgreSQL**：
```bash
docker-compose -f docker-compose.databases.yml up -d postgres
bash scripts/database/switch-database.sh postgresql
```

**启动MySQL**：
```bash
docker-compose -f docker-compose.databases.yml up -d mysql
bash scripts/database/switch-database.sh mysql
```

**启动所有数据库**：
```bash
docker-compose -f docker-compose.databases.yml up -d
```

---

## 📖 详细文档

| 文档 | 内容 |
|------|------|
| [快速开始](../../docs/deployment/快速开始-一键切换数据库.md) | 5分钟入门指南 |
| [完整部署指南](../../docs/deployment/一键切换数据库部署指南.md) | 企业级部署方案 |
| [双击使用说明](./README-双击使用说明.md) | macOS/Windows双击指南 |
| [桌面双击说明](./桌面双击使用说明.md) | 超简单双击说明 |
| [故障排除](./双击故障排除指南.md) | 双击问题解决方案 |
| [技术架构](../../docs/architecture/SmartAbp企业级多数据库支持架构说明.md) | 技术架构文档 |

---

## 🆘 常见问题

### Q1: 双击后闪退？

**解决**：使用稳定版
```bash
# 复制稳定版到桌面
cp ~/SmartAbp/hxlot/scripts/database/switch-database-stable.command ~/Desktop/数据库切换.command
chmod +x ~/Desktop/数据库切换.command
```

### Q2: 双击后没反应？

**解决**：右键打开
```
1. 右键点击文件
2. 选择"打开"
3. 确认打开
```

### Q3: 如何在终端直接运行？

**解决**：
```bash
cd ~/SmartAbp/hxlot
bash scripts/database/switch-database.sh
```

### Q4: Windows执行策略错误？

**解决**：
```powershell
# 管理员PowerShell运行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎉 完整工作流程

### 1. 切换数据库

```bash
# 双击桌面的"数据库切换.command"
# 或在终端运行：
bash scripts/database/switch-database.sh sqlite
```

### 2. 运行迁移

```bash
cd src/SmartAbp.DbMigrator
dotnet run
```

### 3. 启动后端

```bash
cd src/SmartAbp.Web
dotnet run
```

### 4. 启动前端

```bash
cd src/SmartAbp.Vue
npm run dev
```

### 5. 访问应用

```
http://localhost:11369
```

---

## 🚀 高级用法

### 创建macOS应用

```bash
bash scripts/database/create-mac-app.sh
# 然后在桌面双击 "SmartAbp数据库切换.app"
```

### 添加到PATH

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加：
alias smartabp-db='cd ~/SmartAbp/hxlot && bash scripts/database/switch-database.sh'

# 然后可以在任何地方运行：
smartabp-db
```

### 使用环境变量

```bash
export DATABASE_TYPE="PostgreSQL"
export DATABASE_CONNECTION_STRING="Host=localhost;Database=smartabp;..."

cd src/SmartAbp.Web && dotnet run
```

---

## 📞 获取帮助

**查看帮助信息**：
```bash
bash scripts/database/switch-database.sh --help
```

**运行演示**：
```bash
bash scripts/database/demo-switch.sh
```

**测试双击功能**：
```bash
# 双击
scripts/database/test-double-click.command
```

---

**🎊 现在您可以轻松切换数据库了！**

**选择最适合您的方式开始使用吧！** 🚀

