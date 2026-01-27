/**
 * Vite 代理诊断脚本
 * 用于测试不同请求方式是否能通过 Vite 代理正常工作
 * 
 * 运行方式：node scripts/diagnose-proxy.js
 */

const http = require('http');
const https = require('https');

// 测试配置
const VITE_PROXY_URL = 'http://localhost:9001';
const BACKEND_URL = 'https://localhost:9002';
const TEST_ENDPOINT = '/api/code-generator/test-connection';
const TEST_BODY = JSON.stringify({
  provider: 'SqlServer',
  connectionString: 'Default'
});

// 忽略自签名证书
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testRequest(baseUrl, label) {
  return new Promise((resolve) => {
    const isHttps = baseUrl.startsWith('https');
    const url = new URL(TEST_ENDPOINT, baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(TEST_BODY)
      }
    };

    const client = isHttps ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n[${label}]`);
        console.log(`  URL: ${baseUrl}${TEST_ENDPOINT}`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Response Headers: ${JSON.stringify(res.headers, null, 2).substring(0, 200)}...`);
        
        try {
          const json = JSON.parse(data);
          console.log(`  Success: ${json.success}`);
          if (json.success) {
            console.log(`  Tables: ${json.tableCount} 个表`);
          } else {
            console.log(`  Error: ${json.error?.message || json.message}`);
          }
        } catch (e) {
          console.log(`  Raw Response: ${data.substring(0, 200)}...`);
        }
        
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (e) => {
      console.log(`\n[${label}] 请求失败: ${e.message}`);
      resolve(false);
    });

    req.write(TEST_BODY);
    req.end();
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Vite 代理诊断工具');
  console.log('='.repeat(60));
  console.log(`\n测试请求体: ${TEST_BODY}`);
  
  // 测试1: 直接访问后端
  const backendResult = await testRequest(BACKEND_URL, '直接访问后端 HTTPS');
  
  // 测试2: 通过 Vite 代理访问
  const proxyResult = await testRequest(VITE_PROXY_URL, '通过 Vite 代理');
  
  console.log('\n' + '='.repeat(60));
  console.log('诊断结果:');
  console.log('='.repeat(60));
  console.log(`  直接后端: ${backendResult ? '✅ 正常' : '❌ 失败'}`);
  console.log(`  Vite代理: ${proxyResult ? '✅ 正常' : '❌ 失败'}`);
  
  if (backendResult && !proxyResult) {
    console.log('\n⚠️ 问题定位: Vite 代理配置或 http-proxy 存在问题');
    console.log('建议方案:');
    console.log('  1. 检查 vite.config.ts 中的 proxy 配置');
    console.log('  2. 确保 Vite 开发服务器正在运行');
    console.log('  3. 考虑直接调用后端地址绕过代理');
  } else if (!backendResult) {
    console.log('\n⚠️ 问题定位: 后端服务可能未启动或配置错误');
  } else {
    console.log('\n✅ 所有测试通过');
  }
}

main().catch(console.error);
