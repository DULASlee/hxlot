# SmartAbp低代码引擎 - 操作手册 v2.0
## 渐进式升级实战：从Layer1到微服务的完整旅程

**文档版本**: v2.0（重构版）
**创建日期**: 2025-10-19
**适用引擎**: SmartAbp低代码引擎v2.0 + DevKit框架
**核心特性**: Layer1→2→3渐进式升级 + Aspire微服务编排
**演示系统**: 企业级权限管理系统
**预计时间**: 5小时（完整升级链路）vs 4周（手动编码）

---

## 📋 文档说明

```yaml
v2.0重构版核心升级:
  ✅ 演示Layer1→2→3完整升级流程（NEW）
  ✅ DevKit框架升级工具使用（NEW）
  ✅ Aspire微服务编排转换（NEW）
  ✅ 代码可升级性实战演示（NEW）
  ✅ 统一平台整体性展示（NEW）

手册目标:
  ✅ 演示低代码引擎的渐进式能力
  ✅ 展示DevKit框架的核心价值
  ✅ 验证代码可升级性架构
  ✅ 完整生成企业级权限系统（6大模块）
  ✅ 展示三层用户体验的升级路径

目标系统:
  权限管理系统6大模块:
    1. 组织管理（Company/Department/Position）
    2. 用户管理（User/UserRole/UserOrganization）
    3. 角色管理（Role/RolePermission）
    4. 权限管理（Permission/DataScope）
    5. 菜单管理（Menu/MenuPermission）
    6. 字典管理（Dictionary/DictionaryItem）

技术架构:
  - 后端: ABP vNext 9.1.1 + .NET 9.0
  - 前端: Vue 3.5 + TypeScript + Element Plus
  - DevKit: 统一代码生成框架
  - Aspire: 微服务编排系统
  - 数据库: SQL Server 2022
  - 代码质量: 95分企业级标准

升级路径:
  Layer 1（极简通道）:
    → 5分钟快速生成标准CRUD
    → 适合: 快速原型验证、基础数据管理

  Layer 2（进阶定制）:
    → 从Layer1代码升级
    → 30分钟定制字段、表单、列表
    → 适合: 企业后台管理、业务系统

  Layer 3（专业平台）:
    → 从Layer2代码升级
    → 2小时集成工作流、规则引擎
    → 适合: 复杂业务流程、企业级应用

  Aspire微服务:
    → 从Layer1/2/3代码转换
    → 1小时微服务编排
    → 适合: 云原生架构、可扩展系统

预期成果:
  ✅ 完整的渐进式升级案例（Layer1→2→3→微服务）
  ✅ DevKit框架使用实战
  ✅ 6大模块完整代码（前端+后端）
  ✅ 数据库表结构和迁移
  ✅ 完整CRUD功能 + 业务扩展
  ✅ 类型安全（0个any）
  ✅ 可直接运行使用
  ✅ 微服务架构代码
```

---

## 🎯 第一部分：准备工作

### 1.1 环境检查

```bash
# 检查后端环境
dotnet --version
# 预期：9.0或更高版本

# 检查前端环境
node --version
npm --version
# 预期：Node 18+, npm 9+

# 检查数据库
sqlcmd -S (localdb)\MSSQLLocalDB -Q "SELECT @@VERSION"
# 预期：SQL Server 2022或更高版本

# 启动后端项目
cd hxlot
dotnet run --project src/SmartAbp.Web
# 预期：https://localhost:44308

# 启动前端项目
cd src/SmartAbp.Vue
npm run dev
# 预期：http://localhost:5173
```

### 1.2 DevKit框架检查（NEW）

```bash
# 检查DevKit框架是否正常
cd src/SmartAbp.DevKit
dotnet build
# 预期：编译成功

# 检查DevKit命令行工具
dotnet devkit --version
# 预期：v2.0.0或更高

# 检查升级管理器
dotnet devkit upgrade --help
# 预期：显示升级命令帮助信息

# 检查Aspire集成
dotnet devkit aspire --help
# 预期：显示微服务编排命令帮助信息
```

### 1.3 数据库准备

```sql
-- 检查数据库是否存在
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SmartAbp')
BEGIN
    CREATE DATABASE SmartAbp
END
GO

-- 检查表结构
USE SmartAbp
GO

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME
-- 预期：看到ABP基础表（AbpUsers, AbpRoles等）
```

### 1.4 访问低代码平台Portal

```yaml
步骤1: 打开浏览器访问Portal
  URL: http://localhost:5173/lowcode/portal
  预期: 看到三层用户路径入口 + DevKit工具入口

步骤2: 三层入口说明（NEW）
  Layer 1（极简通道）:
    ✅ 5分钟快速生成
    ✅ 从数据库表一键生成CRUD
    ✅ 适合: 原型验证、基础数据管理

  Layer 2（进阶定制）:
    ✅ 30分钟定制开发
    ✅ 可从Layer1升级，或独立使用
    ✅ 字段设计器 + 表单设计器 + 列表设计器
    ✅ 适合: 企业后台、业务系统

  Layer 3（专业平台）:
    ✅ 2小时专业定制
    ✅ 可从Layer2升级，或独立使用
    ✅ 工作流 + 规则引擎 + 批量操作 + 导入导出
    ✅ 适合: 复杂业务流程、企业级应用

步骤3: DevKit工具入口（NEW）
  DevKit升级管理器:
    ✅ Layer1→2代码升级
    ✅ Layer2→3代码升级
    ✅ 升级记录查看
    ✅ 版本管理

  Aspire微服务编排:
    ✅ 单体应用→微服务转换
    ✅ 服务拆分建议
    ✅ 一键生成Aspire配置
    ✅ Docker编排文件生成

步骤4: 开始本手册演示
  演示路径: Layer 1 → Layer 2 → Layer 3 → Aspire微服务
  演示模块: 公司管理（Company）
  完整时长: 约5小时
```

---

## 🚀 第二部分：Layer 1极简通道快速生成（NEW）

### 2.1 场景：5分钟快速生成公司管理模块

#### 2.1.1 步骤1：选择数据库表（1分钟）

