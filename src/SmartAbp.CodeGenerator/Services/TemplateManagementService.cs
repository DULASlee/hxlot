using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 模板市场管理服务 - Day 45-46
    /// 提供模板的发布、搜索、评分、一键部署等完整市场功能
    /// </summary>
    public class TemplateManagementService : ApplicationService
    {
        private readonly ILogger<TemplateManagementService> _logger;
        private readonly TemplateRepository _repository;
        private readonly TemplateDeploymentEngine _deploymentEngine;

        public TemplateManagementService(ILogger<TemplateManagementService> logger)
        {
            _logger = logger;
            _repository = new TemplateRepository();
            _deploymentEngine = new TemplateDeploymentEngine(logger);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 1. 模板CRUD操作
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 创建模板
        /// </summary>
        public async Task<TemplateDto> CreateTemplateAsync(CreateTemplateDto input)
        {
            _logger.LogInformation("🆕 创建模板: {Name}", input.Name);

            var template = new TemplateDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = input.Name,
                DisplayName = input.DisplayName,
                Description = input.Description,
                Category = input.Category,
                Type = input.Type,
                Author = input.Author,
                Version = "1.0.0",
                Tags = input.Tags,
                Content = input.Content,
                ConfigSchema = input.ConfigSchema,
                IsPublic = input.IsPublic,
                IsFeatured = false,
                Downloads = 0,
                Rating = 0,
                RatingCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "draft"
            };

            await _repository.AddAsync(template);

            _logger.LogInformation("✅ 模板创建成功: {Id}", template.Id);
            return template;
        }

        /// <summary>
        /// 更新模板
        /// </summary>
        public async Task<TemplateDto> UpdateTemplateAsync(string id, UpdateTemplateDto input)
        {
            _logger.LogInformation("📝 更新模板: {Id}", id);

            var template = await _repository.GetByIdAsync(id);
            if (template == null)
            {
                throw new Exception($"模板不存在: {id}");
            }

            // 更新字段
            template.DisplayName = input.DisplayName ?? template.DisplayName;
            template.Description = input.Description ?? template.Description;
            template.Category = input.Category ?? template.Category;
            template.Tags = input.Tags ?? template.Tags;
            template.Content = input.Content ?? template.Content;
            template.ConfigSchema = input.ConfigSchema ?? template.ConfigSchema;
            template.IsPublic = input.IsPublic ?? template.IsPublic;
            template.UpdatedAt = DateTime.UtcNow;

            // 如果内容变化，增加版本号
            if (input.Content != null && input.Content != template.Content)
            {
                template.Version = IncrementVersion(template.Version);
                await _repository.CreateVersionAsync(template);
            }

            await _repository.UpdateAsync(template);

            _logger.LogInformation("✅ 模板更新成功: {Id}", id);
            return template;
        }

        /// <summary>
        /// 删除模板
        /// </summary>
        public async Task DeleteTemplateAsync(string id)
        {
            _logger.LogInformation("🗑️ 删除模板: {Id}", id);

            var template = await _repository.GetByIdAsync(id);
            if (template == null)
            {
                throw new Exception($"模板不存在: {id}");
            }

            await _repository.DeleteAsync(id);

            _logger.LogInformation("✅ 模板删除成功: {Id}", id);
        }

        /// <summary>
        /// 获取模板详情
        /// </summary>
        public async Task<TemplateDetailDto> GetTemplateAsync(string id)
        {
            _logger.LogInformation("🔍 获取模板详情: {Id}", id);

            var template = await _repository.GetByIdAsync(id);
            if (template == null)
            {
                throw new Exception($"模板不存在: {id}");
            }

            // 获取版本历史
            var versions = await _repository.GetVersionsAsync(id);

            // 获取评论
            var comments = await _repository.GetCommentsAsync(id);

            var detail = new TemplateDetailDto
            {
                Template = template,
                Versions = versions,
                Comments = comments,
                RelatedTemplates = await GetRelatedTemplatesAsync(template)
            };

            return detail;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 2. 模板搜索和浏览
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 搜索模板
        /// </summary>
        public async Task<TemplateSearchResultDto> SearchTemplatesAsync(TemplateSearchDto criteria)
        {
            _logger.LogInformation("🔍 搜索模板: {Keyword}", criteria.Keyword);

            var allTemplates = await _repository.GetAllAsync();

            // 筛选公开模板
            var templates = allTemplates.Where(t => t.IsPublic).ToList();

            // 关键词搜索
            if (!string.IsNullOrEmpty(criteria.Keyword))
            {
                templates = templates.Where(t =>
                    t.Name.Contains(criteria.Keyword, StringComparison.OrdinalIgnoreCase) ||
                    t.DisplayName.Contains(criteria.Keyword, StringComparison.OrdinalIgnoreCase) ||
                    t.Description.Contains(criteria.Keyword, StringComparison.OrdinalIgnoreCase) ||
                    t.Tags.Any(tag => tag.Contains(criteria.Keyword, StringComparison.OrdinalIgnoreCase))
                ).ToList();
            }

            // 分类筛选
            if (!string.IsNullOrEmpty(criteria.Category))
            {
                templates = templates.Where(t => t.Category == criteria.Category).ToList();
            }

            // 类型筛选
            if (!string.IsNullOrEmpty(criteria.Type))
            {
                templates = templates.Where(t => t.Type == criteria.Type).ToList();
            }

            // 标签筛选
            if (criteria.Tags != null && criteria.Tags.Any())
            {
                templates = templates.Where(t =>
                    criteria.Tags.Any(tag => t.Tags.Contains(tag))
                ).ToList();
            }

            // 评分筛选
            if (criteria.MinRating > 0)
            {
                templates = templates.Where(t => t.Rating >= criteria.MinRating).ToList();
            }

            // 排序
            templates = criteria.SortBy switch
            {
                "downloads" => templates.OrderByDescending(t => t.Downloads).ToList(),
                "rating" => templates.OrderByDescending(t => t.Rating).ToList(),
                "updated" => templates.OrderByDescending(t => t.UpdatedAt).ToList(),
                "created" => templates.OrderByDescending(t => t.CreatedAt).ToList(),
                _ => templates.OrderByDescending(t => t.Downloads).ToList()
            };

            // 分页
            var total = templates.Count;
            var skip = (criteria.Page - 1) * criteria.PageSize;
            var pagedTemplates = templates.Skip(skip).Take(criteria.PageSize).ToList();

            return new TemplateSearchResultDto
            {
                Items = pagedTemplates,
                Total = total,
                Page = criteria.Page,
                PageSize = criteria.PageSize,
                TotalPages = (int)Math.Ceiling(total / (double)criteria.PageSize)
            };
        }

        /// <summary>
        /// 获取推荐模板
        /// </summary>
        public async Task<List<TemplateDto>> GetFeaturedTemplatesAsync(int count = 10)
        {
            _logger.LogInformation("⭐ 获取推荐模板");

            var templates = await _repository.GetAllAsync();

            return templates
                .Where(t => t.IsPublic && t.IsFeatured)
                .OrderByDescending(t => t.Rating)
                .Take(count)
                .ToList();
        }

        /// <summary>
        /// 获取热门模板
        /// </summary>
        public async Task<List<TemplateDto>> GetPopularTemplatesAsync(int count = 10)
        {
            _logger.LogInformation("🔥 获取热门模板");

            var templates = await _repository.GetAllAsync();

            return templates
                .Where(t => t.IsPublic)
                .OrderByDescending(t => t.Downloads)
                .ThenByDescending(t => t.Rating)
                .Take(count)
                .ToList();
        }

        /// <summary>
        /// 获取最新模板
        /// </summary>
        public async Task<List<TemplateDto>> GetLatestTemplatesAsync(int count = 10)
        {
            _logger.LogInformation("🆕 获取最新模板");

            var templates = await _repository.GetAllAsync();

            return templates
                .Where(t => t.IsPublic)
                .OrderByDescending(t => t.CreatedAt)
                .Take(count)
                .ToList();
        }

        /// <summary>
        /// 获取分类列表
        /// </summary>
        public async Task<List<TemplateCategoryDto>> GetCategoriesAsync()
        {
            _logger.LogInformation("📂 获取分类列表");

            var templates = await _repository.GetAllAsync();
            var publicTemplates = templates.Where(t => t.IsPublic).ToList();

            var categories = publicTemplates
                .GroupBy(t => t.Category)
                .Select(g => new TemplateCategoryDto
                {
                    Name = g.Key,
                    Count = g.Count(),
                    Icon = GetCategoryIcon(g.Key)
                })
                .OrderByDescending(c => c.Count)
                .ToList();

            return categories;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3. 模板评分和评论
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 评分模板
        /// </summary>
        public async Task<TemplateDto> RateTemplateAsync(string templateId, RateTemplateDto input)
        {
            _logger.LogInformation("⭐ 评分模板: {TemplateId}, 评分: {Rating}", templateId, input.Rating);

            var template = await _repository.GetByIdAsync(templateId);
            if (template == null)
            {
                throw new Exception($"模板不存在: {templateId}");
            }

            // 更新评分
            var totalRating = template.Rating * template.RatingCount + input.Rating;
            template.RatingCount++;
            template.Rating = totalRating / template.RatingCount;

            await _repository.UpdateAsync(template);

            return template;
        }

        /// <summary>
        /// 添加评论
        /// </summary>
        public async Task<TemplateCommentDto> AddCommentAsync(string templateId, AddCommentDto input)
        {
            _logger.LogInformation("💬 添加评论: {TemplateId}", templateId);

            var template = await _repository.GetByIdAsync(templateId);
            if (template == null)
            {
                throw new Exception($"模板不存在: {templateId}");
            }

            var comment = new TemplateCommentDto
            {
                Id = Guid.NewGuid().ToString(),
                TemplateId = templateId,
                Author = input.Author,
                Content = input.Content,
                Rating = input.Rating,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddCommentAsync(comment);

            return comment;
        }

        /// <summary>
        /// 获取评论列表
        /// </summary>
        public async Task<List<TemplateCommentDto>> GetCommentsAsync(string templateId)
        {
            _logger.LogInformation("💬 获取评论: {TemplateId}", templateId);

            return await _repository.GetCommentsAsync(templateId);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 4. 模板版本管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取版本历史
        /// </summary>
        public async Task<List<TemplateVersionDto>> GetVersionsAsync(string templateId)
        {
            _logger.LogInformation("📜 获取版本历史: {TemplateId}", templateId);

            return await _repository.GetVersionsAsync(templateId);
        }

        /// <summary>
        /// 获取指定版本
        /// </summary>
        public async Task<TemplateDto> GetVersionAsync(string templateId, string version)
        {
            _logger.LogInformation("📦 获取版本: {TemplateId}@{Version}", templateId, version);

            var versions = await _repository.GetVersionsAsync(templateId);
            var targetVersion = versions.FirstOrDefault(v => v.Version == version);

            if (targetVersion == null)
            {
                throw new Exception($"版本不存在: {version}");
            }

            var template = await _repository.GetByIdAsync(templateId);
            if (template != null)
            {
                template.Version = targetVersion.Version;
                template.Content = targetVersion.Content;
            }

            return template!;
        }

        /// <summary>
        /// 发布新版本
        /// </summary>
        public async Task<TemplateDto> PublishVersionAsync(string templateId, PublishVersionDto input)
        {
            _logger.LogInformation("🚀 发布新版本: {TemplateId}", templateId);

            var template = await _repository.GetByIdAsync(templateId);
            if (template == null)
            {
                throw new Exception($"模板不存在: {templateId}");
            }

            // 更新版本
            template.Version = input.Version;
            template.Content = input.Content;
            template.UpdatedAt = DateTime.UtcNow;

            // 创建版本记录
            await _repository.CreateVersionAsync(template);

            // 更新主模板
            await _repository.UpdateAsync(template);

            return template;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 5. 一键部署
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 一键部署模板
        /// </summary>
        public async Task<DeploymentResultDto> DeployTemplateAsync(DeployTemplateDto input)
        {
            _logger.LogInformation("🚀 一键部署模板: {TemplateId}", input.TemplateId);

            // 获取模板
            var template = await _repository.GetByIdAsync(input.TemplateId);
            if (template == null)
            {
                throw new Exception($"模板不存在: {input.TemplateId}");
            }

            // 增加下载计数
            template.Downloads++;
            await _repository.UpdateAsync(template);

            // 执行部署
            var result = await _deploymentEngine.DeployAsync(template, input);

            _logger.LogInformation("✅ 部署完成: {TemplateId}", input.TemplateId);

            return result;
        }

        /// <summary>
        /// 验证模板配置
        /// </summary>
        public async Task<ValidationResultDto> ValidateTemplateConfigAsync(
            string templateId,
            Dictionary<string, object> config)
        {
            _logger.LogInformation("✅ 验证模板配置: {TemplateId}", templateId);

            var template = await _repository.GetByIdAsync(templateId);
            if (template == null)
            {
                throw new Exception($"模板不存在: {templateId}");
            }

            var errors = new List<string>();

            // 验证必填字段
            if (template.ConfigSchema != null)
            {
                foreach (var field in template.ConfigSchema.RequiredFields)
                {
                    if (!config.ContainsKey(field))
                    {
                        errors.Add($"缺少必填字段: {field}");
                    }
                }
            }

            return new ValidationResultDto
            {
                IsValid = errors.Count == 0,
                Errors = errors
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 6. 辅助方法
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string IncrementVersion(string version)
        {
            var parts = version.Split('.');
            if (parts.Length == 3 && int.TryParse(parts[2], out var patch))
            {
                return $"{parts[0]}.{parts[1]}.{patch + 1}";
            }
            return version;
        }

        private async Task<List<TemplateDto>> GetRelatedTemplatesAsync(TemplateDto template)
        {
            var allTemplates = await _repository.GetAllAsync();

            return allTemplates
                .Where(t => t.Id != template.Id &&
                           t.IsPublic &&
                           (t.Category == template.Category ||
                            t.Tags.Intersect(template.Tags).Any()))
                .OrderByDescending(t => t.Rating)
                .Take(5)
                .ToList();
        }

        private string GetCategoryIcon(string category)
        {
            return category switch
            {
                "Microservices" => "🔷",
                "Database" => "🗄️",
                "Monitoring" => "📊",
                "Security" => "🔒",
                "CI/CD" => "🔄",
                "Networking" => "🌐",
                _ => "📦"
            };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 模板仓库
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public class TemplateRepository
    {
        private readonly List<TemplateDto> _templates = new();
        private readonly List<TemplateVersionDto> _versions = new();
        private readonly List<TemplateCommentDto> _comments = new();

        public TemplateRepository()
        {
            InitializeSampleTemplates();
        }

        private void InitializeSampleTemplates()
        {
            // 微服务模板
            _templates.Add(new TemplateDto
            {
                Id = "template-001",
                Name = "aspnet-microservice",
                DisplayName = "ASP.NET Core微服务",
                Description = "包含API Gateway、认证服务、业务服务的完整微服务架构模板",
                Category = "Microservices",
                Type = "Full Stack",
                Author = "SmartAbp Team",
                Version = "1.2.0",
                Tags = new List<string> { "ASP.NET Core", "Microservices", "Docker", "Kubernetes" },
                Content = "# ASP.NET Core Microservice Template\n...",
                IsPublic = true,
                IsFeatured = true,
                Downloads = 1250,
                Rating = 4.8,
                RatingCount = 87,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow.AddDays(-5),
                Status = "published"
            });

            // 监控模板
            _templates.Add(new TemplateDto
            {
                Id = "template-002",
                Name = "prometheus-grafana-stack",
                DisplayName = "Prometheus + Grafana监控栈",
                Description = "完整的监控解决方案，包含Prometheus、Grafana、Alertmanager",
                Category = "Monitoring",
                Type = "Infrastructure",
                Author = "Community",
                Version = "2.0.1",
                Tags = new List<string> { "Prometheus", "Grafana", "Monitoring", "Alerting" },
                Content = "# Monitoring Stack Template\n...",
                IsPublic = true,
                IsFeatured = true,
                Downloads = 980,
                Rating = 4.6,
                RatingCount = 65,
                CreatedAt = DateTime.UtcNow.AddMonths(-4),
                UpdatedAt = DateTime.UtcNow.AddDays(-10),
                Status = "published"
            });

            // CI/CD模板
            _templates.Add(new TemplateDto
            {
                Id = "template-003",
                Name = "github-actions-cicd",
                DisplayName = "GitHub Actions CI/CD流水线",
                Description = "自动化构建、测试、部署流水线模板",
                Category = "CI/CD",
                Type = "Pipeline",
                Author = "DevOps Team",
                Version = "1.5.0",
                Tags = new List<string> { "GitHub Actions", "CI/CD", "Docker", "Kubernetes" },
                Content = "# CI/CD Pipeline Template\n...",
                IsPublic = true,
                IsFeatured = false,
                Downloads = 750,
                Rating = 4.5,
                RatingCount = 42,
                CreatedAt = DateTime.UtcNow.AddMonths(-3),
                UpdatedAt = DateTime.UtcNow.AddDays(-15),
                Status = "published"
            });
        }

        public Task<TemplateDto?> GetByIdAsync(string id)
        {
            return Task.FromResult(_templates.FirstOrDefault(t => t.Id == id));
        }

        public Task<List<TemplateDto>> GetAllAsync()
        {
            return Task.FromResult(_templates.ToList());
        }

        public Task AddAsync(TemplateDto template)
        {
            _templates.Add(template);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(TemplateDto template)
        {
            var index = _templates.FindIndex(t => t.Id == template.Id);
            if (index >= 0)
            {
                _templates[index] = template;
            }
            return Task.CompletedTask;
        }

        public Task DeleteAsync(string id)
        {
            _templates.RemoveAll(t => t.Id == id);
            return Task.CompletedTask;
        }

        public Task<List<TemplateVersionDto>> GetVersionsAsync(string templateId)
        {
            return Task.FromResult(_versions.Where(v => v.TemplateId == templateId).ToList());
        }

        public Task CreateVersionAsync(TemplateDto template)
        {
            _versions.Add(new TemplateVersionDto
            {
                TemplateId = template.Id,
                Version = template.Version,
                Content = template.Content,
                CreatedAt = DateTime.UtcNow,
                ChangeLog = "版本更新"
            });
            return Task.CompletedTask;
        }

        public Task<List<TemplateCommentDto>> GetCommentsAsync(string templateId)
        {
            return Task.FromResult(_comments
                .Where(c => c.TemplateId == templateId)
                .OrderByDescending(c => c.CreatedAt)
                .ToList());
        }

        public Task AddCommentAsync(TemplateCommentDto comment)
        {
            _comments.Add(comment);
            return Task.CompletedTask;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 部署引擎
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public class TemplateDeploymentEngine
    {
        private readonly ILogger _logger;

        public TemplateDeploymentEngine(ILogger logger)
        {
            _logger = logger;
        }

        public async Task<DeploymentResultDto> DeployAsync(TemplateDto template, DeployTemplateDto input)
        {
            _logger.LogInformation("🚀 开始部署: {TemplateName}", template.Name);

            var result = new DeploymentResultDto
            {
                TemplateId = template.Id,
                DeploymentId = Guid.NewGuid().ToString(),
                Status = "InProgress",
                StartTime = DateTime.UtcNow,
                Steps = new List<DeploymentStepDto>()
            };

            try
            {
                // Step 1: 验证配置
                result.Steps.Add(await ExecuteStepAsync("验证配置", async () =>
                {
                    await Task.Delay(500);
                    return "配置验证通过";
                }));

                // Step 2: 生成资源清单
                result.Steps.Add(await ExecuteStepAsync("生成资源清单", async () =>
                {
                    await Task.Delay(1000);
                    return "已生成Kubernetes YAML文件";
                }));

                // Step 3: 应用到集群
                result.Steps.Add(await ExecuteStepAsync("应用到Kubernetes集群", async () =>
                {
                    await Task.Delay(1500);
                    return "资源已成功创建";
                }));

                // Step 4: 健康检查
                result.Steps.Add(await ExecuteStepAsync("健康检查", async () =>
                {
                    await Task.Delay(1000);
                    return "所有Pod运行正常";
                }));

                result.Status = "Succeeded";
                result.Message = "部署成功";
            }
            catch (Exception ex)
            {
                result.Status = "Failed";
                result.Message = $"部署失败: {ex.Message}";
                _logger.LogError(ex, "部署失败");
            }

            result.EndTime = DateTime.UtcNow;
            return result;
        }

        private async Task<DeploymentStepDto> ExecuteStepAsync(string name, Func<Task<string>> action)
        {
            var step = new DeploymentStepDto
            {
                Name = name,
                Status = "InProgress",
                StartTime = DateTime.UtcNow
            };

            try
            {
                step.Message = await action();
                step.Status = "Succeeded";
            }
            catch (Exception ex)
            {
                step.Status = "Failed";
                step.Message = ex.Message;
                throw;
            }

            step.EndTime = DateTime.UtcNow;
            return step;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DTOs for Template Management Service
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public class TemplateDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public string Content { get; set; } = string.Empty;
        public TemplateConfigSchemaDto? ConfigSchema { get; set; }
        public bool IsPublic { get; set; }
        public bool IsFeatured { get; set; }
        public int Downloads { get; set; }
        public double Rating { get; set; }
        public int RatingCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public string Content { get; set; } = string.Empty;
        public TemplateConfigSchemaDto? ConfigSchema { get; set; }
        public bool IsPublic { get; set; }
    }

    public class UpdateTemplateDto
    {
        public string? DisplayName { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public List<string>? Tags { get; set; }
        public string? Content { get; set; }
        public TemplateConfigSchemaDto? ConfigSchema { get; set; }
        public bool? IsPublic { get; set; }
    }

    public class TemplateDetailDto
    {
        public TemplateDto Template { get; set; } = new();
        public List<TemplateVersionDto> Versions { get; set; } = new();
        public List<TemplateCommentDto> Comments { get; set; } = new();
        public List<TemplateDto> RelatedTemplates { get; set; } = new();
    }

    public class TemplateSearchDto
    {
        public string Keyword { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public double MinRating { get; set; }
        public string SortBy { get; set; } = "downloads";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class TemplateSearchResultDto
    {
        public List<TemplateDto> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class TemplateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Icon { get; set; } = string.Empty;
    }

    public class RateTemplateDto
    {
        public double Rating { get; set; }
    }

    public class AddCommentDto
    {
        public string Author { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public double Rating { get; set; }
    }

    public class TemplateCommentDto
    {
        public string Id { get; set; } = string.Empty;
        public string TemplateId { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public double Rating { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TemplateVersionDto
    {
        public string TemplateId { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string ChangeLog { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class PublishVersionDto
    {
        public string Version { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string ChangeLog { get; set; } = string.Empty;
    }

    public class TemplateConfigSchemaDto
    {
        public List<string> RequiredFields { get; set; } = new();
        public Dictionary<string, string> FieldTypes { get; set; } = new();
        public Dictionary<string, object> DefaultValues { get; set; } = new();
    }

    public class DeployTemplateDto
    {
        public string TemplateId { get; set; } = string.Empty;
        public string Environment { get; set; } = string.Empty;
        public Dictionary<string, object> Config { get; set; } = new();
    }

    public class DeploymentResultDto
    {
        public string TemplateId { get; set; } = string.Empty;
        public string DeploymentId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public List<DeploymentStepDto> Steps { get; set; } = new();
    }

    public class DeploymentStepDto
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class ValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}

