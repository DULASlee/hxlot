using System;
using System.Collections.Generic;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.Quality
{
    /// <summary>
    /// Definition for code quality and validation solution
    /// </summary>
    public sealed class QualityDefinition
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<QualityRule> Rules { get; set; } = new List<QualityRule>();
        
        [PublicAPI]
        public IList<QualityMetric> Metrics { get; set; } = new List<QualityMetric>();
        
        [PublicAPI]
        public IList<QualityGate> Gates { get; set; } = new List<QualityGate>();
        
        [PublicAPI]
        public QualityConfiguration Configuration { get; set; } = new();
    }
    
    /// <summary>
    /// Quality rule definition
    /// </summary>
    public sealed class QualityRule
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public RuleCategory Category { get; set; } = RuleCategory.CodeQuality;
        
        [PublicAPI]
        public RuleSeverity Severity { get; set; } = RuleSeverity.Warning;
        
        [PublicAPI]
        public bool IsEnabled { get; set; } = true;
        
        [PublicAPI]
        public IDictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
    }
    
    /// <summary>
    /// Quality metric definition
    /// </summary>
    public sealed class QualityMetric
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public MetricType Type { get; set; } = MetricType.Count;
        
        [PublicAPI]
        public double? MinValue { get; set; }
        
        [PublicAPI]
        public double? MaxValue { get; set; }
        
        [PublicAPI]
        public double? TargetValue { get; set; }
    }
    
    /// <summary>
    /// Quality gate definition
    /// </summary>
    public sealed class QualityGate
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<QualityCondition> Conditions { get; set; } = new List<QualityCondition>();
        
        [PublicAPI]
        public bool IsBlocking { get; set; } = true;
    }
    
    /// <summary>
    /// Quality condition for gates
    /// </summary>
    public sealed class QualityCondition
    {
        [PublicAPI]
        public string MetricName { get; set; } = string.Empty;
        
        [PublicAPI]
        public ComparisonOperator Operator { get; set; } = ComparisonOperator.LessThan;
        
        [PublicAPI]
        public double Threshold { get; set; }
        
        [PublicAPI]
        public string? ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Quality configuration
    /// </summary>
    public sealed class QualityConfiguration
    {
        [PublicAPI]
        public bool EnableStaticAnalysis { get; set; } = true;
        
        [PublicAPI]
        public bool EnableSecurityAnalysis { get; set; } = true;
        
        [PublicAPI]
        public bool EnablePerformanceAnalysis { get; set; } = true;
        
        [PublicAPI]
        public bool EnableCodeCoverage { get; set; } = true;
        
        [PublicAPI]
        public double MinimumCodeCoverage { get; set; } = 80.0;
        
        [PublicAPI]
        public int MaxCyclomaticComplexity { get; set; } = 10;
        
        [PublicAPI]
        public int MaxMethodLength { get; set; } = 50;
        
        [PublicAPI]
        public int MaxClassLength { get; set; } = 500;
        
        [PublicAPI]
        public bool FailOnQualityGateViolation { get; set; } = true;
    }
    
    /// <summary>
    /// Generated quality solution result
    /// </summary>
    public sealed class GeneratedQualitySolution
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int RuleCount { get; set; }
        
        [PublicAPI]
        public int MetricCount { get; set; }
        
        [PublicAPI]
        public int GateCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
    }
    
    /// <summary>
    /// Analysis result
    /// </summary>
    public sealed class AnalysisResult
    {
        [PublicAPI]
        public bool IsSuccess { get; set; }
        
        [PublicAPI]
        public IList<AnalysisIssue> Issues { get; set; } = new List<AnalysisIssue>();
        
        [PublicAPI]
        public IList<AnalysisWarning> Warnings { get; set; } = new List<AnalysisWarning>();
        
        [PublicAPI]
        public IList<AnalysisError> Errors { get; set; } = new List<AnalysisError>();
        
        [PublicAPI]
        public DateTime AnalyzedAt { get; set; }
    }
    
    /// <summary>
    /// Analysis issue
    /// </summary>
    public sealed class AnalysisIssue
    {
        [PublicAPI]
        public string RuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Message { get; set; } = string.Empty;
        
        [PublicAPI]
        public AnalysisSeverity Severity { get; set; } = AnalysisSeverity.Warning;
        
        [PublicAPI]
        public int LineNumber { get; set; }
        
        [PublicAPI]
        public int ColumnNumber { get; set; }
        
        [PublicAPI]
        public string? FileName { get; set; }
    }
    
    /// <summary>
    /// Analysis warning
    /// </summary>
    public sealed class AnalysisWarning
    {
        [PublicAPI]
        public string RuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Message { get; set; } = string.Empty;
        
        [PublicAPI]
        public int LineNumber { get; set; }
        
        [PublicAPI]
        public string? FileName { get; set; }
    }
    
    /// <summary>
    /// Analysis error
    /// </summary>
    public sealed class AnalysisError
    {
        [PublicAPI]
        public string Message { get; set; } = string.Empty;
        
        [PublicAPI]
        public AnalysisSeverity Severity { get; set; } = AnalysisSeverity.Error;
        
        [PublicAPI]
        public string? StackTrace { get; set; }
    }
    
    /// <summary>
    /// Validation result
    /// </summary>
    public sealed class ValidationResult
    {
        [PublicAPI]
        public bool IsValid { get; set; }
        
        [PublicAPI]
        public IList<RuleViolation> Violations { get; set; } = new List<RuleViolation>();
        
        [PublicAPI]
        public DateTime ValidatedAt { get; set; }
        
        [PublicAPI]
        public string? ValidationError { get; set; }
    }
    
    /// <summary>
    /// Rule violation
    /// </summary>
    public sealed class RuleViolation
    {
        [PublicAPI]
        public string RuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Message { get; set; } = string.Empty;
        
        [PublicAPI]
        public RuleSeverity Severity { get; set; } = RuleSeverity.Warning;
        
        [PublicAPI]
        public int LineNumber { get; set; }
        
        [PublicAPI]
        public string? FileName { get; set; }
    }
    
    /// <summary>
    /// Code metrics
    /// </summary>
    public sealed class CodeMetrics
    {
        [PublicAPI]
        public int LinesOfCode { get; set; }
        
        [PublicAPI]
        public int CyclomaticComplexity { get; set; }
        
        [PublicAPI]
        public int ClassCount { get; set; }
        
        [PublicAPI]
        public int MethodCount { get; set; }
        
        [PublicAPI]
        public double CodeCoverage { get; set; }
        
        [PublicAPI]
        public int DuplicatedLines { get; set; }
        
        [PublicAPI]
        public bool HasError { get; set; }
        
        [PublicAPI]
        public string? ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Quality gate result
    /// </summary>
    public sealed class QualityGateResult
    {
        [PublicAPI]
        public bool Passed { get; set; }
        
        [PublicAPI]
        public IList<QualityGateCheckResult> Results { get; set; } = new List<QualityGateCheckResult>();
        
        [PublicAPI]
        public DateTime CheckedAt { get; set; }
        
        [PublicAPI]
        public string? Error { get; set; }
    }
    
    /// <summary>
    /// Quality gate check result
    /// </summary>
    public sealed class QualityGateCheckResult
    {
        [PublicAPI]
        public string GateName { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool Passed { get; set; }
        
        [PublicAPI]
        public string? FailureReason { get; set; }
        
        [PublicAPI]
        public double? ActualValue { get; set; }
        
        [PublicAPI]
        public double? ExpectedValue { get; set; }
    }
    
    /// <summary>
    /// Rule category enumeration
    /// </summary>
    public enum RuleCategory
    {
        CodeQuality,
        Security,
        Performance,
        Maintainability,
        Design,
        Naming,
        Documentation
    }
    
    /// <summary>
    /// Rule severity enumeration
    /// </summary>
    public enum RuleSeverity
    {
        Information,
        Warning,
        Error,
        Critical
    }
    
    /// <summary>
    /// Analysis severity enumeration
    /// </summary>
    public enum AnalysisSeverity
    {
        Information,
        Warning,
        Error,
        Critical
    }
    
    /// <summary>
    /// Metric type enumeration
    /// </summary>
    public enum MetricType
    {
        Count,
        Percentage,
        Ratio,
        Duration,
        Size
    }
    
    /// <summary>
    /// Comparison operator enumeration
    /// </summary>
    public enum ComparisonOperator
    {
        LessThan,
        LessThanOrEqual,
        GreaterThan,
        GreaterThanOrEqual,
        Equal,
        NotEqual
    }
}