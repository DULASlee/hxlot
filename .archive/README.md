# SmartAbp 文档归档目录

**目的**: 存储非核心的历史文档，减少主项目 `docs/` 目录的文档数量

---

## 📋 归档说明

### 什么会被归档到这里？

- ✅ 已完成的工作计划
- ✅ 已解决的问题修复记录
- ✅ 历史版本的架构方案
- ✅ 测试验证记录
- ✅ 项目报告和总结
- ✅ 已废弃的技术方案

### 什么应该保留在 `docs/` 目录？

- ✅ 核心ADR（架构决策记录）
- ✅ 当前版本的系统架构文档
- ✅ 开发指南和规范
- ✅ 部署运维手册
- ✅ 工具使用指南

---

## 🗂️ 目录结构

```
.archive/
├─ 工作计划/              (已完成的工作计划)
├─ 紧急修复/              (已解决的问题修复)
├─ 测试验证/              (历史测试记录)
├─ 项目报告/              (项目总结报告)
├─ 架构设计_历史版本/    (旧版本的架构文档)
├─ 架构重构/              (已完成的重构记录)
├─ 架构审查/              (历史审查记录)
└─ README.md             (本文档)
```

---

## 🔍 如何查找归档文档？

### 方法1: 本地搜索

```bash
# Windows PowerShell
Get-ChildItem -Path ".archive" -Recurse -Filter "*.md" | Select-String "关键词"

# Linux/Mac
grep -r "关键词" .archive/
```

### 方法2: IDE搜索

在 VSCode/Cursor 中：
1. 按 `Ctrl+Shift+F` 打开全局搜索
2. 在 "files to include" 中输入 `.archive/**/*.md`
3. 输入关键词搜索

---

## 📊 归档统计

**创建日期**: 2025-10-08  
**归档文件数**: 约 200+ 个 markdown 文件  
**总大小**: 约 3-4 MB

---

## 🚫 Git 忽略说明

此目录已添加到 `.gitignore`，**不会被提交到Git仓库**。

**原因**:
- ✅ 减少代码仓库大小
- ✅ 加快 `git clone` 速度
- ✅ 避免历史文档污染主分支

---

## 🗄️ 长期存储方案

### 推荐方案1: GitHub Wiki

```bash
# 克隆Wiki仓库
git clone https://github.com/DULASlee/hxlot.wiki.git

# 复制归档文档
cp -r .archive/* hxlot.wiki/

# 提交
cd hxlot.wiki
git add .
git commit -m "迁移归档文档"
git push
```

**访问**: https://github.com/DULASlee/hxlot/wiki

---

### 推荐方案2: 云存储备份

```bash
# 压缩归档
tar -czf smartabp-docs-archive-$(date +%Y%m%d).tar.gz .archive/

# 上传到云存储（示例）
# - 腾讯云COS
# - 阿里云OSS
# - AWS S3
# - Google Drive
```

---

## 🔄 定期维护

### 每月执行

```bash
# 运行归档脚本
pwsh scripts/docs/archive-old-docs.ps1 -Force
```

### 每季度执行

```bash
# 备份归档到云存储
tar -czf archive-backup.tar.gz .archive/

# 清理超过1年的文档（可选）
# 谨慎操作，建议先备份！
```

---

## 📞 联系信息

如需恢复归档文档或有任何问题，请联系：

- **项目负责人**: [Your Name]
- **技术负责人**: [Tech Lead]
- **文档位置**: 本地 `.archive/` 目录

---

**最后更新**: 2025-10-08  
**维护者**: SmartAbp Team

