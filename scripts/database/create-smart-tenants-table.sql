-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SmartAbp企业级租户扩展表创建脚本
-- 文件: scripts/database/create-smart-tenants-table.sql
-- 版本: v1.0
-- 创建日期: 2025-10-24
-- 说明: 创建SM_SmartTenants表及相关索引和约束
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USE SmartAbp_Main;
GO

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 第1步：创建SM_SmartTenants表
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SM_SmartTenants]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SM_SmartTenants]
    (
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        -- 主键与关联
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [TenantId] UNIQUEIDENTIFIER NOT NULL,  -- FK → AbpTenants.Id

        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        -- 基本信息
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [Code] NVARCHAR(50) NOT NULL,          -- 租户代码（唯一）
        [Type] INT NOT NULL DEFAULT 1,         -- 租户类型（枚举：1=企业,2=个人,3=试用,4=合作伙伴,99=系统）
        [Status] INT NOT NULL DEFAULT 1,       -- 租户状态（枚举：1=正常,2=暂停,3=已过期,4=已禁用,5=待审核）
        [ParentId] UNIQUEIDENTIFIER NULL,      -- 父租户ID（树形结构）
        [IsActive] BIT NOT NULL DEFAULT 1,     -- 是否启用
        [Description] NVARCHAR(500) NULL,      -- 描述

        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        -- 订阅信息
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [SubscriptionPlanId] UNIQUEIDENTIFIER NULL,    -- 订阅计划ID
        [StartTime] DATETIME2(7) NULL,                 -- 订阅开始时间
        [EndTime] DATETIME2(7) NULL,                   -- 订阅结束时间

        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        -- 资源配额
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [MaxUserCount] INT NOT NULL DEFAULT 10,        -- 最大用户数
        [MaxStorageSize] BIGINT NOT NULL DEFAULT 1024, -- 最大存储空间(MB)
        [MaxApiCallsPerDay] INT NULL DEFAULT 10000,    -- 每日API调用限制

        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        -- 安全配置
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [ConnectionString] NVARCHAR(1000) NULL,        -- 独立数据库连接字符串（加密存储）
        [IsIsolatedDatabase] BIT NOT NULL DEFAULT 0,   -- 是否使用独立数据库

        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        -- 高级配置 (JSON)
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [FeatureConfig] NVARCHAR(MAX) NULL,            -- 功能配置 (JSON)
        [CustomSettings] NVARCHAR(MAX) NULL,           -- 自定义设置 (JSON)

        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        -- ABP审计字段（标准）
        -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [ExtraProperties] NVARCHAR(MAX) NULL,          -- ABP扩展属性 (JSON)
        [ConcurrencyStamp] NVARCHAR(40) NULL,          -- 并发控制
        [CreationTime] DATETIME2(7) NOT NULL DEFAULT GETDATE(),  -- 创建时间
        [CreatorId] UNIQUEIDENTIFIER NULL,             -- 创建人ID
        [LastModificationTime] DATETIME2(7) NULL,      -- 最后修改时间
        [LastModifierId] UNIQUEIDENTIFIER NULL,        -- 最后修改人ID
        [IsDeleted] BIT NOT NULL DEFAULT 0,            -- 软删除标记
        [DeleterId] UNIQUEIDENTIFIER NULL,             -- 删除人ID
        [DeletionTime] DATETIME2(7) NULL               -- 删除时间
    );

    PRINT '✅ 表 SM_SmartTenants 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 表 SM_SmartTenants 已存在，跳过创建';
END
GO

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 第2步：创建唯一索引
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 唯一索引：TenantId
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SmartTenants_TenantId')
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [IX_SmartTenants_TenantId]
        ON [dbo].[SM_SmartTenants]([TenantId]);
    PRINT '✅ 索引 IX_SmartTenants_TenantId 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 索引 IX_SmartTenants_TenantId 已存在';
END
GO

