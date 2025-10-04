# 🛡️ AI Guardian - AI断线守护系统

## 概述

AI Guardian是为Cursor IDE设计的AI大模型断线检测与自动恢复系统，解决AI因网络或终端问题导致的工作中断。

## 文件结构

```
tools/ai-guardian/
├── mcp-ai-guardian-server.js   # MCP服务器主程序
├── guardian-daemon.py           # Python守护脚本（备选）
└── README.md                    # 本文件
```

## 快速开始

### 方案1: MCP服务器（推荐）

1. **已自动配置**: `.cursor/settings.json` 已添加MCP配置
2. **重启IDE**: 重启Cursor IDE使配置生效
3. **验证服务**: 在聊天框输入 `@ai_guardian_status`

### 方案2: Python守护脚本（备选）

```bash
# 安装依赖
pip install psutil pyautogui

# 启动守护脚本
python tools/ai-guardian/guardian-daemon.py
```

## 详细文档

完整使用指南请参考：[AI断线守护MCP服务使用指南](../../docs/ai-guardian/AI断线守护MCP服务使用指南.md)

## 核心功能

- ✅ **智能断线检测**: 90秒无活动自动判断
- ✅ **自动检查点**: 关键任务节点状态保存
- ✅ **快速恢复**: 生成清晰的恢复指令
- ✅ **心跳监控**: 30秒间隔实时监控

## 状态文件

```
.ai-engine/
├── ai-state.json          # AI状态
├── checkpoint-*.json       # 检查点快照
└── logs/
    └── recovery-*.txt      # 恢复指令
```

## MCP工具

| 工具 | 功能 |
|------|------|
| `ai_guardian_ping` | 记录AI活动心跳 |
| `ai_guardian_checkpoint` | 创建执行检查点 |
| `ai_guardian_status` | 查看AI在线状态 |
| `ai_guardian_recover` | 生成恢复指令 |

## 技术栈

- **Node.js**: MCP服务器运行环境
- **MCP Protocol**: Cursor IDE标准协议
- **Python**: 守护脚本（可选）

## 维护

- **版本**: 1.0.0
- **作者**: 世界顶级微服务架构师
- **日期**: 2025-10-04

