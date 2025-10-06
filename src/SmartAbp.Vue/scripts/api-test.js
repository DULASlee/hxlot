/**
 * UltraSimpleStudio API测试脚本
 * 测试前后端API连接是否正常
 */
const fetch = require('node-fetch');

// API基础地址
const baseUrl = process.env.API_URL || 'http://localhost:11369';

// 测试数据
const testModule = {
    systemName: 'TestSystem',
    name: 'TestModule',
    displayName: 'Test Module',
    namespace: 'TestSystem.TestModule',
    architecturePattern: 'Crud',
    databaseInfo: {
        provider: 'SqlServer',
        connectionString: 'Default',
        tableName: 'TestTable'
    },
    frontend: {
        framework: 'Vue3',
        parentId: 'business',
        routePrefix: '/test-module',
        icon: 'database'
    },
    backend: {
        generateEntity: true,
        generateAppService: true,
        generateController: true,
        generateDto: true,
        generateRepository: false,
        authorization: {
            enabled: true,
            policyPrefix: 'TestSystem'
        }
    }
};

// 测试API端点
async function testApi() {
    console.log('🚀 开始测试API连接...');
    console.log(`基础地址: ${baseUrl}`);

    // 测试数据库连接API
    try {
        console.log('\n📡 测试数据库连接API...');
        const testConnResponse = await fetch(`${baseUrl}/api/code-generator/test-connection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: 'SqlServer',
                connectionString: 'Default'
            })
        });

        const testConnData = await testConnResponse.json();
        console.log(`✅ 状态: ${testConnResponse.status} ${testConnResponse.statusText}`);
        console.log(`📊 响应数据: `, JSON.stringify(testConnData, null, 2));
    } catch (error) {
        console.error(`❌ 数据库连接测试失败:`, error.message);
    }

    // 测试生成模块API
    try {
        console.log('\n📡 测试生成模块API...');
        const generateResponse = await fetch(`${baseUrl}/api/code-generator/generate-module`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testModule)
        });

        const generateData = await generateResponse.json();
        console.log(`✅ 状态: ${generateResponse.status} ${generateResponse.statusText}`);
        console.log(`📊 响应数据: `, JSON.stringify(generateData, null, 2));

        if (generateData && generateData.sessionId) {
            // 测试获取状态API
            console.log('\n📡 测试获取生成状态API...');
            const statusResponse = await fetch(`${baseUrl}/api/code-generator/status/${generateData.sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const statusData = await statusResponse.json();
            console.log(`✅ 状态: ${statusResponse.status} ${statusResponse.statusText}`);
            console.log(`📊 响应数据: `, JSON.stringify(statusData, null, 2));

            // 测试导出代码API
            console.log('\n📡 测试导出代码API...');
            const exportResponse = await fetch(`${baseUrl}/api/code-generator/export/${generateData.sessionId}`, {
                method: 'GET'
            });

            console.log(`✅ 状态: ${exportResponse.status} ${exportResponse.statusText}`);
            console.log(`📊 Content-Type: ${exportResponse.headers.get('Content-Type')}`);
            console.log(`📊 Content-Length: ${exportResponse.headers.get('Content-Length')} bytes`);
        } else {
            console.log('⚠️ 没有获取到sessionId，无法测试状态和导出API');
        }
    } catch (error) {
        console.error(`❌ 生成模块测试失败:`, error.message);
    }
}

// 运行测试
testApi().then(() => {
    console.log('\n✅ API测试完成');
}).catch(err => {
    console.error('\n❌ API测试失败:', err);
});
