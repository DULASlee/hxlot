-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MES生产线监控系统数据库表创建脚本
-- 创建日期: 2025-10-21
-- 用途: 创建ProductionLine、Equipment、SensorData三张核心表
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. 创建ProductionLine表（生产线）
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppProductionLines')
BEGIN
    CREATE TABLE [dbo].[AppProductionLines] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Name] NVARCHAR(256) NOT NULL,
        [Code] NVARCHAR(64) NOT NULL,
        [Description] NVARCHAR(1000) NULL,
        [Location] NVARCHAR(256) NULL,
        [Status] NVARCHAR(32) NOT NULL DEFAULT 'stopped',
        [Type] NVARCHAR(64) NULL,
        [Shift] NVARCHAR(64) NULL,
        [Supervisor] NVARCHAR(128) NULL,
        [WorkMode] NVARCHAR(64) NULL,
        [IsEnabled] BIT NOT NULL DEFAULT 1,
        [TenantId] UNIQUEIDENTIFIER NULL,
        
        -- KPI指标
        [TotalProduction] INT NOT NULL DEFAULT 0,
        [CurrentEfficiency] DECIMAL(5,2) NOT NULL DEFAULT 0,
        [EquipmentUtilization] DECIMAL(5,2) NOT NULL DEFAULT 0,
        [QualifiedRate] DECIMAL(5,2) NOT NULL DEFAULT 0,
        [DailyProduction] INT NOT NULL DEFAULT 0,
        [DailyTarget] INT NOT NULL DEFAULT 0,
        
        -- 审计字段
        [ExtraProperties] NVARCHAR(MAX) NULL,
        [ConcurrencyStamp] NVARCHAR(40) NULL,
        [CreationTime] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        [CreatorId] UNIQUEIDENTIFIER NULL,
        [LastModificationTime] DATETIME2(7) NULL,
        [LastModifierId] UNIQUEIDENTIFIER NULL,
        [IsDeleted] BIT NOT NULL DEFAULT 0,
        [DeleterId] UNIQUEIDENTIFIER NULL,
        [DeletionTime] DATETIME2(7) NULL,
        
        CONSTRAINT [UQ_ProductionLine_Code] UNIQUE ([Code])
    );
    
    -- 创建索引
    CREATE INDEX [IX_AppProductionLines_Name] ON [dbo].[AppProductionLines] ([Name]);
    CREATE INDEX [IX_AppProductionLines_Status] ON [dbo].[AppProductionLines] ([Status]);
    CREATE INDEX [IX_AppProductionLines_IsEnabled] ON [dbo].[AppProductionLines] ([IsEnabled]);
    CREATE INDEX [IX_AppProductionLines_TenantId] ON [dbo].[AppProductionLines] ([TenantId]);
    CREATE INDEX [IX_AppProductionLines_Status_IsEnabled] ON [dbo].[AppProductionLines] ([Status], [IsEnabled]);
    
    PRINT 'Table AppProductionLines created successfully.';
END
ELSE
BEGIN
    PRINT 'Table AppProductionLines already exists.';
END
GO

