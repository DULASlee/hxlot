using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using SmartAbp.Domain.Entities.LowCode;
using SmartAbp.Domain.Shared.LowCode; // PageConfigDto定义

namespace SmartAbp.Application.LowCode.Validation
{
    /// <summary>
    /// 页面配置体检器：在发布/生成前做快速校验，提前发现配置问题。
    /// </summary>
    public class PageConfigValidator
    {
        private static readonly HashSet<string> AllowedControlTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            // 常用控件（与form-create/element常用类型对齐）
            "input", "select", "date", "datetime", "time",
            "textarea", "switch", "radio", "checkbox", "upload", "editor"
        };

        public PageConfigValidationResult Validate(PageConfigDto? config, IEnumerable<LowCodeProperty>? properties = null)
        {
            var result = new PageConfigValidationResult();

            if (config == null)
            {
                result.Errors.Add("PageConfig 不能为空");
                return result;
            }

            var propertyNames = new HashSet<string>(properties?.Select(p => p.Name) ?? Enumerable.Empty<string>(), StringComparer.OrdinalIgnoreCase);

            // 1) 表单规则校验
            if (config.Form?.Rules != null)
            {
                for (var i = 0; i < config.Form.Rules.Count; i++)
                {
                    var rule = config.Form.Rules[i];
                    if (string.IsNullOrWhiteSpace(rule.Type))
                    {
                        result.Errors.Add($"Form.Rules[{i}].Type 不能为空");
                    }
                    else if (!AllowedControlTypes.Contains(rule.Type))
                    {
                        result.Errors.Add($"Form.Rules[{i}].Type 不被支持: {rule.Type}");
                    }

                    if (string.IsNullOrWhiteSpace(rule.Field))
                    {
                        result.Errors.Add($"Form.Rules[{i}].Field 不能为空");
                    }
                    else if (propertyNames.Count > 0 && !propertyNames.Contains(rule.Field))
                    {
                        result.Errors.Add($"Form.Rules[{i}].Field 引用了不存在的属性: {rule.Field}");
                    }

                    if (string.IsNullOrWhiteSpace(rule.Title))
                    {
                        result.Errors.Add($"Form.Rules[{i}].Title 不能为空");
                    }
                }
            }

            // 2) 列表列配置校验
            if (config.List?.Columns != null)
            {
                for (var i = 0; i < config.List.Columns.Count; i++)
                {
                    var col = config.List.Columns[i];
                    if (string.IsNullOrWhiteSpace(col.Prop))
                    {
                        result.Errors.Add($"List.Columns[{i}].Prop 不能为空");
                    }
                    else if (propertyNames.Count > 0 && !propertyNames.Contains(col.Prop))
                    {
                        result.Errors.Add($"List.Columns[{i}].Prop 引用了不存在的属性: {col.Prop}");
                    }

                    if (string.IsNullOrWhiteSpace(col.Label))
                    {
                        result.Errors.Add($"List.Columns[{i}].Label 不能为空");
                    }
                }
            }

            // 3) 事件配置基本校验（URL格式、方法等）
            if (config.Events != null)
            {
                foreach (var kv in config.Events)
                {
                    var key = kv.Key;
                    var ev = kv.Value;
                    if (string.IsNullOrWhiteSpace(ev.Type))
                    {
                        result.Errors.Add($"Events['{key}'].Type 不能为空");
                    }

                    if (!string.IsNullOrEmpty(ev.Url) && !IsValidUrl(ev.Url))
                    {
                        result.Errors.Add($"Events['{key}'].Url 非法: {ev.Url}");
                    }
                }
            }

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        private static bool IsValidUrl(string url)
        {
            // 简单校验（允许 / 开头的相对地址或 http(s)）
            if (url.StartsWith("/")) return true;
            return Regex.IsMatch(url, "^https?://", RegexOptions.IgnoreCase);
        }
    }

    public class PageConfigValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; } = new();
    }
}