```yaml
操作步骤:
  1. 进入Layer 1极简通道
     URL: http://localhost:5173/CodeGen/ultra-simple

  2. 基础配置（自动填充）
     数据库表: 选择"Companies"
     系统名称: "SmartAbp"（自动识别）
     模块名称: "Organization"（自动推断）
     显示名称: "公司管理"（从表注释自动识别）

  3. 架构配置（使用默认）
     架构模式: "DDD"（默认）
     数据库提供程序: "SqlServer"（默认）

  4. 菜单配置（自动生成）
     父级菜单: "基础数据"（自动创建）
     菜单图标: "Building"（自动推荐）
     菜单排序: "1"（自动计算）

自动填充说明（AI智能推断）:
  ✅ 表名"Companies" → 模块名"Company"（单数形式）
  ✅ 表注释"公司信息表" → 显示名"公司管理"
  ✅ 主键列"Id" → 自动识别为Guid类型
  ✅ 创建时间、修改时间 → 自动识别为审计字段
  ✅ 外键列"ParentId" → 自动识别为导航属性

预计时间: 1分钟（主要是选择表，其他自动）
```

#### 2.1.2 步骤2：一键生成代码（4分钟）

```yaml
操作步骤:
  1. 点击"立即生成"按钮
     DevKit引擎启动
     分析表结构...
     生成代码...

  2. 等待生成完成（约10秒）
     ✅ 后端代码: 8个文件
     ✅ 前端代码: 4个文件
     ✅ 数据库迁移: 1个文件

  3. 查看生成日志（实时显示）
     [01] 📊 分析表结构: Companies
          - 检测到8个字段
          - 识别到1个外键关系（ParentId → Companies.Id）
          - 识别到2个索引

     [02] 🔧 生成后端代码:
          ✅ Entity: Company.cs
          ✅ Repository: CompanyRepository.cs
          ✅ AppService: CompanyAppService.cs
          ✅ DTOs: CompanyDto.cs, CreateCompanyDto.cs, UpdateCompanyDto.cs
          ✅ Controller: CompanyController.cs
          ✅ AutoMapper: OrganizationApplicationAutoMapperProfile.cs

     [03] 🎨 生成前端代码:
          ✅ View: CompanyView.vue
          ✅ API: company.ts
          ✅ Types: company.ts
          ✅ Store: companyStore.ts

     [04] 📦 生成数据库迁移:
          ✅ Migration: 20251019120000_AddCompany.cs

     [05] 🔍 代码质量检查:
          ✅ TypeScript编译: 0错误
          ✅ ESLint检查: 0错误0警告
          ✅ 后端编译: 成功
          ✅ 评分: 95/100分（符合企业级标准）

     [06] ✅ 生成完成！
          总耗时: 9.8秒
          生成文件: 13个
          代码行数: 1,245行

  4. 预览生成的代码
     点击"预览代码"按钮
     可查看所有生成的文件内容

预计时间: 4分钟（生成10秒 + 预览3分钟）

Layer 1生成的代码特点:
  ✅ 标准CRUD功能（增删改查）
  ✅ 分页、排序、筛选
  ✅ 基础验证规则
  ✅ 100%类型安全
  ✅ 完全可运行
  ✅ 可直接使用

  ⚠️ 但功能较基础:
  ⚠️ 字段布局固定（2列布局）
  ⚠️ 表单验证简单（只有必填和长度）
  ⚠️ 列表显示固定（显示所有字段）
  ⚠️ 无高级功能（批量操作、导入导出等）

  💡 解决方案: 升级到Layer 2进行定制！
```

#### 2.1.3 步骤3：运行测试（可选）

```yaml
操作步骤:
  1. 执行数据库迁移
     cd src/SmartAbp.DbMigrator
     dotnet run
     # 预期：创建Companies表

  2. 启动后端
     dotnet run --project src/SmartAbp.Web
     # 预期：https://localhost:44308 正常访问

  3. 启动前端
     cd src/SmartAbp.Vue
     npm run dev
     # 预期：http://localhost:5173 正常访问

  4. 访问公司管理页面
     URL: http://localhost:5173/organization/company

     预期功能:
       ✅ 列表显示（分页、排序、筛选）
       ✅ 新增公司（表单验证）
       ✅ 编辑公司（数据回填）
       ✅ 删除公司（确认提示）
       ✅ 操作反馈（成功/失败提示）

  5. 功能验证清单
     ☑️ 打开页面成功
     ☑️ 列表数据加载
     ☑️ 新增功能正常
     ☑️ 编辑功能正常
     ☑️ 删除功能正常
     ☑️ 分页排序正常
     ☑️ 筛选功能正常

预计时间: 10分钟（可选）

Layer 1总结:
  ✅ 优点: 极速生成（5分钟）、零配置、开箱即用
  ✅ 适合: 快速原型、基础数据管理、验证想法
  ⚠️ 限制: 功能固定、样式统一、扩展性有限

  💡 下一步: 升级到Layer 2进行定制优化！
```

---

## 🎨 第三部分：Layer 1→Layer 2渐进升级（NEW）

### 3.1 场景：30分钟将公司管理升级到进阶定制版

#### 3.1.1 步骤1：启动DevKit升级管理器（1分钟）

```yaml
操作步骤:
  1. 打开DevKit升级管理器
     方式A: 在Portal点击"升级管理"按钮
     方式B: 直接访问 http://localhost:5173/devkit/upgrade

  2. 选择要升级的模块
     模块列表中找到: "公司管理（Company）"
     当前层级: Layer 1（极简通道）
     目标层级: Layer 2（进阶定制）

  3. 点击"开始升级"按钮
     DevKit分析当前代码...
     检测升级兼容性...
     生成升级计划...

升级兼容性检查（自动）:
  ✅ 代码质量: 95分（符合升级标准）
  ✅ 文件完整性: 13/13个文件完整
  ✅ 依赖关系: 正常
  ✅ 数据库结构: 兼容
  ✅ 类型安全: 100%

  ℹ️ 升级计划:
     - 保留所有Layer 1代码（不删除）
     - 扩展AppService（添加高级查询）
     - 扩展前端组件（添加设计器）
     - 添加高级配置文件

  预计升级时间: 5分钟
  预计手动调整时间: 25分钟

  ⚠️ 注意事项:
     - 升级过程可随时中断
     - 原Layer 1代码保留，可回退
     - 升级后数据库兼容

预计时间: 1分钟
```

#### 3.1.2 步骤2：执行自动升级（4分钟）

