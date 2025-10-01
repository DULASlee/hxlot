using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.OpsManagement.Contracts.Logs;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// Elasticsearch服务接口
/// </summary>
public interface IElasticsearchService
{
    Task<bool> IndexLogAsync(LogEntryDocument log);
    Task<bool> BulkIndexLogsAsync(List<LogEntryDocument> logs);
    Task<(long Total, List<LogEntryDocument> Items)> SearchLogsAsync(LogSearchRequest request);
}

