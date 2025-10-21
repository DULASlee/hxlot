using System;

namespace SmartAbp.DevKit.Core.Platform;

/// <summary>
/// 目标平台枚举
/// </summary>
/// <remarks>
/// 【多平台支持架构设计】
/// 低代码引擎支持生成三种平台的代码：
/// - Web: Vue3 + Element Plus + TypeScript（传统Web应用）
/// - Dashboard: 数字大屏（ECharts + WebSocket实时数据）
/// - UniApp: 移动端APP（iOS + Android + H5）
/// </remarks>
public enum TargetPlatform
{
    /// <summary>
    /// Web平台（Vue3 + Element Plus）
    /// </summary>
    /// <remarks>
    /// 目标场景：传统企业级Web应用（管理后台、业务系统）
    /// 技术栈：
    /// - 前端框架：Vue3 + TypeScript
    /// - UI组件库：Element Plus
    /// - 状态管理：Pinia
    /// - 路由：Vue Router
    /// - API调用：Axios
    /// 生成内容：
    /// - 列表页面（CRUD列表+搜索+分页+排序）
    /// - 表单对话框（新增/编辑/详情）
    /// - API Client（TypeScript类型安全）
    /// - Pinia Store（状态管理）
    /// </remarks>
    Web = 1,

    /// <summary>
    /// Dashboard平台（数字大屏）
    /// </summary>
    /// <remarks>
    /// 目标场景：可视化数字大屏（MES产线监控、智慧工地监控）
    /// 技术栈：
    /// - 前端框架：Vue3 + TypeScript
    /// - 可视化库：ECharts
    /// - 实时通信：WebSocket（SignalR）
    /// - 大屏布局：固定1920×1080，自动缩放适配
    /// 生成内容：
    /// - 大屏布局组件（DashboardLayout）
    /// - KPI指标卡片（KPICard）
    /// - 实时图表组件（RealtimeChart + ECharts）
    /// - WebSocket客户端（实时数据推送）
    /// - 实时数据Store（Pinia + 自动更新）
    /// </remarks>
    Dashboard = 2,

    /// <summary>
    /// UniApp平台（移动端APP）
    /// </summary>
    /// <remarks>
    /// 目标场景：移动端原生APP（iOS + Android + H5）
    /// 技术栈：
    /// - 跨平台框架：UniApp
    /// - UI组件库：uni-ui
    /// - 状态管理：Pinia
    /// - API调用：uni.request
    /// - 离线存储：uni.storage
    /// 生成内容：
    /// - 列表页面（uni-list + 下拉刷新 + 上拉加载）
    /// - 详情页面（信息展示）
    /// - 表单页面（新增/编辑）
    /// - API Client（uni.request封装）
    /// - Pinia Store（支持离线数据同步）
    /// - pages.json（路由配置）
    /// </remarks>
    UniApp = 3
}

/// <summary>
/// 文件类型枚举扩展（支持更多平台特定文件）
/// </summary>
public enum FileType
{
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 后端文件类型
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    /// <summary>
    /// C#代码文件
    /// </summary>
    CSharp,
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Web平台文件类型
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    /// <summary>
    /// TypeScript代码文件
    /// </summary>
    TypeScript,
    
    /// <summary>
    /// Vue单文件组件（Web平台：Element Plus）
    /// </summary>
    Vue,
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Dashboard平台文件类型
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    /// <summary>
    /// Dashboard专用Vue组件（大屏布局、KPI卡片、实时图表）
    /// </summary>
    DashboardVue,
    
    /// <summary>
    /// WebSocket客户端TypeScript文件
    /// </summary>
    WebSocketClient,
    
    /// <summary>
    /// 实时数据Store（Pinia + 自动更新机制）
    /// </summary>
    RealtimeStore,
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UniApp平台文件类型
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    /// <summary>
    /// UniApp专用Vue页面（uni-ui组件 + uni.request）
    /// </summary>
    UniAppVue,
    
    /// <summary>
    /// UniApp路由配置文件（pages.json）
    /// </summary>
    UniAppJson,
    
    /// <summary>
    /// UniApp manifest配置文件（manifest.json）
    /// </summary>
    UniAppManifest,
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 通用配置文件类型
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    /// <summary>
    /// JSON配置文件
    /// </summary>
    Json,
    
    /// <summary>
    /// XML配置文件
    /// </summary>
    Xml,
    
    /// <summary>
    /// Markdown文档文件
    /// </summary>
    Markdown,
    
    /// <summary>
    /// 其他类型文件
    /// </summary>
    Other
}