```yaml
操作步骤:
  1. 点击"确认升级"按钮
     DevKit开始自动升级...

  2. 查看升级日志（实时）
     [01] 📋 创建升级快照（备份当前代码）
          ✅ 快照保存至: .devkit/snapshots/Company_Layer1_20251019120000

     [02] 🔧 扩展后端代码:
          ✅ 保留: CompanyAppService.cs（Layer 1版本）
          ✅ 创建: CompanyAppService.Layer2.cs（扩展类）
          ✅ 添加: 高级查询方法（GetTreeAsync, GetLookupAsync）
          ✅ 添加: 批量操作方法（BatchDeleteAsync, BatchEnableAsync）
          ✅ 添加: 导入导出方法（ExportExcelAsync, ImportExcelAsync）

     [03] 🎨 扩展前端代码:
          ✅ 保留: CompanyView.vue（Layer 1版本）
          ✅ 创建: CompanyView.Layer2.vue（扩展版本）
          ✅ 添加: 字段设计器组件
          ✅ 添加: 表单设计器组件
          ✅ 添加: 列表设计器组件
          ✅ 添加: 高级筛选组件

     [04] 📦 创建配置文件:
          ✅ 字段配置: .lowcode/configs/Company/fields.json
          ✅ 表单配置: .lowcode/configs/Company/form.json
          ✅ 列表配置: .lowcode/configs/Company/list.json
          ✅ 升级记录: .devkit/upgrade-history/Company_Layer1to2.json

     [05] 🔄 更新路由配置:
          ✅ 添加Layer 2路由: /organization/company/layer2
          ✅ 保留Layer 1路由: /organization/company/layer1
          ✅ 默认路由指向: Layer 2

     [06] 🔍 代码质量检查:
          ✅ TypeScript编译: 0错误
          ✅ ESLint检查: 0错误0警告
          ✅ 后端编译: 成功
          ✅ 评分: 95/100分

     [07] ✅ 自动升级完成！
          总耗时: 15.6秒
          新增文件: 12个
          扩展代码行数: 2,340行

          💡 提示:
             - Layer 1版本已保留，可通过路由访问
             - 现在可以使用设计器进行定制
             - 建议先预览再发布

  3. 预览升级结果
     点击"预览升级"按钮
     可查看新增的设计器界面

预计时间: 4分钟（自动升级16秒 + 预览3分钟）

自动升级完成的工作:
  ✅ 代码结构扩展（Partial类 + 继承）
  ✅ 设计器组件添加
  ✅ 配置文件生成
  ✅ 路由更新
  ✅ 质量检查

  ⚠️ 还需手动定制:
  ⚠️ 配置字段显示和验证
  ⚠️ 设计表单布局
  ⚠️ 配置列表显示
  ⚠️ 测试高级功能

  💡 下一步: 使用设计器进行定制！
```

#### 3.1.3 步骤3：使用字段设计器定制（10分钟）

```yaml
操作步骤:
  1. 打开字段设计器
     URL: http://localhost:5173/organization/company/layer2/fields

     预期: 看到从Layer 1导入的8个字段
       - Code（公司编码）
       - Name（公司名称）
       - ShortName（简称）
       - ParentId（上级公司）
       - Level（公司层级）
       - Status（状态）
       - SortOrder（排序）
       - Description（描述）

  2. 字段1：优化"公司编码"
     字段名: Code
     控件类型: input → input（保持）
     验证规则:
       ✅ 必填: true
       ✅ 正则表达式: ^[A-Z]{2,6}$（新增）
       ✅ 错误提示: "公司编码为2-6位大写字母"（新增）

     表单显示:
       ✅ 显示: true
       ✅ 必填: true
       ✅ 占位符: "请输入公司编码，如: BAOBAB"（新增）
       ✅ 帮助提示: "用于系统内唯一标识"（新增）

     列表显示:
       ✅ 显示: true
       ✅ 宽度: 120px
       ✅ 固定列: 左侧（新增）
       ✅ 可排序: true（新增）

  3. 字段2：优化"上级公司"
     字段名: ParentId
     控件类型: input → select（改为下拉选择）
     数据源配置:
       ✅ 类型: API接口
       ✅ 接口地址: /api/app/company/lookup
       ✅ 显示字段: name
       ✅ 值字段: id
       ✅ 级联选择: true（支持树形结构）

     表单显示:
       ✅ 显示: true
       ✅ 必填: false
       ✅ 占位符: "请选择上级公司"
       ✅ 可清空: true

     列表显示:
       ✅ 显示: false（不在列表显示，避免重复）

  4. 字段3：优化"状态"
     字段名: Status
     控件类型: input → select（改为枚举选择）
     选项配置:
       选项1:
         ✅ 值: Active
         ✅ 显示: 正常
         ✅ 标签颜色: 绿色
       选项2:
         ✅ 值: Inactive
         ✅ 显示: 停用
         ✅ 标签颜色: 红色

     表单显示:
       ✅ 显示: true
       ✅ 必填: true
       ✅ 默认值: Active

     列表显示:
       ✅ 显示: true
       ✅ 宽度: 100px
       ✅ 格式化: 标签形式
       ✅ 居中显示: true

  5. 批量优化其他字段
     使用"智能建议"功能:
       点击"AI优化建议"按钮
       DevKit分析字段语义
       自动推荐最佳配置
       一键应用建议

  6. 保存字段配置
     点击"保存配置"按钮
     配置保存至: .lowcode/configs/Company/fields.json
     自动触发代码重新生成

预计时间: 10分钟

字段设计器完成的工作:
  ✅ 8个字段全部优化配置
  ✅ 验证规则完善（正则、范围、唯一性）
  ✅ 控件类型优化（下拉、枚举、日期等）
  ✅ 数据源配置（API接口、字典）
  ✅ 显示控制（表单、列表）
  ✅ 格式化配置（标签、日期、货币）

  ℹ️ 配置已保存，可随时调整
  💡 下一步: 设计表单布局！
```

#### 3.1.4 步骤4：使用表单设计器定制（8分钟）

```yaml
操作步骤:
  1. 打开表单设计器
     URL: http://localhost:5173/organization/company/layer2/form

     预期: 看到默认的2列布局（从Layer 1继承）

  2. 优化表单布局
     方式: 拖拽调整

     基本信息分组:
       Row 1: [公司编码 span=8] [公司名称 span=10] [简称 span=6]
       Row 2: [上级公司 span=12] [状态 span=6] [排序 span=6]

       说明:
         - 公司编码占8列（短字段）
         - 公司名称占10列（重要字段，宽一些）
         - 简称占6列（短字段）
         - 上级公司占12列（下拉选择需要宽度）
         - 状态和排序各占6列

     扩展信息分组:
       Row 3: [描述 span=24（全宽，多行文本框）]

  3. 配置字段联动（NEW）
     联动规则1: 选择上级公司后，自动计算Level
       触发字段: ParentId
       目标字段: Level
       联动逻辑: Level = Parent.Level + 1

     联动规则2: Code格式化
       触发字段: Code
       联动逻辑: 自动转换为大写字母

     联动规则3: 状态为Inactive时，提示影响
       触发字段: Status
       联动逻辑: 当选择"停用"时，显示警告"停用后将影响下级公司"

  4. 配置验证规则（NEW）
     规则1: Code唯一性验证
       类型: 异步验证
       API: /api/app/company/check-code-unique
       触发: 失焦时

     规则2: Name最小长度验证
       类型: 同步验证
       规则: 最小2个字符
       提示: "公司名称至少2个字符"

  5. 预览表单
     点击"预览"按钮
     测试表单功能:
       ☑️ 布局美观
       ☑️ 字段联动生效
       ☑️ 验证规则生效
       ☑️ 下拉选择正常
       ☑️ 帮助提示显示

  6. 保存表单配置
     点击"保存配置"按钮
     配置保存至: .lowcode/configs/Company/form.json
     自动触发代码重新生成

预计时间: 8分钟

表单设计器完成的工作:
  ✅ 表单布局优化（灵活分组、响应式）
  ✅ 字段联动配置
  ✅ 验证规则完善
  ✅ 帮助提示添加
  ✅ 可视化预览

  ℹ️ 配置已保存，可随时调整
  💡 下一步: 配置列表显示！
```

