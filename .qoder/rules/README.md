# Qoder 规则文件说明

## 📋 概述

此目录包含从 `.cursor/rules` 转换而来的 Qoder IDE 规则文件。所有规则文件已从 Cursor 格式（`.mdc`）转换为 Qoder 格式（`.md`）。

## 📁 文件列表

| 文件名 | 描述 | 大小 |
|--------|------|------|
| `00_执行引擎_主文档.md` | AI编程执行引擎总览与导航 | ~6.4KB |
| `01_核心原则与铁律.md` | P0最高优先级规则（整合版） | ~13.3KB |
| `02_四大基石理念.md` | AI思维框架与方法论 | ~10.4KB |
| `03_任务分级流程.md` | Level 1-3弹性执行机制 | ~10.9KB |
| `04_Level3_模式1_四阶段.md` | 熟悉项目时使用的四阶段流程 | ~15.9KB |
| `05_Level3_模式2_完整八阶段.md` | 新项目时使用的完整八阶段流程 | ~17.4KB |
| `06_质量门禁标准.md` | 五关强制检查与架构合规标准 | ~14.1KB |

**总计**: 7个规则文件，约88.3KB

## 🔄 格式转换

### Cursor 格式 (.mdc)
```yaml
---
description: AI编程执行引擎总览
globs:
alwaysApply: true
version: v14.0
---
```

### Qoder 格式 (.md)
```yaml
---
trigger: always_on
alwaysApply: true
---
```

## 🔧 自动同步

使用以下脚本自动从 `.cursor/rules` 同步并转换规则文件：

```bash
pwsh -File scripts/convert-rules-to-qoder.ps1
```

脚本功能：
- ✅ 自动转换 YAML front matter
- ✅ 将 `.mdc` 扩展名改为 `.md`
- ✅ 更新所有内部链接引用
- ✅ 保留UTF-8编码

## 📖 使用指南

1. **Qoder IDE 会自动加载所有规则**
   - 所有标记为 `trigger: always_on` 的规则会永久生效

2. **规则优先级**
   - `01_核心原则与铁律.md` - P0最高优先级，必须严格遵守

3. **快速开始**
   - 先阅读 `00_执行引擎_主文档.md` 了解整体结构
   - 根据任务类型选择对应的流程文档

## ⚠️ 注意事项

- **不要直接修改 `.qoder/rules` 下的文件**
- 所有修改应在 `.cursor/rules` 中进行
- 修改后运行转换脚本同步到 `.qoder/rules`
- 保持两个目录的内容一致性

## 🔗 相关文档

- 原始规则目录：`.cursor/rules/`
- 转换脚本：`scripts/convert-rules-to-qoder.ps1`
- 变更日志：`.cursor/rules/CHANGELOG.md`

## 📊 版本信息

- **当前版本**: v14.1
- **最后更新**: 2025-10-24
- **同步状态**: ✅ 已同步

---

**维护者**: SmartAbp团队
**许可**: 项目内部使用
