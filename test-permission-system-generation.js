/**
 * 🍽️ 吃自己的狗粮测试脚本
 * 使用极简代码生成通道生成权限管理系统
 */

const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 9002;
const API_PATH = '/api/permission-system-generator/generate';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🍽️ 吃自己的狗粮：生成权限管理系统');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`请求: POST http://${API_HOST}:${API_PORT}${API_PATH}`);
console.log('');

const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: API_PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000 // 5分钟超时
};

const req = http.request(options, (res) => {
    let data = '';

    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    console.log('');

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 生成结果');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`成功: ${result.success ? '✅' : '❌'}`);
            console.log(`总实体数: ${result.totalEntities}`);
            console.log(`成功数: ${result.successCount}`);
            console.log(`失败数: ${result.failureCount}`);
            console.log(`总文件数: ${result.totalFiles}`);

            if (result.errorMessage) {
                console.log(`错误: ${result.errorMessage}`);
            }

            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 各实体生成结果');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            if (result.entityResults && result.entityResults.length > 0) {
                result.entityResults.forEach((entity, index) => {
                    console.log(`\n${index + 1}. ${entity.entityName}`);
                    console.log(`   状态: ${entity.success ? '✅ 成功' : '❌ 失败'}`);
                    console.log(`   文件数: ${entity.fileCount}`);
                    if (entity.message) {
                        console.log(`   消息: ${entity.message}`);
                    }
                    if (entity.generatedFiles && entity.generatedFiles.length > 0) {
                        console.log(`   生成的文件:`);
                        entity.generatedFiles.slice(0, 5).forEach(file => {
                            console.log(`      - ${file}`);
                        });
                        if (entity.generatedFiles.length > 5) {
                            console.log(`      ... 还有 ${entity.generatedFiles.length - 5} 个文件`);
                        }
                    }
                });
            }

            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            if (result.success) {
                console.log('🎉 权限管理系统生成成功！');
                console.log('🍽️ "吃自己的狗粮"验证完成！');
            } else {
                console.log('❌ 权限管理系统生成失败！');
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        } catch (err) {
            console.error('解析响应失败:', err);
            console.error('原始响应:', data);
        }
    });
});

req.on('error', (err) => {
    console.error('❌ 请求失败:', err.message);
    console.error('');
    console.error('请确保后端服务正在运行:');
    console.error(`  cd src/SmartAbp.Web && dotnet run --urls http://localhost:${API_PORT}`);
});

req.on('timeout', () => {
    console.error('❌ 请求超时（5分钟）');
    req.destroy();
});

req.end();

