# SmartAbp 架构优化方案 - Phase 1: 紧急止血与环境标准化

##  优化目标
- 立即缓解IDE内存压力和终端卡顿问题
- 建立标准化的开发环境配置
- 为后续架构优化奠定基础

##  核心问题诊断

### 三大架构原则违背
1. **关注点未能分离**: IDE被迫监控编译产物、生成代码等非源码文件
2. **边界模糊**: 低代码生成器产出与手写源码混杂，污染开发环境  
3. **开发负载过重**: 宏观监控粒度与微观开发模式不匹配

##  实施步骤 (1-3天)

### 1. IDE配置标准化

#### 创建 .vscode/settings.json
`json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/coverage/**": true,
    "**/packages/**/dist/**": true,
    "**/packages/**/node_modules/**": true,
    "**/generated/**": true,
    "**/*.generated.*": true,
    "**/__tests__/__snapshots__/**": true,
    "**/.cursor-cache/**": true,
    "**/.vscode-server/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/*.code-search": true,
    "**/packages/**/dist": true,
    "**/generated": true
  },
  "typescript.tsserver.watchOptions": {
    "exclude": [
      "**/node_modules",
      "**/dist", 
      "**/generated",
      "**/build",
      "**/coverage"
    ]
  }
}
`

### 2. 代码生成器输出隔离

#### 创建生成文件隔离目录
`ash
mkdir -p .generated/lowcode-output
mkdir -p .generated/temp-cache
`

#### 更新 .gitignore
`gitignore
# 生成器输出隔离
.generated/
`

#### 配置生成器输出路径
修改低代码生成器配置，将所有生成文件输出到 .generated/ 目录

### 3. Workspace开发模式推行

#### 创建开发工作区配置
`json
// SmartAbp.code-workspace
{
  "folders": [
    {"path": "src/SmartAbp.Application", "name": "后端应用层"},
    {"path": "src/SmartAbp.Vue/packages/lowcode-core", "name": "低代码核心"},
    {"path": "src/SmartAbp.Vue/packages/lowcode-designer", "name": "设计器模块"},
    {"path": "src/SmartAbp.Vue", "name": "主应用", "disabled": true}
  ],
  "settings": {
    "files.watcherExclude": {
      "**/node_modules/**": true,
      "**/dist/**": true,
      "**/generated/**": true
    }
  }
}
`

### 4. 开发环境清理脚本

#### 创建 scripts/dx-clean.ps1
`powershell
# 开发体验清理脚本
Write-Host " 清理开发环境缓存..." -ForegroundColor Green

# 清理IDE缓存
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue @(
    ".cursor-cache",
    ".vscode-server", 
    ".idea",
    ".vs"
)

# 清理构建产物
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue @(
    "dist",
    "build",
    "coverage",
    "**/bin",
    "**/obj"
)

# 清理生成文件
if (Test-Path ".generated") {
    Remove-Item -Recurse -Force "/../.generated/*" -Exclude ".gitkeep"
}

Write-Host " 开发环境清理完成！" -ForegroundColor Green
`

#### 添加到 package.json scripts
`json
{
  "scripts": {
    "dx:clean": "powershell -File scripts/dx-clean.ps1"
  }
}
`

##  预期效果

- **内存使用**: 降低30-50%
- **IDE响应**: 提升2-3倍
- **开发体验**: 大幅改善卡顿问题
- **标准化**: 团队环境配置统一

##  验证指标

1. 执行 dx:clean 后IDE内存占用变化
2. 终端命令执行时间对比
3. 文件监控数量统计
4. 团队开发环境一致性检查

##  注意事项

1. 确保所有团队成员同步更新IDE配置
2. 代码生成器需要适配新的输出路径
3. Workspace模式需要团队培训适应
4. 定期执行清理脚本保持环境清洁

---

**下一阶段**: Phase 2 - 结构性解耦与构建现代化