/// <summary>
/// 平台能力枚举（用于判断平台特性）
/// </summary>
[Flags]
public enum PlatformCapabilities
{
    /// <summary>
    /// 无特殊能力
    /// </summary>
    None = 0,
    
    /// <summary>
    /// 支持离线数据存储
    /// </summary>
    OfflineStorage = 1 << 0,
    
    /// <summary>
    /// 支持实时数据推送（WebSocket/SignalR）
    /// </summary>
    RealtimeData = 1 << 1,
    
    /// <summary>
    /// 支持文件上传（含分片上传）
    /// </summary>
    FileUpload = 1 << 2,
    
    /// <summary>
    /// 支持摄像头访问
    /// </summary>
    Camera = 1 << 3,
    
    /// <summary>
    /// 支持地理定位
    /// </summary>
    Geolocation = 1 << 4,
    
    /// <summary>
    /// 支持推送通知
    /// </summary>
    PushNotification = 1 << 5,
    
    /// <summary>
    /// 支持大屏可视化（ECharts）
    /// </summary>
    DataVisualization = 1 << 6,
    
    /// <summary>
    /// 支持多端运行（iOS/Android/H5）
    /// </summary>
    MultiPlatform = 1 << 7
}

/// <summary>
/// 平台辅助类（提供平台相关的工具方法）
/// </summary>
public static class PlatformHelper
{
    /// <summary>
    /// 获取平台名称
    /// </summary>
    public static string GetPlatformName(TargetPlatform platform)
    {
        return platform switch
        {
            TargetPlatform.Web => "Web",
            TargetPlatform.Dashboard => "Dashboard",
            TargetPlatform.UniApp => "UniApp",
            _ => throw new ArgumentOutOfRangeException(nameof(platform))
        };
    }
    
    /// <summary>
    /// 获取平台描述
    /// </summary>
    public static string GetPlatformDescription(TargetPlatform platform)
    {
        return platform switch
        {
            TargetPlatform.Web => "企业级Web应用（Vue3 + Element Plus）",
            TargetPlatform.Dashboard => "可视化数字大屏（ECharts + WebSocket）",
            TargetPlatform.UniApp => "移动端APP（iOS + Android + H5）",
            _ => throw new ArgumentOutOfRangeException(nameof(platform))
        };
    }
    
    /// <summary>
    /// 获取平台能力
    /// </summary>
    public static PlatformCapabilities GetPlatformCapabilities(TargetPlatform platform)
    {
        return platform switch
        {
            TargetPlatform.Web => 
                PlatformCapabilities.FileUpload | 
                PlatformCapabilities.RealtimeData,
            
            TargetPlatform.Dashboard => 
                PlatformCapabilities.RealtimeData | 
                PlatformCapabilities.DataVisualization,
            
            TargetPlatform.UniApp => 
                PlatformCapabilities.OfflineStorage | 
                PlatformCapabilities.FileUpload | 
                PlatformCapabilities.Camera | 
                PlatformCapabilities.Geolocation | 
                PlatformCapabilities.PushNotification | 
                PlatformCapabilities.MultiPlatform,
            
            _ => PlatformCapabilities.None
        };
    }
    
    /// <summary>
    /// 判断平台是否支持某个能力
    /// </summary>
    public static bool HasCapability(TargetPlatform platform, PlatformCapabilities capability)
    {
        var capabilities = GetPlatformCapabilities(platform);
        return (capabilities & capability) == capability;
    }
    
    /// <summary>
    /// 获取平台默认端口
    /// </summary>
    public static int GetDefaultPort(TargetPlatform platform)
    {
        return platform switch
        {
            TargetPlatform.Web => 5173,      // Vite默认端口
            TargetPlatform.Dashboard => 5174, // Dashboard专用端口
            TargetPlatform.UniApp => 8080,   // UniApp H5端口
            _ => 5000
        };
    }
    
    /// <summary>
    /// 获取平台文件扩展名
    /// </summary>
    public static string GetFileExtension(FileType fileType)
    {
        return fileType switch
        {
            FileType.CSharp => ".cs",
            FileType.TypeScript => ".ts",
            FileType.Vue => ".vue",
            FileType.DashboardVue => ".vue",
            FileType.WebSocketClient => ".ts",
            FileType.RealtimeStore => ".ts",
            FileType.UniAppVue => ".vue",
            FileType.UniAppJson => ".json",
            FileType.UniAppManifest => ".json",
            FileType.Json => ".json",
            FileType.Xml => ".xml",
            FileType.Markdown => ".md",
            _ => string.Empty
        };
    }
}

