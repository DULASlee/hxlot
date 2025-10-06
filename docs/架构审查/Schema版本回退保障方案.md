# Schema版本回退保障方案

## 📋 文档概述

**版本**: v1.0.0  
**更新日期**: 2025-10-06  
**目的**: 确保Schema版本升级失败时能够安全快速回退

---

## 🛡️ 回退保障三要素

### 1. 数据迁移策略
### 2. 安全检查机制
### 3. 兼容性测试

---

## 📦 数据迁移策略

### 原则

**双向兼容**: 升级和回退都必须有明确的迁移脚本

```
v1.0.0 ←→ v1.1.0
   ↑           ↑
   |           |
 升级脚本   回退脚本
```

### 迁移脚本命名规范

```
migrations/
├── v1.0.0_to_v1.1.0_upgrade.sql      # 升级脚本
├── v1.1.0_to_v1.0.0_rollback.sql     # 回退脚本
├── v1.1.0_to_v1.2.0_upgrade.sql
├── v1.2.0_to_v1.1.0_rollback.sql
└── README.md
```

### 升级脚本示例

**v1.0.0_to_v1.1.0_upgrade.sql**:
```sql
-- ═══════════════════════════════════════════════════════════════
-- Schema升级: v1.0.0 → v1.1.0
-- 变更类型: Minor (向后兼容)
-- 变更内容: 为EntityDefinition添加Category分类字段
-- 日期: 2025-10-06
-- ═══════════════════════════════════════════════════════════════

-- 添加新字段(允许NULL,向后兼容)
ALTER TABLE EntityDefinitions 
ADD Category NVARCHAR(100) NULL;

-- 设置默认值
UPDATE EntityDefinitions 
SET Category = 'Default' 
WHERE Category IS NULL;

-- 创建索引
CREATE INDEX IX_EntityDefinitions_Category 
ON EntityDefinitions(Category);

-- 记录版本历史
INSERT INTO SchemaVersionHistory (
    Id, Version, SchemaName, ChangeType, Description, 
    IsBreakingChange, IsReleased, ReleaseDate
)
VALUES (
    NEWID(), '1.1.0', 'LowCodeEntitySchema', 'Minor', 
    '添加实体分类功能', 0, 1, GETUTCDATE()
);
```

### 回退脚本示例

**v1.1.0_to_v1.0.0_rollback.sql**:
```sql
-- ═══════════════════════════════════════════════════════════════
-- Schema回退: v1.1.0 → v1.0.0
-- 回退原因: 升级失败或发现严重BUG
-- 注意: 回退将丢失Category字段数据
-- 日期: 2025-10-06
-- ═══════════════════════════════════════════════════════════════

-- ⚠️ 备份Category数据(可选)
SELECT Id, Name, Category 
INTO EntityDefinitions_Category_Backup
FROM EntityDefinitions
WHERE Category IS NOT NULL;

-- 删除索引
DROP INDEX IF EXISTS IX_EntityDefinitions_Category 
ON EntityDefinitions;

-- 删除字段
ALTER TABLE EntityDefinitions 
DROP COLUMN Category;

-- 标记版本为已弃用
UPDATE SchemaVersionHistory 
SET IsDeprecated = 1, DeprecatedDate = GETUTCDATE()
WHERE Version = '1.1.0';
```

---

## ✅ 安全检查机制

### 回退前检查清单