#### 3.1.5 步骤5：使用列表设计器定制（7分钟）

```yaml
操作步骤:
  1. 打开列表设计器
     URL: http://localhost:5173/organization/company/layer2/list

     预期: 看到默认的列配置（从Layer 1继承）

  2. 优化列配置
     列1: 公司编码
       宽度: 120px
       固定: 左侧（NEW）
       可排序: true（NEW）

     列2: 公司名称
       宽度: 200px
       固定: 左侧（NEW）
       可排序: true（NEW）

     列3: 简称
       宽度: 120px
       可排序: false

     列4: 公司层级（NEW）
       宽度: 100px
       对齐: 居中
       可排序: true
       格式化:
         Level=1 → "集团公司"
         Level=2 → "子公司"
         Level=3 → "分公司"
         Level>=4 → "其他"

     列5: 状态
       宽度: 100px
       对齐: 居中
       格式化: 标签形式（NEW）
         Active → 绿色标签"正常"
         Inactive → 红色标签"停用"

     列6: 排序
       宽度: 80px
       对齐: 右对齐
       可排序: true（NEW）

     列7: 创建时间
       宽度: 180px
       格式化: 日期时间（YYYY-MM-DD HH:mm）
       可排序: true（NEW）

     列8: 操作
       宽度: 150px
       固定: 右侧（NEW）
       操作按钮: [编辑] [删除]

  3. 配置高级筛选（NEW）
     筛选项1: 公司编码
       类型: 输入框
       模糊匹配: true

     筛选项2: 公司名称
       类型: 输入框
       模糊匹配: true

     筛选项3: 状态
       类型: 下拉选择
       选项: 全部/正常/停用

     筛选项4: 公司层级
       类型: 下拉选择
       选项: 全部/集团公司/子公司/分公司

     筛选项5: 创建时间
       类型: 日期范围选择
       默认: 近30天

  4. 配置批量操作（NEW）
     操作1: 批量删除
       权限: Company.Delete
       确认提示: "确定删除选中的X条记录吗？"

     操作2: 批量启用/停用
       权限: Company.Update
       确认提示: "确定修改选中的X条记录状态吗？"

     操作3: 导出Excel（NEW）
       权限: Company.Export
       导出字段: 可自定义选择
       文件名: "公司列表_{日期}.xlsx"

  5. 预览列表
     点击"预览"按钮
     测试列表功能:
       ☑️ 列表渲染正确
       ☑️ 排序功能生效
       ☑️ 筛选功能生效
       ☑️ 格式化显示正确
       ☑️ 分页正常
       ☑️ 批量操作可用
       ☑️ 导出Excel正常

  6. 保存列表配置
     点击"保存配置"按钮
     配置保存至: .lowcode/configs/Company/list.json
     自动触发代码重新生成

预计时间: 7分钟

列表设计器完成的工作:
  ✅ 列配置优化（宽度、对齐、固定）
  ✅ 格式化配置（标签、日期、枚举）
  ✅ 排序配置
  ✅ 高级筛选
  ✅ 批量操作
  ✅ 导出Excel

  ℹ️ 配置已保存，可随时调整
  💡 Layer 2升级完成！
```

### 3.2 Layer 1→2升级总结

```yaml
升级完成情况:
  ✅ 自动升级: 5分钟（DevKit完成）
  ✅ 手动定制: 25分钟（使用设计器）
  ✅ 总耗时: 30分钟

  ✅ 代码扩展: 2,340行
  ✅ 新增文件: 12个
  ✅ 配置文件: 3个
  ✅ 代码质量: 95/100分（保持）

功能对比:
  Layer 1基础功能:
    ✅ 标准CRUD
    ✅ 分页、排序、筛选
    ✅ 基础验证

  Layer 2新增功能（NEW）:
    ✅ 字段级定制（验证规则、控件类型）
    ✅ 表单布局定制（拖拽设计、字段联动）
    ✅ 列表显示定制（列格式化、高级筛选）
    ✅ 批量操作（删除、启用/停用）
    ✅ 导入导出（Excel）
    ✅ 可视化设计器

代码架构:
  ✅ Layer 1代码保留（可回退）
  ✅ Layer 2代码扩展（Partial类 + 继承）
  ✅ 配置驱动（JSON配置文件）
  ✅ 路由分离（/layer1、/layer2）

  ℹ️ 两个版本可以共存，随时切换

升级记录:
  ✅ 升级快照: .devkit/snapshots/Company_Layer1_20251019120000
  ✅ 升级历史: .devkit/upgrade-history/Company_Layer1to2.json
  ✅ 配置文件: .lowcode/configs/Company/*.json

  ℹ️ 支持一键回退到Layer 1

下一步选择:
  选项1: 继续使用Layer 2（适合大多数场景）
  选项2: 升级到Layer 3（需要工作流、规则引擎）
  选项3: 转换为微服务（需要微服务架构）

  💡 本手册继续演示: Layer 2 → Layer 3升级
```

---

## 🏢 第四部分：Layer 2→Layer 3专业平台升级（NEW）

### 4.1 场景：2小时将公司管理升级到专业平台版

#### 4.1.1 步骤1：评估Layer 3升级必要性（5分钟）

