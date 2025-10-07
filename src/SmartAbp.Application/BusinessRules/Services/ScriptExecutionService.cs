using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using Jint;
using Jint.Runtime;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Application.BusinessRules.Services
{
    /// <summary>
    /// 脚本执行服务实现
    /// 支持JavaScript和C#脚本执行
    /// </summary>
    public class ScriptExecutionService : IScriptExecutionService, ITransientDependency
    {
        private readonly ILogger<ScriptExecutionService> _logger;

        public ScriptExecutionService(ILogger<ScriptExecutionService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 执行JavaScript脚本
        /// </summary>
        public async Task<ScriptExecutionResult> ExecuteJavaScriptAsync(string script, Dictionary<string, object> context, int timeout = 5000)
        {
            var result = new ScriptExecutionResult();
            var stopwatch = Stopwatch.StartNew();

            try
            {
                _logger.LogDebug("开始执行JavaScript脚本，超时时间: {Timeout}ms", timeout);

                // 使用Jint JavaScript引擎
                var engine = new Engine(options =>
                {
                    options.TimeoutInterval(TimeSpan.FromMilliseconds(timeout));
                    options.MaxStatements(1000); // 限制最大语句数
                    options.LimitRecursion(100); // 限制递归深度
                });

                // 注入上下文变量
                foreach (var kvp in context)
                {
                    try
                    {
                        engine.SetValue(kvp.Key, kvp.Value);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("无法注入上下文变量 {Key}: {Error}", kvp.Key, ex.Message);
                    }
                }

                // 注入常用函数
                InjectCommonFunctions(engine);

                // 执行脚本
                var jsResult = await Task.Run(() =>
                {
                    try
                    {
                        return engine.Evaluate(script);
                    }
                    catch (TimeoutException)
                    {
                        result.IsTimeout = true;
                        throw;
                    }
                });

                result.Success = true;
                result.Result = ConvertJintValue(jsResult);

                _logger.LogDebug("JavaScript脚本执行成功，耗时: {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
            }
            catch (TimeoutException ex)
            {
                result.Success = false;
                result.Error = "脚本执行超时";
                result.IsTimeout = true;
                result.Exception = ex;
                _logger.LogWarning("JavaScript脚本执行超时: {Error}", ex.Message);
            }
            catch (JavaScriptException ex)
            {
                result.Success = false;
                result.Error = $"JavaScript执行错误: {ex.Message}";
                result.Exception = ex;
                _logger.LogError(ex, "JavaScript脚本执行错误");
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Error = $"脚本执行异常: {ex.Message}";
                result.Exception = ex;
                _logger.LogError(ex, "JavaScript脚本执行异常");
            }
            finally
            {
                stopwatch.Stop();
                result.ExecutionTime = (int)stopwatch.ElapsedMilliseconds;
                result.MemoryUsage = GC.GetTotalMemory(false);
            }

            return result;
        }

        /// <summary>
        /// 执行C#脚本
        /// </summary>
        public async Task<ScriptExecutionResult> ExecuteCSharpAsync(string script, Dictionary<string, object> context, int timeout = 5000)
        {
            var result = new ScriptExecutionResult();
            var stopwatch = Stopwatch.StartNew();

            try
            {
                _logger.LogDebug("开始执行C#脚本，超时时间: {Timeout}ms", timeout);

                // 创建脚本选项
                var options = ScriptOptions.Default
                    .WithReferences(typeof(object).Assembly)
                    .WithReferences(typeof(System.Linq.Enumerable).Assembly)
                    .WithReferences(typeof(System.Collections.Generic.List<>).Assembly)
                    .WithImports("System")
                    .WithImports("System.Linq")
                    .WithImports("System.Collections.Generic")
                    .WithImports("System.Math");

                // 创建全局变量类
                var globals = new ScriptGlobals();
                foreach (var kvp in context)
                {
                    globals.Variables[kvp.Key] = kvp.Value;
                }

                // 使用CancellationToken实现超时
                using var cts = new CancellationTokenSource(timeout);

                // 执行脚本
                var scriptResult = await CSharpScript.EvaluateAsync(script, options, globals, cancellationToken: cts.Token);

                result.Success = true;
                result.Result = scriptResult;

                _logger.LogDebug("C#脚本执行成功，耗时: {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
            }
            catch (OperationCanceledException ex) when (ex.CancellationToken.IsCancellationRequested)
            {
                result.Success = false;
                result.Error = "脚本执行超时";
                result.IsTimeout = true;
                result.Exception = ex;
                _logger.LogWarning("C#脚本执行超时");
            }
            catch (CompilationErrorException ex)
            {
                result.Success = false;
                result.Error = $"C#编译错误: {string.Join("; ", ex.Diagnostics.Select(d => d.GetMessage()))}";
                result.Exception = ex;
                _logger.LogError(ex, "C#脚本编译错误");
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Error = $"脚本执行异常: {ex.Message}";
                result.Exception = ex;
                _logger.LogError(ex, "C#脚本执行异常");
            }
            finally
            {
                stopwatch.Stop();
                result.ExecutionTime = (int)stopwatch.ElapsedMilliseconds;
                result.MemoryUsage = GC.GetTotalMemory(false);
            }

            return result;
        }

        /// <summary>
        /// 验证脚本语法
        /// </summary>
        public async Task<ScriptValidationResult> ValidateScriptAsync(string script, ScriptType scriptType)
        {
            var result = new ScriptValidationResult();

            try
            {
                switch (scriptType)
                {
                    case ScriptType.JavaScript:
                        await ValidateJavaScriptAsync(script, result);
                        break;
                    case ScriptType.CSharp:
                        await ValidateCSharpAsync(script, result);
                        break;
                    case ScriptType.Expression:
                        await ValidateExpressionAsync(script, result);
                        break;
                    default:
                        result.Errors.Add($"不支持的脚本类型: {scriptType}");
                        break;
                }
            }
            catch (Exception ex)
            {
                result.IsValid = false;
                result.Errors.Add($"验证过程中发生异常: {ex.Message}");
                _logger.LogError(ex, "脚本验证异常");
            }

            result.IsValid = !result.Errors.Any();
            return result;
        }

        /// <summary>
        /// 获取支持的脚本类型
        /// </summary>
        public IEnumerable<ScriptType> GetSupportedScriptTypes()
        {
            return new[] { ScriptType.JavaScript, ScriptType.CSharp, ScriptType.Expression };
        }

        #region 私有方法

        /// <summary>
        /// 注入常用函数到JavaScript引擎
        /// </summary>
        private void InjectCommonFunctions(Engine engine)
        {
            // 注入日志函数
            engine.SetValue("log", new Action<object>(obj =>
            {
                _logger.LogInformation("Script Log: {Message}", obj?.ToString());
            }));

            // 注入常用工具函数
            engine.SetValue("now", new Func<DateTime>(() => DateTime.Now));
            engine.SetValue("utcNow", new Func<DateTime>(() => DateTime.UtcNow));
            engine.SetValue("guid", new Func<string>(() => Guid.NewGuid().ToString()));
            engine.SetValue("random", new Func<double>(() => new Random().NextDouble()));

            // 注入JSON处理函数
            engine.SetValue("parseJson", new Func<string, object>(json =>
            {
                try
                {
                    return JsonSerializer.Deserialize<object>(json);
                }
                catch
                {
                    return null;
                }
            }));

            engine.SetValue("toJson", new Func<object, string>(obj =>
            {
                try
                {
                    return JsonSerializer.Serialize(obj);
                }
                catch
                {
                    return "{}";
                }
            }));
        }

        /// <summary>
        /// 转换Jint值为.NET对象
        /// </summary>
        private object? ConvertJintValue(Jint.Native.JsValue jsValue)
        {
            if (jsValue.IsNull() || jsValue.IsUndefined())
                return null;

            if (jsValue.IsBoolean())
                return jsValue.AsBoolean();

            if (jsValue.IsNumber())
                return jsValue.AsNumber();

            if (jsValue.IsString())
                return jsValue.AsString();

            if (jsValue.IsArray())
            {
                var array = jsValue.AsArray();
                var result = new object[array.Length];
                for (uint i = 0; i < array.Length; i++)
                {
                    result[i] = ConvertJintValue(array.Get(i.ToString()));
                }
                return result;
            }

            if (jsValue.IsObject())
            {
                var obj = jsValue.AsObject();
                var result = new Dictionary<string, object>();
                foreach (var property in obj.GetOwnProperties())
                {
                    result[property.Key.AsString()] = ConvertJintValue(property.Value.Value);
                }
                return result;
            }

            return jsValue.ToString();
        }

        /// <summary>
        /// 验证JavaScript语法
        /// </summary>
        private async Task ValidateJavaScriptAsync(string script, ScriptValidationResult result)
        {
            try
            {
                var engine = new Engine(options =>
                {
                    options.TimeoutInterval(TimeSpan.FromMilliseconds(1000));
                    options.MaxStatements(100);
                });

                // 尝试解析脚本
                await Task.Run(() => engine.Execute("try { " + script + " } catch(e) { throw e; }"));
                
                result.SyntaxInfo["parsed"] = true;
            }
            catch (JavaScriptException ex)
            {
                result.Errors.Add($"JavaScript语法错误: {ex.Message}");
            }
            catch (Exception ex)
            {
                result.Errors.Add($"JavaScript验证异常: {ex.Message}");
            }
        }

        /// <summary>
        /// 验证C#语法
        /// </summary>
        private async Task ValidateCSharpAsync(string script, ScriptValidationResult result)
        {
            try
            {
                var options = ScriptOptions.Default
                    .WithReferences(typeof(object).Assembly)
                    .WithImports("System");

                var compilation = CSharpScript.Create(script, options).GetCompilation();
                var diagnostics = compilation.GetDiagnostics();

                foreach (var diagnostic in diagnostics)
                {
                    if (diagnostic.Severity == Microsoft.CodeAnalysis.DiagnosticSeverity.Error)
                    {
                        result.Errors.Add($"C#编译错误: {diagnostic.GetMessage()}");
                    }
                    else if (diagnostic.Severity == Microsoft.CodeAnalysis.DiagnosticSeverity.Warning)
                    {
                        result.Warnings.Add($"C#编译警告: {diagnostic.GetMessage()}");
                    }
                }

                result.SyntaxInfo["compiled"] = !result.Errors.Any();
            }
            catch (Exception ex)
            {
                result.Errors.Add($"C#验证异常: {ex.Message}");
            }

            await Task.CompletedTask;
        }

        /// <summary>
        /// 验证表达式语法
        /// </summary>
        private async Task ValidateExpressionAsync(string script, ScriptValidationResult result)
        {
            try
            {
                // 简单的表达式验证，可以扩展为更复杂的表达式解析器
                if (string.IsNullOrWhiteSpace(script))
                {
                    result.Errors.Add("表达式不能为空");
                    return;
                }

                // 检查基本的表达式语法
                var allowedOperators = new[] { "==", "!=", ">", "<", ">=", "<=", "&&", "||", "(", ")" };
                var hasValidOperator = allowedOperators.Any(op => script.Contains(op));

                if (!hasValidOperator)
                {
                    result.Warnings.Add("表达式可能缺少比较操作符");
                }

                result.SyntaxInfo["isExpression"] = true;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"表达式验证异常: {ex.Message}");
            }

            await Task.CompletedTask;
        }

        #endregion
    }

    /// <summary>
    /// C#脚本全局变量类
    /// </summary>
    public class ScriptGlobals
    {
        /// <summary>
        /// 动态变量字典
        /// </summary>
        public Dictionary<string, object> Variables { get; set; } = new();

        /// <summary>
        /// 获取变量值
        /// </summary>
        public T Get<T>(string key)
        {
            if (Variables.TryGetValue(key, out var value) && value is T typedValue)
            {
                return typedValue;
            }
            return default(T);
        }

        /// <summary>
        /// 设置变量值
        /// </summary>
        public void Set(string key, object value)
        {
            Variables[key] = value;
        }

        /// <summary>
        /// 检查变量是否存在
        /// </summary>
        public bool Has(string key)
        {
            return Variables.ContainsKey(key);
        }

        /// <summary>
        /// 日志输出
        /// </summary>
        public void Log(object message)
        {
            Console.WriteLine($"[Script] {message}");
        }

        /// <summary>
        /// 获取当前时间
        /// </summary>
        public DateTime Now => DateTime.Now;

        /// <summary>
        /// 获取UTC时间
        /// </summary>
        public DateTime UtcNow => DateTime.UtcNow;

        /// <summary>
        /// 生成GUID
        /// </summary>
        public string NewGuid() => Guid.NewGuid().ToString();
    }
}
