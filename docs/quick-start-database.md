# SmartAbp 快速启动指南 - 数据库配置

## 🚀 一键启动（推荐）

### 使用SQLite（无需安装数据库服务器）

```bash
# 1. 恢复NuGet包
dotnet restore

# 2. 运行数据库迁移
cd src/SmartAbp.DbMigrator
dotnet run

# 3. 启动后端服务
cd ../SmartAbp.Web
dotnet run

# 4. 启动前端（新终端）
cd ../SmartAbp.Vue
npm install
npm run dev
```

✅ **完成！** 访问 https://localhost:44379

---

## 🔧 切换到SQL Server LocalDB（Windows推荐）

### 步骤1：确认LocalDB已安装

```bash
# 检查LocalDB是否可用
sqllocaldb info
```

如果未安装，下载安装：
- Visual Studio自带LocalDB
- 或下载：[SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads)

### 步骤2：修改配置

**修改 `src/SmartAbp.Web/appsettings.json`：**
```json
{
  "Database": {
    "Type": "LocalDb"
  },
  "ConnectionStrings": {
    "Default": "Server=(LocalDb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true"
  }
}
```

**修改 `src/SmartAbp.DbMigrator/appsettings.json`：**
```json
{
  "Database": {
    "Type": "LocalDb"
  },
  "ConnectionStrings": {
    "Default": "Server=(LocalDb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true"
  }
}
```

### 步骤3：运行迁移并启动

```bash
# 运行数据库迁移
cd src/SmartAbp.DbMigrator
dotnet run

# 启动服务
cd ../SmartAbp.Web
dotnet run
```

---

## 🐘 切换到PostgreSQL

### 步骤1：安装PostgreSQL

- Windows: https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

### 步骤2：创建数据库和用户

```sql
-- 以postgres用户登录
psql -U postgres

-- 创建用户
CREATE USER smartabp_user WITH PASSWORD 'SmartAbp@2025';

-- 创建数据库
CREATE DATABASE smartabp OWNER smartabp_user;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE smartabp TO smartabp_user;
```

### 步骤3：修改配置

**修改 `src/SmartAbp.Web/appsettings.json`：**
```json
{
  "Database": {
    "Type": "PostgreSQL"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=smartabp;Username=smartabp_user;Password=SmartAbp@2025;Port=5432"
  }
}
```

### 步骤4：运行迁移并启动

```bash
cd src/SmartAbp.DbMigrator
dotnet run

cd ../SmartAbp.Web
dotnet run
```

---

## 🔍 验证数据库连接

### SQLite
```bash
# 检查数据库文件是否创建
ls -la smartabp.db

# 使用SQLite浏览器打开
# 推荐工具：DB Browser for SQLite
```

### LocalDB
```bash
# 列出所有LocalDB实例
sqllocaldb info

# 连接到数据库
sqlcmd -S (LocalDb)\MSSQLLocalDB -d SmartAbp
```

### PostgreSQL
```bash
# 检查服务状态
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# 连接数据库
psql -U smartabp_user -d smartabp
```

---

## ⚠️ 常见错误解决

### 错误1：PostgreSQL连接失败
```
Failed to connect to 127.0.0.1:5432
```

**解决方案**：
```bash
# 1. 检查PostgreSQL是否运行
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# 2. 切换到SQLite
# 修改appsettings.json的Database.Type为"Sqlite"
```

### 错误2：LocalDB实例不存在
```
A network-related or instance-specific error occurred
```

**解决方案**：
```bash
# 创建LocalDB实例
sqllocaldb create MSSQLLocalDB
sqllocaldb start MSSQLLocalDB
```

### 错误3：SQLite文件权限错误
```
SQLite Error: Unable to open database file
```

**解决方案**：
```bash
# 确保有写入权限
chmod 666 smartabp.db

# 或使用绝对路径
"Default": "Data Source=C:\\Projects\\smartabp.db"
```

---

## 📊 数据库管理工具推荐

### SQLite
- **DB Browser for SQLite**: https://sqlitebrowser.org/
- **DBeaver**: https://dbeaver.io/

### SQL Server / LocalDB
- **SQL Server Management Studio (SSMS)**
- **Azure Data Studio**
- **DBeaver**

### PostgreSQL
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

---

## 🎯 最佳实践

1. **开发环境**: 使用SQLite，简单快速
2. **团队开发**: 使用LocalDB（Windows）或Docker PostgreSQL
3. **生产环境**: 使用专用SQL Server或PostgreSQL服务器
4. **CI/CD**: 使用SQLite内存数据库进行测试

---

## 📝 环境变量配置（可选）

```bash
# Windows PowerShell
$env:Database__Type="Sqlite"
$env:ConnectionStrings__Default="Data Source=smartabp.db"

# Linux/macOS
export Database__Type="Sqlite"
export ConnectionStrings__Default="Data Source=smartabp.db"
```

---

**快速命令汇总**：

```bash
# SQLite启动（推荐）
cd src/SmartAbp.DbMigrator && dotnet run && cd ../SmartAbp.Web && dotnet run

# LocalDB启动
# 1. 修改appsettings.json的Database.Type为"LocalDb"
# 2. cd src/SmartAbp.DbMigrator && dotnet run && cd ../SmartAbp.Web && dotnet run

# PostgreSQL启动
# 1. 启动PostgreSQL服务
# 2. 修改appsettings.json的Database.Type为"PostgreSQL"
# 3. cd src/SmartAbp.DbMigrator && dotnet run && cd ../SmartAbp.Web && dotnet run
```

🎉 **祝您使用愉快！**

