#!/usr/bin/env node

/**
 * 📡 SmartAbp API功能真实性检查
 * 验证前端与后端API的连接状态
 */

const http = require('http');
const https = require('https');

console.log('📡 开始API功能真实性检查...\n');

// API端点列表
const apiEndpoints = [
  { name: '前端开发服务器', url: 'http://localhost:11369/', method: 'GET' },
  { name: '后端API健康检查', url: 'https://localhost:44321/health', method: 'GET' },
  { name: '后端API Swagger', url: 'https://localhost:44321/swagger', method: 'GET' },
  { name: 'ABP应用配置', url: 'https://localhost:44321/api/abp/application-configuration', method: 'GET' }
];

// HTTP请求工具函数
function makeRequest(url, method = 'GET') {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://');
    const lib = isHttps ? https : http;

    const options = {
      method,
      timeout: 5000,
      rejectUnauthorized: false // 忽略自签名证书
    };

    const req = lib.request(url, options, (res) => {
      resolve({
        success: true,
        statusCode: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// 并行测试所有API端点
async function testAllEndpoints() {
  console.log('🌐 测试API端点连接状态:\n');

  const results = await Promise.all(
    apiEndpoints.map(async (endpoint) => {
      const result = await makeRequest(endpoint.url, endpoint.method);

      if (result.success) {
        const status = result.statusCode >= 200 && result.statusCode < 400 ? '✅' : '⚠️';
        console.log(`  ${status} ${endpoint.name}: ${result.statusCode}`);
        return { ...endpoint, status: 'success', statusCode: result.statusCode };
      } else {
        console.log(`  ❌ ${endpoint.name}: ${result.error}`);
        return { ...endpoint, status: 'failed', error: result.error };
      }
    })
  );

  return results;
}

// 分析测试结果
function analyzeResults(results) {
  console.log('\n📊 API测试结果分析:');

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');

  console.log(`  ✅ 成功: ${successful.length}/${results.length}`);
  console.log(`  ❌ 失败: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log('\n🚨 失败的端点:');
    failed.forEach(f => {
      console.log(`    - ${f.name}: ${f.error}`);
    });
  }

  // 给出建议
  console.log('\n💡 建议:');
  if (successful.some(s => s.name === '前端开发服务器')) {
    console.log('  ✅ 前端服务器运行正常，可以进行前端功能测试');
  } else {
    console.log('  ❌ 前端服务器未运行，请执行 npm run dev');
  }

  if (successful.some(s => s.name.includes('后端'))) {
    console.log('  ✅ 后端API可用，可以进行完整功能测试');
  } else {
    console.log('  ⚠️  后端API不可用，前端将以离线模式运行');
  }
}

// 主测试流程
async function main() {
  try {
    const results = await testAllEndpoints();
    analyzeResults(results);

    console.log('\n🏁 API功能真实性检查完成!');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
    process.exit(1);
  }
}

main();
