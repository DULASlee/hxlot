-- 验证 LC_表结构和数据

PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '🔍 验证低代码 SSOT 后端落地情况'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT ''

PRINT '【1/3】验证 LC_表结构'
SELECT
    TABLE_NAME AS '表名',
    CASE WHEN EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = t.TABLE_NAME)
         THEN '✅ 已创建'
         ELSE '❌ 未创建'
    END AS '状态'
FROM (
    VALUES ('LC_Modules'), ('LC_Entities'), ('LC_Properties'), ('LC_PageConfigs')
) AS t(TABLE_NAME)

PRINT ''
PRINT '【2/3】验证 JSON 列配置'
SELECT
    c.TABLE_NAME AS '表名',
    c.COLUMN_NAME AS '列名',
    c.DATA_TYPE AS '数据类型',
    CASE WHEN c.DATA_TYPE = 'nvarchar' AND c.CHARACTER_MAXIMUM_LENGTH = -1
         THEN '✅ JSON配置正确'
         ELSE '⚠️ 需检查'
    END AS '状态'
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_NAME IN ('LC_Properties', 'LC_PageConfigs')
  AND c.COLUMN_NAME IN ('UIConfig', 'ValidationRules', 'PageConfig')
ORDER BY c.TABLE_NAME, c.COLUMN_NAME

PRINT ''
PRINT '【3/3】统计现有低代码配置数据'
SELECT
    'LC_Modules' AS '表名',
    COUNT(*) AS '记录数'
FROM LC_Modules
UNION ALL
SELECT 'LC_Entities', COUNT(*) FROM LC_Entities
UNION ALL
SELECT 'LC_Properties', COUNT(*) FROM LC_Properties
UNION ALL
SELECT 'LC_PageConfigs', COUNT(*) FROM LC_PageConfigs

PRINT ''
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '✅ SSOT 后端验证完成'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