```yaml
Layer 3升级评估清单:

  问题1: 是否需要工作流功能？
    ☑️ 公司新增需要审批流程
    ☑️ 公司信息变更需要审批
    ☑️ 公司停用需要多级审批

  问题2: 是否需要规则引擎？
    ☑️ 复杂的业务规则（如：公司编码规则动态可配）
    ☑️ 数据验证规则动态配置
    ☑️ 业务逻辑外部化

  问题3: 是否需要高级权限控制？
    ☑️ 数据权限（只能看自己公司的数据）
    ☑️ 字段权限（某些字段某些角色不可见）
    ☑️ 操作权限（某些操作某些角色不可用）

  问题4: 是否需要高级集成？
    ☑️ 与第三方系统集成
    ☑️ API接口外部调用
    ☑️ 消息队列集成

  问题5: 是否需要高级分析？
    ☑️ 数据统计报表
    ☑️ 业务看板
    ☑️ 数据导出定制

评估结果:
  ✅ 5个问题中回答"是"的数量: 5个

  建议:
    - 5个"是" → 强烈建议升级到Layer 3
    - 3-4个"是" → 建议升级到Layer 3
    - 1-2个"是" → Layer 2即可满足需求
    - 0个"是" → Layer 2即可满足需求

我们的场景:
  ✅ 5个问题全部为"是"
  ✅ 决定: 升级到Layer 3

预计时间: 5分钟
```

#### 4.1.2 步骤2：启动Layer 2→3升级（10分钟）

```yaml
操作步骤:
  1. 打开DevKit升级管理器
     URL: http://localhost:5173/devkit/upgrade

  2. 选择要升级的模块
     模块: "公司管理（Company）"
     当前层级: Layer 2（进阶定制）
     目标层级: Layer 3（专业平台）

  3. 选择Layer 3功能模块
     模块1: ✅ 工作流引擎（必选）
     模块2: ✅ 规则引擎（必选）
     模块3: ✅ 高级权限（推荐）
     模块4: ✅ API集成（推荐）
     模块5: ✅ 数据分析（推荐）
     模块6: ⬜ 消息队列（可选）

  4. 配置工作流引擎
     工作流1: 公司新增审批流程
       节点1: 提交申请（起点）
       节点2: 部门经理审批
       节点3: 总经理审批
       节点4: 审批完成（终点）

     工作流2: 公司信息变更审批流程
       节点1: 提交变更（起点）
       节点2: 合规审核
       节点3: 总经理审批
       节点4: 变更完成（终点）

  5. 配置规则引擎
     规则1: 公司编码生成规则
       规则类型: 编码生成
       规则内容: {区域代码}{行业代码}{序号}
       示例: BJ01001（北京01行业序号001）

     规则2: 公司层级限制规则
       规则类型: 业务约束
       规则内容: 最大层级不超过5级

     规则3: 公司停用条件规则
       规则类型: 前置检查
       规则内容: 有下级公司时不允许停用

  6. 配置高级权限
     数据权限:
       规则1: 集团用户看所有公司
       规则2: 公司用户只看本公司及下级
       规则3: 部门用户只看本公司

     字段权限:
       规则1: 普通用户不可见"Description"字段
       规则2: 只读用户不可编辑任何字段

     操作权限:
       规则1: 只有管理员可删除
       规则2: 普通用户只能查看和编辑

  7. 点击"开始升级"按钮
     DevKit开始升级...

     升级日志:
       [01] 📋 创建升级快照
            ✅ 快照保存: .devkit/snapshots/Company_Layer2_20251019130000

       [02] 🔧 集成工作流引擎:
            ✅ 安装: SmartAbp.Workflow包
            ✅ 创建: CompanyWorkflowService.cs
            ✅ 配置: 2个工作流定义
            ✅ 生成: 工作流管理界面

       [03] 🎯 集成规则引擎:
            ✅ 安装: SmartAbp.Rules包
            ✅ 创建: CompanyRuleEngine.cs
            ✅ 配置: 3个业务规则
            ✅ 生成: 规则配置界面

       [04] 🔐 集成高级权限:
            ✅ 安装: SmartAbp.AdvancedPermission包
            ✅ 创建: CompanyPermissionProvider.cs
            ✅ 配置: 数据权限、字段权限、操作权限
            ✅ 生成: 权限配置界面

       [05] 🌐 集成API接口:
            ✅ 创建: CompanyOpenApiController.cs
            ✅ 配置: RESTful API + Swagger文档
            ✅ 添加: API密钥认证

       [06] 📊 集成数据分析:
            ✅ 创建: CompanyAnalyticsService.cs
            ✅ 配置: 5个统计报表
            ✅ 生成: 数据看板界面

       [07] 🔄 更新路由配置:
            ✅ 添加Layer 3路由: /organization/company/layer3
            ✅ 保留Layer 2路由: /organization/company/layer2
            ✅ 保留Layer 1路由: /organization/company/layer1
            ✅ 默认路由指向: Layer 3

       [08] 🔍 代码质量检查:
            ✅ TypeScript编译: 0错误
            ✅ ESLint检查: 0错误0警告
            ✅ 后端编译: 成功
            ✅ 评分: 95/100分

       [09] ✅ 升级完成！
            总耗时: 45.2秒
            新增文件: 28个
            扩展代码行数: 4,680行

            💡 提示:
               - Layer 2版本已保留
               - Layer 1版本已保留
               - 现在可以使用专业平台功能
               - 建议先测试再发布

预计时间: 10分钟（自动升级45秒 + 配置9分钟）
```

#### 4.1.3 步骤3：配置工作流（30分钟）