-- 唯一索引：Code
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SmartTenants_Code')
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [IX_SmartTenants_Code]
        ON [dbo].[SM_SmartTenants]([Code]);
    PRINT '✅ 索引 IX_SmartTenants_Code 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 索引 IX_SmartTenants_Code 已存在';
END
GO

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 第3步：创建普通索引
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 索引：ParentId（树形结构查询）
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SmartTenants_ParentId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_SmartTenants_ParentId]
        ON [dbo].[SM_SmartTenants]([ParentId])
        WHERE [ParentId] IS NOT NULL;
    PRINT '✅ 索引 IX_SmartTenants_ParentId 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 索引 IX_SmartTenants_ParentId 已存在';
END
GO

-- 索引：Status + Type（常用查询条件）
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SmartTenants_Status_Type')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_SmartTenants_Status_Type]
        ON [dbo].[SM_SmartTenants]([Status], [Type])
        INCLUDE ([Code], [IsActive]);
    PRINT '✅ 索引 IX_SmartTenants_Status_Type 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 索引 IX_SmartTenants_Status_Type 已存在';
END
GO

-- 索引：IsDeleted（软删除过滤）
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SmartTenants_IsDeleted')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_SmartTenants_IsDeleted]
        ON [dbo].[SM_SmartTenants]([IsDeleted])
        WHERE [IsDeleted] = 0;
    PRINT '✅ 索引 IX_SmartTenants_IsDeleted 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 索引 IX_SmartTenants_IsDeleted 已存在';
END
GO

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 第4步：创建外键约束
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 外键：TenantId → AbpTenants.Id（级联删除）
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SmartTenants_AbpTenants')
BEGIN
    ALTER TABLE [dbo].[SM_SmartTenants]
        ADD CONSTRAINT [FK_SmartTenants_AbpTenants]
        FOREIGN KEY ([TenantId])
        REFERENCES [dbo].[AbpTenants]([Id])
        ON DELETE CASCADE;
    PRINT '✅ 外键约束 FK_SmartTenants_AbpTenants 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 外键约束 FK_SmartTenants_AbpTenants 已存在';
END
GO

-- 外键：ParentId → SM_SmartTenants.Id（自引用，禁止级联）
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SmartTenants_Parent')
BEGIN
    ALTER TABLE [dbo].[SM_SmartTenants]
        ADD CONSTRAINT [FK_SmartTenants_Parent]
        FOREIGN KEY ([ParentId])
        REFERENCES [dbo].[SM_SmartTenants]([Id])
        ON DELETE NO ACTION;  -- 防止循环级联
    PRINT '✅ 外键约束 FK_SmartTenants_Parent 创建成功';
END
ELSE
BEGIN
    PRINT '⏭️ 外键约束 FK_SmartTenants_Parent 已存在';
END
GO

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 第5步：验证表结构
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRINT '';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT '✅ SM_SmartTenants 表结构验证';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

-- 检查字段数量
DECLARE @ColumnCount INT;
SELECT @ColumnCount = COUNT(*)
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SM_SmartTenants';
PRINT '字段数量: ' + CAST(@ColumnCount AS VARCHAR(10));

-- 检查索引数量
DECLARE @IndexCount INT;
SELECT @IndexCount = COUNT(*)
FROM sys.indexes
WHERE object_id = OBJECT_ID('SM_SmartTenants') AND name IS NOT NULL;
PRINT '索引数量: ' + CAST(@IndexCount AS VARCHAR(10));

-- 检查外键数量
DECLARE @FKCount INT;
SELECT @FKCount = COUNT(*)
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('SM_SmartTenants');
PRINT '外键数量: ' + CAST(@FKCount AS VARCHAR(10));

PRINT '';
PRINT '✅ 数据库表创建完成！';
PRINT '下一步: 访问 http://localhost:9001/lowcode/layer1';
PRINT '        在数据库内省中选择 SM_SmartTenants 表';
PRINT '        点击生成按钮自动生成前后端代码';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
GO

