using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartAbp.OpsManagement.Services;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.OpsManagement.Infrastructure.Prometheus;

/// <summary>
/// Prometheus服务实现
/// </summary>
public class PrometheusService : IPrometheusService, ITransientDependency
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PrometheusService> _logger;
    private readonly string _prometheusUrl;

    public PrometheusService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<PrometheusService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("Prometheus");
        _logger = logger;
        _prometheusUrl = configuration["Prometheus:Url"] ?? "http://localhost:9090";
    }

    /// <summary>
    /// 查询Prometheus指标
    /// </summary>
    public async Task<PrometheusQueryResult> QueryAsync(string query)
    {
        try
        {
            _logger.LogInformation("Querying Prometheus: {Query}", query);

            var url = $"{_prometheusUrl}/api/v1/query?query={Uri.EscapeDataString(query)}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(content);

            var result = ParseQueryResponse(jsonDoc);

            _logger.LogDebug("Prometheus query returned value: {Value}", result.Value);

            return result;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to query Prometheus. URL: {Url}", _prometheusUrl);
            throw new InvalidOperationException("Prometheus service is unavailable", ex);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse Prometheus response");
            throw new InvalidOperationException("Invalid Prometheus response format", ex);
        }
    }

    /// <summary>
    /// 范围查询（时间序列）
    /// </summary>
    public async Task<List<PrometheusDataPoint>> QueryRangeAsync(
        string query,
        DateTime start,
        DateTime end,
        string step = "15s")
    {
        try
        {
            var startUnix = new DateTimeOffset(start).ToUnixTimeSeconds();
            var endUnix = new DateTimeOffset(end).ToUnixTimeSeconds();

            var url = $"{_prometheusUrl}/api/v1/query_range?query={Uri.EscapeDataString(query)}&start={startUnix}&end={endUnix}&step={step}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(content);

            return ParseRangeResponse(jsonDoc);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to query Prometheus range");
            throw new InvalidOperationException("Prometheus range query failed", ex);
        }
    }

    private PrometheusQueryResult ParseQueryResponse(JsonDocument jsonDoc)
    {
        var data = jsonDoc.RootElement.GetProperty("data");
        var result = data.GetProperty("result");

        if (result.GetArrayLength() == 0)
        {
            return new PrometheusQueryResult { Value = 0, Labels = new Dictionary<string, string>() };
        }

        var firstResult = result[0];
        var metric = firstResult.GetProperty("metric");
        var value = firstResult.GetProperty("value");

        var labels = new Dictionary<string, string>();
        foreach (var label in metric.EnumerateObject())
        {
            labels[label.Name] = label.Value.GetString() ?? string.Empty;
        }

        var valueArray = value.EnumerateArray();
        valueArray.MoveNext(); // Skip timestamp
        valueArray.MoveNext(); // Get value
        var valueStr = valueArray.Current.GetString() ?? "0";
        var parsedValue = double.TryParse(valueStr, out var v) ? v : 0;

        return new PrometheusQueryResult
        {
            Value = parsedValue,
            Labels = labels
        };
    }

    private List<PrometheusDataPoint> ParseRangeResponse(JsonDocument jsonDoc)
    {
        var dataPoints = new List<PrometheusDataPoint>();
        var data = jsonDoc.RootElement.GetProperty("data");
        var result = data.GetProperty("result");

        foreach (var series in result.EnumerateArray())
        {
            var values = series.GetProperty("values");
            foreach (var value in values.EnumerateArray())
            {
                var valueArray = value.EnumerateArray();
                var enumerator = valueArray.GetEnumerator();

                enumerator.MoveNext();
                var timestamp = enumerator.Current.GetInt64();

                enumerator.MoveNext();
                var valueStr = enumerator.Current.GetString() ?? "0";
                var parsedValue = double.TryParse(valueStr, out var v) ? v : 0;

                dataPoints.Add(new PrometheusDataPoint
                {
                    Timestamp = DateTimeOffset.FromUnixTimeSeconds(timestamp).DateTime,
                    Value = parsedValue
                });
            }
        }

        return dataPoints;
    }
}