```yaml
操作步骤:
  1. 打开工作流设计器
     URL: http://localhost:5173/organization/company/layer3/workflow

     预期: 看到2个预置工作流
       - 公司新增审批流程
       - 公司信息变更审批流程

  2. 配置工作流1：公司新增审批流程

     节点1: 提交申请（起点）
       类型: 开始节点
       操作: 用户填写公司信息并提交
       下一步: 自动流转到"部门经理审批"

     节点2: 部门经理审批
       类型: 审批节点
       审批人: 申请人的部门经理（动态获取）
       审批选项: [同意] [拒绝] [退回]
       超时处理: 48小时未审批自动提醒
       同意后: 流转到"总经理审批"
       拒绝后: 流转到"审批完成"（状态：已拒绝）
       退回后: 流转到"提交申请"（重新填写）

     节点3: 总经理审批
       类型: 审批节点
       审批人: 总经理角色（配置角色）
       审批选项: [同意] [拒绝] [退回]
       超时处理: 72小时未审批自动提醒
       同意后: 流转到"审批完成"（状态：已通过）
       拒绝后: 流转到"审批完成"（状态：已拒绝）
       退回后: 流转到"部门经理审批"

     节点4: 审批完成（终点）
       类型: 结束节点
       操作: 根据审批结果自动处理
         - 已通过: 自动创建公司记录
         - 已拒绝: 记录拒绝原因
         - 已退回: 通知申请人重新提交

  3. 配置工作流2：公司信息变更审批流程

     节点1: 提交变更（起点）
       类型: 开始节点
       操作: 用户修改公司信息并提交变更申请
       下一步: 自动流转到"合规审核"

     节点2: 合规审核
       类型: 审批节点
       审批人: 合规部门（配置部门）
       审批选项: [通过] [不通过]
       超时处理: 24小时未审批自动提醒
       通过后: 流转到"总经理审批"
       不通过后: 流转到"变更完成"（状态：未通过）

     节点3: 总经理审批
       类型: 审批节点
       审批人: 总经理角色
       审批选项: [同意] [拒绝]
       超时处理: 48小时未审批自动提醒
       同意后: 流转到"变更完成"（状态：已通过）
       拒绝后: 流转到"变更完成"（状态：已拒绝）

     节点4: 变更完成（终点）
       类型: 结束节点
       操作: 根据审批结果自动处理
         - 已通过: 自动更新公司信息
         - 未通过/已拒绝: 记录原因，不更新数据

  4. 测试工作流
     步骤1: 提交一个新公司申请
     步骤2: 模拟部门经理审批
     步骤3: 模拟总经理审批
     步骤4: 验证公司是否自动创建

     预期: 工作流正常流转，公司创建成功

  5. 保存工作流配置
     配置保存至: .lowcode/workflows/Company/*.json

预计时间: 30分钟
```

#### 4.1.4 步骤4：配置规则引擎（25分钟）

```yaml
操作步骤:
  1. 打开规则配置器
     URL: http://localhost:5173/organization/company/layer3/rules

  2. 配置规则1：公司编码生成规则
     规则名称: CompanyCodeGenerator
     规则类型: 编码生成
     触发时机: 创建公司时

     规则内容（配置）:
       模板: {Region}{Industry}{Sequence}

       Region（区域代码）:
         获取方式: 从公司所在地推断
         示例: BJ（北京）、SH（上海）、GZ（广州）

       Industry（行业代码）:
         获取方式: 从用户选择的行业获取
         示例: 01（互联网）、02（制造业）、03（金融）

       Sequence（序号）:
         获取方式: 数据库自增
         格式: 001-999（3位数字）

       完整示例:
         BJ01001（北京互联网公司序号001）
         SH02015（上海制造业公司序号015）

     规则优先级: 1（最高）
     规则状态: 启用

  2. 配置规则2：公司层级限制规则
     规则名称: CompanyLevelLimit
     规则类型: 业务约束
     触发时机: 创建/编辑公司时

     规则内容（DSL）:
       IF ParentId != NULL THEN
         ParentLevel = Query(Companies, Id = ParentId, Level)
         CurrentLevel = ParentLevel + 1

         IF CurrentLevel > 5 THEN
           RETURN Error("公司层级不能超过5级")
         END IF
       END IF

     规则优先级: 2
     规则状态: 启用

  3. 配置规则3：公司停用条件规则
     规则名称: CompanyInactiveCheck
     规则类型: 前置检查
     触发时机: 停用公司时

     规则内容（DSL）:
       ChildCount = Count(Companies, ParentId = CurrentId AND Status = 'Active')

       IF ChildCount > 0 THEN
         RETURN Error("该公司有{ChildCount}个正常状态的下级公司，无法停用")
       END IF

       EmployeeCount = Count(Employees, CompanyId = CurrentId AND Status = 'Active')

       IF EmployeeCount > 0 THEN
         RETURN Warning("该公司有{EmployeeCount}个在职员工，停用后员工将无法登录")
         RETURN Confirm("确定要停用吗？")
       END IF

     规则优先级: 3
     规则状态: 启用

  4. 测试规则引擎
     测试1: 创建公司，验证编码是否自动生成
     测试2: 创建6级公司，验证是否提示层级限制
     测试3: 停用有下级的公司，验证是否提示错误

     预期: 所有规则正常工作

  5. 保存规则配置
     配置保存至: .lowcode/rules/Company/*.json

预计时间: 25分钟
```

#### 4.1.5 步骤5：配置高级权限（20分钟）

```yaml
操作步骤:
  1. 打开权限配置器
     URL: http://localhost:5173/organization/company/layer3/permissions

  2. 配置数据权限
     规则1: 集团用户权限
       角色: 集团管理员
       数据范围: 所有公司（无限制）
       SQL过滤: 无

     规则2: 公司用户权限
       角色: 公司管理员
       数据范围: 本公司及下级公司
       SQL过滤:
         Id = CurrentUser.CompanyId OR
         ParentId = CurrentUser.CompanyId OR
         ParentId IN (
           SELECT Id FROM Companies WHERE ParentId = CurrentUser.CompanyId
         )

     规则3: 部门用户权限
       角色: 部门经理
       数据范围: 仅本公司
       SQL过滤: Id = CurrentUser.CompanyId

  3. 配置字段权限
     字段1: Code（公司编码）
       所有角色: 可见
       集团管理员: 可编辑
       公司管理员: 只读
       部门经理: 只读
       普通用户: 只读

     字段2: Name（公司名称）
       所有角色: 可见
       集团管理员: 可编辑
       公司管理员: 可编辑
       部门经理: 只读
       普通用户: 只读

     字段3: Description（描述）
       集团管理员: 可见、可编辑
       公司管理员: 可见、可编辑
       部门经理: 不可见
       普通用户: 不可见

  4. 配置操作权限
     操作1: 新增公司
       集团管理员: 允许
       公司管理员: 允许（需审批）
       部门经理: 禁止
       普通用户: 禁止

     操作2: 编辑公司
       集团管理员: 允许
       公司管理员: 允许（仅限本公司，需审批）
       部门经理: 禁止
       普通用户: 禁止

     操作3: 删除公司
       集团管理员: 允许
       公司管理员: 禁止
       部门经理: 禁止
       普通用户: 禁止

     操作4: 停用公司
       集团管理员: 允许
       公司管理员: 允许（仅限本公司，需审批）
       部门经理: 禁止
       普通用户: 禁止

  5. 测试权限配置
     测试1: 使用不同角色登录，验证数据权限
     测试2: 尝试编辑不同字段，验证字段权限
     测试3: 尝试不同操作，验证操作权限

     预期: 所有权限规则正常工作

  6. 保存权限配置
     配置保存至: .lowcode/permissions/Company/*.json

预计时间: 20分钟
```

#### 4.1.6 步骤6：配置API接口和数据分析（30分钟）

