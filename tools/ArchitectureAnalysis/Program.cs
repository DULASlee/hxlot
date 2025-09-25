using System;
using System.IO;
using System.Threading.Tasks;

namespace SmartAbp.Tools.ArchitectureAnalysis
{
    /// <summary>
    /// 🚀 SmartAbp架构分析程序入口
    /// </summary>
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("🔥 SmartAbp低代码引擎架构深度分析工具");
            Console.WriteLine("===================================");
            Console.WriteLine();

            try
            {
                // 获取项目根目录
                var projectPath = GetProjectPath(args);
                
                if (!Directory.Exists(projectPath))
                {
                    Console.WriteLine($"❌ 项目路径不存在: {projectPath}");
                    Console.WriteLine("💡 使用方法: dotnet run [项目路径]");
                    return;
                }

                Console.WriteLine($"📁 项目路径: {projectPath}");
                Console.WriteLine($"⏰ 开始时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                Console.WriteLine();

                // 创建分析执行器
                var runner = new AnalysisRunner(projectPath);

                // 执行第1天分析
                var success = await runner.ExecuteDay1AnalysisAsync();

                if (success)
                {
                    Console.WriteLine();
                    Console.WriteLine("🎉 第1天架构分析执行成功！");
                    Console.WriteLine("📄 请查看生成的分析报告");
                    Console.WriteLine($"📁 报告位置: {Path.Combine(projectPath, "docs", "ArchitectureAnalysis")}");
                }
                else
                {
                    Console.WriteLine();
                    Console.WriteLine("❌ 第1天架构分析执行失败！");
                    Console.WriteLine("请检查错误信息并重试");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 程序执行异常: {ex.Message}");
                Console.WriteLine($"📍 错误详情: {ex.StackTrace}");
            }

            Console.WriteLine();
            Console.WriteLine("✅ 分析程序执行完成！");
        }

        /// <summary>
        /// 获取项目路径
        /// </summary>
        private static string GetProjectPath(string[] args)
        {
            if (args.Length > 0 && !string.IsNullOrEmpty(args[0]))
            {
                return Path.GetFullPath(args[0]);
            }

            // 默认使用当前目录的上级目录（假设工具在Tools子目录中）
            var currentDir = Directory.GetCurrentDirectory();
            
            // 查找包含.sln文件的目录
            var directory = new DirectoryInfo(currentDir);
            while (directory != null)
            {
                if (directory.GetFiles("*.sln").Length > 0)
                {
                    return directory.FullName;
                }
                directory = directory.Parent;
            }

            // 如果找不到，使用当前目录
            return currentDir;
        }
    }
}
