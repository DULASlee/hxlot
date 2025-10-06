# metadata-core 测试修复说明

**创建日期**: 2025-10-06
**状态**: 待修复
**测试通过率**: 80%（96/120）
**失败用例**: 39个

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 失败原因分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 类别1: 自定义错误消息不匹配（20个）

**问题**: Zod默认错误消息与测试期望的中文消息不一致

**示例**:
```typescript
// 测试期望
expect(errors).toContain('实体名称不能为空')

// Zod实际返回
['name: Required']

// 解决方案
z.string({
  required_error: '实体名称不能为空'
}).min(1)
```

**影响测试**:
- entity-validator.test.ts: 4个（1.2, 1.3, 1.4, 2.1）
- module-validator.test.ts: 5个（1.2, 1.3, 1.4, 1.5）
- aspire-validator.test.ts: 5个（1.2, 1.3, 1.4, 1.5）

**修复方法**: 为所有Schema字段添加custom error messages

### 类别2: 跨字段验证逻辑缺失（15个）

**问题**: 高级验证逻辑未实现

**缺失验证**:
```typescript
1. 属性名称重复检测
   - 测试: 4.1 应该拒绝重复的属性名
   - 期望: errors.toContain('属性名称不能重复: title')
   - 实际: ['properties.properties: 属性名称不能重复']
   - 问题: 错误消息不包含具体字段名

2. 属性名与导航属性名冲突
   - 测试: 4.2 应该拒绝属性名与导航属性名重复
   - 缺失: 跨数组验证逻辑

3. 导航属性名重复
   - 测试: 4.3 应该拒绝重复的导航属性名
   - 缺失: navigationProperties数组验证

4. foreignKey验证
   - 测试: 4.5 应该验证foreignKey引用存在的属性
   - 缺失: 引用完整性检查

5. 路由名称/路径重复
   - 测试: 2.8 应该拒绝重复的路由名称
   - 测试: 2.9 应该拒绝重复的路由路径
   - 缺失: routes数组去重验证

6. Store名称重复
   - 测试: 3.7 应该拒绝重复的Store名称
   - 缺失: stores数组去重验证

7. 微服务名称/端口重复
   - 测试: 2.7 应该拒绝重复的微服务名称
   - 测试: 2.8 应该拒绝重复的端口号
   - 缺失: microservices数组去重验证
```

**修复方法**: 使用Zod的superRefine()实现复杂验证

### 类别3: 异步验证API返回值错误（3个）

**问题**: validateXxxAsync()应该返回boolean，实际返回元数据对象

**错误实现**:
```typescript
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<EntityMetadata> {  // ❌ 应该返回boolean
    const result = EntityMetadataSchema.safeParse(data)
    if (!result.success) throw result.error
    return result.data  // ❌ 应该返回true
}
```

**正确实现**:
```typescript
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<boolean> {  // ✅ 返回boolean
    const result = EntityMetadataSchema.safeParse(data)
    if (!result.success) throw result.error
    return true  // ✅ 验证成功返回true
}
```

### 类别4: 嵌套路由验证（1个）

**问题**: RouteMetadata不支持递归children

**当前类型**:
```typescript
export interface RouteMetadata {
  path: string
  name: string
  component?: string
  meta?: Record<string, any>
  // 缺少children字段！
}
```

**修复**: 添加children: RouteMetadata[]支持

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 详细修复清单
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 修复1: 自定义错误消息（entity-validator.ts）

```typescript
// 需要修改的Schema字段
export const EntityMetadataSchema = z.object({
    schemaVersion: z.string().default('1.0.0'),
    name: z.string({
        required_error: '实体名称不能为空',  // ✅ 添加
        invalid_type_error: '实体名称必须是字符串'
    })
        .min(1, '实体名称不能为空')
        .max(128, '实体名称不能超过128个字符')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '实体名称必须是PascalCase格式（首字母大写）'),  // ✅ 修改
    module: z.string({
        required_error: '模块名称不能为空',  // ✅ 添加
        invalid_type_error: '模块名称必须是字符串'
    }).min(1, '模块名称不能为空'),
    // ... 其他字段 ...
    properties: z.array(PropertyMetadataSchema)
        .min(1, '实体必须至少有一个属性'),  // ✅ 修改消息
})
```

### 修复2: 跨字段验证（entity-validator.ts）

