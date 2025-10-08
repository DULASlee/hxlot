# 🌍 SmartAbp 跨平台数据库配置指南

## 📋 概述

本指南说明如何在不同操作系统上正确配置和使用SmartAbp的数据库系统。

### 🎯 核心特性

- ✅ **OS智能检测**：自动根据操作系统选择合适的数据库
- ✅ **配置驱动**：非硬编码，通过`appsettings.json`灵活配置
- ✅ **多数据库支持**：SQL Server、PostgreSQL、SQLite、MySQL
- ✅ **完整迁移**：每个数据库都有独立的迁移文件

---

## 🖥️ 操作系统与推荐数据库

| 操作系统 | 推荐数据库 | 原因 |
|---------|-----------|------|
| Windows | SQL Server (LocalDB) | Windows原生支持，开发便捷 |
| macOS | PostgreSQL | Mac不支持SQL Server LocalDB |
| Linux | PostgreSQL | 开源跨平台支持最佳 |

---

## 🚀 快速开始

### 1. Auto模式（推荐）

**配置文件**: `src/SmartAbp.DbMigrator/appsettings.json`

```json
{
  "Database": {
    "Type": "Auto"
  }
}
```

**说明**: 系统自动根据操作系统选择数据库
- Windows → SQL Server LocalDB
- macOS → PostgreSQL
- Linux → PostgreSQL

### 2. 手动指定模式

```json
{
  "Database": {
    "Type": "PostgreSQL"  // 或 "SqlServer", "Sqlite", "MySQL"
  }
}
```

---

## 🔧 macOS 设置指南

### 步骤1: 安装PostgreSQL

```bash
# 使用Homebrew安装
brew install postgresql@16

# 启动PostgreSQL服务
brew services start postgresql@16
```

### 步骤2: 运行设置脚本

```bash
cd scripts/database
./setup-mac-postgresql.sh
```

**脚本会自动执行**:
1. ✅ 检查PostgreSQL安装状态
2. ✅ 创建数据库用户（smartabp_user）
3. ✅ 创建数据库（smartabp）
4. ✅ 生成PostgreSQL迁移文件
5. ✅ 运行数据库迁移
6. ✅ 验证数据库

### 步骤3: 配置连接字符串

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Port=5432;Database=smartabp;Username=smartabp_user;Password=SmartAbp123!;Include Error Detail=true;Search Path=public"
  }
}
```

### 验证安装

```bash
# 连接数据库
psql -U smartabp_user -d smartabp

# 查看表
\dt

# 退出
\q
```

---

## 🔷 Windows 设置指南

### 步骤1: 安装SQL Server LocalDB

**选项A: 通过Visual Studio安装**
- 安装Visual Studio时选择"数据存储和处理"工作负载

**选项B: 单独安装**
- 下载：https://go.microsoft.com/fwlink/?linkid=866662
- 运行安装程序

### 步骤2: 运行设置脚本

```powershell
cd scripts\database
.\setup-windows-sqlserver.ps1
```

**脚本会自动执行**:
1. ✅ 检查.NET SDK和EF Core工具
2. ✅ 检查SQL Server LocalDB状态
3. ✅ 检查迁移文件完整性
4. ✅ 更新配置文件
5. ✅ 运行数据库迁移

### 步骤3: 配置连接字符串

```json
{
  "ConnectionStrings": {
    "LocalDb": "Server=(localdb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true"
  }
}
```

### 验证安装

**使用SQL Server Management Studio (SSMS)**:
1. 服务器名称: `(localdb)\MSSQLLocalDB`
2. 身份验证: Windows身份验证
3. 连接后查看`SmartAbp`数据库

---

## 🐧 Linux 设置指南

### 步骤1: 安装PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 步骤2: 创建数据库和用户

```bash
sudo -u postgres psql

CREATE USER smartabp_user WITH PASSWORD 'SmartAbp123!';
CREATE DATABASE smartabp OWNER smartabp_user;
GRANT ALL PRIVILEGES ON DATABASE smartabp TO smartabp_user;
\q
```

### 步骤3: 配置并运行迁移

```bash
cd src/SmartAbp.DbMigrator

# 配置appsettings.json
cat > appsettings.json << 'EOF'
{
  "Database": {
    "Type": "PostgreSQL"
  },
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Port=5432;Database=smartabp;Username=smartabp_user;Password=SmartAbp123!;Include Error Detail=true;Search Path=public"
  }
}
EOF

# 运行迁移
dotnet run
```

---

## 📊 数据库驱动配置

### 动态加载机制

系统通过`SmartAbpEntityFrameworkCoreModule.cs`动态加载数据库驱动：

```csharp
Configure<AbpDbContextOptions>(options =>
{
    var configuration = context.Services.GetConfiguration();
    var databaseType = MultiDatabaseMigrationManager.GetDatabaseType(configuration);
    
    switch (databaseType)
    {
        case DatabaseType.SQLite:
            options.UseSqlite();
            break;
            
        case DatabaseType.SqlServer:
            options.UseSqlServer();
            break;
            
        case DatabaseType.PostgreSQL:
            options.UseNpgsql();
            break;
            
        case DatabaseType.MySQL:
            options.UseMySql();
            break;
    }
});
```

### NuGet包引用

所有数据库驱动已在`.csproj`中配置，无需额外安装：

```xml
<ItemGroup>
  <!-- SQL Server -->
  <PackageReference Include="Volo.Abp.EntityFrameworkCore.SqlServer" Version="$(AbpVersion)" />
  
  <!-- PostgreSQL -->
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />
  <PackageReference Include="Volo.Abp.EntityFrameworkCore.PostgreSql" Version="$(AbpVersion)" />
  
  <!-- SQLite -->
  <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.0" />
  <PackageReference Include="Volo.Abp.EntityFrameworkCore.Sqlite" Version="$(AbpVersion)" />
