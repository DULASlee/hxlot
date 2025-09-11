# 🎯 SmartAbp 模板库使用演示

## 📋 概述

本文档演示如何使用SmartAbp模板库进行AI辅助编程，展示AI如何自动识别和使用模板。

## 🚀 使用场景演示

### 场景1：创建产品管理模块

#### 用户输入
```
我需要创建一个产品管理模块，包含完整的CRUD操作
```

#### AI预期响应流程

**第1步：模板搜索**
```
🔍 **模板搜索**: 正在查找CRUD相关模板...
```

AI应该执行：
```bash
glob "templates/**/*crud*.template.*"
```

**第2步：模板发现**
```
📋 **模板发现**: 找到以下相关模板：
- templates/backend/application/CrudAppService.template.cs (ABP CRUD应用服务)
- templates/backend/contracts/EntityDto.template.cs (实体DTO)
- templates/backend/contracts/CreateEntityDto.template.cs (创建DTO)
- templates/backend/contracts/UpdateEntityDto.template.cs (更新DTO)
- templates/frontend/components/CrudManagement.template.vue (Vue管理组件)
- templates/frontend/stores/EntityStore.template.ts (Pinia状态管理)
```

**第3步：参数映射**
```
⚙️ **参数映射**: 
- EntityName: Product
- entityName: product
- entityDisplayName: 产品
- ModuleName: Catalog
- kebab-case-name: product-management
```

**第4步：代码生成**
```
🏗️ **代码生成**: 基于模板生成以下文件：
1. ProductAppService.cs (后端应用服务)
2. ProductDto.cs (数据传输对象)
3. CreateProductDto.cs (创建DTO)
4. UpdateProductDto.cs (更新DTO)
5. ProductManagement.vue (前端管理组件)
6. useProductStore.ts (状态管理)
```

**第5步：合规检查**
```
✅ **合规检查**: 
- 代码符合ABP框架规范 ✓
- 遵循项目命名约定 ✓
- 包含必要的权限检查 ✓
- 前端组件符合Vue3 + Element Plus规范 ✓
```

### 场景2：创建用户管理页面

#### 用户输入
```
需要一个用户管理页面，包含列表、搜索、新增、编辑功能
```

#### AI预期响应流程

**第1步：模板搜索**
```
🔍 **模板搜索**: 正在查找管理页面相关模板...
```

AI应该执行：
```bash
glob "templates/**/components/*management*.template.vue"
```

**第2步：模板发现和应用**
```
📋 **模板发现**: 找到模板 `templates/frontend/components/CrudManagement.template.vue`

⚙️ **参数映射**: 
- EntityName: User
- entityName: user
- entityDisplayName: 用户
- ModuleName: Identity
- kebab-case-name: user-management

🏗️ **代码生成**: 基于Vue CRUD管理组件模板生成 UserManagement.vue

✅ **合规检查**: 代码符合Vue3组合式API规范和Element Plus设计系统
```

### 场景3：创建状态管理Store

#### 用户输入
```
为订单模块创建Pinia状态管理
```

#### AI预期响应流程

```
🔍 **模板搜索**: 正在查找状态管理相关模板...

📋 **模板发现**: 找到模板 `templates/frontend/stores/EntityStore.template.ts`

⚙️ **参数映射**: 
- EntityName: Order
- entityName: order
- ModuleName: Sales

🏗️ **代码生成**: 基于Pinia实体状态管理模板生成 useOrderStore.ts

✅ **合规检查**: 代码符合Pinia状态管理规范，包含完整的CRUD操作和错误处理
```

## 🔧 AI行为验证

### 必须执行的步骤

1. **模板搜索阶段**
   - [ ] AI是否在代码生成前搜索了相关模板？
   - [ ] 是否使用了正确的glob模式？
   - [ ] 是否找到了最匹配的模板？

2. **模板应用阶段**
   - [ ] AI是否正确解析了模板参数？
   - [ ] 是否正确替换了所有占位符？
   - [ ] 是否保持了模板的结构和规范？

3. **质量检查阶段**
   - [ ] 生成的代码是否符合项目规范？
   - [ ] 是否包含了必要的注释和文档？
   - [ ] 是否通过了基本的语法检查？

### 错误处理验证

#### 场景：模板不存在
```
用户输入：创建一个区块链智能合约

AI应该响应：
🔍 **模板搜索**: 正在查找智能合约相关模板...
❌ **模板缺失**: 未找到智能合约相关模板
💡 **建议**: 将基于项目约定手动创建代码，并建议添加到模板库
📝 **后续**: 建议将此代码模式添加到 templates/blockchain/contracts/SmartContract.template.sol
```

#### 场景：参数不完整
```
用户输入：创建一个管理页面（未指定实体）

AI应该响应：
🔍 **模板搜索**: 找到管理页面模板
❓ **参数确认**: 请提供以下必需参数：
- 实体名称（如：Product、User）
- 显示名称（如：产品、用户）
- 所属模块（如：Catalog、Identity）
```

## 📊 效果评估

### 成功指标

- **模板使用率**: > 80% 的代码生成任务使用了模板
- **代码质量**: 生成的代码通过所有质量门禁
- **开发效率**: 代码生成时间减少 60%
- **一致性**: 生成的代码 100% 符合项目规范

### 监控方法

1. **实时监控**
   - 记录每次AI代码生成是否使用了模板
   - 统计模板使用频率和成功率
   - 收集用户对生成代码的反馈

2. **质量检查**
   - 自动运行代码质量检查
   - 验证生成代码的可编译性
   - 检查是否遵循项目约定

3. **持续改进**
   - 分析未使用模板的原因
   - 根据使用情况优化模板内容
   - 扩展模板库覆盖更多场景

## 🎯 最佳实践

### 用户输入建议

**✅ 好的输入示例**：
- "创建产品管理的CRUD服务"
- "需要一个用户管理页面"
- "为订单模块添加状态管理"

**❌ 避免的输入**：
- "写一些代码"（太模糊）
- "复制其他项目的代码"（违反模板优先原则）
- "不要使用模板"（违反项目规范）

### AI响应规范

**必须包含的元素**：
1. 🔍 模板搜索过程
2. 📋 模板发现结果
3. ⚙️ 参数映射详情
4. 🏗️ 代码生成说明
5. ✅ 合规检查结果

**禁止的行为**：
- 跳过模板搜索直接生成代码
- 使用外部代码而不是项目模板
- 生成不符合项目规范的代码

## 🚀 下一步计划

1. **模板库扩展**
   - 添加更多业务场景模板
   - 创建测试代码模板
   - 开发部署脚本模板

2. **AI能力增强**
   - 改进模板匹配算法
   - 增加智能参数推断
   - 优化代码生成质量

3. **工具链完善**
   - 开发VS Code插件
   - 集成到CI/CD流程
   - 创建模板管理界面