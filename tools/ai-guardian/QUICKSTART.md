# 🚀 AI Guardian 快速开始

## 立即使用（3步）

### ✅ 方案1: MCP服务器（已配置好）

**重启Cursor IDE** 即可！配置已自动添加。

重启后在聊天框测试：
```
请帮我检查AI状态
```

AI会自动调用 `@ai_guardian_status` 工具。

---

### ✅ 方案2: Python守护脚本

#### 步骤1: 安装依赖（首次）

```bash
cd tools/ai-guardian
install-deps.bat
```

#### 步骤2: 启动守护

```bash
python guardian-daemon.py
```

#### 步骤3: 保持运行

守护脚本会每30秒检测AI状态，断线自动生成恢复指令。

---

## 测试MCP服务器

```bash
cd tools/ai-guardian
test-mcp.bat
```

---

## 工作原理

```
AI执行任务 → 记录活动 → 90秒无活动 → 判断离线 → 生成恢复指令
```

---

## 恢复文件位置

断线后恢复指令保存在：
```
.ai-engine/logs/recovery-*.txt
```

---

## 需要帮助？

完整文档: `docs/ai-guardian/AI断线守护MCP服务使用指南.md`

