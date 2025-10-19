using System;
using System.Collections.Generic;

namespace SmartAbp.DevKit.Core.Models;

/// <summary>
/// 操作结果模型（通用）
/// </summary>
public class Result
{
    /// <summary>
    /// 操作是否成功
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// 错误消息（如果失败）
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 详细错误信息
    /// </summary>
    public string? ErrorDetails { get; set; }

    /// <summary>
    /// 警告消息列表
    /// </summary>
    public List<string> Warnings { get; set; } = new();

    /// <summary>
    /// 附加数据
    /// </summary>
    public Dictionary<string, object> Data { get; set; } = new();

    /// <summary>
    /// 创建成功结果
    /// </summary>
    public static Result Success()
    {
        return new Result { IsSuccess = true };
    }

    /// <summary>
    /// 创建成功结果（带附加数据）
    /// </summary>
    public static Result Success(Dictionary<string, object> data)
    {
        return new Result
        {
            IsSuccess = true,
            Data = data
        };
    }

    /// <summary>
    /// 创建失败结果
    /// </summary>
    public static Result Failure(string errorMessage)
    {
        return new Result
        {
            IsSuccess = false,
            ErrorMessage = errorMessage
        };
    }

    /// <summary>
    /// 创建失败结果（带详细信息）
    /// </summary>
    public static Result Failure(string errorMessage, string errorDetails)
    {
        return new Result
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            ErrorDetails = errorDetails
        };
    }

    /// <summary>
    /// 创建失败结果（带异常）
    /// </summary>
    public static Result Failure(string errorMessage, Exception exception)
    {
        return new Result
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            ErrorDetails = exception.ToString()
        };
    }

    /// <summary>
    /// 添加警告消息
    /// </summary>
    public Result AddWarning(string warning)
    {
        Warnings.Add(warning);
        return this;
    }

    /// <summary>
    /// 添加附加数据
    /// </summary>
    public Result AddData(string key, object value)
    {
        Data[key] = value;
        return this;
    }
}

/// <summary>
/// 操作结果模型（泛型，带返回值）
/// </summary>
public class Result<T> : Result
{
    /// <summary>
    /// 返回值
    /// </summary>
    public T? Value { get; set; }

    /// <summary>
    /// 创建成功结果（带返回值）
    /// </summary>
    public static Result<T> Success(T value)
    {
        return new Result<T>
        {
            IsSuccess = true,
            Value = value
        };
    }

    /// <summary>
    /// 创建失败结果（泛型）
    /// </summary>
    public new static Result<T> Failure(string errorMessage)
    {
        return new Result<T>
        {
            IsSuccess = false,
            ErrorMessage = errorMessage
        };
    }

    /// <summary>
    /// 创建失败结果（泛型，带详细信息）
    /// </summary>
    public new static Result<T> Failure(string errorMessage, string errorDetails)
    {
        return new Result<T>
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            ErrorDetails = errorDetails
        };
    }

    /// <summary>
    /// 创建失败结果（泛型，带异常）
    /// </summary>
    public new static Result<T> Failure(string errorMessage, Exception exception)
    {
        return new Result<T>
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            ErrorDetails = exception.ToString()
        };
    }
}

