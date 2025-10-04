import * as assert from 'assert';

// 模拟AI状态接口
interface MockAIState {
  lastActivity: number;
  isOnline: boolean;
  activityCount: number;
  engineLoaded: boolean;
  lastEngineCheck: number;
}

// 模拟AI Guardian核心逻辑类
class MockAIGuardian {
  private aiState: MockAIState;

  constructor() {
    this.aiState = {
      lastActivity: 0,
      isOnline: true,
      activityCount: 0,
      engineLoaded: false,
      lastEngineCheck: 0
    };
  }

  public recordActivity(activity: string = 'user_activity') {
    this.aiState.lastActivity = Date.now();
    this.aiState.activityCount++;
    this.aiState.isOnline = true;
  }

  public getState(): MockAIState {
    return { ...this.aiState };
  }

  public async isAIOffline(): Promise<boolean> {
    const now = Date.now();
    const timeSinceLastActivity = now - this.aiState.lastActivity;
    const offlineThreshold = 10 * 60 * 1000; // 10分钟
    
    return timeSinceLastActivity > offlineThreshold;
  }

  public async checkExecutionEngine(): Promise<boolean> {
    // 模拟检查执行引擎文件
    this.aiState.lastEngineCheck = Date.now();
    
    // 模拟文件存在检查
    const engineFileExists = true; // 模拟文件存在
    const testPassed = await this.testEngineResponse();
    
    this.aiState.engineLoaded = engineFileExists && testPassed;
    return this.aiState.engineLoaded;
  }

  private async testEngineResponse(): Promise<boolean> {
    // 模拟Language Model API测试
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟AI响应包含执行引擎标志
        const mockResponse = '🔥 专家模式已激活！九重爆雷连环启动！AI编程铁律自动执行引擎已启动';
        const engineKeywords = [
          'AI编程铁律自动执行引擎已启动',
          '专家模式已激活',
          '九重爆雷',
          '编程前强制学习',
          '质量门禁检查'
        ];
        
        const hasEngineResponse = engineKeywords.some(keyword => 
          mockResponse.includes(keyword)
        );
        
        resolve(hasEngineResponse);
      }, 100);
    });
  }

  public generateStatusText(): string {
    const statusIcon = this.aiState.isOnline ? '🟢' : '🔴';
    const connectionStatus = this.aiState.isOnline ? '在线' : '离线';
    const engineStatus = this.aiState.engineLoaded ? '已加载' : '未加载';
    
    return `${statusIcon} AI ${connectionStatus} | 引擎 ${engineStatus}`;
  }
}