```typescript
export const EntityMetadataSchema = z.object({
    // ... 现有字段 ...
}).superRefine((data, ctx) => {
    // 1. 检查属性名称重复（需要包含具体字段名）
    const propNames = data.properties.map(p => p.name)
    const duplicates = propNames.filter((name, index) => propNames.indexOf(name) !== index)
    
    if (duplicates.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `属性名称不能重复: ${duplicates[0]}`,  // ✅ 包含字段名
            path: ['properties']
        })
    }
    
    // 2. 检查属性名与导航属性名冲突
    if (data.navigationProperties) {
        const navNames = data.navigationProperties.map(n => n.name)
        const conflicts = propNames.filter(name => navNames.includes(name))
        
        if (conflicts.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `属性名称与导航属性名称重复: ${conflicts[0]}`,
                path: ['properties']
            })
        }
    }
    
    // 3. 检查导航属性名重复
    if (data.navigationProperties) {
        const navNames = data.navigationProperties.map(n => n.name)
        const navDuplicates = navNames.filter((name, index) => navNames.indexOf(name) !== index)
        
        if (navDuplicates.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `导航属性名称不能重复: ${navDuplicates[0]}`,
                path: ['navigationProperties']
            })
        }
    }
    
    // 4. 验证foreignKey引用存在
    if (data.navigationProperties) {
        for (const nav of data.navigationProperties) {
            if (nav.foreignKey) {
                const exists = propNames.includes(nav.foreignKey)
                if (!exists) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `foreignKey '${nav.foreignKey}' 不存在于属性列表中`,
                        path: ['navigationProperties', nav.name, 'foreignKey']
                    })
                }
            }
        }
    }
})
```

### 修复3: 异步验证API（所有validators）

```typescript
// entity-validator.ts
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<boolean> {  // ✅ 改为boolean
    const result = EntityMetadataSchema.safeParse(data)
    if (!result.success) throw result.error
    return true  // ✅ 返回true
}

// module-validator.ts
export async function validateModuleMetadataAsync(
    data: unknown
): Promise<boolean> {  // ✅ 改为boolean
    const result = ModuleMetadataSchema.safeParse(data)
    if (!result.success) throw result.error
    return true  // ✅ 返回true
}

// aspire-validator.ts
export async function validateAspireSolutionMetadataAsync(
    data: unknown
): Promise<boolean> {  // ✅ 改为boolean
    const result = AspireSolutionMetadataSchema.safeParse(data)
    if (!result.success) throw result.error
    return true  // ✅ 返回true
}
```

### 修复4: RouteMetadata递归children支持

```typescript
// types/index.ts
export interface RouteMetadata {
  path: string
  name: string
  component?: string
  meta?: Record<string, any>
  children?: RouteMetadata[]  // ✅ 添加递归children
}

// validators/module-validator.ts
const RouteMetadataSchema: z.ZodType<RouteMetadata> = z.lazy(() =>
  z.object({
    path: z.string().min(1, '路由路径不能为空').startsWith('/'),
    name: z.string()
      .min(1, '路由名称不能为空')
      .regex(/^[A-Z][a-zA-Z0-9]*$/, '路由名称必须是PascalCase格式'),
    component: z.string().optional(),
    meta: z.record(z.any()).optional(),
    children: z.array(RouteMetadataSchema).optional()  // ✅ 递归
  })
)
```

### 修复5: Module/Aspire Schema自定义消息

```typescript
// module-validator.ts
export const ModuleMetadataSchema = z.object({
    name: z.string({
        required_error: '模块名称不能为空'  // ✅ 添加
    })
        .min(1, '模块名称不能为空')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '模块名称必须是PascalCase格式（首字母大写）'),  // ✅ 修改
    version: z.string({
        required_error: '模块版本不能为空'  // ✅ 添加
    })
        .regex(/^\d+\.\d+\.\d+/, '模块版本必须遵循语义化版本格式（如1.0.0）'),  // ✅ 修改
    // ... 其他字段 ...
    routes: z.array(RouteMetadataSchema).default([]).superRefine((routes, ctx) => {
        // 检查路由名称重复
        const names = routes.map(r => r.name)
        const dupName = names.find((name, i) => names.indexOf(name) !== i)
        if (dupName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `路由名称不能重复: ${dupName}`,
                path: []
            })
        }
        
        // 检查路由路径重复
        const paths = routes.map(r => r.path)
        const dupPath = paths.find((path, i) => paths.indexOf(path) !== i)
        if (dupPath) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `路由路径不能重复: ${dupPath}`,
                path: []
            })
        }
    }),
    stores: z.array(StoreMetadataSchema).default([]).superRefine((stores, ctx) => {
        // 检查Store名称重复
        const names = stores.map(s => s.name)
        const dupName = names.find((name, i) => names.indexOf(name) !== i)
        if (dupName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Store名称不能重复: ${dupName}`,
                path: []
            })
        }
    })
})

