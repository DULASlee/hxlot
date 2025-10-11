// ========================================
// v7.0真实机制 - 完整迁移到v10.0
// 增强版：支持VSCode事件回调
// ========================================

export interface Checkpoint {
  id: string;
  type: 'USER_REVIEW' | 'LIGHT_CHECK' | 'QUALITY_GATE' | 'FORCED_STOP' | 'MANUAL';
  lines: number;
  files: FileInfo[];
  timestamp: Date;
  canRestore: boolean;
}

export interface FileInfo {
  fileName: string;
  lines: number;
  timestamp: Date;
}

export type CheckpointType = 'USER_REVIEW' | 'LIGHT_CHECK' | 'QUALITY_GATE' | 'FORCED_STOP' | 'MANUAL';

export interface CodeLineTrackerCallbacks {
  on100LinesReached?: () => void;
  on200LinesReached?: () => void;
  on280LinesWarning?: () => void;
  on300LinesForceStop?: () => void;
  onCheckpointCreated?: (checkpoint: Checkpoint) => void;
}

export interface SessionStats {
  totalLines: number;
  filesCount: number;
  checkpointsCount: number;
  lastCheckpoint?: Checkpoint;
  files: FileInfo[];
}


export class EnhancedCodeLineTracker {
  private currentSessionLines: number = 0;
  private checkpoints: Checkpoint[] = [];
  private filesCreated: FileInfo[] = [];
  private callbacks: CodeLineTrackerCallbacks = {};
  private has100Triggered: boolean = false;
  private has200Triggered: boolean = false;
  private has280Triggered: boolean = false;

  constructor(callbacks?: CodeLineTrackerCallbacks) {
    this.callbacks = callbacks || {};
  }

  // 添加代码时自动计算行数
  addCode(fileName: string, code: string): void {
    const lines = code.split('\n').length;
    this.currentSessionLines += lines;

    // 查找或更新文件记录
    const existingFileIndex = this.filesCreated.findIndex(f => f.fileName === fileName);
    if (existingFileIndex >= 0) {
      this.filesCreated[existingFileIndex].lines += lines;
      this.filesCreated[existingFileIndex].timestamp = new Date();
    } else {
      this.filesCreated.push({
        fileName,
        lines,
        timestamp: new Date()
      });
    }

    // 自动检查阈值
    this.checkSmartThresholds();
  }

  // 获取当前会话统计
  getSessionStats(): SessionStats {
    return {
      totalLines: this.currentSessionLines,
      filesCount: this.filesCreated.length,
      checkpointsCount: this.checkpoints.length,
      lastCheckpoint: this.checkpoints[this.checkpoints.length - 1],
      files: [...this.filesCreated]
    };
  }

  // 重置会话（质量门禁通过后）
  resetSession(): void {
    this.currentSessionLines = 0;
    this.filesCreated = [];
    this.checkpoints = [];
    this.has100Triggered = false;
    this.has200Triggered = false;
    this.has280Triggered = false;
  }

  // 智能阈值检查（核心机制）
  checkSmartThresholds(): boolean {
    const current = this.currentSessionLines;

    // 100行审查点
    if (current >= 100 && current < 120 && !this.has100Triggered) {
      this.has100Triggered = true;
      this.createCheckpoint('100lines', 'USER_REVIEW');
      if (this.callbacks.on100LinesReached) {
        this.callbacks.on100LinesReached();
      }
    }

    // 200行审查点
    if (current >= 200 && current < 220 && !this.has200Triggered) {
      this.has200Triggered = true;
      this.createCheckpoint('200lines', 'USER_REVIEW');
      if (this.callbacks.on200LinesReached) {
        this.callbacks.on200LinesReached();
      }
    }

    // 280行轻量检查 ✅
    if (current >= 280 && current < 300 && !this.has280Triggered) {
      this.has280Triggered = true;
      this.createCheckpoint('280lines', 'LIGHT_CHECK');
      if (this.callbacks.on280LinesWarning) {
        this.callbacks.on280LinesWarning();
      }
    }

    // 300行完整质量门禁 ✅
    if (current >= 300) {
      this.createCheckpoint('300lines', 'QUALITY_GATE');
      if (this.callbacks.on300LinesForceStop) {
        this.callbacks.on300LinesForceStop();
      }
      return false;
    }

    return true;
  }

  // 创建检查点
  createCheckpoint(id: string, type: CheckpointType): void {
    const checkpoint: Checkpoint = {
      id,
      type,
      lines: this.currentSessionLines,
      files: [...this.filesCreated],
      timestamp: new Date(),
      canRestore: true
    };

    this.checkpoints.push(checkpoint);

    if (this.callbacks.onCheckpointCreated) {
      this.callbacks.onCheckpointCreated(checkpoint);
    }
  }

  // 从检查点恢复
  async restoreFromCheckpoint(checkpointId: string): Promise<boolean> {
    const checkpoint = this.checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) {
      throw new Error(`检查点不存在: ${checkpointId}`);
    }

    this.currentSessionLines = checkpoint.lines;
    this.filesCreated = [...checkpoint.files];

    return true;
  }

  // 获取所有检查点
  getCheckpoints(): Checkpoint[] {
    return [...this.checkpoints];
  }

  // 获取最后一个检查点
  getLastCheckpoint(): Checkpoint | undefined {
    return this.checkpoints[this.checkpoints.length - 1];
  }

  // 生成详细报告
  generateReport(): string {
    const stats = this.getSessionStats();
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 本次会话统计报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

总代码行数: ${stats.totalLines}行
创建文件数: ${stats.filesCount}个
检查点数: ${stats.checkpointsCount}个
距离限制: ${300 - stats.totalLines}行

📋 文件清单:
${stats.files.map((f, i) => `  ${i + 1}. ${f.fileName.split('/').pop()} (${f.lines}行)`).join('\n')}

✅ 检查点:
${this.checkpoints.map((cp, i) => `  ${i + 1}. ${cp.id} - ${cp.type} (${cp.lines}行)`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }
}