// 测试套件
describe('AI Guardian 核心逻辑测试', function() {
  let guardian: MockAIGuardian;

  beforeEach(function() {
    guardian = new MockAIGuardian();
  });

  describe('AI状态监控功能', function() {
    it('应该正确初始化AI状态', function() {
      const state = guardian.getState();
      
      assert.strictEqual(state.isOnline, true, 'AI初始状态应该为在线');
      assert.strictEqual(state.lastActivity, 0, '最后活动时间应该为0');
      assert.strictEqual(state.activityCount, 0, '活动计数初始应该为0');
      assert.strictEqual(state.engineLoaded, false, '执行引擎初始状态应该为未加载');
      assert.strictEqual(state.lastEngineCheck, 0, '最后引擎检查时间应该为0');
    });

    it('应该能够记录AI活动', function() {
      guardian.recordActivity('test_activity');
      
      const state = guardian.getState();
      assert.notStrictEqual(state.lastActivity, 0, '记录活动后lastActivity应该不为0');
      assert.strictEqual(state.activityCount, 1, '活动计数应该增加到1');
      assert.strictEqual(state.isOnline, true, '记录活动后AI应该为在线状态');
    });

    it('应该能够检测AI离线状态', async function() {
      // 模拟AI长时间无活动
      const state = guardian.getState();
      (guardian as any).aiState.lastActivity = Date.now() - 11 * 60 * 1000; // 11分钟前
      
      const isOffline = await guardian.isAIOffline();
      assert.strictEqual(isOffline, true, '11分钟无活动应该被检测为离线');
    });

    it('应该能够检测AI在线状态', async function() {
      guardian.recordActivity(); // 记录当前活动
      
      const isOffline = await guardian.isAIOffline();
      assert.strictEqual(isOffline, false, '刚记录活动应该被检测为在线');
    });
  });

  describe('执行引擎检查功能', function() {
    it('应该能够检查执行引擎状态', async function() {
      const result = await guardian.checkExecutionEngine();
      
      const state = guardian.getState();
      assert.strictEqual(result, true, '执行引擎检查应该成功');
      assert.strictEqual(state.engineLoaded, true, '检查后执行引擎应该为已加载状态');
      assert.notStrictEqual(state.lastEngineCheck, 0, '检查后lastEngineCheck应该不为0');
    });

    it('应该能够测试引擎响应', async function() {
      const result = await (guardian as any).testEngineResponse();
      assert.strictEqual(result, true, '引擎响应测试应该成功');
    });
  });

  describe('状态栏显示功能', function() {
    it('应该正确生成在线状态文本', function() {
      guardian.recordActivity();
      const statusText = guardian.generateStatusText();
      
      assert.ok(statusText.includes('🟢'), '在线状态应该显示绿色圆点');
      assert.ok(statusText.includes('AI 在线'), '应该显示AI在线状态');
    });

    it('应该正确生成离线状态文本', function() {
      (guardian as any).aiState.isOnline = false;
      const statusText = guardian.generateStatusText();
      
      assert.ok(statusText.includes('🔴'), '离线状态应该显示红色圆点');
      assert.ok(statusText.includes('AI 离线'), '应该显示AI离线状态');
    });

    it('应该根据执行引擎状态显示相应文本', async function() {
      await guardian.checkExecutionEngine();
      const statusText = guardian.generateStatusText();
      
      assert.ok(statusText.includes('引擎 已加载'), '引擎已加载状态应该显示在状态栏');
    });
  });

  describe('完整工作流程测试', function() {
    it('应该能够完成完整的监控流程', async function() {
      // 1. 记录活动
      guardian.recordActivity('用户操作');
      
      // 2. 检查执行引擎
      await guardian.checkExecutionEngine();
      
      // 3. 验证状态
      const state = guardian.getState();
      assert.strictEqual(state.isOnline, true, '完整流程后AI应该在线');
      assert.strictEqual(state.engineLoaded, true, '完整流程后执行引擎应该已加载');
      assert.strictEqual(state.activityCount, 1, '活动计数应该为1');
      
      // 4. 生成状态文本
      const statusText = guardian.generateStatusText();
      assert.ok(statusText.includes('🟢'), '状态文本应该显示在线');
      assert.ok(statusText.includes('已加载'), '状态文本应该显示引擎已加载');
      
      console.log('✅ 完整工作流程测试通过');
    });

    it('应该能够处理离线恢复场景', async function() {
      // 1. 模拟离线状态
      (guardian as any).aiState.isOnline = false;
      (guardian as any).aiState.lastActivity = Date.now() - 15 * 60 * 1000; // 15分钟前
      
      // 2. 检查离线状态
      const isOffline = await guardian.isAIOffline();
      assert.strictEqual(isOffline, true, '应该检测到离线状态');
      
      // 3. 模拟恢复操作
      guardian.recordActivity('恢复连接');
      
      // 4. 验证恢复后状态
      const state = guardian.getState();
      assert.strictEqual(state.isOnline, true, '恢复后应该为在线状态');
      
      console.log('✅ 离线恢复场景测试通过');
    });
  });
});

// 性能测试
describe('AI Guardian 性能测试', function() {
  let guardian: MockAIGuardian;

  beforeEach(function() {
    guardian = new MockAIGuardian();
  });

  it('应该能够快速记录大量活动', function() {
    const startTime = Date.now();
    
    // 记录1000次活动
    for (let i = 0; i < 1000; i++) {
      guardian.recordActivity(`activity_${i}`);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert.ok(duration < 1000, `记录1000次活动应该在1秒内完成，实际用时：${duration}ms`);
    
    const state = guardian.getState();
    assert.strictEqual(state.activityCount, 1000, '活动计数应该为1000');
  });

  it('应该能够快速生成状态文本', function() {
    const startTime = Date.now();
    
    // 生成1000次状态文本
    for (let i = 0; i < 1000; i++) {
      guardian.generateStatusText();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert.ok(duration < 500, `生成1000次状态文本应该在500ms内完成，实际用时：${duration}ms`);
  });
});

console.log('🚀 AI Guardian 核心逻辑测试启动...');
