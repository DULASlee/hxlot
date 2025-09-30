# SmartAbp Cursor IDE 配置指南

> **版本**: v2.1 | **更新日期**: 2025-09-30 | **质量标准**: 企业级95分

## 📋 目录

- [快速开始](#快速开始)
- [配置架构](#配置架构)
- [终端配置](#终端配置)
- [可用命令](#可用命令)
- [验证配置](#验证配置)
- [故障排除](#故障排除)
- [文件说明](#文件说明)

## 🚀 快速开始

### 第一次使用

1. **打开Cursor IDE**，加载SmartAbp项目
2. **按 `Ctrl+Shift+``** 打开集成终端
3. **自动加载配置**，看到以下提示即表示成功：
   ```
   ✅ SmartAbp 统一PowerShell终端配置已加载 (v2.1)
   📁 项目根目录: D:\BAOBAB\Baobab.SmartAbp
   🎯 质量阈值: 95 分
   ```

### 验证配置

运行验证器确保所有配置正确：

```powershell
pwsh -File .cursor/terminal-config-validator.ps1
```

预期结果：
```
✅ 通过: 13 项
❌ 失败: 0 项
🎯 合规率: 100%
```

## 🏗️ 配置架构

### 核心配置文件

```
.cursor/
├── env-vars.json                      # 核心环境变量配置（统一配置源）
├── settings.json                      # Cursor IDE主配置
│
├── unified-terminal.ps1 (v2.1)        # PowerShell统一配置
├── unified-terminal.sh (v2.1)         # Bash统一配置
├── unified-terminal.bat (v2.1)        # CMD统一配置
│
├── terminal-config-validator.ps1      # 配置验证器
├── mcp-settings.json                  # MCP工具配置
│
├── README.md                          # 本文档（主入口）
└── README-terminal-unified.md         # 终端配置详细报告
```

### 配置层次

```
┌─────────────────────────────────────┐
│   env-vars.json (核心配置源)        │
│   • encoding                         │
│   • pagers                           │
│   • msys                             │
│   • terminal                         │
└─────────────┬───────────────────────┘
              │
              ├─────────────────────────┐
              │                         │
    ┌─────────▼──────────┐    ┌────────▼─────────┐
    │  unified-terminal  │    │   settings.json  │
    │  • .ps1            │    │   • 终端profiles │
    │  • .sh             │    │   • 环境变量     │
    │  • .bat            │    │   • IDE设置      │
    └────────────────────┘    └──────────────────┘
```

## 🖥️ 终端配置

### 可用终端类型

| 终端类型 | 配置文件 | 自动加载 | 推荐使用 |
|---------|---------|---------|---------|
| **PowerShell (SmartAbp)** | `unified-terminal.ps1` | ✅ | ⭐⭐⭐⭐⭐ |
| **Bash (SmartAbp)** | `unified-terminal.sh` | ✅ | ⭐⭐⭐⭐ |
| **CMD (SmartAbp)** | `unified-terminal.bat` | ✅ | ⭐⭐⭐ |

### 自动加载机制

#### PowerShell (SmartAbp)
```json
{
  "path": "pwsh.exe",
  "args": [
    "-NoLogo",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-File", "${workspaceFolder}\\.cursor\\unified-terminal.ps1"
  ]
}
```

#### Bash (SmartAbp)
```json
{
  "path": "C:\\Program Files\\Git\\bin\\bash.exe",
  "args": [
    "--login", "-i", "-c",
    "source ${workspaceFolder}/.cursor/unified-terminal.sh; exec bash"
  ]
}
```

#### CMD (SmartAbp)
```json
{
  "path": "C:\\Windows\\System32\\cmd.exe",
  "args": [
    "/K",
    "chcp 65001 >nul && call \"${workspaceFolder}\\.cursor\\unified-terminal.bat\""
  ]
}
```

### 环境变量配置

所有终端统一配置以下环境变量：

```bash
# 编码设置
LANG=C.UTF-8
LC_ALL=C.UTF-8
LESSCHARSET=utf-8
TERM=xterm-256color

# 分页器禁用（解决卡死问题）
PAGER=cat
GIT_PAGER=cat
MANPAGER=cat
LESS=
SYSTEMD_PAGER=

# MSYS设置
MSYS_NO_PATHCONV=1
MSYS2_ARG_CONV_EXCL=*

# SmartAbp项目特定
SMARTABP_PROJECT_ROOT=<项目根目录>
SMARTABP_QUALITY_THRESHOLD=95
```

## 💻 可用命令

### Git快捷命令

| 命令 | 完整命令 | 说明 |
|-----|---------|------|
| `gs` | `git status --short` | 简短状态 |
| `gl` | `git log --oneline --graph --decorate --all -10` | 图形化日志 |
| `gd` | `git --no-pager diff` | 差异对比 |
| `gb` | `git --no-pager branch` | 分支列表 |

### .NET快捷命令

| 命令 | 完整命令 | 说明 |
|-----|---------|------|
| `dnr` | `dotnet run` | 运行项目 |
| `dnb` | `dotnet build` | 构建项目 |
| `dnt` | `dotnet test` | 运行测试 |

### SmartAbp专用命令

#### 核心功能

| 命令 | 功能 | 说明 |
|-----|------|------|
| `smartabp-sync` | Git安全同步 | 质量检查+推送（符合铁律） |
| `smartabp-check` | 质量检查 | 运行完整质量检查 |
| `smartabp-dev` | 启动开发环境 | 启动前后端开发服务 |

#### 快速导航 (v2.1新增) ⭐

| 命令 | 目标目录 | 说明 |
|-----|---------|------|
| `smartabp-vue` | `src/SmartAbp.Vue` | Vue前端项目 |
| `smartabp-packages` | `src/SmartAbp.Vue/packages` | 低代码引擎packages |
| `smartabp-backend` | `src/SmartAbp.Application` | 后端应用服务 |

#### 质量检查 (v2.1新增) ⭐

| 命令 | 功能 | 说明 |
|-----|------|------|
| `smartabp-lint` | ESLint检查 | 运行前端代码规范检查 |
| `smartabp-type` | TypeScript类型检查 | 运行类型安全检查 |
| `smartabp-build` | 前端构建 | 运行Vite构建 |

## ✅ 验证配置

### 运行验证器

```powershell
pwsh -File .cursor/terminal-config-validator.ps1
```

### 验证项目

验证器会检查以下13项配置：

1. ✅ 核心环境配置文件存在
2. ✅ PowerShell统一配置存在
3. ✅ Bash统一配置存在
4. ✅ CMD统一配置存在
5. ✅ 环境变量JSON格式正确
6. ✅ PowerShell配置语法正确
7. ✅ Git可执行文件存在
8. ✅ dotnet可执行文件存在
9. ✅ npm可执行文件存在
10. ✅ 旧配置文件已清理
11. ✅ 环境变量配置完整性
12. ✅ Shell脚本存在性
13. ✅ 配置版本一致性 (v2.1)

### 手动测试

测试以下命令确保终端配置正常：

```bash
# 测试Git命令（不应卡死）
git log --oneline -5
git status
git diff

# 测试别名
gs
gl
gd

# 测试SmartAbp命令
smartabp-vue
pwd
cd ../..

# 测试环境变量
echo $env:SMARTABP_PROJECT_ROOT    # PowerShell
echo $SMARTABP_PROJECT_ROOT         # Bash
```

## 🔧 故障排除

### 问题1: 终端配置未自动加载

**症状**: 打开终端后没有看到加载成功提示

**解决方案**:

1. 检查默认终端配置：
   ```json
   "terminal.integrated.defaultProfile.windows": "PowerShell (SmartAbp)"
   ```

2. 确认配置文件存在：
   ```bash
   ls .cursor/unified-terminal.ps1
   ```

3. 手动加载配置：
   ```powershell
   . .cursor/unified-terminal.ps1
   ```

4. 重启Cursor IDE

### 问题2: Git命令卡死在分页器

**症状**: 运行 `git log` 或 `git diff` 时终端卡住

**解决方案**:

1. 检查环境变量：
   ```powershell
   echo $env:GIT_PAGER    # 应该显示 "cat"
   ```

2. 手动设置环境变量：
   ```bash
   export GIT_PAGER=cat
   ```

3. 运行验证器检查配置

### 问题3: 别名不可用

**症状**: 输入 `gs` 或 `smartabp-vue` 提示命令不存在

**解决方案**:

1. 确认使用SmartAbp终端（标题栏包含"SmartAbp"）
2. 重新打开终端
3. 手动加载配置文件
4. 检查配置文件语法是否正确

### 问题4: PowerShell执行策略错误

**症状**: PowerShell提示"无法加载，因为在此系统上禁止运行脚本"

**解决方案**:

```powershell
# 以管理员身份运行PowerShell，执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 问题5: Bash找不到配置文件

**症状**: Bash启动时提示找不到 `unified-terminal.sh`

**解决方案**:

1. 检查Git Bash安装路径：
   ```bash
   which bash
   ```

2. 更新 `settings.json` 中的路径：
   ```json
   "path": "C:\\Program Files\\Git\\bin\\bash.exe"
   ```

3. 或使用相对路径：
   ```json
   "path": "${env:ProgramFiles}\\Git\\bin\\bash.exe"
   ```

## 📚 文件说明

### 配置文件

| 文件 | 类型 | 说明 |
|-----|------|------|
| `env-vars.json` | JSON | 核心环境变量配置，所有终端配置的数据源 |
| `settings.json` | JSON | Cursor IDE主配置，包含终端profiles定义 |
| `mcp-settings.json` | JSON | MCP (Model Context Protocol) 工具配置 |

### 终端脚本

| 文件 | 类型 | 说明 |
|-----|------|------|
| `unified-terminal.ps1` | PowerShell | PowerShell终端统一配置 (v2.1) |
| `unified-terminal.sh` | Bash | Bash终端统一配置 (v2.1) |
| `unified-terminal.bat` | Batch | CMD终端统一配置 (v2.1) |

### 工具脚本

| 文件 | 类型 | 说明 |
|-----|------|------|
| `terminal-config-validator.ps1` | PowerShell | 终端配置验证器，13项完整检查 |

### 文档

| 文件 | 说明 |
|-----|------|
| `README.md` | 本文档，主入口文档 |
| `README-terminal-unified.md` | 终端配置详细报告，包含版本历史 |

### 规则目录

| 文件 | 说明 |
|-----|------|
| `rules/00_core_philosophy.mdc` | 核心开发哲学 |
| `rules/01_code_standards.mdc` | 代码标准规范 |
| `rules/02_development_process.mdc` | 开发流程规范 |
| `rules/03_quality_guardian.mdc` | 质量守护铁律 |
| `rules/04_code_quality_prohibitions.mdc` | 代码质量禁令 |
| `rules/05_增量迭代开发质量门禁与GIT版本管理铁律.mdc` | 质量门禁与Git管理 |
| `rules/06_低代码生成器代码质量铁律.mdc` | 低代码生成器质量标准 |

## 🎯 最佳实践

### 终端使用建议

1. **优先使用PowerShell (SmartAbp)** - 功能最完整，彩色输出，错误处理最好
2. **Linux兼容性场景使用Bash (SmartAbp)** - 需要运行.sh脚本时
3. **传统Windows场景使用CMD (SmartAbp)** - 特定工具要求时

### 开发工作流

```bash
# 1. 打开终端
Ctrl+Shift+`

# 2. 进入工作目录
smartabp-vue         # 前端开发
smartabp-packages    # 低代码引擎开发
smartabp-backend     # 后端开发

# 3. 开发前检查
smartabp-type        # TypeScript类型检查
smartabp-lint        # 代码规范检查

# 4. 提交前验证
smartabp-check       # 完整质量检查

# 5. 安全同步
smartabp-sync        # Git安全同步（含质量门禁）
```

### 配置维护

1. **定期验证**: 每周运行一次配置验证器
2. **版本更新**: 关注配置版本更新，及时同步
3. **备份配置**: 重要修改前备份 `.cursor` 目录
4. **问题反馈**: 遇到问题及时记录和反馈

## 📈 版本历史

| 版本 | 日期 | 主要改进 |
|------|------|---------|
| v2.1 | 2025-09-30 | 新增快速导航和质量检查命令；增强错误处理；删除废弃配置；创建综合README |
| v2.0 | 2025-09-27 | 统一三个Shell配置；创建核心env-vars.json；删除重复配置 |
| v1.0 | 2025-09-26 | 初始版本；解决终端卡死问题；创建基础配置 |

## 🔗 相关资源

- [项目开发规范总览](../docs/项目开发规范总览.md)
- [终端配置详细报告](./README-terminal-unified.md)
- [Git安全同步脚本](../scripts/git/git-safe-sync.sh)
- [质量检查脚本](../scripts/ci-quality-check.sh)

---

**配置版本**: v2.1  
**更新日期**: 2025-09-30  
**维护人员**: SmartAbp开发团队  
**质量标准**: 企业级95分标准  
**验证状态**: ✅ 100%通过（13/13项）

