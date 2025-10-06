// 🔥 Schema版本验证测试脚本
// 使用: dotnet script test-schema-version.cs

using System;
using System.Text.RegularExpressions;

Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("🧪 Schema版本验证测试");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

var versionRegex = new Regex(@"^(\d+)\.(\d+)\.(\d+)$", RegexOptions.Compiled);

// 测试1: 版本格式验证
Console.WriteLine("\n📋 测试1: 版本格式验证");
var testVersions = new[]
{
    ("1.0.0", true),
    ("2.5.10", true),
    ("0.1.0", true),
    ("1.0", false),
    ("1.0.0.0", false),
    ("v1.0.0", false),
    ("1.0.0-beta", false),
    ("", false),
};

foreach (var (version, expected) in testVersions)
{
    var isValid = versionRegex.IsMatch(version);
    var result = isValid == expected ? "✅" : "❌";
    Console.WriteLine($"  {result} '{version}' → {isValid} (预期: {expected})");
}

// 测试2: 版本比较
Console.WriteLine("\n📋 测试2: 版本比较");
var compareTests = new[]
{
    ("1.0.0", "1.0.0", 0),
    ("2.0.0", "1.0.0", 1),
    ("1.0.0", "2.0.0", -1),
    ("1.5.0", "1.4.9", 1),
    ("1.0.1", "1.0.0", 1),
};

int CompareVersions(string v1, string v2)
{
    var match1 = versionRegex.Match(v1);
    var match2 = versionRegex.Match(v2);

    var major1 = int.Parse(match1.Groups[1].Value);
    var minor1 = int.Parse(match1.Groups[2].Value);
    var patch1 = int.Parse(match1.Groups[3].Value);

    var major2 = int.Parse(match2.Groups[1].Value);
    var minor2 = int.Parse(match2.Groups[2].Value);
    var patch2 = int.Parse(match2.Groups[3].Value);

    if (major1 != major2) return major1 > major2 ? 1 : -1;
    if (minor1 != minor2) return minor1 > minor2 ? 1 : -1;
    if (patch1 != patch2) return patch1 > patch2 ? 1 : -1;
    return 0;
}

foreach (var (v1, v2, expected) in compareTests)
{
    var result = CompareVersions(v1, v2);
    var passed = result == expected ? "✅" : "❌";
    Console.WriteLine($"  {passed} {v1} vs {v2} → {result} (预期: {expected})");
}

// 测试3: 版本兼容性检查
Console.WriteLine("\n📋 测试3: 版本兼容性检查");
const string CURRENT_VERSION = "1.0.0";
const string MIN_SUPPORTED_VERSION = "1.0.0";

bool IsCompatible(string clientVersion)
{
    if (!versionRegex.IsMatch(clientVersion)) return false;

    var clientVsMin = CompareVersions(clientVersion, MIN_SUPPORTED_VERSION);
    var clientVsCurrent = CompareVersions(clientVersion, CURRENT_VERSION);

    return clientVsMin >= 0 && clientVsCurrent <= 0;
}

var compatibilityTests = new[]
{
    ("1.0.0", true),   // 完全匹配
    ("0.9.0", false),  // 低于最低版本
    ("1.1.0", false),  // 高于当前版本
    ("1.0.1", false),  // 高于当前版本
    ("invalid", false) // 无效格式
};

foreach (var (version, expected) in compatibilityTests)
{
    var isCompatible = IsCompatible(version);
    var result = isCompatible == expected ? "✅" : "❌";
    Console.WriteLine($"  {result} '{version}' → {isCompatible} (预期: {expected})");
}

Console.WriteLine("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("✅ 所有测试完成!");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

