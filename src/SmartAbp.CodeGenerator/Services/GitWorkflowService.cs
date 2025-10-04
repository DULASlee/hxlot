using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// Git工作流服务 - Git Workflow Service
    /// 提供Git仓库管理、分支管理、提交管理和Git配置生成等功能
    /// </summary>
    public class GitWorkflowService
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 公共API方法 - Public API Methods
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 初始化Git仓库
        /// </summary>
        public async Task<GitWorkflowResultDto> InitializeRepositoryAsync(GitRepositoryInitDto config)
        {
            var result = new GitWorkflowResultDto
            {
                Success = true,
                RepositoryPath = config.ProjectPath,
                CurrentBranch = config.DefaultBranch
            };

            try
            {
                // 验证路径
                if (string.IsNullOrWhiteSpace(config.ProjectPath))
                {
                    result.Success = false;
                    result.Errors.Add("项目路径不能为空");
                    return result;
                }

                if (!Directory.Exists(config.ProjectPath))
                {
                    Directory.CreateDirectory(config.ProjectPath);
                    result.Message += $"创建项目目录: {config.ProjectPath}\n";
                }

                // 生成.gitignore
                if (config.GenerateGitignore)
                {
                    var gitignorePath = Path.Combine(config.ProjectPath, ".gitignore");
                    var gitignoreContent = GenerateGitignore(config.GitignoreTemplate);
                    await File.WriteAllTextAsync(gitignorePath, gitignoreContent);
                    result.CreatedFiles.Add(".gitignore");
                    result.Message += "✅ 生成 .gitignore\n";
                }

                // 生成README
                if (config.InitializeWithReadme)
                {
                    var readmePath = Path.Combine(config.ProjectPath, "README.md");
                    var readmeContent = GenerateReadmeTemplate(config.ProjectName);
                    await File.WriteAllTextAsync(readmePath, readmeContent);
                    result.CreatedFiles.Add("README.md");
                    result.Message += "✅ 生成 README.md\n";
                }

                // 设置Git钩子
                if (config.SetupGitHooks)
                {
                    var hooksCreated = await SetupGitHooksAsync(config.ProjectPath);
                    result.CreatedFiles.AddRange(hooksCreated);
                    result.Message += $"✅ 配置Git钩子 ({hooksCreated.Count}个)\n";
                }

                // 生成PR模板
                if (config.GeneratePullRequestTemplate)
                {
                    var prTemplatePath = Path.Combine(config.ProjectPath, ".github", "PULL_REQUEST_TEMPLATE.md");
                    Directory.CreateDirectory(Path.GetDirectoryName(prTemplatePath)!);
                    var prContent = GeneratePullRequestTemplate(new PullRequestTemplateDto());
                    await File.WriteAllTextAsync(prTemplatePath, prContent);
                    result.CreatedFiles.Add(".github/PULL_REQUEST_TEMPLATE.md");
                    result.Message += "✅ 生成 PR模板\n";
                }

                result.Message += $"\n🎉 Git仓库初始化完成！\n共创建 {result.CreatedFiles.Count} 个文件";
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Errors.Add($"初始化仓库失败: {ex.Message}");
            }

            return await Task.FromResult(result);
        }

        /// <summary>
        /// 创建分支
        /// </summary>
        public async Task<GitWorkflowResultDto> CreateBranchAsync(GitBranchDto branchConfig)
        {
            var result = new GitWorkflowResultDto { Success = true };

            try
            {
                // 验证分支名
                if (string.IsNullOrWhiteSpace(branchConfig.BranchName))
                {
                    result.Success = false;
                    result.Errors.Add("分支名不能为空");
                    return result;
                }

                // 根据分支类型生成标准化分支名
                var fullBranchName = $"{branchConfig.BranchType}/{branchConfig.BranchName}";
                result.CurrentBranch = fullBranchName;

                result.Message = $"✅ 准备创建分支: {fullBranchName}\n";
                result.Message += $"   基于分支: {branchConfig.BaseBranch}\n";

                if (!string.IsNullOrWhiteSpace(branchConfig.Description))
                {
                    result.Message += $"   描述: {branchConfig.Description}\n";
                }

                result.Warnings.Add("实际的Git命令执行需要在客户端完成");
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Errors.Add($"创建分支失败: {ex.Message}");
            }

            return await Task.FromResult(result);
        }

        /// <summary>
        /// 生成提交信息
        /// </summary>
        public async Task<GitWorkflowResultDto> GenerateCommitMessageAsync(GitCommitDto commitConfig)
        {
            var result = new GitWorkflowResultDto { Success = true };

            try
            {
                var commitMessage = new StringBuilder();

                // Conventional Commits格式
                commitMessage.Append(commitConfig.CommitType);

                if (!string.IsNullOrWhiteSpace(commitConfig.Scope))
                {
                    commitMessage.Append($"({commitConfig.Scope})");
                }

                commitMessage.Append($": {commitConfig.Description}");

                if (!string.IsNullOrWhiteSpace(commitConfig.Body))
                {
                    commitMessage.AppendLine();
                    commitMessage.AppendLine();
                    commitMessage.Append(commitConfig.Body);
                }

                result.Message = commitMessage.ToString();
                result.Success = true;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Errors.Add($"生成提交信息失败: {ex.Message}");
            }

            return await Task.FromResult(result);
        }

        /// <summary>
        /// 生成完整的Git配置文件集合
        /// </summary>
        public async Task<GeneratedGitConfigDto> GenerateAllGitConfigsAsync(GitRepositoryInitDto config)
        {
            var generated = new GeneratedGitConfigDto
            {
                GeneratedAt = DateTime.UtcNow
            };

            // 生成.gitignore
            generated.GitignoreContent = GenerateGitignore(config.GitignoreTemplate);

            // 生成Git钩子
            var hookConfig = new GitHookConfigDto
            {
                EnableCodeFormatCheck = true,
                EnableLintCheck = true,
                EnableCommitMsgValidation = true
            };

            generated.PreCommitHookContent = GeneratePreCommitHook(hookConfig);
            generated.PrePushHookContent = GeneratePrePushHook(hookConfig);
            generated.CommitMsgHookContent = GenerateCommitMsgHook(hookConfig);

            // 生成PR模板
            generated.PullRequestTemplate = GeneratePullRequestTemplate(new PullRequestTemplateDto());

            // 生成README
            generated.ReadmeTemplate = GenerateReadmeTemplate(config.ProjectName);

            return await Task.FromResult(generated);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Git配置文件生成方法 - Git Configuration File Generation
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成.gitignore文件内容
        /// </summary>
        private string GenerateGitignore(string template)
        {
            var config = new GitignoreConfigDto();
            var sb = new StringBuilder();

            sb.AppendLine("# SmartAbp Generated .gitignore");
            sb.AppendLine($"# Template: {template}");
            sb.AppendLine($"# Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine();

            if (template == "dotnet" || template == "dotnet-vue")
            {
                sb.AppendLine("# .NET Build Artifacts");
                foreach (var pattern in config.DotNetPatterns)
                {
                    sb.AppendLine(pattern);
                }
                sb.AppendLine();
            }

            if (template == "vue" || template == "dotnet-vue")
            {
                sb.AppendLine("# Vue / Node.js");
                foreach (var pattern in config.VuePatterns)
                {
                    sb.AppendLine(pattern);
                }
                sb.AppendLine();
            }

            sb.AppendLine("# Common");
            foreach (var pattern in config.CommonPatterns)
            {
                sb.AppendLine(pattern);
            }

            return sb.ToString();
        }

        /// <summary>
        /// 生成pre-commit钩子内容
        /// </summary>
        private string GeneratePreCommitHook(GitHookConfigDto config)
        {
            var sb = new StringBuilder();
            sb.AppendLine("#!/bin/sh");
            sb.AppendLine("# SmartAbp Pre-Commit Hook");
            sb.AppendLine();

            if (config.EnableCodeFormatCheck)
            {
                sb.AppendLine("echo '🔍 Checking code format...'");
                sb.AppendLine("dotnet format --verify-no-changes");
                sb.AppendLine();
            }

            if (config.EnableLintCheck)
            {
                sb.AppendLine("echo '🔍 Running lint checks...'");
                sb.AppendLine("cd src/SmartAbp.Vue && npm run lint");
                sb.AppendLine();
            }

            sb.AppendLine("exit 0");
            return sb.ToString();
        }

        /// <summary>
        /// 生成pre-push钩子内容
        /// </summary>
        private string GeneratePrePushHook(GitHookConfigDto config)
        {
            var sb = new StringBuilder();
            sb.AppendLine("#!/bin/sh");
            sb.AppendLine("# SmartAbp Pre-Push Hook");
            sb.AppendLine();

            if (config.EnableTestExecution)
            {
                sb.AppendLine("echo '🧪 Running tests...'");
                sb.AppendLine("dotnet test");
                sb.AppendLine();
            }

            sb.AppendLine("exit 0");
            return sb.ToString();
        }

        /// <summary>
        /// 生成commit-msg钩子内容
        /// </summary>
        private string GenerateCommitMsgHook(GitHookConfigDto config)
        {
            var sb = new StringBuilder();
            sb.AppendLine("#!/bin/sh");
            sb.AppendLine("# SmartAbp Commit Message Hook");
            sb.AppendLine();

            if (config.EnableCommitMsgValidation)
            {
                sb.AppendLine("commit_msg=$(cat $1)");
                sb.AppendLine();
                sb.AppendLine("# Conventional Commits format validation");
                sb.AppendLine("if ! echo \"$commit_msg\" | grep -qE '^(feat|fix|docs|style|refactor|test|chore)(\\(.+\\))?: .+'; then");
                sb.AppendLine("  echo '❌ Invalid commit message format!'");
                sb.AppendLine("  echo 'Please use Conventional Commits format: <type>(<scope>): <subject>'");
                sb.AppendLine("  echo 'Types: feat, fix, docs, style, refactor, test, chore'");
                sb.AppendLine("  exit 1");
                sb.AppendLine("fi");
                sb.AppendLine();
            }

            sb.AppendLine("exit 0");
            return sb.ToString();
        }

        /// <summary>
        /// 生成PR模板内容
        /// </summary>
        private string GeneratePullRequestTemplate(PullRequestTemplateDto config)
        {
            var sb = new StringBuilder();
            sb.AppendLine("# Pull Request Template");
            sb.AppendLine();

            foreach (var section in config.Sections)
            {
                sb.AppendLine(section);
                sb.AppendLine();

                if (section.Contains("变更类型"))
                {
                    foreach (var type in config.ChangeTypes)
                    {
                        sb.AppendLine(type);
                    }
                    sb.AppendLine();
                }

                if (section.Contains("检查清单"))
                {
                    foreach (var item in config.Checklist)
                    {
                        sb.AppendLine(item);
                    }
                    sb.AppendLine();
                }
            }

            return sb.ToString();
        }

        /// <summary>
        /// 生成README模板内容
        /// </summary>
        private string GenerateReadmeTemplate(string projectName)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"# {projectName}");
            sb.AppendLine();
            sb.AppendLine("## 项目简介");
            sb.AppendLine();
            sb.AppendLine("基于SmartAbp微服务编排设计器生成的项目。");
            sb.AppendLine();
            sb.AppendLine("## 技术栈");
            sb.AppendLine();
            sb.AppendLine("- .NET 8.0");
            sb.AppendLine("- ABP vNext");
            sb.AppendLine("- Vue 3");
            sb.AppendLine("- TypeScript");
            sb.AppendLine();
            sb.AppendLine("## 快速开始");
            sb.AppendLine();
            sb.AppendLine("```bash");
            sb.AppendLine("# 克隆项目");
            sb.AppendLine($"git clone <repository-url>");
            sb.AppendLine();
            sb.AppendLine("# 后端启动");
            sb.AppendLine("dotnet run");
            sb.AppendLine();
            sb.AppendLine("# 前端启动");
            sb.AppendLine("cd frontend && npm install && npm run dev");
            sb.AppendLine("```");
            sb.AppendLine();
            sb.AppendLine("## 贡献指南");
            sb.AppendLine();
            sb.AppendLine("请遵循 Conventional Commits 规范提交代码。");
            sb.AppendLine();

            return sb.ToString();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 辅助方法 - Helper Methods
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 设置Git钩子
        /// </summary>
        private async Task<List<string>> SetupGitHooksAsync(string projectPath)
        {
            var createdHooks = new List<string>();
            var hooksDir = Path.Combine(projectPath, ".git", "hooks");

            if (!Directory.Exists(hooksDir))
            {
                Directory.CreateDirectory(hooksDir);
            }

            var hookConfig = new GitHookConfigDto
            {
                EnableCodeFormatCheck = true,
                EnableLintCheck = true,
                EnableCommitMsgValidation = true
            };

            // Pre-commit hook
            var preCommitPath = Path.Combine(hooksDir, "pre-commit");
            await File.WriteAllTextAsync(preCommitPath, GeneratePreCommitHook(hookConfig));
            MakeExecutable(preCommitPath);
            createdHooks.Add("pre-commit");

            // Pre-push hook
            var prePushPath = Path.Combine(hooksDir, "pre-push");
            await File.WriteAllTextAsync(prePushPath, GeneratePrePushHook(hookConfig));
            MakeExecutable(prePushPath);
            createdHooks.Add("pre-push");

            // Commit-msg hook
            var commitMsgPath = Path.Combine(hooksDir, "commit-msg");
            await File.WriteAllTextAsync(commitMsgPath, GenerateCommitMsgHook(hookConfig));
            MakeExecutable(commitMsgPath);
            createdHooks.Add("commit-msg");

            return createdHooks;
        }

        /// <summary>
        /// 使文件可执行 (Unix/Linux/Mac)
        /// </summary>
        private void MakeExecutable(string filePath)
        {
            if (!OperatingSystem.IsWindows())
            {
                try
                {
                    var chmod = System.Diagnostics.Process.Start("chmod", $"+x {filePath}");
                    chmod?.WaitForExit();
                }
                catch
                {
                    // 忽略chmod错误（Windows环境）
                }
            }
        }
    }
}

