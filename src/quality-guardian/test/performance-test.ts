/**
 * 性能和内存测试
 */

import { MemoryManager, PerformanceMonitor, QualityGuardian } from './src/index.js';

async function testPerformance() {
    console.log('🚀 性能和内存测试开始...\n');

    const monitor = new PerformanceMonitor();
    const memManager = new MemoryManager(512);

    monitor.start();

    // 测试1: 内存监控
    console.log('测试1: 内存监控');
    const initialMem = memManager.getCurrentMemoryMB();
    console.log(`  初始内存: ${initialMem}MB`);

    // 测试2: 并发执行性能
    console.log('\n测试2: 并发执行');
    monitor.checkpoint('开始');

    const guardian = new QualityGuardian({
        projectRoot: process.cwd(),
        generateReport: false,
        performance: {
            enableParallel: true,
            parallelBatchSize: 5,
            maxMemoryMB: 512
        }
    });

    try {
        await guardian.run();
    } catch (error) {
        // 忽略质量检查失败
    }

    monitor.checkpoint('完成');

    // 测试3: 性能报告
    console.log('\n测试3: 性能报告');
    const perfReport = monitor.getReport();
    console.log('  性能指标:', perfReport);

    // 测试4: 内存报告
    console.log('\n测试4: 内存使用');
    const memUsage = PerformanceMonitor.getMemoryUsage();
    console.log('  RSS:', memUsage.rss, 'MB');
    console.log('  Heap Total:', memUsage.heapTotal, 'MB');
    console.log('  Heap Used:', memUsage.heapUsed, 'MB');

    // 清理
    memManager.cleanup();

    console.log('\n✅ 测试完成');
}

testPerformance().catch(console.error);

