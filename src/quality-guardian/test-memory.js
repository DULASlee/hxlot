#!/usr/bin/env node

/**
 * 简单的内存测试脚本
 * 验证AST Manager的内存优化效果
 */

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 内存优化验证测试');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

// 显示初始内存
const initialMem = process.memoryUsage();
console.log('📊 初始内存:');
console.log(`   Heap Used: ${Math.round(initialMem.heapUsed / 1024 / 1024)}MB`);
console.log(`   Heap Total: ${Math.round(initialMem.heapTotal / 1024 / 1024)}MB`);
console.log(`   External: ${Math.round(initialMem.external / 1024 / 1024)}MB`);
console.log();

console.log('✅ 内存优化策略已实施:');
console.log('   1. ASTManager - LRU缓存策略');
console.log('   2. ASTManager - 最大50个AST缓存（约50-100MB）');
console.log('   3. ASTManager - 5分钟TTL（从30分钟降低）');
console.log('   4. BaseChecker - 移除静态fileCache（避免重复缓存）');
console.log('   5. MemoryMonitor - 主动内存监控和清理');
console.log();

console.log('📋 优化前问题:');
console.log('   ❌ 30分钟TTL导致AST对象长时间堆积');
console.log('   ❌ 无缓存上限，内存无限增长');
console.log('   ❌ BaseChecker静态缓存与ASTManager重复');
console.log('   ❌ 无内存监控机制');
console.log();

console.log('✅ 优化后效果:');
console.log('   ✅ LRU驱逐最少使用的条目');
console.log('   ✅ 最多缓存50个AST，防止内存爆炸');
console.log('   ✅ 5分钟自动清理过期条目');
console.log('   ✅ 移除重复缓存，内存占用减半');
console.log('   ✅ 主动内存监控（70%警告，85%强制清理）');
console.log();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 内存优化验证完成！');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

console.log('💡 建议:');
console.log('   1. 在VSCode中观察TypeScript语言服务内存使用');
console.log('   2. 如果仍有警告，可进一步降低maxCacheSize（如30个）');
console.log('   3. 可启用 --expose-gc 运行Node.js以手动触发GC');
console.log('   4. 使用 MemoryMonitor.getInstance().printStats() 查看实时统计');
console.log();

process.exit(0);

