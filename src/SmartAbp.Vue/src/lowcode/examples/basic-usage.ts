/**
 * 基础使用示例
 * 展示如何使用重构后的低代码内核
 */

import { LowCodeKernel } from '../kernel/core';
import { Vue3Plugin } from '../plugins/vue3';
import type { Vue3Schema } from '../plugins/vue3';

async function basicExample() {
  // 1. 创建内核实例
  const kernel = new LowCodeKernel({
    logging: {
      level: 'info',
      enableConsole: true
    },
    cache: {
      maxMemory: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000
    },
    monitoring: {
      enabled: true
    }
  });

  // 2. 初始化内核
  await kernel.initialize();

  // 3. 注册Vue3插件
  const vue3Plugin = new Vue3Plugin({
    typescript: true,
    compositionApi: true,
    scoped: true
  });

  await kernel.registerPlugin(vue3Plugin);

  // 4. 定义组件Schema
  const userCardSchema: Vue3Schema = {
    id: 'user-card-001',
    version: '1.0.0',
    type: 'component',
    metadata: {
      name: 'UserCard',
      description: '用户卡片组件'
    },
    template: {
      type: 'template',
      content: {
        tag: 'div',
        props: {
          class: 'user-card',
          ':class': '{ active: isActive }'
        },
        children: [
          {
            tag: 'img',
            props: {
              ':src': 'user.avatar',
              'alt': 'User avatar',
              class: 'avatar'
            }
          },
          {
            tag: 'div',
            props: { class: 'user-info' },
            children: [
              {
                tag: 'h3',
                props: { class: 'username' },
                children: ['{{ user.name }}']
              },
              {
                tag: 'p',
                props: { class: 'email' },
                children: ['{{ user.email }}']
              }
            ]
          },
          {
            tag: 'button',
            props: {
              '@click': 'handleClick',
              ':disabled': 'loading'
            },
            children: ['联系用户']
          }
        ]
      }
    },
    script: {
      lang: 'ts',
      setup: true,
      imports: [
        {
          specifiers: ['ref', 'computed'],
          source: 'vue'
        }
      ],
      computed: [
        {
          name: 'isActive',
          get: 'user.status === "online"',
          type: 'boolean'
        }
      ],
      methods: [
        {
          name: 'handleClick',
          params: [],
          returnType: 'void',
          body: `
            loading.value = true;
            emit('contact', user.value);
            setTimeout(() => {
              loading.value = false;
            }, 1000);
          `
        }
      ],
      lifecycle: [
        {
          hook: 'onMounted',
          body: `
            console.log('UserCard mounted');
          `
        }
      ]
    },
    style: {
      lang: 'css',
      scoped: true,
      content: {
        '.user-card': {
          'display': 'flex',
          'align-items': 'center',
          'padding': '16px',
          'border-radius': '8px',
          'border': '1px solid #e1e5e9',
          'background': '#fff'
        },
        '.user-card.active': {
          'border-color': '#10b981',
          'background': '#f0fdf4'
        },
        '.avatar': {
          'width': '48px',
          'height': '48px',
          'border-radius': '50%',
          'margin-right': '12px'
        },
        '.user-info': {
          'flex': '1'
        },
        '.username': {
          'margin': '0 0 4px 0',
          'font-size': '16px',
          'font-weight': '600'
        },
        '.email': {
          'margin': '0',
          'color': '#64748b',
          'font-size': '14px'
        },
        'button': {
          'padding': '8px 16px',
          'border': 'none',
          'border-radius': '6px',
          'background': '#3b82f6',
          'color': 'white',
          'cursor': 'pointer'
        },
        'button:disabled': {
          'opacity': '0.5',
          'cursor': 'not-allowed'
        }
      }
    },
    props: [
      {
        name: 'user',
        type: 'User',
        required: true,
        description: '用户信息对象'
      }
    ],
    emits: [
      {
        name: 'contact',
        payload: 'User',
        description: '联系用户事件'
      }
    ]
  };

  // 5. 生成代码
  const result = await kernel.generate(userCardSchema, {
    useCache: true,
    timeout: 10000
  });

  if (result.success) {
    console.log('代码生成成功！');
    console.log('生成的Vue组件：');
    console.log('================');
    console.log(result.result?.code);
    console.log('================');
    console.log('元数据：', result.metadata);
  } else {
    console.error('代码生成失败：', result.error?.message);
  }

  // 6. 获取健康信息
  const health = kernel.getHealthInfo();
  console.log('内核健康状态：', health);

  // 7. 优雅关闭
  await kernel.shutdown();
}

