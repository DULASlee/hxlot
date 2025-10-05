# Mac平台数据库配置方案

**问题**: macOS不支持SQL Server LocalDB

**错误信息**: `System.PlatformNotSupportedException: 此平台不支持 LocalDB`

**原因**: LocalDB是Windows专有的SQL Server Express轻量级版本，不支持macOS

---

## 🎯 推荐解决方案：使用PostgreSQL（最佳）

### 为什么选择PostgreSQL？
- ✅ 跨平台支持（Windows/macOS/Linux）
- ✅ ABP框架完全支持
- ✅ 性能优秀，企业级稳定
- ✅ 免费开源
- ✅ Mac上安装简单（通过Homebrew）

---

## 🚀 方案1：PostgreSQL（推荐⭐⭐⭐⭐⭐）

### Step 1: 安装PostgreSQL

```bash
# 使用Homebrew安装PostgreSQL
brew install postgresql@15

# 启动PostgreSQL服务
brew services start postgresql@15

# 验证安装
psql --version
# 应该显示: psql (PostgreSQL) 15.x
```

### Step 2: 创建数据库和用户

```bash
# 连接到PostgreSQL
psql postgres

# 在psql命令行中执行：
CREATE DATABASE smartabp;
CREATE USER smartabp_user WITH PASSWORD 'SmartAbp@2025';
GRANT ALL PRIVILEGES ON DATABASE smartabp TO smartabp_user;

# 授予schema权限（PostgreSQL 15+需要）
\c smartabp
GRANT ALL ON SCHEMA public TO smartabp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO smartabp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smartabp_user;

# 退出
\q
```

### Step 3: 修改连接字符串

**文件**: `src/SmartAbp.Web/appsettings.json`

**原始配置**:
```json
{
  "ConnectionStrings": {
    "Default": "Server=(LocalDb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true"
  }
}
```

**修改为PostgreSQL**:
```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=smartabp;Username=smartabp_user;Password=SmartAbp@2025;Port=5432"
  }
}
```

### Step 4: 安装PostgreSQL NuGet包

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web

# 移除SQL Server包（如果已安装）
dotnet remove package Microsoft.EntityFrameworkCore.SqlServer

# 添加PostgreSQL包
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.0
```

### Step 5: 修改DbContext配置

**文件**: `src/SmartAbp.EntityFrameworkCore/SmartAbpDbContext.cs` 或类似文件

**查找**:
```csharp
options.UseSqlServer(connectionString);
```

**修改为**:
```csharp
options.UseNpgsql(connectionString);
```

**或在模块配置中** (通常在`*EntityFrameworkCoreModule.cs`):
```csharp
// 查找并修改
context.Services.AddAbpDbContext<SmartAbpDbContext>(options =>
{
    options.AddDefaultRepositories(includeAllEntities: true);
});

Configure<AbpDbContextOptions>(options =>
{
    // 原来: options.UseSqlServer();
    // 修改为:
    options.UseNpgsql();
});
```

### Step 6: 执行数据库迁移

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web

# 创建迁移（如果需要）
dotnet ef migrations add InitialCreate

# 应用迁移到数据库
dotnet ef database update

# 或者使用ABP CLI
abp migrate
```

### Step 7: 启动验证

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web
dotnet run

# 应该看到成功启动，没有数据库错误
```

---

## 🔧 方案2：SQLite（轻量级，适合开发）

### 优点
- ✅ 无需安装数据库服务器
- ✅ 文件数据库，便携性强
- ✅ 配置超级简单

### 缺点
- ⚠️ 功能相对有限
- ⚠️ 不适合生产环境
- ⚠️ 并发性能较弱

### 配置步骤

#### Step 1: 安装SQLite NuGet包

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web

# 移除SQL Server包
dotnet remove package Microsoft.EntityFrameworkCore.SqlServer

# 添加SQLite包
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 9.0.0
```

#### Step 2: 修改连接字符串

**文件**: `src/SmartAbp.Web/appsettings.json`

```json
{
  "ConnectionStrings": {
    "Default": "Data Source=smartabp.db"
  }
}
```

#### Step 3: 修改DbContext配置

```csharp
// 查找 UseSqlServer，修改为
options.UseSqlite(connectionString);

// 在模块配置中
Configure<AbpDbContextOptions>(options =>
{
    options.UseSqlite();
});
```

#### Step 4: 执行迁移

```bash
dotnet ef database update
```

---

## 🐳 方案3：Docker运行SQL Server（兼容原配置）

