using System.Threading.Tasks;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// 命令处理器接口
/// </summary>
public interface ICommandHandler
{
    /// <summary>
    /// 执行命令
    /// </summary>
    Task<int> ExecuteAsync();
}

