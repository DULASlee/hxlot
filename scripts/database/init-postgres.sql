-- SmartAbp PostgreSQL 初始化脚本
-- 自动执行：docker-compose启动时自动运行

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 支持模糊搜索

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 创建数据库信息表
CREATE TABLE IF NOT EXISTS __DbInfo (
    Id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Version VARCHAR(50) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    Description TEXT
);

-- 插入初始化信息
INSERT INTO __DbInfo (Version, Description)
VALUES ('1.0.0', 'SmartAbp 初始数据库 - PostgreSQL')
ON CONFLICT DO NOTHING;

-- 输出欢迎信息
DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🚀 SmartAbp PostgreSQL 数据库初始化完成！';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📊 数据库: smartabp';
    RAISE NOTICE '👤 用户: smartabp_user';
    RAISE NOTICE '🔗 连接: Host=localhost;Database=smartabp;Username=smartabp_user;Password=SmartAbp@2025;Port=5432';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