### 优点
- ✅ 与Windows开发环境一致
- ✅ 无需修改连接字符串和代码
- ✅ 支持完整的SQL Server功能

### 缺点
- ⚠️ 需要Docker Desktop
- ⚠️ 资源占用较大
- ⚠️ 启动较慢

### 配置步骤

#### Step 1: 启动SQL Server容器

```bash
# 拉取并运行SQL Server 2022
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 \
  --name sqlserver2022 \
  --hostname sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# 验证容器运行
docker ps | grep sqlserver
```

#### Step 2: 修改连接字符串

**文件**: `src/SmartAbp.Web/appsettings.json`

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost,1433;Database=SmartAbp;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true"
  }
}
```

#### Step 3: 执行迁移

```bash
dotnet ef database update
```

---

## 📊 方案对比

| 方案 | 难度 | 资源占用 | 功能完整性 | 推荐度 |
|------|------|----------|-----------|--------|
| **PostgreSQL** | ⭐⭐ | 低 | 高 | ⭐⭐⭐⭐⭐ |
| **SQLite** | ⭐ | 极低 | 中 | ⭐⭐⭐ |
| **Docker SQL Server** | ⭐⭐⭐ | 高 | 高 | ⭐⭐⭐⭐ |

---

## 🎯 推荐执行：PostgreSQL方案

### 完整执行命令（一键复制）

```bash
# === Step 1: 安装PostgreSQL ===
brew install postgresql@15
brew services start postgresql@15

# === Step 2: 创建数据库 ===
psql postgres << EOF
CREATE DATABASE smartabp;
CREATE USER smartabp_user WITH PASSWORD 'SmartAbp@2025';
GRANT ALL PRIVILEGES ON DATABASE smartabp TO smartabp_user;
\c smartabp
GRANT ALL ON SCHEMA public TO smartabp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smartabp_user;
EOF

# === Step 3: 添加PostgreSQL NuGet包 ===
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web
dotnet remove package Microsoft.EntityFrameworkCore.SqlServer 2>/dev/null || true
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.0

# === Step 4: 验证PostgreSQL运行 ===
psql -U smartabp_user -d smartabp -c "SELECT version();"
```

---

## 🔧 需要修改的文件清单

### 1. appsettings.json
```
src/SmartAbp.Web/appsettings.json
src/SmartAbp.Web/appsettings.Development.json
src/SmartAbp.DbMigrator/appsettings.json (如果存在)
```

### 2. EntityFrameworkCore配置
```
src/SmartAbp.EntityFrameworkCore/*EntityFrameworkCoreModule.cs
src/SmartAbp.EntityFrameworkCore/SmartAbpDbContext.cs (或类似文件)
```

### 3. 项目文件
```
src/SmartAbp.EntityFrameworkCore/SmartAbp.EntityFrameworkCore.csproj
src/SmartAbp.Web/SmartAbp.Web.csproj
```

---

## ⚠️ 注意事项

### PostgreSQL vs SQL Server差异

1. **语法差异**
   - PostgreSQL区分大小写（表名、列名）
   - 某些SQL Server特定函数可能需要调整

2. **数据类型映射**
   - `nvarchar(max)` → `text`
   - `uniqueidentifier` → `uuid`
   - `datetime2` → `timestamp`

3. **EF Core迁移**
   - 可能需要重新生成迁移文件
   - 建议删除旧迁移，重新创建

---

## 🚀 快速验证清单

- [ ] PostgreSQL已安装并运行
- [ ] 数据库和用户已创建
- [ ] NuGet包已更新
- [ ] 连接字符串已修改
- [ ] DbContext配置已更新
- [ ] 数据库迁移已执行
- [ ] 后端成功启动无错误
- [ ] 可以正常访问API

---

## 💡 故障排查

### 问题1: psql命令找不到

```bash
# 添加到PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 问题2: 连接被拒绝

```bash
# 检查PostgreSQL状态
brew services list | grep postgresql

# 重启PostgreSQL
brew services restart postgresql@15
```

### 问题3: 权限不足

```bash
# 重新授权
psql -U postgres smartabp << EOF
GRANT ALL ON SCHEMA public TO smartabp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smartabp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO smartabp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO smartabp_user;
EOF
```

---

**🎊 推荐立即执行PostgreSQL方案！**

**预计时间**: 15-20分钟  
**难度**: ⭐⭐ (中等)  
**成功率**: ⭐⭐⭐⭐⭐ (很高)