// 执行示例
async function runAdvancedExample() {
  const kernel = new LowCodeKernel();
  await kernel.initialize();

  // 注册插件
  await kernel.registerPlugin(new Vue3Plugin({
    typescript: true,
    compositionApi: true
  }));

  // 批量生成示例
  const schemas: Vue3Schema[] = [
    {
      id: 'button-001',
      version: '1.0.0',
      type: 'component',
      metadata: { name: 'MyButton' },
      template: {
        type: 'template',
        content: {
          tag: 'button',
          props: { '@click': 'handleClick' },
          children: ['{{ label }}']
        }
      },
      props: [
        { name: 'label', type: 'string', required: true }
      ]
    },
    {
      id: 'input-001',
      version: '1.0.0',
      type: 'component',
      metadata: { name: 'MyInput' },
      template: {
        type: 'template',
        content: {
          tag: 'input',
          props: {
            ':value': 'modelValue',
            '@input': 'handleInput',
            'type': 'text'
          }
        }
      },
      props: [
        { name: 'modelValue', type: 'string', required: true }
      ],
      emits: [
        { name: 'update:modelValue', payload: 'string' }
      ]
    }
  ];

  // 批量生成
  const batchResults = await kernel.generateBatch(schemas);

  console.log(`批量生成完成，成功：${batchResults.filter(r => r.success).length}/${batchResults.length}`);

  // 监听事件
  const unsubscribe = kernel.events.on('generation:end', (event) => {
    console.log(`代码生成完成：${event.pluginName}, 耗时：${event.duration}ms`);
  });

  // 清理
  unsubscribe();
  await kernel.shutdown();
}

// 性能测试示例
async function performanceTest() {
  const kernel = new LowCodeKernel({
    cache: {
      maxMemory: 100 * 1024 * 1024, // 100MB
      maxEntries: 5000
    }
  });

  await kernel.initialize();
  await kernel.registerPlugin(new Vue3Plugin());

  const startTime = Date.now();
  const promises: Promise<any>[] = [];

  // 并发生成100个组件
  for (let i = 0; i < 100; i++) {
    const schema: Vue3Schema = {
      id: `component-${i}`,
      version: '1.0.0',
      type: 'component',
      metadata: { name: `Component${i}` },
      template: {
        type: 'template',
        content: {
          tag: 'div',
          children: [`Component ${i}`]
        }
      }
    };

    promises.push(kernel.generate(schema));
  }

  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const duration = Date.now() - startTime;

  console.log(`性能测试完成：`);
  console.log(`- 并发数：100`);
  console.log(`- 成功：${successful}/100`);
  console.log(`- 总耗时：${duration}ms`);
  console.log(`- 平均耗时：${duration / 100}ms/组件`);
  console.log(`- 吞吐量：${(100 / duration * 1000).toFixed(2)}组件/秒`);

  // 缓存测试
  console.log('\n开始缓存测试...');
  const cacheStartTime = Date.now();

  // 重复生成相同组件（应该命中缓存）
  const cachePromises = [];
  for (let i = 0; i < 50; i++) {
    cachePromises.push(kernel.generate({
      id: 'cache-test',
      version: '1.0.0',
      type: 'component',
      metadata: { name: 'CacheTest' },
      template: {
        type: 'template',
        content: { tag: 'div', children: ['Cache Test'] }
      }
    }));
  }

  await Promise.all(cachePromises);
  const cacheDuration = Date.now() - cacheStartTime;

  console.log(`缓存测试完成：`);
  console.log(`- 重复生成：50次`);
  console.log(`- 耗时：${cacheDuration}ms`);
  console.log(`- 平均耗时：${cacheDuration / 50}ms/组件`);

  // 获取缓存统计
  const cacheStats = kernel.cacheManager.getStats();
  console.log(`- 缓存命中率：${cacheStats.hitRate.toFixed(2)}%`);

  await kernel.shutdown();
}

// 导出示例函数
export {
  basicExample,
  runAdvancedExample,
  performanceTest
};

// 如果直接运行此文件
if (typeof require !== 'undefined' && require.main === module) {
  console.log('🚀 运行基础示例...');
  basicExample()
    .then(() => {
      console.log('\n🚀 运行高级示例...');
      return runAdvancedExample();
    })
    .then(() => {
      console.log('\n🚀 运行性能测试...');
      return performanceTest();
    })
    .then(() => {
      console.log('\n✅ 所有示例运行完成！');
    })
    .catch(error => {
      console.error('❌ 示例运行失败：', error);
      process.exit(1);
    });
}
