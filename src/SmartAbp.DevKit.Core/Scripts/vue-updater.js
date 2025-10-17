#!/usr/bin/env node

/**
 * Vue组件增量更新器 - ts-morph实现
 * 保护手动编写的代码，只更新生成的部分
 */

const { Project } = require('ts-morph');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = parseArguments(process.argv.slice(2));

// 主函数
async function main() {
  try {
    console.log('🔧 开始ts-morph增量更新...');
    console.log(`📄 文件: ${args.file}`);
    console.log(`🎯 组件: ${args.component}`);
    console.log(`🔄 模式: ${args.mode}`);

    // 检查文件是否存在
    if (!fs.existsSync(args.file)) {
      throw new Error(`文件不存在: ${args.file}`);
    }

    // 初始化ts-morph项目
    const project = new Project({
      useInMemoryFileSystem: false,
    });

    // 读取Vue SFC文件
    const vueContent = fs.readFileSync(args.file, 'utf-8');
    
    // 提取<script setup lang="ts">部分
    const scriptMatch = vueContent.match(/<script setup lang="ts">([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      throw new Error('未找到<script setup lang="ts">标签');
    }

    const scriptContent = scriptMatch[1];
    const scriptStartIndex = scriptMatch.index + '<script setup lang="ts">'.length;

    // 创建临时TS文件用于AST操作
    const tempFile = project.createSourceFile('temp.ts', scriptContent, { overwrite: true });

    // 更新Props定义
    updatePropsDefinition(tempFile, args.props, args.mode);

    // 获取更新后的代码
    const updatedScript = tempFile.getFullText();

    // 替换Vue文件中的script部分
    const updatedVueContent = 
      vueContent.substring(0, scriptStartIndex) +
      updatedScript +
      vueContent.substring(scriptStartIndex + scriptContent.length);

    // 写回文件
    fs.writeFileSync(args.file, updatedVueContent, 'utf-8');

    console.log('✅ ts-morph增量更新成功！');
    console.log('📊 更新统计:');
    console.log(`  - 属性数量: ${args.props.length}`);
    console.log(`  - 更新模式: ${args.mode}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ ts-morph更新失败:', error.message);
    process.exit(1);
  }
}

/**
 * 更新Props定义
 */
function updatePropsDefinition(sourceFile, newProps, mode) {
  // 简化实现：直接查找defineProps文本并替换
  const fullText = sourceFile.getFullText();
  const definePropsRegex = /const\s+props\s*=\s*defineProps<\{[\s\S]*?\}>\(\)/;
  
  const propsCode = generatePropsCode(newProps);

  if (definePropsRegex.test(fullText)) {
    // 存在defineProps，替换
    const updatedText = fullText.replace(definePropsRegex, propsCode);
    sourceFile.replaceWithText(updatedText);
  } else {
    // 不存在defineProps，在开头添加
    sourceFile.insertText(0, `${propsCode}\n\n`);
  }
}

/**
 * 生成Props代码
 */
function generatePropsCode(props) {
  const propsLines = props.map(prop => {
    const required = prop.Required ? ', required: true' : '';
    const defaultValue = prop.DefaultValue ? `, default: ${prop.DefaultValue}` : '';
    return `  ${prop.Name}: { type: ${mapTypeToVue(prop.Type)}${required}${defaultValue} }`;
  });

  return `const props = defineProps<{\n${propsLines.join(',\n')}\n}>()`;
}

/**
 * 映射C#类型到Vue类型
 */
function mapTypeToVue(csharpType) {
  const typeMap = {
    'string': 'String',
    'int': 'Number',
    'decimal': 'Number',
    'bool': 'Boolean',
    'DateTime': 'String',
    'Guid': 'String',
  };
  return typeMap[csharpType] || 'Object';
}

/**
 * 解析命令行参数
 */
function parseArguments(argv) {
  const args = {
    file: '',
    component: '',
    mode: 'merge',
    props: []
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--file':
        args.file = argv[++i];
        break;
      case '--component':
        args.component = argv[++i];
        break;
      case '--mode':
        args.mode = argv[++i];
        break;
      case '--props':
        args.props = JSON.parse(argv[++i]);
        break;
    }
  }

  return args;
}

// 运行主函数
main();