```yaml
操作步骤:
  1. 打开API配置器
     URL: http://localhost:5173/organization/company/layer3/api

  2. 配置RESTful API
     GET /api/open/company/list
       说明: 获取公司列表
       认证: API Key
       参数:
         - page（页码）
         - pageSize（每页条数）
         - status（状态）
       响应: { total, items }

     GET /api/open/company/{id}
       说明: 获取公司详情
       认证: API Key
       参数: id（公司ID）
       响应: CompanyDto

     POST /api/open/company
       说明: 创建公司
       认证: API Key + OAuth2
       参数: CreateCompanyDto
       响应: CompanyDto

     PUT /api/open/company/{id}
       说明: 更新公司
       认证: API Key + OAuth2
       参数: id, UpdateCompanyDto
       响应: CompanyDto

     DELETE /api/open/company/{id}
       说明: 删除公司
       认证: API Key + OAuth2
       参数: id
       响应: 成功/失败

  3. 配置API密钥
     步骤1: 生成API Key
     步骤2: 配置访问频率限制（100次/分钟）
     步骤3: 配置IP白名单
     步骤4: 生成Swagger文档

  4. 配置数据分析
     报表1: 公司数量统计
       维度: 按状态统计
       图表: 饼图
       数据: Active: XX个, Inactive: XX个

     报表2: 公司层级分布
       维度: 按层级统计
       图表: 柱状图
       数据: 1级: XX个, 2级: XX个, ...

     报表3: 公司增长趋势
       维度: 按月统计
       图表: 折线图
       数据: 近12个月的新增公司数量

     报表4: 公司地域分布
       维度: 按地区统计
       图表: 地图
       数据: 北京: XX个, 上海: XX个, ...

     报表5: Top10公司
       维度: 按下级公司数量排序
       图表: 表格
       数据: 公司名称、下级数量、员工数量

  5. 生成数据看板
     点击"生成看板"按钮
     自动生成数据看板页面
     URL: http://localhost:5173/organization/company/layer3/dashboard

  6. 测试API和数据分析
     测试1: 使用Postman调用API
     测试2: 访问数据看板，查看报表

     预期: API正常调用，数据看板正常显示

预计时间: 30分钟
```

### 4.2 Layer 2→3升级总结

```yaml
升级完成情况:
  ✅ 自动升级: 45秒（DevKit完成）
  ✅ 手动配置: 115分钟（工作流、规则、权限、API、分析）
  ✅ 总耗时: 约2小时

  ✅ 代码扩展: 4,680行
  ✅ 新增文件: 28个
  ✅ 配置文件: 15个
  ✅ 代码质量: 95/100分（保持）

功能对比:
  Layer 2进阶功能:
    ✅ 字段级定制
    ✅ 表单布局定制
    ✅ 列表显示定制
    ✅ 批量操作
    ✅ 导入导出

  Layer 3新增功能（NEW）:
    ✅ 工作流引擎（审批流程）
    ✅ 规则引擎（业务规则外部化）
    ✅ 高级权限（数据权限、字段权限、操作权限）
    ✅ API接口（RESTful + Swagger）
    ✅ 数据分析（报表 + 看板）
    ✅ 消息队列集成（可选）

代码架构:
  ✅ Layer 1代码保留（可回退）
  ✅ Layer 2代码保留（可回退）
  ✅ Layer 3代码扩展（插件式集成）
  ✅ 配置驱动（工作流、规则、权限都可配置）
  ✅ 路由分离（/layer1、/layer2、/layer3）

  ℹ️ 三个版本可以共存，随时切换

升级记录:
  ✅ 升级快照: .devkit/snapshots/Company_Layer2_20251019130000
  ✅ 升级历史: .devkit/upgrade-history/Company_Layer2to3.json
  ✅ 配置文件: .lowcode/workflows/, .lowcode/rules/, .lowcode/permissions/

  ℹ️ 支持一键回退到Layer 2或Layer 1

下一步选择:
  选项1: 继续使用Layer 3（适合企业级复杂业务）
  选项2: 转换为微服务（需要微服务架构）

  💡 本手册继续演示: Layer 3 → Aspire微服务转换
```

---

## 🚀 第五部分：使用DevKit框架管理升级（NEW）

### 5.1 DevKit升级管理器功能总览

```yaml
DevKit升级管理器核心功能:

功能1: 升级路径管理
  ✅ 查看所有模块的当前层级
  ✅ 查看可升级的路径（Layer1→2, Layer2→3）
  ✅ 查看升级历史记录
  ✅ 查看升级快照

功能2: 升级计划生成
  ✅ 分析当前代码结构
  ✅ 评估升级兼容性
  ✅ 生成详细升级计划
  ✅ 预估升级时间和工作量

功能3: 自动升级执行
  ✅ 创建代码快照（可回退）
  ✅ 扩展后端代码（Partial类 + 继承）
  ✅ 扩展前端代码（高阶组件 + 插槽）
  ✅ 生成配置文件
  ✅ 更新路由配置
  ✅ 执行代码质量检查

功能4: 升级记录管理
  ✅ 记录每次升级的详细信息
  ✅ 保存升级前后的代码快照
  ✅ 支持一键回退到任意历史版本
  ✅ 导出升级报告

功能5: 版本管理
  ✅ 多版本并存（Layer1/2/3同时保留）
  ✅ 灰度发布（部分用户使用新版本）
  ✅ A/B测试（对比不同版本效果）
  ✅ 版本切换（随时切换到任意版本）

使用场景:
  场景1: 快速原型验证
    Layer 1 → 5分钟快速生成 → 验证业务逻辑 → 决定是否升级

  场景2: 渐进式开发
    Layer 1 → 快速生成 →
    Layer 2 → 定制字段和UI →
    Layer 3 → 添加工作流和规则 →
    微服务 → 拆分为微服务

  场景3: 版本回退
    Layer 3发现问题 → 一键回退到Layer 2 →
    修复问题 → 重新升级到Layer 3

  场景4: 多版本并存
    核心模块使用Layer 3 →
    辅助模块使用Layer 2 →
    临时模块使用Layer 1 →
    灵活组合

DevKit的价值:
  ✅ 降低升级风险（可随时回退）
  ✅ 提高开发效率（自动化升级）
  ✅ 保证代码质量（强制质量检查）
  ✅ 统一架构风格（模板驱动）
  ✅ 简化版本管理（多版本并存）
```

### 5.2 DevKit命令行工具使用