**自动检查**:
```csharp
public class RollbackSafetyChecker
{
    /// <summary>
    /// 检查是否可以安全回退
    /// </summary>
    public async Task<RollbackSafetyResult> CheckSafetyAsync(
        string currentVersion, 
        string targetVersion)
    {
        var result = new RollbackSafetyResult();
        
        // 1. 版本兼容性检查
        result.IsVersionCompatible = CheckVersionCompatibility(
            currentVersion, targetVersion);
        
        // 2. 数据完整性检查
        result.IsDataIntact = await CheckDataIntegrityAsync();
        
        // 3. 活跃用户会话检查
        result.ActiveSessions = await GetActiveSessionCountAsync();
        result.HasActiveSessions = result.ActiveSessions > 0;
        
        // 4. 回退脚本存在性检查
        result.HasRollbackScript = CheckRollbackScriptExists(
            currentVersion, targetVersion);
        
        // 5. 数据备份检查
        result.HasBackup = await CheckBackupExistsAsync();
        
        // 综合评估
        result.IsSafeToRollback = 
            result.IsVersionCompatible &&
            result.IsDataIntact &&
            result.HasRollbackScript &&
            result.HasBackup;
        
        return result;
    }
}
```

### 回退风险评估

| 检查项 | 状态 | 风险级别 | 操作 |
|---|---|---|---|
| 版本兼容性 | ✅ | 低 | 允许回退 |
| 数据完整性 | ✅ | 低 | 允许回退 |
| 活跃会话 | ⚠️ 10个 | 中 | 建议等待或强制登出 |
| 回退脚本 | ✅ | 低 | 允许回退 |
| 数据备份 | ✅ | 低 | 允许回退 |
| **综合评估** | ⚠️ | 中 | 建议维护窗口回退 |

---

## 🧪 兼容性测试

### 回退兼容性测试套件

**测试场景**:
```typescript
describe('Schema版本回退兼容性测试', () => {
  
  it('应能从v1.1.0回退到v1.0.0', async () => {
    // 1. 准备测试数据(v1.1.0格式)
    const testData = {
      id: 'test-entity-1',
      name: 'TestEntity',
      category: 'Business' // v1.1.0新增字段
    }
    
    // 2. 执行回退脚本
    await executeRollbackScript('v1.1.0', 'v1.0.0')
    
    // 3. 验证旧版本API仍可用
    const entity = await api.getEntity(testData.id)
    expect(entity.name).toBe('TestEntity')
    expect(entity.category).toBeUndefined() // 新字段已移除
    
    // 4. 验证核心功能正常
    const allEntities = await api.getAllEntities()
    expect(allEntities.length).toBeGreaterThan(0)
  })
  
  it('应保留核心数据不丢失', async () => {
    // 回退前记录数据
    const beforeCount = await db.countEntities()
    
    // 执行回退
    await rollback('v1.1.0', 'v1.0.0')
    
    // 验证数据完整
    const afterCount = await db.countEntities()
    expect(afterCount).toBe(beforeCount)
  })
  
  it('应能处理回退失败并恢复', async () => {
    // 模拟回退失败
    jest.spyOn(db, 'executeScript').mockRejectedValueOnce(
      new Error('Database timeout')
    )
    
    // 执行回退(应失败并自动恢复)
    await expect(
      rollback('v1.1.0', 'v1.0.0')
    ).rejects.toThrow()
    
    // 验证系统仍在v1.1.0
    const version = await api.getVersion()
    expect(version).toBe('1.1.0')
  })
})
```

### 自动化兼容性测试

**CI/CD集成**:
```yaml
# .github/workflows/schema-compatibility-test.yml
name: Schema兼容性测试

on:
  pull_request:
    paths:
      - 'src/**/SchemaVersion*.cs'
      - 'migrations/**'

jobs:
  compatibility-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: 测试升级
        run: |
          dotnet ef database update --version 1.1.0
          dotnet test --filter "Category=SchemaUpgrade"
      
      - name: 测试回退
        run: |
          dotnet ef database update --version 1.0.0
          dotnet test --filter "Category=SchemaRollback"
      
      - name: 验证数据完整性
        run: |
          dotnet test --filter "Category=DataIntegrity"
```

---

## 🚨 回退执行流程

### 标准回退SOP

