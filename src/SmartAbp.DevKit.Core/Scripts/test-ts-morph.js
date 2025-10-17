#!/usr/bin/env node

/**
 * ts-morph功能快速验证
 */

const { Project } = require('ts-morph');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 ts-morph功能验证');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // 创建项目
  const project = new Project();

  // 创建测试源文件
  const sourceFile = project.createSourceFile('test.ts', `
interface Product {
  name: string;
  price: number;
}

const product: Product = {
  name: 'Test',
  price: 100
};
  `, { overwrite: true });

  console.log('✅ ts-morph已安装并可用');
  console.log('✅ Project对象创建成功');
  console.log('✅ SourceFile创建成功');
  
  // 获取接口
  const interfaces = sourceFile.getInterfaces();
  console.log(`✅ 找到接口数量: ${interfaces.length}`);
  
  if (interfaces.length > 0) {
    const productInterface = interfaces[0];
    console.log(`✅ 接口名称: ${productInterface.getName()}`);
    
    const properties = productInterface.getProperties();
    console.log(`✅ 属性数量: ${properties.length}`);
    
    properties.forEach(prop => {
      console.log(`   - ${prop.getName()}: ${prop.getType().getText()}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ts-morph验证通过！可以用于Vue组件更新！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  process.exit(0);
} catch (error) {
  console.error('❌ ts-morph验证失败:', error.message);
  process.exit(1);
}