```bash
# DevKit CLI使用指南

# 1. 查看所有模块的升级状态
dotnet devkit upgrade status

# 输出示例:
# ┌──────────────────────┬──────────────┬──────────────┐
# │ 模块名称             │ 当前层级     │ 可升级       │
# ├──────────────────────┼──────────────┼──────────────┤
# │ Company（公司管理）  │ Layer 3      │ 微服务       │
# │ Department（部门）   │ Layer 2      │ Layer 3      │
# │ User（用户管理）     │ Layer 1      │ Layer 2      │
# └──────────────────────┴──────────────┴──────────────┘

# 2. 升级指定模块
dotnet devkit upgrade --module Company --from Layer2 --to Layer3

# 3. 升级所有Layer 1模块到Layer 2
dotnet devkit upgrade --from Layer1 --to Layer2 --all

# 4. 查看升级历史
dotnet devkit upgrade history --module Company

# 输出示例:
# 升级历史:
#   1. 2025-10-19 12:00:00 Layer 1 → Layer 2 (成功)
#   2. 2025-10-19 13:00:00 Layer 2 → Layer 3 (成功)

# 5. 回退到指定版本
dotnet devkit upgrade rollback --module Company --to Layer2

# 6. 查看升级快照
dotnet devkit upgrade snapshots --module Company

# 输出示例:
# 快照列表:
#   1. Company_Layer1_20251019120000.zip (Layer 1, 2025-10-19 12:00:00)
#   2. Company_Layer2_20251019130000.zip (Layer 2, 2025-10-19 13:00:00)

# 7. 恢复指定快照
dotnet devkit upgrade restore --module Company --snapshot Company_Layer1_20251019120000

# 8. 导出升级报告
dotnet devkit upgrade report --module Company --output Company_Upgrade_Report.html
```

### 5.3 DevKit核心接口（供扩展使用）

```csharp
// DevKit核心接口定义

namespace SmartAbp.DevKit.Core
{
    /// <summary>
    /// 升级管理器接口
    /// </summary>
    public interface IUpgradeManager
    {
        /// <summary>
        /// 分析模块升级兼容性
        /// </summary>
        Task<UpgradeCompatibilityResult> AnalyzeCompatibilityAsync(
            string moduleName,
            LayerLevel fromLayer,
            LayerLevel toLayer);

        /// <summary>
        /// 生成升级计划
        /// </summary>
        Task<UpgradePlan> GeneratePlanAsync(
            string moduleName,
            LayerLevel fromLayer,
            LayerLevel toLayer);

        /// <summary>
        /// 执行升级
        /// </summary>
        Task<UpgradeResult> ExecuteUpgradeAsync(UpgradePlan plan);

        /// <summary>
        /// 创建快照
        /// </summary>
        Task<Snapshot> CreateSnapshotAsync(string moduleName, LayerLevel layer);

        /// <summary>
        /// 回退到指定版本
        /// </summary>
        Task<RollbackResult> RollbackAsync(string moduleName, LayerLevel targetLayer);

        /// <summary>
        /// 恢复快照
        /// </summary>
        Task<RestoreResult> RestoreSnapshotAsync(string snapshotId);
    }

    /// <summary>
    /// 代码生成器接口
    /// </summary>
    public interface ICodeGenerator
    {
        /// <summary>
        /// 生成Layer 1代码
        /// </summary>
        Task<GenerationResult> GenerateLayer1Async(Layer1Config config);

        /// <summary>
        /// 扩展Layer 2代码
        /// </summary>
        Task<GenerationResult> ExtendToLayer2Async(
            string moduleName,
            Layer2Config config);

        /// <summary>
        /// 扩展Layer 3代码
        /// </summary>
        Task<GenerationResult> ExtendToLayer3Async(
            string moduleName,
            Layer3Config config);

        /// <summary>
        /// 转换为微服务
        /// </summary>
        Task<GenerationResult> ConvertToMicroserviceAsync(
            string moduleName,
            MicroserviceConfig config);
    }

    /// <summary>
    /// 模板管理器接口
    /// </summary>
    public interface ITemplateManager
    {
        /// <summary>
        /// 获取Layer 1模板
        /// </summary>
        Task<TemplateCollection> GetLayer1TemplatesAsync();

        /// <summary>
        /// 获取Layer 2扩展模板
        /// </summary>
        Task<TemplateCollection> GetLayer2ExtensionTemplatesAsync();

        /// <summary>
        /// 获取Layer 3扩展模板
        /// </summary>
        Task<TemplateCollection> GetLayer3ExtensionTemplatesAsync();

        /// <summary>
        /// 获取微服务转换模板
        /// </summary>
        Task<TemplateCollection> GetMicroserviceTemplatesAsync();

        /// <summary>
        /// 自定义模板
        /// </summary>
        Task<CustomTemplate> CreateCustomTemplateAsync(
            string name,
            string content,
            TemplateType type);
    }
}

// 使用示例
public class CompanyUpgradeService
{
    private readonly IUpgradeManager _upgradeManager;
    private readonly ICodeGenerator _codeGenerator;

    public async Task UpgradeCompanyModuleAsync()
    {
        // 1. 分析兼容性
        var compatibility = await _upgradeManager.AnalyzeCompatibilityAsync(
            "Company", LayerLevel.Layer2, LayerLevel.Layer3);

        if (!compatibility.IsCompatible)
        {
            throw new Exception($"升级不兼容: {compatibility.Reason}");
        }

        // 2. 生成升级计划
        var plan = await _upgradeManager.GeneratePlanAsync(
            "Company", LayerLevel.Layer2, LayerLevel.Layer3);

        // 3. 执行升级
        var result = await _upgradeManager.ExecuteUpgradeAsync(plan);

        if (result.IsSuccess)
        {
            Console.WriteLine("升级成功！");
        }
        else
        {
            Console.WriteLine($"升级失败: {result.ErrorMessage}");

            // 4. 回退
            await _upgradeManager.RollbackAsync("Company", LayerLevel.Layer2);
        }
    }
}
```

---

本文档为**Part 1**，包含：
- 第一部分：准备工作
- 第二部分：Layer 1极简通道快速生成
- 第三部分：Layer 1→Layer 2渐进升级
- 第四部分：Layer 2→Layer 3专业平台升级
- 第五部分：使用DevKit框架管理升级

**请继续阅读Part 2**，将包含：
- 第六部分：Aspire微服务编排转换
- 第七部分：生成结果验证
- 第八部分：进阶技巧
- 第九部分：效率对比
- 第十部分：最佳实践建议
- 总结

---

**🎉 恭喜！您已完成Layer1→2→3的渐进式升级演示！**

**继续阅读Part 2，了解Aspire微服务编排转换！** 🚀