**1. 准备阶段** (5分钟)
```bash
# 1.1 确认当前版本
current_version=$(dotnet --version)

# 1.2 确认目标版本
target_version="1.0.0"

# 1.3 备份当前数据库
pg_dump smartabp_db > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql

# 1.4 通知用户系统维护
curl -X POST /api/admin/maintenance-mode -d '{"enabled": true}'
```

**2. 安全检查阶段** (2分钟)
```bash
# 2.1 运行安全检查
dotnet run --project SafetyChecker -- --from $current_version --to $target_version

# 2.2 等待活跃会话结束(最多5分钟)
while [ $(get_active_sessions) -gt 0 ]; do
  sleep 30
done
```

**3. 回退执行阶段** (5-10分钟)
```bash
# 3.1 停止应用服务
systemctl stop smartabp-api

# 3.2 回退代码
git checkout v$target_version

# 3.3 执行数据库回退脚本
psql -d smartabp_db -f migrations/v${current_version}_to_v${target_version}_rollback.sql

# 3.4 重新编译和部署
dotnet publish -c Release
systemctl start smartabp-api
```

**4. 验证阶段** (5分钟)
```bash
# 4.1 健康检查
curl http://localhost:5000/health

# 4.2 版本验证
actual_version=$(curl http://localhost:5000/api/version | jq -r '.version')
[[ "$actual_version" == "$target_version" ]] || exit 1

# 4.3 核心功能烟雾测试
dotnet test --filter "Category=SmokeTest"

# 4.4 解除维护模式
curl -X POST /api/admin/maintenance-mode -d '{"enabled": false}'
```

**5. 监控阶段** (30分钟)
```bash
# 5.1 监控错误日志
tail -f /var/log/smartabp/error.log

# 5.2 监控性能指标
watch -n 10 'curl -s http://localhost:5000/metrics | grep response_time'

# 5.3 监控用户反馈
# (人工监控用户报告)
```

---

## 📊 回退后验证清单

### 功能验证

- [ ] 用户登录功能正常
- [ ] 实体查询API正常
- [ ] 实体创建API正常
- [ ] 实体更新API正常
- [ ] 实体删除API正常
- [ ] 代码生成功能正常
- [ ] 前端页面渲染正常

### 数据验证

- [ ] 核心实体数量一致
- [ ] 关键字段数据完整
- [ ] 关联关系保持正确
- [ ] 审计日志完整

### 性能验证

- [ ] API响应时间符合基准
- [ ] 数据库查询性能正常
- [ ] 内存使用率正常
- [ ] CPU使用率正常

---

## 🆘 回退失败应急方案

### 场景1: 数据库回退脚本执行失败

**症状**: SQL错误,事务回滚

**应急措施**:
```bash
# 1. 恢复数据库备份
pg_restore -d smartabp_db backup_before_rollback_*.sql

# 2. 验证数据完整性
dotnet test --filter "Category=DataIntegrity"

# 3. 保持当前版本,修复回退脚本后再试
```

### 场景2: 回退后应用无法启动

**症状**: 服务启动失败,端口无响应

**应急措施**:
```bash
# 1. 查看错误日志
journalctl -u smartabp-api -n 100

# 2. 检查依赖项
dotnet --info
ls -la /opt/smartabp/

# 3. 尝试使用备份的二进制文件
cp /backup/smartabp-api/* /opt/smartabp/
systemctl restart smartabp-api
```

### 场景3: 前后端版本不匹配

**症状**: API调用失败,CORS错误

**应急措施**:
```bash
# 1. 同步回退前端
cd /opt/smartabp/frontend
git checkout v$target_version
npm run build
pm2 restart frontend

# 2. 验证版本匹配
curl http://localhost:5000/api/version
curl http://localhost:3000/version.json
```

---

## 📚 相关文档

- [Schema版本升级指南](./Schema版本升级指南.md)
- [数据库迁移脚本规范](./数据库迁移脚本规范.md)
- [应急响应手册](./应急响应手册.md)

---

**🛡️ Schema版本回退保障方案 - 确保万无一失,快速恢复!**

