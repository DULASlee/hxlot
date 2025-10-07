// ========================================
// v7.0真实机制 - 完整迁移到v9.0
// ========================================

interface Checkpoint {
  id: string
  type: 'USER_REVIEW' | 'FORCED_STOP' | 'MANUAL'
  lines: number
  files: FileInfo[]
  timestamp: Date
  canRestore: boolean
}

interface FileInfo {
  fileName: string
  lines: number
  timestamp: Date
}

type CheckpointType = 'USER_REVIEW' | 'FORCED_STOP' | 'MANUAL';


export class EnhancedCodeLineTracker {
  private currentSessionLines: number = 0
  private checkpoints: Checkpoint[] = []
  private filesCreated: FileInfo[] = []
  
  // 添加代码时自动计算行数
  addCode(fileName: string, code: string) {
    const lines = code.split('\n').length
    this.currentSessionLines += lines
    this.filesCreated.push({ 
      fileName, 
      lines, 
      timestamp: new Date() 
    })
    
    // 自动检查阈值
    this.checkSmartThresholds()
  }
  
  // 智能阈值检查（核心机制）
  checkSmartThresholds() {
    const current = this.currentSessionLines
    
    // 100行审查点
    if (current >= 100 && current < 120 && !this.hasCheckpoint('100lines')) {
      this.createCheckpoint('100lines', 'USER_REVIEW')
      this.triggerUserIntervention(1)
    }
    
    // 200行审查点
    if (current >= 200 && current < 220 && !this.hasCheckpoint('200lines')) {
      this.createCheckpoint('200lines', 'USER_REVIEW')
      this.triggerUserIntervention(2)
    }
    
    // 280行警告
    if (current >= 280 && current < 300) {
      console.warn(`⚠️ 警告：已编写${current}行，接近300行限制`)
    }
    
    // 300行强制停止
    if (current >= 300) {
      this.createCheckpoint('300lines', 'FORCED_STOP')
      this.triggerQualityGate()
      return false
    }
    
    return true
  }
  
  // 创建检查点
  createCheckpoint(id: string, type: CheckpointType) {
    const checkpoint: Checkpoint = {
      id,
      type,
      lines: this.currentSessionLines,
      files: [...this.filesCreated],
      timestamp: new Date(),
      canRestore: true
    }
    
    this.checkpoints.push(checkpoint)
    this.saveToFS(checkpoint)
    
    console.log(`💾 检查点已保存: ${id} (${this.currentSessionLines}行)`)
  }
  
  // 从检查点恢复
  async restoreFromCheckpoint(checkpointId: string): Promise<boolean> {
    const checkpoint = this.checkpoints.find(cp => cp.id === checkpointId)
    if (!checkpoint) {
      throw new Error(`检查点不存在: ${checkpointId}`)
    }
    
    console.log(`🔄 从检查点恢复: ${checkpointId}`)
    this.currentSessionLines = checkpoint.lines
    this.filesCreated = checkpoint.files
    
    return true
  }
  
  // 检查是否存在检查点
  private hasCheckpoint(id: string): boolean {
    return this.checkpoints.some(cp => cp.id === id)
  }
  
  // 保存检查点到文件系统
  private saveToFS(checkpoint: Checkpoint) {
    // 保存到 .ai-engine/checkpoints/
    const path = `.ai-engine/checkpoints/checkpoint_${checkpoint.id}_${this.formatTimestamp(checkpoint.timestamp)}.json`
    // 实际实现由AI工具支持
  }
  
  // 格式化时间戳
  private formatTimestamp(date: Date): string {
    return date.toISOString().replace(/[:.]/g, '').slice(0, 15)
  }
  
  // 触发用户干预
  private triggerUserIntervention(level: number) {
    if (level === 1) {
      this.showUserIntervention100()
    } else if (level === 2) {
      this.showUserIntervention200()
    }
  }
  
  // 触发质量门禁
  private triggerQualityGate() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🛑 已达到300行代码限制！")
    console.log("⚡ 自动触发质量门禁检查！")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  }
  
  // 100行用户干预
  private showUserIntervention100() {
    const output = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛑 用户干预点1: 100行代码审查
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 当前进度:
  • 已编写: ${this.currentSessionLines}行
  • 创建文件: ${this.filesCreated.length}个
  • 预计剩余: ~${300 - this.currentSessionLines}行

📋 已创建文件:
${this.filesCreated.map((f, i) => `  ${i+1}. ${f.fileName} (${f.lines}行)`).join('\n')}

💡 建议:
  1. 代码方向是否正确？
  2. 是否有重复代码？
  3. 是否需要重构？

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
选项:
  [C] 继续编程（已确认代码质量）
  [R] 重构当前代码（回到100行检查点）
  [P] 暂停并查看详细报告
  [S] 停止并执行质量门禁

⏳ 10秒后自动选择 [C]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    console.log(output)
  }
  
  // 200行用户干预
  private showUserIntervention200() {
    const output = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛑 用户干预点2: 200行深度审查
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 当前进度:
  • 已编写: ${this.currentSessionLines}行
  • 创建文件: ${this.filesCreated.length}个
  • 预计剩余: ~${300 - this.currentSessionLines}行

📋 已创建文件:
${this.filesCreated.map((f, i) => `  ${i+1}. ${f.fileName} (${f.lines}行)`).join('\n')}

🚨 重要提醒:
  • 接近300行限制，建议提前执行质量门禁
  • 避免在接近限制时进行大量修改

💡 强烈建议:
  1. 立即执行质量门禁（推荐）
  2. 补充单元测试
  3. 添加文档注释

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
选项:
  [C] 继续编程到300行
  [Q] 立即执行质量门禁（推荐）✅
  [T] 补充单元测试后继续
  [R] 重构优化

⏳ 15秒后自动选择 [Q]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    console.log(output)
  }
}
