-- SmartAbp MySQL 初始化脚本
-- 自动执行：docker-compose启动时自动运行

-- 创建数据库信息表
CREATE TABLE IF NOT EXISTS `__DbInfo` (
    `Id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `Version` VARCHAR(50) NOT NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `Description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始化信息
INSERT INTO `__DbInfo` (`Id`, `Version`, `Description`)
VALUES (UUID(), '1.0.0', 'SmartAbp 初始数据库 - MySQL');

-- 输出欢迎信息
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🚀 SmartAbp MySQL 数据库初始化完成！' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '📊 数据库: smartabp' AS '';
SELECT '👤 用户: smartabp_user' AS '';
SELECT '🔗 连接: Server=localhost;Port=3306;Database=smartabp;User=smartabp_user;Password=SmartAbp@2025;' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

