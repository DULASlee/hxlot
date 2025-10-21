using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Nest;
using SmartAbp.OpsManagement.Contracts.Logs;
using SmartAbp.OpsManagement.Services;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.OpsManagement.Infrastructure.Elasticsearch;

/// <summary>
/// Elasticsearch服务实现
/// </summary>
public class ElasticsearchService : IElasticsearchService, ITransientDependency
{
    private readonly IElasticClient _client;
    private readonly ILogger<ElasticsearchService> _logger;
    private readonly string _indexPrefix;

    public ElasticsearchService(
        IConfiguration configuration,
        ILogger<ElasticsearchService> logger)
    {
        _logger = logger;
        _indexPrefix = configuration["Elasticsearch:IndexPrefix"] ?? "logs-smartabp";

        var uri = configuration["Elasticsearch:Uri"] ?? "http://localhost:9200";
        var settings = new ConnectionSettings(new Uri(uri))
            .DefaultIndex(_indexPrefix)
            .EnableDebugMode()
            .PrettyJson()
            .RequestTimeout(TimeSpan.FromSeconds(30));

        _client = new ElasticClient(settings);
    }

    /// <summary>
    /// 索引日志到Elasticsearch
    /// </summary>
    public async Task<bool> IndexLogAsync(LogEntryDocument log)
    {
        try
        {
            var indexName = $"{_indexPrefix}-{log.Timestamp:yyyy.MM.dd}";
            var response = await _client.IndexAsync(log, idx => idx.Index(indexName));

            if (!response.IsValid)
            {
                _logger.LogError("Failed to index log: {Error}", response.OriginalException?.Message);
                return false;
            }

            _logger.LogDebug("Log indexed successfully. ID: {Id}", response.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while indexing log");
            return false;
        }
    }

    /// <summary>
    /// 批量索引日志
    /// </summary>
    public async Task<bool> BulkIndexLogsAsync(List<LogEntryDocument> logs)
    {
        try
        {
            var bulkDescriptor = new BulkDescriptor();

            foreach (var log in logs)
            {
                var indexName = $"{_indexPrefix}-{log.Timestamp:yyyy.MM.dd}";
                bulkDescriptor.Index<LogEntryDocument>(op => op
                    .Document(log)
                    .Index(indexName));
            }

            var response = await _client.BulkAsync(bulkDescriptor);

            if (!response.IsValid)
            {
                _logger.LogError("Bulk index failed: {Error}", response.OriginalException?.Message);
                return false;
            }

            _logger.LogInformation("Bulk indexed {Count} logs successfully", logs.Count);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during bulk indexing");
            return false;
        }
    }

    /// <summary>
    /// 搜索日志
    /// </summary>
    public async Task<(long Total, List<LogEntryDocument> Items)> SearchLogsAsync(LogSearchRequest request)
    {
        try
        {
            var searchResponse = await _client.SearchAsync<LogEntryDocument>(s => s
                .Index($"{_indexPrefix}-*")
                .From(request.SkipCount)
                .Size(request.MaxResultCount)
                .Query(q => BuildSearchQuery(q, request))
                .Sort(sort => sort.Descending(log => log.Timestamp))
            );

            if (!searchResponse.IsValid)
            {
                _logger.LogError("Search failed: {Error}", searchResponse.OriginalException?.Message);
                return (0, new List<LogEntryDocument>());
            }

            return (searchResponse.Total, searchResponse.Documents.ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during log search");
            return (0, new List<LogEntryDocument>());
        }
    }

    private QueryContainer BuildSearchQuery(QueryContainerDescriptor<LogEntryDocument> q, LogSearchRequest request)
    {
        var queries = new List<QueryContainer>();

        // 时间范围
        queries.Add(q.DateRange(r => r
            .Field(f => f.Timestamp)
            .GreaterThanOrEquals(request.StartTime)
            .LessThanOrEquals(request.EndTime)
        ));

        // 服务名称
        if (!string.IsNullOrWhiteSpace(request.ServiceName))
        {
            queries.Add(q.Term(t => t.Field(f => f.ServiceName).Value(request.ServiceName)));
        }

        // 日志级别
        if (!string.IsNullOrWhiteSpace(request.Level))
        {
            queries.Add(q.Term(t => t.Field(f => f.Level).Value(request.Level)));
        }

        // 关键词搜索
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            queries.Add(q.MultiMatch(m => m
                .Query(request.Keyword)
                .Fields(f => f
                    .Field(log => log.Message)
                    .Field(log => log.Exception))
            ));
        }

        // TraceID
        if (!string.IsNullOrWhiteSpace(request.TraceId))
        {
            queries.Add(q.Term(t => t.Field(f => f.TraceId).Value(request.TraceId)));
        }

        return q.Bool(b => b.Must(queries.ToArray()));
    }
}