-- 2. 创建Equipment表（设备）
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppEquipments')
BEGIN
    CREATE TABLE [dbo].[AppEquipments] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [ProductionLineId] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(256) NOT NULL,
        [Code] NVARCHAR(64) NOT NULL,
        [Description] NVARCHAR(1000) NULL,
        [Type] NVARCHAR(64) NULL,
        [Manufacturer] NVARCHAR(128) NULL,
        [Model] NVARCHAR(128) NULL,
        [SerialNumber] NVARCHAR(128) NULL,
        [Location] NVARCHAR(256) NULL,
        [Status] NVARCHAR(32) NOT NULL DEFAULT 'stopped',
        [HealthStatus] NVARCHAR(32) NOT NULL DEFAULT 'healthy',
        [PLCAddress] NVARCHAR(128) NULL,
        [MaintenanceResponsible] NVARCHAR(128) NULL,
        [IsEnabled] BIT NOT NULL DEFAULT 1,
        [TenantId] UNIQUEIDENTIFIER NULL,
        
        -- 审计字段
        [ExtraProperties] NVARCHAR(MAX) NULL,
        [ConcurrencyStamp] NVARCHAR(40) NULL,
        [CreationTime] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        [CreatorId] UNIQUEIDENTIFIER NULL,
        [LastModificationTime] DATETIME2(7) NULL,
        [LastModifierId] UNIQUEIDENTIFIER NULL,
        [IsDeleted] BIT NOT NULL DEFAULT 0,
        [DeleterId] UNIQUEIDENTIFIER NULL,
        [DeletionTime] DATETIME2(7) NULL,
        
        CONSTRAINT [FK_AppEquipments_ProductionLine] FOREIGN KEY ([ProductionLineId]) 
            REFERENCES [dbo].[AppProductionLines] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_Equipment_Code] UNIQUE ([Code])
    );
    
    -- 创建索引
    CREATE INDEX [IX_AppEquipments_ProductionLineId] ON [dbo].[AppEquipments] ([ProductionLineId]);
    CREATE INDEX [IX_AppEquipments_Status] ON [dbo].[AppEquipments] ([Status]);
    CREATE INDEX [IX_AppEquipments_HealthStatus] ON [dbo].[AppEquipments] ([HealthStatus]);
    CREATE INDEX [IX_AppEquipments_IsEnabled] ON [dbo].[AppEquipments] ([IsEnabled]);
    CREATE INDEX [IX_AppEquipments_TenantId] ON [dbo].[AppEquipments] ([TenantId]);
    CREATE INDEX [IX_AppEquipments_ProductionLineId_Status] ON [dbo].[AppEquipments] ([ProductionLineId], [Status]);
    CREATE INDEX [IX_AppEquipments_Status_IsEnabled] ON [dbo].[AppEquipments] ([Status], [IsEnabled]);
    
    PRINT 'Table AppEquipments created successfully.';
END
ELSE
BEGIN
    PRINT 'Table AppEquipments already exists.';
END
GO

-- 3. 创建SensorData表（传感器数据）
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppSensorData')
BEGIN
    CREATE TABLE [dbo].[AppSensorData] (
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [ProductionLineId] UNIQUEIDENTIFIER NOT NULL,
        [EquipmentId] UNIQUEIDENTIFIER NULL,
        [SensorType] NVARCHAR(64) NOT NULL,
        [SensorName] NVARCHAR(256) NULL,
        [SensorCode] NVARCHAR(64) NULL,
        [Value] FLOAT NOT NULL,
        [Unit] NVARCHAR(32) NULL,
        [Quality] NVARCHAR(32) NOT NULL DEFAULT 'good',
        [Timestamp] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        [IsAlarm] BIT NOT NULL DEFAULT 0,
        [AlarmLevel] NVARCHAR(32) NULL,
        [AlarmMessage] NVARCHAR(1000) NULL,
        [DataSource] NVARCHAR(32) NULL,
        [RawData] NVARCHAR(4000) NULL,
        [TenantId] UNIQUEIDENTIFIER NULL,
        
        -- 审计字段（只有创建相关）
        [CreationTime] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        [CreatorId] UNIQUEIDENTIFIER NULL,
        
        CONSTRAINT [FK_AppSensorData_ProductionLine] FOREIGN KEY ([ProductionLineId]) 
            REFERENCES [dbo].[AppProductionLines] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AppSensorData_Equipment] FOREIGN KEY ([EquipmentId]) 
            REFERENCES [dbo].[AppEquipments] ([Id]) ON DELETE SET NULL
    );
    
    -- 创建索引
    CREATE INDEX [IX_AppSensorData_ProductionLineId] ON [dbo].[AppSensorData] ([ProductionLineId]);
    CREATE INDEX [IX_AppSensorData_EquipmentId] ON [dbo].[AppSensorData] ([EquipmentId]);
    CREATE INDEX [IX_AppSensorData_SensorType] ON [dbo].[AppSensorData] ([SensorType]);
    CREATE INDEX [IX_AppSensorData_Timestamp] ON [dbo].[AppSensorData] ([Timestamp] DESC);
    CREATE INDEX [IX_AppSensorData_IsAlarm] ON [dbo].[AppSensorData] ([IsAlarm]);
    CREATE INDEX [IX_AppSensorData_TenantId] ON [dbo].[AppSensorData] ([TenantId]);
    CREATE INDEX [IX_AppSensorData_ProductionLineId_Timestamp] ON [dbo].[AppSensorData] ([ProductionLineId], [Timestamp] DESC);
    CREATE INDEX [IX_AppSensorData_SensorType_Timestamp] ON [dbo].[AppSensorData] ([SensorType], [Timestamp] DESC);
    
    PRINT 'Table AppSensorData created successfully.';
END
ELSE
BEGIN
    PRINT 'Table AppSensorData already exists.';
END
GO

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
PRINT 'MES生产线监控系统表创建完成！';
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