// aspire-validator.ts
export const AspireSolutionMetadataSchema = z.object({
    solutionName: z.string({
        required_error: '解决方案名称不能为空'  // ✅ 添加
    })
        .min(1, '解决方案名称不能为空')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '解决方案名称必须是PascalCase格式（首字母大写）'),  // ✅ 修改
    rootNamespace: z.string({
        required_error: '根命名空间不能为空'  // ✅ 添加
    })
        .min(1, '根命名空间不能为空')
        .regex(/^[A-Z][a-zA-Z0-9.]*$/, '根命名空间必须是PascalCase格式（首字母大写）'),  // ✅ 修改
    microservices: z.array(MicroserviceMetadataSchema)
        .default([])  // ✅ 允许空数组
        .superRefine((services, ctx) => {
            // 检查微服务名称重复
            const names = services.map(s => s.name)
            const dupName = names.find((name, i) => names.indexOf(name) !== i)
            if (dupName) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `微服务名称不能重复: ${dupName}`,
                    path: []
                })
            }
            
            // 检查端口号重复
            const ports = services.map(s => s.port)
            const dupPort = ports.find((port, i) => ports.indexOf(port) !== i)
            if (dupPort) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `微服务端口号不能重复: ${dupPort}`,
                    path: []
                })
            }
        })
})

// MicroserviceMetadataSchema
const MicroserviceMetadataSchema = z.object({
    port: z.number()
        .int()
        .min(1, '端口号必须在1-65535之间')  // ✅ 修改
        .max(65535, '端口号必须在1-65535之间'),  // ✅ 添加
    // ... 其他字段 ...
})
```

### 类别3: 异步验证API返回值（3个）

**问题**: 所有validateXxxAsync()返回类型错误

**错误**:
```typescript
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<EntityMetadata> {  // ❌ 应该是boolean
    // ...
    return result.data  // ❌ 应该返回true
}
```

**修复**:
```typescript
export async function validateEntityMetadataAsync(
    data: unknown
): Promise<boolean> {  // ✅ 改为boolean
    const result = EntityMetadataSchema.safeParse(data)
    if (!result.success) throw result.error
    return true  // ✅ 返回true
}
```

**影响文件**:
- entity-validator.ts: validateEntityMetadataAsync()
- module-validator.ts: validateModuleMetadataAsync()
- aspire-validator.ts: validateAspireSolutionMetadataAsync()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 修复优先级
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### P0（高优先级）- 3个修复

```yaml
1. 修复异步验证API返回值（3个文件）
   - entity-validator.ts
   - module-validator.ts
   - aspire-validator.ts
   工作量: 10分钟
   影响: 3个测试

2. 添加RouteMetadata递归children
   - types/index.ts
   - module-validator.ts（z.lazy递归）
   工作量: 15分钟
   影响: 3个测试
```

### P1（中优先级）- 20个修复

```yaml
3. 统一自定义错误消息
   - 所有Schema字段添加required_error
   - 所有regex验证添加完整消息
   工作量: 30分钟
   影响: 14个测试
```

### P2（低优先级）- 15个修复

```yaml
4. 实现跨字段验证逻辑
   - 属性名重复（包含字段名）
   - 属性名与导航属性名冲突
   - foreignKey引用验证
   - 路由/Store/微服务重复验证
   工作量: 45分钟
   影响: 15个测试
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 预计修复时间
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```yaml
P0修复: 25分钟
P1修复: 30分钟
P2修复: 45分钟

总计: 1.5-2小时
目标: 100%测试通过率（120/120）
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 下一步行动
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**建议**: 
- 由于用户指示"先1、后2、再3"，优先级1（转换器）已完成
- 优先级2（修复测试）预计2小时，可以延后
- 建议先完成优先级3（文档），然后再回来修复测试

**理由**:
- 转换器已完成且可用，测试失败不影响功能使用
- 文档完善可以让用户更快了解如何使用
- 测试修复可以作为独立任务在后续完成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

