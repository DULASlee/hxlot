# SmartAbp 低代码引擎数据库架构设计方案 v1.0

**文档版本**: v1.0
**创建日期**: 2025-10-17
**设计理念**: 企业级、可扩展、高性能、完整覆盖低代码引擎所有场景
**目标**: 支持业务逻辑、UI配置、表单设计、页面设计、流程编排、业务规则

---

## 📋 目录

1. [架构总览](#架构总览)
2. [核心表设计](#核心表设计)
3. [实体类定义](#实体类定义)
4. [关系映射](#关系映射)
5. [索引优化](#索引优化)
6. [性能优化策略](#性能优化策略)
7. [实施计划](#实施计划)

---

## 一、架构总览

### 1.1 数据库架构分层

```yaml
┌─────────────────────────────────────────────────────────────────┐
│        SmartAbp LowCode Engine Database Architecture v1.0       │
└─────────────────────────────────────────────────────────────────┘

【Layer 1】核心元数据层（业务真理源 - SSOT）
  ├─ LC_Modules                   # 模块元数据
  ├─ LC_Entities                  # 实体元数据
  ├─ LC_EntityProperties          # 实体属性元数据
  ├─ LC_EntityRelationships       # 实体关系元数据
  ├─ LC_EntityIndexes             # 实体索引元数据
  └─ LC_EntityConstraints         # 实体约束元数据

【Layer 2】业务规则层（验证和逻辑）
  ├─ LC_ValidationRules           # 验证规则
  ├─ LC_BusinessRules             # 业务规则
  ├─ LC_PermissionRules           # 权限规则
  └─ LC_FieldPermissions          # 字段级权限

【Layer 3】UI配置层（前端特定配置）
  ├─ LC_FormDesigns               # 表单设计配置
  ├─ LC_FormFieldRules            # form-create规则
  ├─ LC_FieldEffects              # 字段联动效果
  ├─ LC_PageDesigns               # 页面设计配置
  ├─ LC_PageComponents            # 页面组件配置
  ├─ LC_PageEvents                # 页面事件配置
  └─ LC_UIThemes                  # UI主题配置

【Layer 4】流程编排层（工作流配置）
  ├─ LC_Workflows                 # 工作流定义
  ├─ LC_WorkflowNodes             # 流程节点配置
  ├─ LC_WorkflowEdges             # 流程连线配置
  ├─ LC_WorkflowVariables         # 流程变量
  └─ LC_WorkflowInstances         # 流程实例（运行时）

【Layer 5】代码生成层（生成历史和模板）
  ├─ LC_GenerationSessions        # 生成会话
  ├─ LC_GeneratedFiles            # 生成的文件
  ├─ LC_CodeTemplates             # 代码模板
  └─ LC_GenerationHistory         # 生成历史

【Layer 6】版本管理层（配置版本控制）
  ├─ LC_ConfigVersions            # 配置版本
  ├─ LC_ConfigSnapshots           # 配置快照
  └─ LC_ConfigChangeLogs          # 变更日志

【Layer 7】协作层（多人协作）
  ├─ LC_DesignLocks               # 设计锁（防止冲突）
  ├─ LC_DesignComments            # 设计评论
  └─ LC_DesignReviews             # 设计审查
```

### 1.2 ER 图概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    核心实体关系图（简化版）                      │
└─────────────────────────────────────────────────────────────────┘

LC_Modules (模块)
    │
    │ 1:N
    ↓
LC_Entities (实体)
    │
    ├─ 1:N → LC_EntityProperties (属性)
    │           │
    │           ├─ 1:N → LC_ValidationRules (验证规则)
    │           └─ 1:N → LC_FieldPermissions (字段权限)
    │
    ├─ 1:N → LC_EntityRelationships (关系)
    ├─ 1:N → LC_EntityIndexes (索引)
    ├─ 1:N → LC_BusinessRules (业务规则)
    │
    ├─ 1:1 → LC_FormDesigns (表单设计)
    │           │
    │           ├─ 1:N → LC_FormFieldRules (字段规则)
    │           └─ 1:N → LC_FieldEffects (字段联动)
    │
    ├─ 1:N → LC_PageDesigns (页面设计)
    │           │
    │           ├─ 1:N → LC_PageComponents (页面组件)
    │           └─ 1:N → LC_PageEvents (页面事件)
    │
    └─ 1:N → LC_Workflows (工作流)
                │
                ├─ 1:N → LC_WorkflowNodes (流程节点)
                ├─ 1:N → LC_WorkflowEdges (流程连线)
                └─ 1:N → LC_WorkflowVariables (流程变量)
```

---

## 二、核心表设计

### 2.1 Layer 1：核心元数据层

#### 表1：LC_Modules（模块元数据）

```sql
CREATE TABLE LC_Modules (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 业务字段
    SystemName NVARCHAR(100) NOT NULL,           -- 系统名称（如：SmartConstruction）
    ModuleName NVARCHAR(100) NOT NULL,           -- 模块名称（如：ProjectManagement）
    DisplayName NVARCHAR(200) NOT NULL,          -- 显示名称
    Description NVARCHAR(MAX),                   -- 描述
    Namespace NVARCHAR(200) NOT NULL,            -- 命名空间
    Version NVARCHAR(20) NOT NULL DEFAULT '1.0.0',
    ArchitecturePattern NVARCHAR(50) NOT NULL DEFAULT 'Crud',  -- Crud | DDD | CQRS
    Author NVARCHAR(100),

    -- 数据库配置（JSON）
    DatabaseConfig NVARCHAR(MAX),                -- JSON: { provider, schema, connectionString }

    -- 前端配置（JSON）
    FrontendConfig NVARCHAR(MAX),                -- JSON: { parentId, routePrefix }

    -- 特性管理（JSON）
    FeatureManagement NVARCHAR(MAX),             -- JSON: { isEnabled, defaultPolicy }

    -- 权限配置（JSON）
    PermissionConfig NVARCHAR(MAX),              -- JSON: { groups, customActions }

    -- 菜单配置（JSON）
    MenuConfig NVARCHAR(MAX),                    -- JSON: [ { id, title, path, icon } ]

    -- 依赖关系
    Dependencies NVARCHAR(MAX),                  -- JSON: [ "ModuleName1", "ModuleName2" ]

    -- 代码生成配置
    GenerateMobilePages BIT NOT NULL DEFAULT 0,

    -- 状态字段
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft | Published | Archived
    IsActive BIT NOT NULL DEFAULT 1,

    -- 版本管理
    CurrentVersionId UNIQUEIDENTIFIER,           -- 指向 LC_ConfigVersions

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_Modules_SystemName_ModuleName UNIQUE (SystemName, ModuleName, TenantId),
    INDEX IX_LC_Modules_Status (Status),
    INDEX IX_LC_Modules_TenantId (TenantId)
);
```

**字段说明**：
- `SystemName` + `ModuleName`：唯一标识一个模块
- `DatabaseConfig`：存储数据库配置（JSON格式，灵活扩展）
- `Status`：模块状态（草稿/已发布/已归档）
- `CurrentVersionId`：指向当前激活的版本

---

#### 表2：LC_Entities（实体元数据）

```sql
CREATE TABLE LC_Entities (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    ModuleId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (ModuleId) REFERENCES LC_Modules(Id) ON DELETE CASCADE,

    -- 业务字段
    Name NVARCHAR(100) NOT NULL,                 -- 实体名称（如：Order）
    DisplayName NVARCHAR(200) NOT NULL,          -- 显示名称
    Description NVARCHAR(MAX),
    PluralName NVARCHAR(100),                    -- 复数名称（如：Orders）

    -- 数据库映射
    TableName NVARCHAR(100) NOT NULL,            -- 数据库表名
    Schema NVARCHAR(50) NOT NULL DEFAULT 'dbo',

    -- 实体类型
    IsAggregateRoot BIT NOT NULL DEFAULT 1,
    BaseClass NVARCHAR(100),                     -- 基类（如：AuditedAggregateRoot）
    Interfaces NVARCHAR(MAX),                    -- JSON: [ "ISoftDelete", "IMultiTenant" ]

    -- 特性标记
    IsAudited BIT NOT NULL DEFAULT 1,
    IsSoftDelete BIT NOT NULL DEFAULT 1,
    IsMultiTenant BIT NOT NULL DEFAULT 0,
    IsCacheable BIT NOT NULL DEFAULT 0,

    -- 图标和标签
    Icon NVARCHAR(50),                           -- 图标名称
    Color NVARCHAR(20),                          -- 颜色代码
    Tags NVARCHAR(MAX),                          -- JSON: [ "tag1", "tag2" ]

    -- 排序和分组
    DisplayOrder INT NOT NULL DEFAULT 0,
    GroupName NVARCHAR(100),

    -- 版本信息
    Version NVARCHAR(20) NOT NULL DEFAULT '1.0.0',

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_Entities_ModuleId_Name UNIQUE (ModuleId, Name),
    INDEX IX_LC_Entities_TableName (TableName),
    INDEX IX_LC_Entities_DisplayOrder (DisplayOrder)
);
```

**字段说明**：
- `ModuleId`：所属模块
- `TableName` + `Schema`：数据库表映射
- `IsAggregateRoot`：是否为聚合根（DDD）
- `BaseClass`：ABP基类选择

---

#### 表3：LC_EntityProperties（实体属性元数据）⭐核心表

```sql
CREATE TABLE LC_EntityProperties (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 基础字段
    Name NVARCHAR(100) NOT NULL,                 -- 属性名称（如：OrderNo）
    DisplayName NVARCHAR(200) NOT NULL,          -- 显示名称
    Description NVARCHAR(MAX),                   -- 描述
    HelpText NVARCHAR(500),                      -- 帮助文本

    -- 类型定义
    Type NVARCHAR(50) NOT NULL,                  -- C#类型（如：string, int, DateTime）
    IsNullable BIT NOT NULL DEFAULT 0,
    DefaultValue NVARCHAR(MAX),                  -- 默认值（字符串表示）

    -- 数据库映射
    ColumnName NVARCHAR(100) NOT NULL,           -- 数据库列名
    ColumnType NVARCHAR(50) NOT NULL,            -- 数据库类型（如：NVARCHAR(50)）

    -- 属性约束
    IsKey BIT NOT NULL DEFAULT 0,                -- 是否主键
    IsRequired BIT NOT NULL DEFAULT 0,           -- 是否必填
    IsUnique BIT NOT NULL DEFAULT 0,             -- 是否唯一
    IsIndexed BIT NOT NULL DEFAULT 0,            -- 是否索引

    -- 特殊字段标记
    IsAuditField BIT NOT NULL DEFAULT 0,         -- 是否审计字段
    IsSoftDeleteField BIT NOT NULL DEFAULT 0,    -- 是否软删除字段
    IsTenantField BIT NOT NULL DEFAULT 0,        -- 是否租户字段
    IsForeignKey BIT NOT NULL DEFAULT 0,         -- 是否外键

    -- 字符串类型约束
    MaxLength INT,
    MinLength INT,
    Pattern NVARCHAR(500),                       -- 正则表达式

    -- 数值类型约束
    Precision INT,
    Scale INT,
    MinValue DECIMAL(18,4),
    MaxValue DECIMAL(18,4),

    -- 枚举类型
    IsEnum BIT NOT NULL DEFAULT 0,
    EnumType NVARCHAR(100),                      -- 枚举类型名称
    EnumValues NVARCHAR(MAX),                    -- JSON: [{ name, value, displayName }]

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🔥 前端UI配置（核心扩展）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    -- UI可见性控制
    IsVisible BIT NOT NULL DEFAULT 1,            -- 全局可见性
    ListVisible BIT NOT NULL DEFAULT 1,          -- 列表页可见
    FormVisible BIT NOT NULL DEFAULT 1,          -- 表单页可见
    DetailVisible BIT NOT NULL DEFAULT 1,        -- 详情页可见

    -- UI状态控制
    IsReadonly BIT NOT NULL DEFAULT 0,           -- 静态只读
    IsDisabled BIT NOT NULL DEFAULT 0,           -- 静态禁用

    -- UI控件类型（🔥 关键字段）
    ControlType NVARCHAR(50) NOT NULL DEFAULT 'input',
    -- 可选值：input | textarea | number | select | checkbox | switch |
    --        date | datetime | time | upload | image | editor | cascader |
    --        tree-select | color-picker | rate | slider | autocomplete

    -- UI控件配置（JSON）
    ControlConfig NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "placeholder": "请输入订单号",
    --   "clearable": true,
    --   "size": "default",
    --   "options": [...],        // select/radio的选项
    --   "multiple": false,       // 是否多选
    --   "showWordLimit": true,   // 显示字数限制
    --   "rows": 4                // textarea行数
    -- }

    -- 列表配置
    Sortable BIT NOT NULL DEFAULT 0,             -- 是否可排序
    Filterable BIT NOT NULL DEFAULT 0,           -- 是否可筛选
    Searchable BIT NOT NULL DEFAULT 0,           -- 是否可搜索
    ColumnWidth INT,                             -- 列宽（像素）
    ColumnAlign NVARCHAR(20) DEFAULT 'left',     -- 对齐方式：left | center | right
    ColumnFixed NVARCHAR(20),                    -- 固定列：left | right

    -- 表单配置
    FormRow INT NOT NULL DEFAULT 1,              -- 表单行号
    FormCol INT NOT NULL DEFAULT 12,             -- 表单列宽（1-24）
    FormRequired BIT NOT NULL DEFAULT 0,         -- 表单必填
    FormPlaceholder NVARCHAR(200),               -- 表单占位符

    -- 显示格式化
    DisplayFormat NVARCHAR(100),                 -- 显示格式（如：yyyy-MM-dd HH:mm:ss）
    ValueFormat NVARCHAR(100),                   -- 值格式
    Prefix NVARCHAR(50),                         -- 前缀（如：￥）
    Suffix NVARCHAR(50),                         -- 后缀（如：元）

    -- 分组和排序
    DisplayOrder INT NOT NULL DEFAULT 0,         -- 显示顺序
    GroupName NVARCHAR(100),                     -- 分组名称

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🔥 数据源配置（动态下拉等）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    DataSourceType NVARCHAR(50),                 -- 数据源类型：static | api | dict | sql
    DataSourceConfig NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "type": "api",
    --   "url": "/api/app/products/lookup",
    --   "method": "GET",
    --   "labelField": "name",
    --   "valueField": "id",
    --   "params": { "status": "active" }
    -- }
    -- 或
    -- {
    --   "type": "dict",
    --   "dictCode": "ORDER_STATUS"
    -- }

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- ABP审计字段
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_EntityProperties_EntityId_Name UNIQUE (EntityId, Name),
    INDEX IX_LC_EntityProperties_ControlType (ControlType),
    INDEX IX_LC_EntityProperties_DisplayOrder (DisplayOrder),
    INDEX IX_LC_EntityProperties_IsKey (IsKey),
    INDEX IX_LC_EntityProperties_IsForeignKey (IsForeignKey)
);
```

**🔥 核心设计理念**：
1. **一表多用**：同时支持后端Entity定义和前端UI配置
2. **ControlType**：决定前端渲染什么控件
3. **ControlConfig**：JSON灵活配置，支持任意扩展
4. **DataSourceConfig**：支持静态/API/字典/SQL多种数据源

---

#### 表4：LC_EntityRelationships（实体关系元数据）

```sql
CREATE TABLE LC_EntityRelationships (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    SourceEntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (SourceEntityId) REFERENCES LC_Entities(Id) ON DELETE NO ACTION,

    TargetEntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (TargetEntityId) REFERENCES LC_Entities(Id) ON DELETE NO ACTION,

    -- 关系定义
    Name NVARCHAR(100) NOT NULL,                 -- 关系名称
    DisplayName NVARCHAR(200) NOT NULL,
    Type NVARCHAR(50) NOT NULL,                  -- OneToOne | OneToMany | ManyToMany

    -- 属性映射
    SourceProperty NVARCHAR(100),                -- 源实体属性
    TargetProperty NVARCHAR(100),                -- 目标实体属性
    SourceNavigationProperty NVARCHAR(100),      -- 源导航属性
    TargetNavigationProperty NVARCHAR(100),      -- 目标导航属性
    ForeignKeyProperty NVARCHAR(100),            -- 外键属性

    -- 多对多配置
    JoinTableName NVARCHAR(100),                 -- 中间表名称
    JoinTableSchema NVARCHAR(50),                -- 中间表Schema

    -- 级联操作
    OnDeleteBehavior NVARCHAR(50) NOT NULL DEFAULT 'Cascade',  -- Cascade | Restrict | SetNull | NoAction
    IsRequired BIT NOT NULL DEFAULT 0,
    IsForeignKeyRequired BIT NOT NULL DEFAULT 1,

    -- UI配置
    IsVisible BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_EntityRelationships_SourceEntityId (SourceEntityId),
    INDEX IX_LC_EntityRelationships_TargetEntityId (TargetEntityId),
    INDEX IX_LC_EntityRelationships_Type (Type)
);
```

---

#### 表5：LC_EntityIndexes（实体索引元数据）

```sql
CREATE TABLE LC_EntityIndexes (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 索引定义
    Name NVARCHAR(100) NOT NULL,                 -- 索引名称
    Columns NVARCHAR(MAX) NOT NULL,              -- JSON: [ "Column1", "Column2" ]
    IsUnique BIT NOT NULL DEFAULT 0,
    IsClustered BIT NOT NULL DEFAULT 0,
    IncludeColumns NVARCHAR(MAX),                -- JSON: [ "Column3", "Column4" ]
    FilterCondition NVARCHAR(500),               -- WHERE条件
    Description NVARCHAR(MAX),

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_EntityIndexes_EntityId (EntityId)
);
```

---

#### 表6：LC_EntityConstraints（实体约束元数据）

```sql
CREATE TABLE LC_EntityConstraints (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 约束定义
    Name NVARCHAR(100) NOT NULL,                 -- 约束名称
    Type NVARCHAR(50) NOT NULL,                  -- PrimaryKey | ForeignKey | Unique | Check | Default
    Columns NVARCHAR(MAX) NOT NULL,              -- JSON: [ "Column1", "Column2" ]
    Expression NVARCHAR(MAX),                    -- Check约束表达式

    -- 外键约束
    ReferencedTable NVARCHAR(100),
    ReferencedSchema NVARCHAR(50),
    ReferencedColumns NVARCHAR(MAX),             -- JSON: [ "Column1" ]
    OnDelete NVARCHAR(50),                       -- CASCADE | SET NULL | NO ACTION
    OnUpdate NVARCHAR(50),

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_EntityConstraints_EntityId (EntityId),
    INDEX IX_LC_EntityConstraints_Type (Type)
);
```

---

### 2.2 Layer 2：业务规则层

#### 表7：LC_ValidationRules（验证规则）

```sql
CREATE TABLE LC_ValidationRules (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键（可以关联到Property或Entity）
    PropertyId UNIQUEIDENTIFIER,
    FOREIGN KEY (PropertyId) REFERENCES LC_EntityProperties(Id) ON DELETE CASCADE,

    EntityId UNIQUEIDENTIFIER,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 验证规则定义
    Name NVARCHAR(100) NOT NULL,                 -- 规则名称
    Type NVARCHAR(50) NOT NULL,
    -- 可选值：required | minLength | maxLength | min | max | pattern |
    --        email | url | phone | custom | async

    -- 规则配置
    Value NVARCHAR(MAX),                         -- 规则值（如：maxLength的值为50）
    Message NVARCHAR(500) NOT NULL,              -- 错误消息
    MessageTemplate NVARCHAR(500),               -- 消息模板（支持{0}占位符）

    -- 条件验证
    Condition NVARCHAR(MAX),                     -- 条件表达式（如：Status === 'Active'）
    TriggerEvent NVARCHAR(50) DEFAULT 'change',  -- 触发事件：change | blur | submit

    -- 自定义验证
    ValidatorName NVARCHAR(100),                 -- 自定义验证器名称
    ValidatorConfig NVARCHAR(MAX),               -- JSON配置

    -- 异步验证
    IsAsync BIT NOT NULL DEFAULT 0,
    AsyncApiUrl NVARCHAR(500),                   -- 异步验证API
    AsyncApiMethod NVARCHAR(10) DEFAULT 'POST',

    -- 优先级和状态
    Priority INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_ValidationRules_PropertyId (PropertyId),
    INDEX IX_LC_ValidationRules_EntityId (EntityId),
    INDEX IX_LC_ValidationRules_Type (Type),
    INDEX IX_LC_ValidationRules_Priority (Priority)
);
```

---

#### 表8：LC_BusinessRules（业务规则）

```sql
CREATE TABLE LC_BusinessRules (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 规则定义
    Name NVARCHAR(100) NOT NULL,                 -- 规则名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 规则类型
    Type NVARCHAR(50) NOT NULL,
    -- 可选值：validation | calculation | constraint | trigger | workflow

    -- 规则条件和动作
    Condition NVARCHAR(MAX) NOT NULL,            -- 条件表达式（如：TotalAmount > 10000）
    Action NVARCHAR(MAX) NOT NULL,               -- 动作表达式（如：ApplyDiscount(0.1)）

    -- 触发时机
    TriggerOn NVARCHAR(50) NOT NULL,             -- BeforeCreate | AfterCreate | BeforeUpdate | AfterUpdate | BeforeDelete

    -- 错误处理
    ErrorMessage NVARCHAR(500),                  -- 失败时的错误消息
    ErrorLevel NVARCHAR(20) DEFAULT 'Error',     -- Error | Warning | Info

    -- 执行配置
    Priority INT NOT NULL DEFAULT 0,             -- 优先级（数字越小越先执行）
    IsActive BIT NOT NULL DEFAULT 1,
    IsAsync BIT NOT NULL DEFAULT 0,

    -- 脚本配置（高级功能）
    ScriptLanguage NVARCHAR(20),                 -- CSharp | JavaScript | Python
    ScriptCode NVARCHAR(MAX),                    -- 脚本代码

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_BusinessRules_EntityId (EntityId),
    INDEX IX_LC_BusinessRules_Type (Type),
    INDEX IX_LC_BusinessRules_TriggerOn (TriggerOn),
    INDEX IX_LC_BusinessRules_Priority (Priority)
);
```

---

#### 表9：LC_PermissionRules（权限规则）

```sql
CREATE TABLE LC_PermissionRules (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 权限定义
    PermissionName NVARCHAR(200) NOT NULL,       -- 权限名称（如：SmartAbp.Orders.Create）
    Operation NVARCHAR(50) NOT NULL,             -- Create | Read | Update | Delete | Custom
    Roles NVARCHAR(MAX),                         -- JSON: [ "Admin", "Manager" ]
    Users NVARCHAR(MAX),                         -- JSON: [ "UserId1", "UserId2" ]

    -- 条件权限
    Condition NVARCHAR(MAX),                     -- 条件表达式（如：CreatorId == CurrentUserId）

    -- 字段级权限
    AllowedFields NVARCHAR(MAX),                 -- JSON: [ "Field1", "Field2" ]
    DeniedFields NVARCHAR(MAX),                  -- JSON: [ "Field3", "Field4" ]

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,
    Priority INT NOT NULL DEFAULT 0,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_PermissionRules_EntityId (EntityId),
    INDEX IX_LC_PermissionRules_Operation (Operation),
    INDEX IX_LC_PermissionRules_PermissionName (PermissionName)
);
```

---

#### 表10：LC_FieldPermissions（字段级权限）

```sql
CREATE TABLE LC_FieldPermissions (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    PropertyId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (PropertyId) REFERENCES LC_EntityProperties(Id) ON DELETE CASCADE,

    PermissionRuleId UNIQUEIDENTIFIER,
    FOREIGN KEY (PermissionRuleId) REFERENCES LC_PermissionRules(Id) ON DELETE CASCADE,

    -- 权限定义
    Operation NVARCHAR(50) NOT NULL,             -- Read | Update
    Roles NVARCHAR(MAX),                         -- JSON: [ "Admin" ]
    Users NVARCHAR(MAX),                         -- JSON: [ "UserId1" ]
    Condition NVARCHAR(MAX),                     -- 条件表达式

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_FieldPermissions_PropertyId (PropertyId),
    INDEX IX_LC_FieldPermissions_PermissionRuleId (PermissionRuleId)
);
```

---

### 2.3 Layer 3：UI配置层（🔥核心层）

#### 表11：LC_FormDesigns（表单设计配置）⭐核心表

```sql
CREATE TABLE LC_FormDesigns (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 基础信息
    Name NVARCHAR(100) NOT NULL,                 -- 表单名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 表单类型
    FormType NVARCHAR(50) NOT NULL DEFAULT 'create',  -- create | edit | view | search

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🔥 form-create 完整配置（核心）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    FormCreateRules NVARCHAR(MAX),
    -- JSON示例：
    -- [
    --   {
    --     "type": "input",
    --     "field": "orderNo",
    --     "title": "订单号",
    --     "value": "",
    --     "props": {
    --       "placeholder": "请输入订单号",
    --       "clearable": true
    --     },
    --     "validate": [
    --       { "type": "required", "message": "订单号不能为空" }
    --     ],
    --     "col": { "span": 12 }
    --   }
    -- ]

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 表单全局配置
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    GlobalConfig NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "size": "default",
    --   "labelPosition": "right",
    --   "labelWidth": 100,
    --   "inline": false,
    --   "showResetButton": true,
    --   "showSubmitButton": true,
    --   "submitButtonText": "提交",
    --   "resetButtonText": "重置"
    -- }

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 布局配置
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Layout NVARCHAR(50) NOT NULL DEFAULT 'vertical',  -- vertical | horizontal | inline
    ColumnCount INT NOT NULL DEFAULT 2,           -- 列数（1-4）
    Gutter INT NOT NULL DEFAULT 20,               -- 列间距

    -- 分组配置
    FieldGroups NVARCHAR(MAX),
    -- JSON示例：
    -- [
    --   {
    --     "id": "basic",
    --     "name": "基本信息",
    --     "title": "基本信息",
    --     "collapsible": true,
    --     "collapsed": false,
    --     "fields": ["orderNo", "orderDate", "customerId"]
    --   }
    -- ]

    -- 验证策略
    ValidationStrategy NVARCHAR(50) DEFAULT 'immediate',  -- immediate | onBlur | onSubmit

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 样式配置
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    CustomCSS NVARCHAR(MAX),                      -- 自定义CSS
    CustomClass NVARCHAR(200),                    -- 自定义Class

    -- 版本管理
    Version INT NOT NULL DEFAULT 1,
    IsPublished BIT NOT NULL DEFAULT 0,
    PublishedAt DATETIME2,

    -- 状态
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft',  -- Draft | Published | Archived

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_FormDesigns_EntityId_FormType UNIQUE (EntityId, FormType, TenantId),
    INDEX IX_LC_FormDesigns_Status (Status),
    INDEX IX_LC_FormDesigns_IsPublished (IsPublished)
);
```

**🔥 核心设计理念**：
1. **FormCreateRules**：完整保存form-create的规则配置（JSON）
2. **支持多表单**：同一个Entity可以有多个表单设计（create/edit/view/search）
3. **版本管理**：支持草稿和发布版本

---

#### 表12：LC_FormFieldRules（表单字段规则）

```sql
CREATE TABLE LC_FormFieldRules (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    FormDesignId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (FormDesignId) REFERENCES LC_FormDesigns(Id) ON DELETE CASCADE,

    PropertyId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (PropertyId) REFERENCES LC_EntityProperties(Id) ON DELETE CASCADE,

    -- 字段配置
    FieldName NVARCHAR(100) NOT NULL,            -- 字段名称

    -- form-create rule（单个字段的完整配置）
    FormCreateRule NVARCHAR(MAX) NOT NULL,
    -- JSON示例：
    -- {
    --   "type": "select",
    --   "field": "status",
    --   "title": "订单状态",
    --   "value": "",
    --   "props": {
    --     "options": [
    --       { "label": "待支付", "value": "Pending" },
    --       { "label": "已支付", "value": "Paid" }
    --     ]
    --   }
    -- }

    -- 显示顺序
    DisplayOrder INT NOT NULL DEFAULT 0,

    -- 状态
    IsVisible BIT NOT NULL DEFAULT 1,
    IsReadonly BIT NOT NULL DEFAULT 0,
    IsDisabled BIT NOT NULL DEFAULT 0,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_FormFieldRules_FormDesignId (FormDesignId),
    INDEX IX_LC_FormFieldRules_PropertyId (PropertyId),
    INDEX IX_LC_FormFieldRules_DisplayOrder (DisplayOrder)
);
```

---

#### 表13：LC_FieldEffects（字段联动效果）⭐核心表

```sql
CREATE TABLE LC_FieldEffects (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    FormDesignId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (FormDesignId) REFERENCES LC_FormDesigns(Id) ON DELETE CASCADE,

    -- 联动定义
    Name NVARCHAR(100) NOT NULL,                 -- 联动名称
    Description NVARCHAR(MAX),

    -- 源字段（触发字段）
    SourceField NVARCHAR(100) NOT NULL,          -- 源字段名称
    EventType NVARCHAR(50) NOT NULL DEFAULT 'change',  -- change | blur | focus | input

    -- 目标字段（被影响字段）
    TargetFields NVARCHAR(MAX) NOT NULL,         -- JSON: [ "field1", "field2" ]

    -- 效果类型
    EffectType NVARCHAR(50) NOT NULL,
    -- 可选值：show | hide | enable | disable | required | optional |
    --        setValue | options | validate | custom

    -- 触发条件
    Condition NVARCHAR(MAX) NOT NULL,
    -- 表达式示例：
    -- - "value === 'Paid'"
    -- - "value > 10000"
    -- - "value in ['Option1', 'Option2']"

    -- 效果配置
    EffectConfig NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "value": "AutoFilled",              // setValue时的值
    --   "options": [...],                   // options时的选项
    --   "validate": {...},                  // validate时的规则
    --   "customScript": "..."               // custom时的脚本
    -- }

    -- 执行优先级
    Priority INT NOT NULL DEFAULT 0,

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_FieldEffects_FormDesignId (FormDesignId),
    INDEX IX_LC_FieldEffects_SourceField (SourceField),
    INDEX IX_LC_FieldEffects_EffectType (EffectType),
    INDEX IX_LC_FieldEffects_Priority (Priority)
);
```

**🔥 核心设计理念**：
1. **字段联动是低代码引擎的核心功能**
2. **支持复杂的联动逻辑**：一个字段可以影响多个字段
3. **支持多种效果类型**：显示/隐藏、启用/禁用、设置值、动态选项等

---

#### 表14：LC_PageDesigns（页面设计配置）

```sql
CREATE TABLE LC_PageDesigns (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    ModuleId UNIQUEIDENTIFIER,
    FOREIGN KEY (ModuleId) REFERENCES LC_Modules(Id) ON DELETE CASCADE,

    -- 基础信息
    Name NVARCHAR(100) NOT NULL,                 -- 页面名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 页面类型
    PageType NVARCHAR(50) NOT NULL,
    -- 可选值：list | form | detail | dashboard | custom

    -- 路由配置
    RoutePath NVARCHAR(200) NOT NULL,            -- 路由路径（如：/orders/list）
    RouteParams NVARCHAR(MAX),                   -- JSON: { "id": "string" }

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🔥 页面布局配置（核心）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    LayoutConfig NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "type": "grid",                    // grid | flex | absolute
    --   "columns": 24,
    --   "gutter": 20,
    --   "header": {
    --     "height": 60,
    --     "showBreadcrumb": true,
    --     "showTitle": true
    --   },
    --   "sidebar": {
    --     "width": 200,
    --     "collapsible": true,
    --     "position": "left"
    --   },
    --   "footer": {
    --     "height": 60,
    --     "show": false
    --   }
    -- }

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 组件树配置
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ComponentTree NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "root": {
    --     "type": "page",
    --     "children": [
    --       {
    --         "id": "header-1",
    --         "type": "header",
    --         "props": { "title": "订单管理" },
    --         "children": []
    --       },
    --       {
    --         "id": "content-1",
    --         "type": "content",
    --         "children": [
    --           {
    --             "id": "table-1",
    --             "type": "table",
    --             "props": { ... }
    --           }
    --         ]
    --       }
    --     ]
    --   }
    -- }

    -- 样式配置
    CustomCSS NVARCHAR(MAX),
    CustomClass NVARCHAR(200),

    -- 版本管理
    Version INT NOT NULL DEFAULT 1,
    IsPublished BIT NOT NULL DEFAULT 0,
    PublishedAt DATETIME2,

    -- 状态
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft',

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_PageDesigns_Name UNIQUE (Name, TenantId),
    INDEX IX_LC_PageDesigns_RoutePath (RoutePath),
    INDEX IX_LC_PageDesigns_PageType (PageType),
    INDEX IX_LC_PageDesigns_Status (Status)
);
```

---

#### 表15：LC_PageComponents（页面组件配置）

```sql
CREATE TABLE LC_PageComponents (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    PageDesignId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (PageDesignId) REFERENCES LC_PageDesigns(Id) ON DELETE CASCADE,

    ParentComponentId UNIQUEIDENTIFIER,
    FOREIGN KEY (ParentComponentId) REFERENCES LC_PageComponents(Id) ON DELETE NO ACTION,

    -- 组件定义
    ComponentId NVARCHAR(100) NOT NULL,          -- 组件唯一ID（如：table-1）
    ComponentType NVARCHAR(50) NOT NULL,
    -- 可选值：table | form | chart | card | panel | button | input | ...

    ComponentName NVARCHAR(100),                 -- 组件名称

    -- 组件配置
    Props NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "data": [],
    --   "columns": [...],
    --   "pagination": { ... },
    --   "loading": false
    -- }

    -- 布局配置
    Layout NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "x": 0,
    --   "y": 0,
    --   "w": 12,
    --   "h": 4,
    --   "static": false
    -- }

    -- 样式配置
    Style NVARCHAR(MAX),                         -- JSON: { "width": "100%", "height": "auto" }
    Class NVARCHAR(200),                         -- CSS类名

    -- 显示顺序
    DisplayOrder INT NOT NULL DEFAULT 0,

    -- 状态
    IsVisible BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_PageComponents_PageDesignId (PageDesignId),
    INDEX IX_LC_PageComponents_ParentComponentId (ParentComponentId),
    INDEX IX_LC_PageComponents_ComponentType (ComponentType),
    INDEX IX_LC_PageComponents_DisplayOrder (DisplayOrder)
);
```

---

#### 表16：LC_PageEvents（页面事件配置）⭐核心表

```sql
CREATE TABLE LC_PageEvents (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    PageDesignId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (PageDesignId) REFERENCES LC_PageDesigns(Id) ON DELETE CASCADE,

    ComponentId UNIQUEIDENTIFIER,
    FOREIGN KEY (ComponentId) REFERENCES LC_PageComponents(Id) ON DELETE CASCADE,

    -- 事件定义
    Name NVARCHAR(100) NOT NULL,                 -- 事件名称
    EventType NVARCHAR(50) NOT NULL,
    -- 可选值：onClick | onLoad | onSubmit | onChange | onBlur |
    --        onSuccess | onError | custom

    -- 触发源
    SourceComponent NVARCHAR(100),               -- 源组件ID

    -- 动作类型
    ActionType NVARCHAR(50) NOT NULL,
    -- 可选值：navigate | api | dialog | message | custom | script

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🔥 动作配置（核心）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ActionConfig NVARCHAR(MAX) NOT NULL,
    -- JSON示例（navigate）：
    -- {
    --   "type": "navigate",
    --   "path": "/orders/detail",
    --   "params": { "id": "{{row.id}}" },
    --   "query": { "tab": "detail" },
    --   "openInNewTab": false
    -- }
    --
    -- JSON示例（api）：
    -- {
    --   "type": "api",
    --   "url": "/api/app/orders/{{id}}",
    --   "method": "DELETE",
    --   "headers": {},
    --   "body": null,
    --   "successMessage": "删除成功",
    --   "errorMessage": "删除失败",
    --   "confirmMessage": "确认删除吗？",
    --   "afterSuccess": {
    --     "type": "refresh",
    --     "target": "table-1"
    --   }
    -- }
    --
    -- JSON示例（dialog）：
    -- {
    --   "type": "dialog",
    --   "component": "OrderEditForm",
    --   "title": "编辑订单",
    --   "width": "800px",
    --   "props": { "id": "{{row.id}}" }
    -- }

    -- 条件执行
    Condition NVARCHAR(MAX),                     -- 条件表达式（如：row.status === 'Pending'）

    -- 执行优先级
    Priority INT NOT NULL DEFAULT 0,

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_PageEvents_PageDesignId (PageDesignId),
    INDEX IX_LC_PageEvents_ComponentId (ComponentId),
    INDEX IX_LC_PageEvents_EventType (EventType),
    INDEX IX_LC_PageEvents_ActionType (ActionType)
);
```

**🔥 核心设计理念**：
1. **配置化事件处理**：不保存JavaScript函数，而是保存事件配置（JSON）
2. **支持多种动作类型**：导航、API调用、弹窗、消息提示、自定义脚本
3. **支持条件执行**：根据条件决定是否执行事件
4. **支持链式动作**：`afterSuccess` 可以配置后续动作

---

#### 表17：LC_UIThemes（UI主题配置）

```sql
CREATE TABLE LC_UIThemes (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 主题定义
    Name NVARCHAR(100) NOT NULL,                 -- 主题名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 主题类型
    ThemeType NVARCHAR(50) NOT NULL DEFAULT 'light',  -- light | dark | custom

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 主题配置（CSS变量）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Colors NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "primary": "#409EFF",
    --   "success": "#67C23A",
    --   "warning": "#E6A23C",
    --   "danger": "#F56C6C",
    --   "info": "#909399"
    -- }

    Spacing NVARCHAR(MAX),                       -- JSON: { "xs": "4px", "sm": "8px", ... }
    Typography NVARCHAR(MAX),                    -- JSON: { "fontFamily": "...", "fontSize": {...} }
    BorderRadius NVARCHAR(MAX),                  -- JSON: { "sm": "2px", "md": "4px", ... }
    Shadows NVARCHAR(MAX),                       -- JSON: { "sm": "...", "md": "...", ... }

    -- 自定义CSS
    CustomCSS NVARCHAR(MAX),

    -- 状态
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_UIThemes_Name UNIQUE (Name, TenantId),
    INDEX IX_LC_UIThemes_ThemeType (ThemeType),
    INDEX IX_LC_UIThemes_IsDefault (IsDefault)
);
```

---

---

### 2.4 Layer 4：流程编排层（工作流配置）

#### 表18：LC_Workflows（工作流定义）

```sql
CREATE TABLE LC_Workflows (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    EntityId UNIQUEIDENTIFIER,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    ModuleId UNIQUEIDENTIFIER,
    FOREIGN KEY (ModuleId) REFERENCES LC_Modules(Id) ON DELETE CASCADE,

    -- 基础信息
    Name NVARCHAR(100) NOT NULL,                 -- 工作流名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 工作流类型
    WorkflowType NVARCHAR(50) NOT NULL,
    -- 可选值：sequential | parallel | statemachine | approval | custom

    -- 触发配置
    TriggerType NVARCHAR(50) NOT NULL,
    -- 可选值：manual | automatic | scheduled | event

    TriggerConfig NVARCHAR(MAX),
    -- JSON示例（event）：
    -- {
    --   "type": "entity_event",
    --   "entity": "Order",
    --   "event": "Created",
    --   "condition": "TotalAmount > 10000"
    -- }
    --
    -- JSON示例（scheduled）：
    -- {
    --   "type": "cron",
    --   "expression": "0 0 * * *",
    --   "timezone": "Asia/Shanghai"
    -- }

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🔥 流程图配置（核心）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    FlowChartData NVARCHAR(MAX),
    -- JSON示例（Rete.js格式）：
    -- {
    --   "nodes": [
    --     {
    --       "id": "start-1",
    --       "type": "start",
    --       "position": { "x": 100, "y": 100 },
    --       "data": { "label": "开始" }
    --     },
    --     {
    --       "id": "task-1",
    --       "type": "task",
    --       "position": { "x": 300, "y": 100 },
    --       "data": {
    --         "label": "审批",
    --         "taskType": "approval",
    --         "assignee": "Manager"
    --       }
    --     }
    --   ],
    --   "edges": [
    --     {
    --       "id": "edge-1",
    --       "source": "start-1",
    --       "target": "task-1",
    --       "label": "提交"
    --     }
    --   ]
    -- }

    -- 版本管理
    Version INT NOT NULL DEFAULT 1,
    IsPublished BIT NOT NULL DEFAULT 0,
    PublishedAt DATETIME2,

    -- 状态
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft',
    IsActive BIT NOT NULL DEFAULT 1,

    -- 统计
    TotalInstances INT NOT NULL DEFAULT 0,
    CompletedInstances INT NOT NULL DEFAULT 0,
    FailedInstances INT NOT NULL DEFAULT 0,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_Workflows_Name UNIQUE (Name, TenantId),
    INDEX IX_LC_Workflows_EntityId (EntityId),
    INDEX IX_LC_Workflows_WorkflowType (WorkflowType),
    INDEX IX_LC_Workflows_Status (Status),
    INDEX IX_LC_Workflows_IsPublished (IsPublished)
);
```

---

#### 表19：LC_WorkflowNodes（流程节点配置）

```sql
CREATE TABLE LC_WorkflowNodes (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    WorkflowId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (WorkflowId) REFERENCES LC_Workflows(Id) ON DELETE CASCADE,

    -- 节点定义
    NodeId NVARCHAR(100) NOT NULL,               -- 节点唯一ID（如：task-1）
    NodeType NVARCHAR(50) NOT NULL,
    -- 可选值：start | end | task | approval | condition | parallel |
    --        script | api | email | notification | delay | custom

    Name NVARCHAR(100) NOT NULL,                 -- 节点名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 位置配置（用于设计器展示）
    PositionX INT,
    PositionY INT,
    Width INT,
    Height INT,

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🔥 节点配置（核心）
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    NodeConfig NVARCHAR(MAX),
    -- JSON示例（approval节点）：
    -- {
    --   "assigneeType": "role",           // user | role | expression
    --   "assignee": "Manager",
    --   "allowReassign": true,
    --   "allowDelegate": true,
    --   "timeout": 86400,                 // 超时时间（秒）
    --   "timeoutAction": "auto_approve",  // auto_approve | auto_reject | notify
    --   "formSchema": {...}               // 审批表单Schema
    -- }
    --
    -- JSON示例（condition节点）：
    -- {
    --   "condition": "TotalAmount > 10000",
    --   "trueLabel": "大额订单",
    --   "falseLabel": "普通订单"
    -- }
    --
    -- JSON示例（api节点）：
    -- {
    --   "url": "/api/app/notifications/send",
    --   "method": "POST",
    --   "headers": {},
    --   "body": {
    --     "title": "订单审批通知",
    --     "content": "您有一个新的订单需要审批"
    --   },
    --   "retry": {
    --     "maxRetries": 3,
    --     "retryDelay": 5000
    --   }
    -- }

    -- 输入输出
    InputVariables NVARCHAR(MAX),                -- JSON: [ "orderId", "amount" ]
    OutputVariables NVARCHAR(MAX),               -- JSON: [ "approvalResult", "comments" ]

    -- 执行配置
    IsAsync BIT NOT NULL DEFAULT 0,
    Timeout INT,                                 -- 超时时间（秒）
    RetryCount INT NOT NULL DEFAULT 0,
    RetryInterval INT,                           -- 重试间隔（秒）

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_WorkflowNodes_WorkflowId (WorkflowId),
    CONSTRAINT IX_LC_WorkflowNodes_WorkflowId_NodeId UNIQUE (WorkflowId, NodeId),
    INDEX IX_LC_WorkflowNodes_NodeType (NodeType)
);
```

---

#### 表20：LC_WorkflowEdges（流程连线配置）

```sql
CREATE TABLE LC_WorkflowEdges (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    WorkflowId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (WorkflowId) REFERENCES LC_Workflows(Id) ON DELETE CASCADE,

    SourceNodeId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (SourceNodeId) REFERENCES LC_WorkflowNodes(Id) ON DELETE NO ACTION,

    TargetNodeId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (TargetNodeId) REFERENCES LC_WorkflowNodes(Id) ON DELETE NO ACTION,

    -- 连线定义
    EdgeId NVARCHAR(100) NOT NULL,               -- 连线唯一ID
    Name NVARCHAR(100),                          -- 连线名称
    Label NVARCHAR(200),                         -- 连线标签（如：同意、拒绝）

    -- 条件配置
    Condition NVARCHAR(MAX),
    -- 表达式示例：
    -- - "approvalResult === 'approved'"
    -- - "amount > 10000"
    -- - "status in ['Pending', 'InProgress']"

    -- 优先级
    Priority INT NOT NULL DEFAULT 0,

    -- 样式配置（用于设计器展示）
    Style NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "stroke": "#333",
    --   "strokeWidth": 2,
    --   "strokeDasharray": "5,5",
    --   "animated": true
    -- }

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_WorkflowEdges_WorkflowId (WorkflowId),
    INDEX IX_LC_WorkflowEdges_SourceNodeId (SourceNodeId),
    INDEX IX_LC_WorkflowEdges_TargetNodeId (TargetNodeId),
    CONSTRAINT IX_LC_WorkflowEdges_WorkflowId_EdgeId UNIQUE (WorkflowId, EdgeId)
);
```

---

#### 表21：LC_WorkflowVariables（流程变量）

```sql
CREATE TABLE LC_WorkflowVariables (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    WorkflowId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (WorkflowId) REFERENCES LC_Workflows(Id) ON DELETE CASCADE,

    -- 变量定义
    Name NVARCHAR(100) NOT NULL,                 -- 变量名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 变量类型
    Type NVARCHAR(50) NOT NULL,
    -- 可选值：string | number | boolean | date | object | array

    IsRequired BIT NOT NULL DEFAULT 0,
    DefaultValue NVARCHAR(MAX),                  -- 默认值（JSON表示）

    -- 变量作用域
    Scope NVARCHAR(50) NOT NULL DEFAULT 'workflow',
    -- 可选值：workflow | node | instance

    -- 变量来源
    Source NVARCHAR(50) NOT NULL DEFAULT 'manual',
    -- 可选值：manual | input | output | expression | api

    SourceConfig NVARCHAR(MAX),
    -- JSON示例（expression）：
    -- {
    --   "expression": "input.amount * 1.1",
    --   "dependencies": ["input.amount"]
    -- }

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_WorkflowVariables_WorkflowId (WorkflowId),
    CONSTRAINT IX_LC_WorkflowVariables_WorkflowId_Name UNIQUE (WorkflowId, Name),
    INDEX IX_LC_WorkflowVariables_Scope (Scope)
);
```

---

#### 表22：LC_WorkflowInstances（流程实例 - 运行时）

```sql
CREATE TABLE LC_WorkflowInstances (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    WorkflowId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (WorkflowId) REFERENCES LC_Workflows(Id) ON DELETE NO ACTION,

    EntityId UNIQUEIDENTIFIER,                   -- 关联的业务实体ID
    EntityType NVARCHAR(100),                    -- 业务实体类型

    -- 实例信息
    InstanceName NVARCHAR(200),
    Description NVARCHAR(MAX),

    -- 状态
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    -- 可选值：Pending | Running | Completed | Failed | Cancelled | Suspended

    CurrentNodeId UNIQUEIDENTIFIER,              -- 当前节点
    FOREIGN KEY (CurrentNodeId) REFERENCES LC_WorkflowNodes(Id) ON DELETE NO ACTION,

    -- 执行信息
    StartedAt DATETIME2,
    CompletedAt DATETIME2,
    Duration INT,                                -- 持续时间（秒）

    -- 变量值（运行时）
    Variables NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "orderId": "123",
    --   "amount": 10000,
    --   "approvalResult": "approved"
    -- }

    -- 执行结果
    Result NVARCHAR(MAX),                        -- 执行结果（JSON）
    ErrorMessage NVARCHAR(MAX),                  -- 错误消息

    -- 发起人
    InitiatorId UNIQUEIDENTIFIER,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_WorkflowInstances_WorkflowId (WorkflowId),
    INDEX IX_LC_WorkflowInstances_EntityId (EntityId),
    INDEX IX_LC_WorkflowInstances_Status (Status),
    INDEX IX_LC_WorkflowInstances_CurrentNodeId (CurrentNodeId),
    INDEX IX_LC_WorkflowInstances_InitiatorId (InitiatorId),
    INDEX IX_LC_WorkflowInstances_CreationTime (CreationTime)
);
```

---

### 2.5 Layer 5：代码生成层

#### 表23：LC_GenerationSessions（生成会话）

```sql
CREATE TABLE LC_GenerationSessions (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    ModuleId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (ModuleId) REFERENCES LC_Modules(Id) ON DELETE CASCADE,

    -- 会话信息
    SessionName NVARCHAR(200),
    SessionType NVARCHAR(50) NOT NULL,
    -- 可选值：full | incremental | preview | rollback

    -- 生成配置
    GenerationConfig NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "entities": ["Order", "Product"],
    --   "layers": ["backend", "frontend", "database"],
    --   "options": {
    --     "overwriteExisting": false,
    --     "skipBackup": false,
    --     "validateOnly": false
    --   }
    -- }

    -- 状态
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    -- 可选值：Pending | Running | Completed | Failed | Cancelled

    Progress INT NOT NULL DEFAULT 0,             -- 进度（0-100）

    -- 执行信息
    StartedAt DATETIME2,
    CompletedAt DATETIME2,
    Duration INT,                                -- 持续时间（秒）

    -- 统计
    TotalFiles INT NOT NULL DEFAULT 0,
    GeneratedFiles INT NOT NULL DEFAULT 0,
    FailedFiles INT NOT NULL DEFAULT 0,
    SkippedFiles INT NOT NULL DEFAULT 0,

    -- 结果
    Result NVARCHAR(MAX),                        -- 生成结果（JSON）
    ErrorMessage NVARCHAR(MAX),                  -- 错误消息
    Warnings NVARCHAR(MAX),                      -- 警告信息（JSON数组）

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_GenerationSessions_ModuleId (ModuleId),
    INDEX IX_LC_GenerationSessions_Status (Status),
    INDEX IX_LC_GenerationSessions_SessionType (SessionType),
    INDEX IX_LC_GenerationSessions_CreationTime (CreationTime)
);
```

---

#### 表24：LC_GeneratedFiles（生成的文件）

```sql
CREATE TABLE LC_GeneratedFiles (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    SessionId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (SessionId) REFERENCES LC_GenerationSessions(Id) ON DELETE CASCADE,

    EntityId UNIQUEIDENTIFIER,
    FOREIGN KEY (EntityId) REFERENCES LC_Entities(Id) ON DELETE CASCADE,

    -- 文件信息
    FilePath NVARCHAR(500) NOT NULL,             -- 文件路径（相对路径）
    FileName NVARCHAR(200) NOT NULL,
    FileType NVARCHAR(50) NOT NULL,
    -- 可选值：entity | dto | service | controller | repository |
    --        vue | ts | css | sql | config | test

    FileCategory NVARCHAR(50) NOT NULL,
    -- 可选值：backend | frontend | database | config | test

    -- 生成方式
    GenerationMethod NVARCHAR(50) NOT NULL,
    -- 可选值：template | ast | custom

    TemplateId UNIQUEIDENTIFIER,                 -- 使用的模板ID
    FOREIGN KEY (TemplateId) REFERENCES LC_CodeTemplates(Id) ON DELETE SET NULL,

    -- 文件内容
    ContentHash NVARCHAR(64),                    -- SHA256哈希（用于对比）
    FileSize INT,                                -- 文件大小（字节）
    LineCount INT,                               -- 行数

    -- 生成状态
    Status NVARCHAR(50) NOT NULL DEFAULT 'Generated',
    -- 可选值：Generated | Deployed | Failed | Skipped

    ErrorMessage NVARCHAR(MAX),

    -- 备份信息
    BackupPath NVARCHAR(500),                    -- 备份路径（如有覆盖）
    IsOverwritten BIT NOT NULL DEFAULT 0,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_GeneratedFiles_SessionId (SessionId),
    INDEX IX_LC_GeneratedFiles_EntityId (EntityId),
    INDEX IX_LC_GeneratedFiles_FilePath (FilePath),
    INDEX IX_LC_GeneratedFiles_FileType (FileType),
    INDEX IX_LC_GeneratedFiles_Status (Status)
);
```

---

#### 表25：LC_CodeTemplates（代码模板）

```sql
CREATE TABLE LC_CodeTemplates (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 模板信息
    Name NVARCHAR(100) NOT NULL,                 -- 模板名称
    DisplayName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 模板类型
    TemplateType NVARCHAR(50) NOT NULL,
    -- 可选值：handlebars | liquid | razor | custom

    FileType NVARCHAR(50) NOT NULL,              -- 生成文件类型
    FileCategory NVARCHAR(50) NOT NULL,          -- 文件类别

    -- 模板内容
    TemplateContent NVARCHAR(MAX) NOT NULL,      -- 模板内容

    -- 配置
    Config NVARCHAR(MAX),
    -- JSON示例：
    -- {
    --   "outputPath": "src/SmartAbp.Application/{{ModuleName}}/{{EntityName}}AppService.cs",
    --   "encoding": "UTF-8",
    --   "addUtf8Bom": false,
    --   "preserveRegions": true
    -- }

    -- 变量定义
    Variables NVARCHAR(MAX),
    -- JSON示例：
    -- [
    --   { "name": "EntityName", "type": "string", "required": true },
    --   { "name": "Namespace", "type": "string", "default": "SmartAbp" }
    -- ]

    -- 版本管理
    Version INT NOT NULL DEFAULT 1,
    IsBuiltIn BIT NOT NULL DEFAULT 0,            -- 是否内置模板
    IsActive BIT NOT NULL DEFAULT 1,

    -- 使用统计
    UsageCount INT NOT NULL DEFAULT 0,
    LastUsedAt DATETIME2,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_CodeTemplates_Name UNIQUE (Name, TenantId),
    INDEX IX_LC_CodeTemplates_TemplateType (TemplateType),
    INDEX IX_LC_CodeTemplates_FileType (FileType),
    INDEX IX_LC_CodeTemplates_IsActive (IsActive)
);
```

---

#### 表26：LC_GenerationHistory（生成历史）

```sql
CREATE TABLE LC_GenerationHistory (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 外键
    SessionId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (SessionId) REFERENCES LC_GenerationSessions(Id) ON DELETE CASCADE,

    -- 历史记录
    Timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Level NVARCHAR(20) NOT NULL,                 -- Info | Warning | Error
    Message NVARCHAR(MAX) NOT NULL,
    Details NVARCHAR(MAX),                       -- JSON详情

    -- 分类
    Category NVARCHAR(50),
    -- 可选值：validation | generation | deployment | rollback | cleanup

    -- 索引
    INDEX IX_LC_GenerationHistory_SessionId (SessionId),
    INDEX IX_LC_GenerationHistory_Level (Level),
    INDEX IX_LC_GenerationHistory_Timestamp (Timestamp)
);
```

---

### 2.6 Layer 6：版本管理层

#### 表27：LC_ConfigVersions（配置版本）

```sql
CREATE TABLE LC_ConfigVersions (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 版本信息
    VersionNumber INT NOT NULL,                  -- 版本号
    VersionName NVARCHAR(100),                   -- 版本名称（如：v1.0）
    Description NVARCHAR(MAX),

    -- 关联对象
    ObjectType NVARCHAR(50) NOT NULL,
    -- 可选值：module | entity | form | page | workflow

    ObjectId UNIQUEIDENTIFIER NOT NULL,          -- 关联对象ID

    -- 快照信息
    SnapshotId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (SnapshotId) REFERENCES LC_ConfigSnapshots(Id) ON DELETE NO ACTION,

    -- 版本状态
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft',
    -- 可选值：Draft | Active | Archived

    IsCurrent BIT NOT NULL DEFAULT 0,            -- 是否当前版本
    IsPublished BIT NOT NULL DEFAULT 0,
    PublishedAt DATETIME2,

    -- 变更信息
    ChangeType NVARCHAR(50),
    -- 可选值：created | updated | deleted | restored

    ChangeDescription NVARCHAR(MAX),
    ChangeSummary NVARCHAR(MAX),                 -- JSON摘要

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_ConfigVersions_ObjectType_ObjectId (ObjectType, ObjectId),
    INDEX IX_LC_ConfigVersions_SnapshotId (SnapshotId),
    INDEX IX_LC_ConfigVersions_Status (Status),
    INDEX IX_LC_ConfigVersions_IsCurrent (IsCurrent),
    INDEX IX_LC_ConfigVersions_CreationTime (CreationTime)
);
```

---

#### 表28：LC_ConfigSnapshots（配置快照）

```sql
CREATE TABLE LC_ConfigSnapshots (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 快照信息
    Name NVARCHAR(200),
    Description NVARCHAR(MAX),

    -- 快照数据
    SnapshotData NVARCHAR(MAX) NOT NULL,         -- 完整配置数据（JSON）
    DataHash NVARCHAR(64),                       -- SHA256哈希
    DataSize INT,                                -- 数据大小（字节）

    -- 压缩配置
    IsCompressed BIT NOT NULL DEFAULT 1,
    CompressionType NVARCHAR(20),                -- gzip | brotli

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_ConfigSnapshots_DataHash (DataHash),
    INDEX IX_LC_ConfigSnapshots_CreationTime (CreationTime)
);
```

---

#### 表29：LC_ConfigChangeLogs（变更日志）

```sql
CREATE TABLE LC_ConfigChangeLogs (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 关联版本
    VersionId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (VersionId) REFERENCES LC_ConfigVersions(Id) ON DELETE CASCADE,

    -- 变更信息
    ChangeType NVARCHAR(50) NOT NULL,
    -- 可选值：added | modified | deleted | renamed | moved

    ObjectPath NVARCHAR(500),                    -- 对象路径（如：entities.Order.properties.Status）

    -- 变更详情
    OldValue NVARCHAR(MAX),                      -- 旧值（JSON）
    NewValue NVARCHAR(MAX),                      -- 新值（JSON）

    -- 变更描述
    Description NVARCHAR(MAX),

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_ConfigChangeLogs_VersionId (VersionId),
    INDEX IX_LC_ConfigChangeLogs_ChangeType (ChangeType),
    INDEX IX_LC_ConfigChangeLogs_CreationTime (CreationTime)
);
```

---

### 2.7 Layer 7：协作层

#### 表30：LC_DesignLocks（设计锁）

```sql
CREATE TABLE LC_DesignLocks (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 锁定对象
    ObjectType NVARCHAR(50) NOT NULL,
    -- 可选值：module | entity | form | page | workflow

    ObjectId UNIQUEIDENTIFIER NOT NULL,          -- 对象ID

    -- 锁定信息
    LockedBy UNIQUEIDENTIFIER NOT NULL,          -- 锁定用户ID
    LockedByUserName NVARCHAR(100) NOT NULL,
    LockedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    -- 锁定类型
    LockType NVARCHAR(50) NOT NULL DEFAULT 'exclusive',
    -- 可选值：exclusive | shared

    -- 锁定原因
    Reason NVARCHAR(MAX),

    -- 自动释放
    ExpiresAt DATETIME2,                         -- 锁定过期时间

    -- 状态
    IsActive BIT NOT NULL DEFAULT 1,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    CONSTRAINT IX_LC_DesignLocks_ObjectType_ObjectId UNIQUE (ObjectType, ObjectId),
    INDEX IX_LC_DesignLocks_LockedBy (LockedBy),
    INDEX IX_LC_DesignLocks_LockedAt (LockedAt),
    INDEX IX_LC_DesignLocks_ExpiresAt (ExpiresAt)
);
```

---

#### 表31：LC_DesignComments（设计评论）

```sql
CREATE TABLE LC_DesignComments (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 评论对象
    ObjectType NVARCHAR(50) NOT NULL,
    ObjectId UNIQUEIDENTIFIER NOT NULL,

    ParentCommentId UNIQUEIDENTIFIER,            -- 父评论ID（支持回复）
    FOREIGN KEY (ParentCommentId) REFERENCES LC_DesignComments(Id) ON DELETE NO ACTION,

    -- 评论内容
    Content NVARCHAR(MAX) NOT NULL,

    -- 评论类型
    CommentType NVARCHAR(50) NOT NULL DEFAULT 'comment',
    -- 可选值：comment | question | suggestion | issue

    -- 状态
    Status NVARCHAR(20) NOT NULL DEFAULT 'Open',
    -- 可选值：Open | Resolved | Closed

    ResolvedBy UNIQUEIDENTIFIER,
    ResolvedAt DATETIME2,

    -- 提及用户
    MentionedUsers NVARCHAR(MAX),                -- JSON: [ "UserId1", "UserId2" ]

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_DesignComments_ObjectType_ObjectId (ObjectType, ObjectId),
    INDEX IX_LC_DesignComments_ParentCommentId (ParentCommentId),
    INDEX IX_LC_DesignComments_CommentType (CommentType),
    INDEX IX_LC_DesignComments_Status (Status),
    INDEX IX_LC_DesignComments_CreationTime (CreationTime)
);
```

---

#### 表32：LC_DesignReviews（设计审查）

```sql
CREATE TABLE LC_DesignReviews (
    -- 主键
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- 审查对象
    ObjectType NVARCHAR(50) NOT NULL,
    ObjectId UNIQUEIDENTIFIER NOT NULL,

    VersionId UNIQUEIDENTIFIER,
    FOREIGN KEY (VersionId) REFERENCES LC_ConfigVersions(Id) ON DELETE CASCADE,

    -- 审查信息
    ReviewName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),

    -- 审查类型
    ReviewType NVARCHAR(50) NOT NULL,
    -- 可选值：peer_review | manager_review | security_review | quality_review

    -- 审查人
    Reviewers NVARCHAR(MAX) NOT NULL,            -- JSON: [ "UserId1", "UserId2" ]

    -- 审查状态
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    -- 可选值：Pending | InProgress | Approved | Rejected | Cancelled

    -- 审查结果
    Result NVARCHAR(50),                         -- Approved | Rejected
    ResultComment NVARCHAR(MAX),

    -- 审查清单
    Checklist NVARCHAR(MAX),
    -- JSON示例：
    -- [
    --   { "item": "命名规范", "checked": true, "comment": "" },
    --   { "item": "代码质量", "checked": false, "comment": "需要改进" }
    -- ]

    -- 时间信息
    DueDate DATETIME2,
    StartedAt DATETIME2,
    CompletedAt DATETIME2,

    -- ABP审计字段
    CreationTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatorId UNIQUEIDENTIFIER,
    LastModificationTime DATETIME2,
    LastModifierId UNIQUEIDENTIFIER,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletionTime DATETIME2,
    DeleterId UNIQUEIDENTIFIER,

    -- ABP多租户
    TenantId UNIQUEIDENTIFIER,

    -- 索引
    INDEX IX_LC_DesignReviews_ObjectType_ObjectId (ObjectType, ObjectId),
    INDEX IX_LC_DesignReviews_VersionId (VersionId),
    INDEX IX_LC_DesignReviews_ReviewType (ReviewType),
    INDEX IX_LC_DesignReviews_Status (Status),
    INDEX IX_LC_DesignReviews_DueDate (DueDate),
    INDEX IX_LC_DesignReviews_CreationTime (CreationTime)
);
```

