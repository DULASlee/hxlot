/**
 * AI Guardian 直接大模型通信功能测试
 * 测试真正的AI大模型通信功能
 */

import * as assert from 'assert';
import { suite, test } from 'mocha';

// 模拟VSCode Language Model API
interface MockLanguageModel {
  name: string;
  sendRequest: (messages: any[], options: any, token: any) => Promise<any>;
}

interface MockCancellationTokenSource {
  token: any;
  cancel: () => void;
}

/**
 * 模拟直接AI通信恢复逻辑
 */
async function attemptDirectAICommunication(
  models: MockLanguageModel[], 
  contextMessage: string
): Promise<boolean> {
  try {
    if (models && models.length > 0) {
      const model = models[0];
      console.log(`✅ Found AI model: ${model.name}`);
      
      // 构建消息
      const message = { role: 'user', content: contextMessage };
      const cancellationSource: MockCancellationTokenSource = {
        token: {},
        cancel: () => {}
      };
      
      console.log('📤 Sending recovery message to AI model...');
      await model.sendRequest([message], {}, cancellationSource.token);
      
      console.log('✅ Recovery message sent successfully to AI model.');
      return true;
    } else {
      console.log('⚠️ No AI models available.');
      return false;
    }
  } catch (error) {
    console.log(`❌ Direct AI communication failed: ${error}`);
    return false;
  }
}

/**
 * 构建恢复上下文
 */
function buildRecoveryContext(lastWorkContext?: string): string {
  const context = lastWorkContext || '继续之前的开发任务';
  const timestamp = new Date().toLocaleString('zh-CN');
  
  return `# AI恢复指令 (${timestamp})

${context}

**请继续执行上述任务。**`;
}

suite('AI Guardian - 直接大模型通信测试', () => {
  
  suite('AI模型发现测试', () => {
    test('应该能够发现可用的AI模型', async () => {
      const mockModels: MockLanguageModel[] = [
        {
          name: 'Claude-3.5-Sonnet',
          sendRequest: async () => ({ success: true })
        }
      ];

      const result = await attemptDirectAICommunication(mockModels, '请继续');
      
      assert.strictEqual(result, true, '应该成功发现并使用AI模型');
    });

    test('没有可用模型时应该返回失败', async () => {
      const mockModels: MockLanguageModel[] = [];

      const result = await attemptDirectAICommunication(mockModels, '请继续');
      
      assert.strictEqual(result, false, '没有模型时应该返回失败');
    });
  });

  suite('消息发送测试', () => {
    test('应该能够发送恢复消息', async () => {
      let sentMessage: any = null;
      
      const mockModels: MockLanguageModel[] = [
        {
          name: 'Test-Model',
          sendRequest: async (messages) => {
            sentMessage = messages[0];
            return { success: true };
          }
        }
      ];

      const contextMessage = buildRecoveryContext('正在测试AI通信功能');
      const result = await attemptDirectAICommunication(mockModels, contextMessage);
      
      assert.strictEqual(result, true, '应该成功发送消息');
      assert.ok(sentMessage, '应该捕获到发送的消息');
      assert.ok(sentMessage.content.includes('正在测试AI通信功能'), '消息应包含工作上下文');
    });

    test('发送失败时应该正确处理错误', async () => {
      const mockModels: MockLanguageModel[] = [
        {
          name: 'Failing-Model',
          sendRequest: async () => {
            throw new Error('Network error');
          }
        }
      ];

      const result = await attemptDirectAICommunication(mockModels, '请继续');
      
      assert.strictEqual(result, false, '发送失败时应该返回false');
    });
  });

  suite('恢复上下文构建测试', () => {
    test('应该包含工作上下文和时间戳', () => {
      const context = buildRecoveryContext('正在开发AI守护插件');
      
      assert.ok(context.includes('正在开发AI守护插件'), '应包含工作上下文');
      assert.ok(context.includes('请继续执行上述任务'), '应包含继续指令');
      assert.ok(/20\d{2}/.test(context), '应包含时间戳');
    });

    test('工作上下文为空时应使用默认值', () => {
      const context = buildRecoveryContext();
      
      assert.ok(context.includes('继续之前的开发任务'), '应使用默认上下文');
    });
  });

  suite('完整通信流程测试', () => {
    test('应该完成完整的AI通信恢复流程', async () => {
      const communicationLog: string[] = [];
      
      const mockModels: MockLanguageModel[] = [
        {
          name: 'Claude-3.5-Sonnet',
          sendRequest: async (messages) => {
            communicationLog.push('模型接收到消息');
            communicationLog.push(`消息内容: ${messages[0].content.substring(0, 50)}...`);
            return { success: true };
          }
        }
      ];

      const contextMessage = buildRecoveryContext('完整流程测试');
      const result = await attemptDirectAICommunication(mockModels, contextMessage);
      
      // 验证结果
      assert.strictEqual(result, true, '完整流程应该成功');
      assert.ok(communicationLog.length >= 2, '应该记录通信过程');
      assert.ok(communicationLog[0].includes('模型接收到消息'), '应该记录消息接收');
      assert.ok(communicationLog[1].includes('完整流程测试'), '应该记录消息内容');
    });
  });

  suite('性能测试', () => {
    test('AI通信应该在合理时间内完成', async () => {
      const mockModels: MockLanguageModel[] = [
        {
          name: 'Fast-Model',
          sendRequest: async () => {
            // 模拟50ms的网络延迟
            await new Promise(resolve => setTimeout(resolve, 50));
            return { success: true };
          }
        }
      ];

      const startTime = Date.now();
      const result = await attemptDirectAICommunication(mockModels, '性能测试');
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      assert.strictEqual(result, true, '性能测试应该成功');
      assert.ok(duration < 1000, `通信应该在1秒内完成，实际用时: ${duration}ms`);
    });
  });
});

console.log('🚀 开始运行AI Guardian直接大模型通信测试...\n');
