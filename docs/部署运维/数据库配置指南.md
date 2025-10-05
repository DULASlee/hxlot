# SmartAbp 数据库配置切换指南

## 📦 支持的数据库

SmartAbp低代码引擎支持以下数据库，可以轻松切换：

### 1. **SQLite** ⭐ 推荐（默认）
- ✅ **优点**: 轻量级，无需安装服务器，开箱即用
- ✅ **适用场景**: 开发、演示、小型项目
- ✅ **数据文件**: `smartabp.db` （存储在项目根目录）

### 2. **SQL Server LocalDB** 🔷 推荐（Windows）
- ✅ **优点**: 免费，集成开发体验，适合Windows开发者
- ✅ **适用场景**: Windows开发环境，中小型项目
- ⚠️ **要求**: 需要安装SQL Server Express或Visual Studio

### 3. **SQL Server**
- ✅ **优点**: 企业级功能，高性能，强大的管理工具
- ✅ **适用场景**: 生产环境，大型项目
- ⚠️ **要求**: 需要安装SQL Server服务器

### 4. **PostgreSQL**
- ✅ **优点**: 开源，功能丰富，跨平台
- ✅ **适用场景**: 生产环境，Linux服务器
- ⚠️ **要求**: 需要安装PostgreSQL服务器

---

## 🔧 快速切换数据库

### 方法1：修改 `appsettings.json`（推荐）

#### 切换到 SQLite（默认）
```json
{
  "Database": {
    "Type": "Sqlite"
  },
  "ConnectionStrings": {
    "Default": "Data Source=../smartabp.db"
  }
}
```

#### 切换到 SQL Server LocalDB
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

#### 切换到 SQL Server
```json
{
  "Database": {
    "Type": "SqlServer"
  },
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=SmartAbp;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
  }
}
```

#### 切换到 PostgreSQL
```json
{
  "Database": {
    "Type": "PostgreSQL"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=smartabp;Username=postgres;Password=YourPassword;Port=5432"
  }
}
```

### 方法2：使用预定义配置文件

SmartAbp提供了多个预配置文件，可以直接使用：

```bash
# 使用 SQLite（默认）
dotnet run --project src/SmartAbp.Web

# 使用 LocalDB
dotnet run --project src/SmartAbp.Web --launch-profile LocalDb

# 或在启动时指定环境变量
$env:ASPNETCORE_ENVIRONMENT="LocalDb"
dotnet run --project src/SmartAbp.Web
```

---

## 🚀 数据库迁移

### 首次使用新数据库

1. **修改配置文件**（如上所述）
2. **运行数据库迁移工具**

```bash
# 方法1：使用DbMigrator工具
cd src/SmartAbp.DbMigrator
dotnet run

# 方法2：使用EF Core命令（开发环境）
cd src/SmartAbp.EntityFrameworkCore
dotnet ef database update
```

### 已有数据库迁移

如果已经在使用某个数据库，切换到新数据库时：

```bash
# 1. 导出现有数据（可选）
# 使用数据库管理工具导出数据

# 2. 修改appsettings.json指向新数据库

# 3. 运行迁移工具创建新数据库
cd src/SmartAbp.DbMigrator
dotnet run

# 4. 导入数据（可选）
```

---

## 📝 数据库连接字符串说明

### SQLite
```
Data Source=../smartabp.db
Data Source=C:\MyProjects\smartabp.db      # 绝对路径
Data Source=:memory:                       # 内存数据库（测试用）
```

### SQL Server LocalDB
```
Server=(LocalDb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true
```

### SQL Server
```
Server=localhost;Database=SmartAbp;User Id=sa;Password=YourPassword;TrustServerCertificate=true
Server=192.168.1.100,1433;Database=SmartAbp;User Id=sa;Password=YourPassword
```

### PostgreSQL
```
Host=localhost;Database=smartabp;Username=postgres;Password=YourPassword;Port=5432
Host=192.168.1.100;Database=smartabp;Username=smartabp_user;Password=YourPassword
```

---

## ⚡ 性能对比

| 数据库 | 启动速度 | 并发性能 | 企业功能 | 部署复杂度 |
|--------|----------|----------|----------|-----------|
| **SQLite** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **LocalDB** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SQL Server** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **PostgreSQL** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🛠️ 常见问题

### Q: 切换数据库后出现迁移错误？
**A**: 删除现有数据库文件/数据库，重新运行 `SmartAbp.DbMigrator`

### Q: SQLite性能是否足够？
**A**: SQLite适合开发和演示，支持10-100个并发用户。生产环境建议使用SQL Server或PostgreSQL。

### Q: 如何备份SQLite数据库？
**A**: 直接复制 `smartabp.db` 文件即可。

### Q: LocalDB在哪里存储数据？
**A**: 默认位置：`C:\Users\{YourUsername}\`

---

## 📞 技术支持

如有问题，请参考：
- ABP框架文档：https://docs.abp.io/
- Entity Framework Core文档：https://docs.microsoft.com/ef/core/
- SmartAbp项目Issues：https://github.com/your-repo/issues

---

**推荐配置**：
- **开发环境**: SQLite（最简单，开箱即用）
- **Windows开发**: SQL Server LocalDB（集成开发体验）
- **生产环境**: SQL Server 或 PostgreSQL（企业级性能）

