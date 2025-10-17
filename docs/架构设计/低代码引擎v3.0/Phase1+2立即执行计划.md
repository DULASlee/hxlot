# Phase 1+2 立即执行计划 - 低代码引擎数据库重构

**执行日期**: 2025-10-17
**执行范围**: Phase 1（4张核心表）+ Phase 2（4张增强表）
**验证方式**: UltraSimpleStudio极简代码生成通道
**执行状态**: 🟢 Ready to Execute

---

## 📋 目录

1. [执行总览](#执行总览)
2. [数据库迁移](#数据库迁移)
3. [UltraSimpleStudio验证](#ultrasimplestudio验证)
4. [执行检查清单](#执行检查清单)

---

## 一、执行总览

### 1.1 Phase 1+2 核心内容

```yaml
Phase 1 - 核心4张表（必须）:
  ✅ LC_Modules      - 模块管理
  ✅ LC_Entities     - 实体定义
  ✅ LC_Properties   - 属性+UI配置（JSON）⭐
  ✅ LC_PageConfigs  - 页面配置（JSON）⭐⭐⭐

Phase 2 - 增强4张表（必须）:
  ✅ LC_Relationships      - 关系定义
  ✅ LC_UIThemes           - UI主题
  ✅ LC_GenerationSessions - 生成会话
  ✅ LC_GeneratedFiles     - 生成文件清单

总计: 8张核心表
```

### 1.2 核心设计亮点

```yaml
1. 极简查询路径:
   ✅ 单页面生成只需3次查询
   ✅ 无需复杂JOIN
   ✅ 查询性能<10ms

2. JSON字段强类型:
   ✅ C# DTO强类型约束
   ✅ EF Core自动序列化
   ✅ 前后端类型一致

3. form-create无缝集成:
   ✅ PageConfig直接用于form-create
   ✅ 无需格式转换
   ✅ 配置即代码
```

---

## 二、数据库迁移

### 2.1 迁移文件

**文件位置**：
```
src/SmartAbp.EntityFrameworkCore/Migrations/20251017_AddLowCodeTables.cs
```

**包含内容**：
- ✅ 8张核心表定义
- ✅ 所有索引（B-Tree）
- ✅ 外键关系
- ✅ 默认值配置
- ✅ ABP审计字段

### 2.2 执行迁移

**步骤1：生成迁移**

```bash
# 进入DbMigrator项目目录
cd src/SmartAbp.DbMigrator

# 执行迁移
dotnet ef database update --project ../SmartAbp.EntityFrameworkCore/SmartAbp.EntityFrameworkCore.csproj
```

**步骤2：验证表结构**

```sql
-- 验证8张表已创建
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'LC_%'
ORDER BY TABLE_NAME;

-- 预期结果（8张表）:
-- LC_Entities
-- LC_GeneratedFiles
-- LC_GenerationSessions
-- LC_Modules
-- LC_PageConfigs
-- LC_Properties
-- LC_Relationships
-- LC_UIThemes
```

**步骤3：验证索引**

```sql
-- 验证索引已创建
SELECT
    t.name AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name LIKE 'LC_%'
ORDER BY t.name, i.name;
```

---

## 三、UltraSimpleStudio验证

### 3.1 验证目标

```yaml
验证内容:
  ✅ 数据库表结构正确
  ✅ 能够保存配置到数据库
  ✅ 能够从数据库读取配置
  ✅ 配置能够驱动代码生成
  ✅ 生成的代码质量≥95分
```

### 3.2 验证步骤

#### **步骤1：创建测试模块**

**在UltraSimpleStudio中配置**：

```yaml
模块配置:
  系统名称: TestSystem
  模块名称: Orders
  显示名称: 订单管理
  命名空间: TestSystem.Orders
  数据库表: Order

实体字段:
  - OrderNo: 订单号（string, 必填, 唯一）
  - CustomerName: 客户名称（string, 必填）
  - OrderDate: 订单日期（DateTime, 必填）
  - TotalAmount: 订单金额（decimal, 必填）
  - Status: 订单状态（enum: Pending/Paid/Shipped）
```

#### **步骤2：保存到数据库**

**验证SQL**：

```sql
-- 验证模块已保存
SELECT * FROM LC_Modules WHERE ModuleName = 'Orders';

-- 验证实体已保存
SELECT * FROM LC_Entities WHERE Name = 'Order';

-- 验证属性已保存（含UIConfig JSON）
SELECT
    Name,
    DisplayName,
    Type,
    JSON_VALUE(UIConfig, '$.controlType') AS ControlType,
    JSON_VALUE(UIConfig, '$.listVisible') AS ListVisible
FROM LC_Properties
WHERE EntityId = (SELECT Id FROM LC_Entities WHERE Name = 'Order');

-- 验证页面配置已保存（含PageConfig JSON）
SELECT
    PageType,
    JSON_QUERY(PageConfig, '$.form.rules') AS FormRules,
    JSON_QUERY(PageConfig, '$.list.columns') AS ListColumns
FROM LC_PageConfigs
WHERE EntityId = (SELECT Id FROM LC_Entities WHERE Name = 'Order');
```

**预期结果**：
- ✅ LC_Modules: 1条记录（Orders模块）
- ✅ LC_Entities: 1条记录（Order实体）
- ✅ LC_Properties: 5条记录（5个字段，每个含UIConfig JSON）
- ✅ LC_PageConfigs: 1条记录（form页面配置，含完整的form-create rules）

#### **步骤3：从数据库读取配置**

**后端API调用**：

```csharp
// 读取实体配置
var entity = await _lowCodeEntityRepository.GetAsync(entityId);

// 读取属性（含UIConfig）
var properties = await _lowCodePropertyRepository.GetListAsync(
    p => p.EntityId == entityId);

// 读取页面配置（含PageConfig）
var pageConfig = await _lowCodePageConfigRepository.FirstOrDefaultAsync(
    p => p.EntityId == entityId && p.PageType == "form");

// 验证JSON反序列化成功
foreach (var prop in properties)
{
    Console.WriteLine($"Property: {prop.Name}");
    Console.WriteLine($"ControlType: {prop.UIConfig?.ControlType}");
    Console.WriteLine($"ListVisible: {prop.UIConfig?.ListVisible}");
}

// 验证PageConfig包含form-create rules
Console.WriteLine($"Form Rules Count: {pageConfig.PageConfig.Form.Rules.Count}");
```

**预期结果**：
- ✅ UIConfig正确反序列化为PropertyUIConfig对象
- ✅ PageConfig正确反序列化为PageConfigDto对象
- ✅ form-create rules数组完整

#### **步骤4：代码生成验证**

**生成流程**：

```typescript
// 1. 从数据库读取配置
const entity = await api.getEntity(entityId);
const properties = await api.getProperties(entityId);
const pageConfig = await api.getPageConfig(entityId, 'form');

// 2. 调用代码生成API
const result = await api.generateCode({
  entity,
  properties,
  pageConfig
});

// 3. 验证生成结果
console.log('Generated Files:', result.generatedFiles);
console.log('Backend Files:', result.backendFiles);
console.log('Frontend Files:', result.frontendFiles);
```

**预期结果**：
- ✅ 后端生成：Entity、DTO、AppService、Controller、EF配置
- ✅ 前端生成：Vue组件、Pinia Store、API Client、路由
- ✅ 代码质量：TypeScript编译通过、ESLint检查通过
- ✅ 功能完整：CRUD功能完整、表单验证完整

#### **步骤5：生成代码运行验证**

**前端页面测试**：

```yaml
测试场景1: 打开列表页面
  ✅ 页面能正常打开
  ✅ 表格列定义正确（OrderNo、CustomerName等）
  ✅ 数据能正常加载
  ✅ 搜索、排序、分页功能正常

测试场景2: 打开新增表单
  ✅ 弹窗能正常打开
  ✅ 表单字段正确（根据PageConfig.form.rules生成）
  ✅ 控件类型正确（input、select、date等）
  ✅ 验证规则生效（必填、格式验证等）

测试场景3: 提交表单
  ✅ 表单验证通过
  ✅ 数据能成功保存
  ✅ 列表能自动刷新
  ✅ 成功提示显示

测试场景4: 编辑和删除
  ✅ 编辑弹窗数据回填正确
  ✅ 更新成功
  ✅ 删除确认提示
  ✅ 删除成功并刷新
```

---

## 四、执行检查清单

### 4.1 数据库层检查

```yaml
☑️ 数据库迁移:
   ✅ 迁移文件已创建
   ✅ 迁移已执行（dotnet ef database update）
   ✅ 8张表已创建
   ✅ 索引已创建
   ✅ 外键关系正确

☑️ 表结构验证:
   ✅ LC_Modules: 字段完整、索引正确
   ✅ LC_Entities: 字段完整、索引正确
   ✅ LC_Properties: 字段完整、UIConfig JSON
   ✅ LC_PageConfigs: 字段完整、PageConfig JSON
   ✅ LC_Relationships: 字段完整
   ✅ LC_UIThemes: 字段完整
   ✅ LC_GenerationSessions: 字段完整
   ✅ LC_GeneratedFiles: 字段完整
```

### 4.2 C#代码层检查

```yaml
☑️ 实体类:
   ✅ LowCodeModule 已定义
   ✅ LowCodeEntity 已定义
   ✅ LowCodeProperty 已定义（含PropertyUIConfig）
   ✅ LowCodePageConfig 已定义（含PageConfigDto）
   ✅ LowCodeRelationship 已定义
   ✅ LowCodeUITheme 已定义
   ✅ LowCodeGenerationSession 已定义
   ✅ LowCodeGeneratedFile 已定义

☑️ DTO类:
   ✅ PropertyUIConfig 已定义
   ✅ PageConfigDto 已定义
   ✅ FormConfig、ListConfig、DetailConfig 已定义
   ✅ ValidationRule 已定义

☑️ EF Core配置:
   ✅ JSON值转换器已配置
   ✅ 索引已配置
   ✅ 关系已配置
```

### 4.3 UltraSimpleStudio验证检查

```yaml
☑️ 配置保存:
   ✅ 模块配置能保存到LC_Modules
   ✅ 实体配置能保存到LC_Entities
   ✅ 属性配置能保存到LC_Properties（含UIConfig JSON）
   ✅ 页面配置能保存到LC_PageConfigs（含PageConfig JSON）

☑️ 配置读取:
   ✅ 能从数据库读取完整配置
   ✅ JSON能正确反序列化为强类型DTO
   ✅ UIConfig、PageConfig数据完整

☑️ 代码生成:
   ✅ 能基于数据库配置生成代码
   ✅ 后端代码完整（Entity、Service、Controller）
   ✅ 前端代码完整（Vue、Store、API）
   ✅ 代码质量≥95分

☑️ 功能验证:
   ✅ 生成的页面能正常运行
   ✅ CRUD功能完整
   ✅ 表单验证正确
   ✅ 用户体验良好
```

---

## 五、后续优化计划

### 5.1 Phase 3（性能优化，按需实施）

```yaml
触发条件: 数据量>10万条 OR 查询性能<要求

优化措施:
  🟢 PostgreSQL GIN索引（JSON字段）
  🟢 SQL Server计算列+索引
  🟢 Redis缓存热数据
  🟢 批量生成优化

预期时间: 3-5天
```

### 5.2 后续增强功能

```yaml
可选功能（需求驱动）:
  🟡 配置快照和版本管理
  🟡 配置发布审批流程
  🟡 A/B测试功能
  🟡 配置导入导出

实施策略: 按需添加，渐进式演进
```

---

## 六、执行总结

### 6.1 核心成果

```yaml
✅ 数据库架构:
   - 8张核心表（精简75%）
   - 极简查询路径（3次查询）
   - 性能优秀（<10ms）

✅ 类型安全:
   - C# DTO强类型
   - EF Core自动序列化
   - 前后端类型一致

✅ 扩展性:
   - JSON字段灵活扩展
   - 无需修改表结构
   - 向后兼容
```

### 6.2 验证标准

```yaml
验收标准:
  ✅ 数据库迁移成功
  ✅ UltraSimpleStudio能保存配置
  ✅ 能从数据库读取配置
  ✅ 能基于配置生成代码
  ✅ 生成的代码质量≥95分
  ✅ 生成的页面功能完整
```

---

**🚀 立即执行！验证我们的重构成果！** 💪

**预计时间**：
- 数据库迁移：10分钟
- UltraSimpleStudio适配：30分钟
- 验证测试：30分钟
- **总计：约1-2小时完成验证** ⏱️

