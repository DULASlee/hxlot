# Git 合并冲突解决指南

## 🚨 如果在同步过程中遇到合并冲突

### 1. 识别冲突文件
```bash
git status
```
会显示类似：
```
both modified:   src/某个文件.ts
both modified:   package.json
```

### 2. 查看冲突内容
打开冲突文件，会看到类似：
```
<<<<<<< HEAD
// 您的本地更改
=======
// 远程的更改
>>>>>>> origin/main
```

### 3. 解决冲突原则

#### 对于我们的TDD开发文件（优先保留本地）：
- `src/SmartAbp.Vue/src/composables/` - **保留本地版本**
- `packages/lowcode-designer/src/components/SecurityDashboard/` - **保留本地版本**
- `performance-testing/` - **保留本地版本**
- `doc/项目工作总结汇报.md` - **保留本地版本**
- `doc/技术实施详细说明.md` - **保留本地版本**

#### 对于配置文件（需要合并）：
- `package.json` - 合并依赖项，保留所有新增的依赖
- `tsconfig.json` - 合并配置选项
- `.gitignore` - 合并忽略规则

#### 对于同事的业务文件（优先保留远程）：
- 其他业务逻辑文件 - **优先保留远程版本**
- 新的配置文件 - **保留远程版本**

### 4. 手动解决冲突步骤

1. **编辑冲突文件**：
   - 删除冲突标记 `<<<<<<<`、`=======`、`>>>>>>>`
   - 保留需要的代码
   - 如果需要同时保留两个版本，手动合并

2. **标记冲突已解决**：
   ```bash
   git add 解决的文件名
   ```

3. **完成合并**：
   ```bash
   git commit -m "解决合并冲突：保留本地TDD成果并集成远程更新"
   ```

### 5. 验证合并结果

```bash
# 查看提交历史
git log --oneline -10

# 确认重要文件存在
ls src/SmartAbp.Vue/src/composables/
ls performance-testing/
ls doc/
```

### 6. 推送最终结果

```bash
git push origin main
```

## 🆘 紧急情况处理

如果合并过程中出现严重问题：

### 中止合并
```bash
git merge --abort
```

### 回到合并前状态
```bash
git reset --hard HEAD~1
```

### 求助命令
```bash
# 查看当前状态
git status

# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看最近的提交
git log --oneline -5
```

## 📞 需要帮助时

如果遇到无法解决的冲突，请：
1. 截图显示 `git status` 输出
2. 截图显示具体的冲突文件内容
3. 说明您希望保留哪个版本的内容

记住：**我们的TDD开发成果非常宝贵，在任何情况下都要确保不丢失！**