</ItemGroup>
```

---

## 🔍 验证和故障排除

### 验证数据库配置

```bash
# 运行验证脚本
./verify-database-config.sh
```

**脚本会检查**:
- ✅ 操作系统类型
- ✅ 推荐数据库vs当前配置
- ✅ 数据库服务状态
- ✅ 迁移文件完整性
- ✅ .NET和EF Core工具

### 常见问题

#### 问题1: PostgreSQL连接失败 (macOS)

```bash
# 检查服务状态
brew services list | grep postgresql

# 重启服务
brew services restart postgresql@16

# 检查端口
lsof -i :5432
```

#### 问题2: LocalDB连接失败 (Windows)

```powershell
# 检查LocalDB状态
SqlLocalDB.exe info MSSQLLocalDB

# 重启LocalDB
SqlLocalDB.exe stop MSSQLLocalDB
SqlLocalDB.exe start MSSQLLocalDB
```

#### 问题3: 迁移文件缺失

```bash
# macOS/Linux - PostgreSQL
cd src/SmartAbp.EntityFrameworkCore
export Database__Type="PostgreSQL"
dotnet ef migrations add "PostgreSQL_CompleteSchema" \
  --context SmartAbpDbContext \
  --output-dir "Migrations/PostgreSQL"

# Windows - SQL Server
cd src\SmartAbp.EntityFrameworkCore
set Database__Type=SqlServer
dotnet ef migrations add "SqlServer_CompleteSchema" `
  --context SmartAbpDbContext `
  --output-dir "Migrations\SqlServer"
```

---

## 🛠️ 迁移管理

### 迁移文件结构

```
src/SmartAbp.EntityFrameworkCore/Migrations/
├── SqlServer/
│   ├── 20251003161310_InitialCreate.cs
│   ├── 20251007031416_AddBusinessRulesTable.cs
│   └── ...
├── PostgreSQL/
│   ├── 20251007172103_PostgreSQL_InitialCreate.cs
│   └── ...
├── SQLite/
│   └── 20251003040119_InitialSQLite.cs
└── MySQL/
    └── (待添加)
```

### 迁移文件过滤机制

系统通过`FilteringMigrationsAssembly`确保只加载当前数据库类型的迁移：

```csharp
// 根据配置的数据库类型，只加载对应文件夹的迁移
var databaseType = MultiDatabaseMigrationManager.GetDatabaseType(configuration);
var requiredNamespace = databaseType switch
{
    DatabaseType.SqlServer => "SmartAbp.Migrations.SqlServer",
    DatabaseType.PostgreSQL => "SmartAbp.Migrations.PostgreSQL",
    DatabaseType.SQLite => "SmartAbp.Migrations.SQLite",
    _ => "SmartAbp.Migrations.SqlServer"
};
```

---

## 📚 相关脚本

| 脚本 | 用途 | 平台 |
|------|------|------|
| `setup-mac-postgresql.sh` | Mac PostgreSQL完整设置 | macOS |
| `setup-windows-sqlserver.ps1` | Windows SQL Server设置 | Windows |
| `verify-database-config.sh` | 验证数据库配置 | 跨平台 |
| `switch-database.sh` | 切换数据库类型 | 跨平台 |

---

## 🎯 最佳实践

### 开发环境

```yaml
推荐配置:
  Windows: SQL Server LocalDB (Auto模式)
  macOS: PostgreSQL (Auto模式)
  Linux: PostgreSQL (Auto模式)

原因:
  - 自动适配操作系统
  - 无需手动配置
  - 开箱即用
```

### 生产环境

```yaml
推荐配置:
  - 明确指定数据库类型（不使用Auto）
  - 使用专用数据库服务器
  - 配置主从复制和备份
  - 使用强密码和SSL连接
```

### CI/CD环境

```yaml
推荐配置:
  - 使用Docker容器化数据库
  - 使用SQLite进行快速测试
  - GitHub Actions使用PostgreSQL服务
  - Azure DevOps使用SQL Server
```

---

## ✅ 检查清单

### 初次设置

- [ ] 安装对应操作系统的数据库
- [ ] 运行设置脚本
- [ ] 验证配置文件
- [ ] 检查迁移文件完整性
- [ ] 运行数据库迁移
- [ ] 验证数据库连接

### 切换数据库

- [ ] 更新`Database:Type`配置
- [ ] 更新对应的连接字符串
- [ ] 确认迁移文件存在
- [ ] 重新运行迁移
- [ ] 测试应用程序

---

## 📞 技术支持

如有问题，请：
1. 查看本文档的故障排除章节
2. 运行`verify-database-config.sh`检查配置
3. 查看日志文件
4. 提交Issue到项目仓库

---

**版本**: 1.0  
**更新日期**: 2025-10-08  
**维护**: SmartAbp Team  

