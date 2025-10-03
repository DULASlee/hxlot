-- SmartAbp SQL Server 初始化脚本
-- 自动执行：docker-compose启动时自动运行

USE [master];
GO

-- 创建数据库（如果不存在）
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SmartAbp')
BEGIN
    CREATE DATABASE [SmartAbp]
    COLLATE Latin1_General_CI_AS;
END
GO

USE [SmartAbp];
GO

-- 创建数据库信息表
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[__DbInfo]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[__DbInfo](
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [Version] NVARCHAR(50) NOT NULL,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        [Description] NVARCHAR(MAX)
    );
END
GO

-- 插入初始化信息
IF NOT EXISTS (SELECT * FROM [dbo].[__DbInfo])
BEGIN
    INSERT INTO [dbo].[__DbInfo] ([Version], [Description])
    VALUES ('1.0.0', 'SmartAbp 初始数据库 - SQL Server');
END
GO

-- 输出欢迎信息
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '🚀 SmartAbp SQL Server 数据库初始化完成！';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '📊 数据库: SmartAbp';
PRINT '👤 用户: sa';
PRINT '🔗 连接: Server=localhost;Database=SmartAbp;User Id=sa;Password=SmartAbp@2025;TrustServerCertificate=True';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
GO

