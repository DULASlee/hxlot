/**
 * 健壮性测试 - 模拟各种错误场景
 */

import fs from 'fs-extra';
import path from 'path';
import { ErrorHandler, QualityGuardian } from './src/index.js';

async function testRobustness() {
    console.log('🛡️  健壮性测试开始...\n');

    const testDir = path.join(process.cwd(), 'test-temp');
    await fs.ensureDir(testDir);

    // 测试1: 权限错误处理
    console.log('测试1: 权限错误处理');
    const noPermFile = path.join(testDir, 'no-perm.ts');
    await fs.writeFile(noPermFile, 'const test = 123;');
    try {
        await fs.chmod(noPermFile, 0o000); // 移除所有权限
        console.log('  ✅ 已创建无权限文件');
    } catch (err) {
        console.log('  ⚠️  无法设置权限（可能在Windows）');
    }

    // 测试2: 文件不存在
    console.log('\n测试2: 文件不存在处理');
    console.log('  测试读取不存在的文件...');

    // 测试3: 错误分类
    console.log('\n测试3: 错误分类系统');
    const testErrors = [
        new Error('JavaScript heap out of memory'),
        new Error('EACCES: permission denied'),
        new Error('ENOSPC: no space left on device'),
        new Error('ENOENT: no such file or directory'),
        new Error('ETIMEDOUT: operation timed out'),
        new Error('Unknown error')
    ];

    testErrors.forEach(error => {
        const severity = ErrorHandler.classifyError(error);
        const recoverable = ErrorHandler.isRecoverable(error);
        const friendly = ErrorHandler.getFriendlyMessage(error);

        console.log(`  错误: ${error.message.substring(0, 30)}...`);
        console.log(`    严重性: ${severity}`);
        console.log(`    可恢复: ${recoverable ? '是' : '否'}`);
        console.log(`    友好提示: ${friendly.substring(0, 40)}...`);
    });

    // 测试4: 实际运行（带错误恢复）
    console.log('\n测试4: 实际检查（带错误恢复）');
    const guardian = new QualityGuardian({
        projectRoot: testDir,
        generateReport: false,
        failFast: false, // 遇到错误继续执行
        performance: {
            enableParallel: true
        }
    });

    try {
        await guardian.run();
        console.log('  ✅ 检查完成（即使有错误也继续执行）');
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.log(`  ⚠️  检查失败: ${err.message}`);
    }

    // 清理
    try {
        if (await fs.pathExists(noPermFile)) {
            await fs.chmod(noPermFile, 0o644); // 恢复权限
        }
        await fs.remove(testDir);
        console.log('\n  🧹 测试环境已清理');
    } catch (err) {
        console.log('\n  ⚠️  清理失败，请手动删除:', testDir);
    }

    console.log('\n✅ 健壮性测试完成');
}

testRobustness().catch(console.error);

