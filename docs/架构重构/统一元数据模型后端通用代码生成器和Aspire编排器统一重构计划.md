# 统一元数据模型后端通用代码生成器和Aspire编排器统一重构计划

## 📋 文档信息

**文档版本**: v1.0.0  
**创建日期**: 2025-01-27  
**重构方案**: JSON Schema统一方案（方案B）  
**执行阶段**: 阶段4 + 阶段7-9  
**预计工期**: 15天  
**依赖**: 前端统一元数据模型核心创建完成  
**技术栈**: C# .NET 8 + ABP Framework 8.0  
**质量标准**: 业界顶级水平（≥95分）

---

## 🎯 重构目标

### 核心目标
重构后端代码生成器和Aspire微服务编排器，使其完全基于JSON Schema统一元数据模型，实现前后端元数据的高度一致性和自动化代码生成能力。

### 成功标准
- ✅ JSON Schema为唯一元数据来源（Schema-First设计）
- ✅ C# DTO自动从JSON Schema生成
- ✅ 前后端元数据100%一致（字段级别）
- ✅ 通用代码生成器完美支持统一元数据
- ✅ Aspire微服务编排器完美支持统一元数据
- ✅ Schema版本管理和演进机制完善
- ✅ 代码生成性能无退化（<原有20%）
- ✅ 所有单元测试通过（覆盖率≥80%）

---

## 📊 后端架构现状分析

### 现有元数据模型

| 文件 | 类型 | 用途 | 问题 |
|------|------|------|------|
| `Core/Definitions.cs` | `EntityDefinition` | CRUD实体定义 | 与前端不一致 |
| `Services/Dtos.cs` | `ModuleMetadataDto` | 模块配置 | 字段缺失 |
| `Aspire/AspireDefinitions.cs` | `AspireSolutionDefinition` | 微服务编排 | 独立设计 |
| `Services/V9/*.cs` | V9 DTOs | 极简生成器 | 临时方案 |

**核心问题**:
- 缺乏统一的元数据模型
- 前后端字段不一致
- 无Schema版本管理
- 代码生成逻辑分散

---

## 🏗️ 阶段4: JSON Schema体系建设（3天）

### 步骤4.1: 创建Schema文件结构

**目标**: 建立完整的JSON Schema文件体系

**新增目录结构**:
```
src/SmartAbp.CodeGenerator/Core/Schema/
├── v1/                           ⬅️ 新增：Schema版本1
│   ├── EntityMetadataSchema.json
│   ├── ModuleMetadataSchema.json
│   ├── AspireSolutionSchema.json
│   └── common/
│       ├── PropertyMetadataSchema.json
│       ├── ValidationRuleSchema.json
│       └── NavigationPropertySchema.json
├── registry.json                 ⬅️ 新增：Schema版本注册表
├── README.md                     ⬅️ 新增：Schema文档
└── validation/                   ⬅️ 新增：验证工具
    ├── SchemaValidator.cs
    └── SchemaRegistry.cs
```

---

### 步骤4.2: 编写EntityMetadataSchema.json

**目标**: 定义统一的实体元数据Schema

**新增文件**: `src/SmartAbp.CodeGenerator/Core/Schema/v1/EntityMetadataSchema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://smartabp.io/schemas/entity-metadata-v1.json",
  "title": "实体元数据Schema v1.0",
  "description": "SmartAbp低代码引擎统一实体元数据定义",
  "type": "object",
  "required": ["name", "module"],
  "properties": {
    "schemaVersion": {
      "type": "string",
      "description": "Schema版本号",
      "const": "1.0.0"
    },
    "name": {
      "type": "string",
      "description": "实体名称（PascalCase）",
      "pattern": "^[A-Z][a-zA-Z0-9]*$",
      "minLength": 1,
      "maxLength": 128
    },
    "module": {
      "type": "string",
      "description": "所属模块名称",
      "minLength": 1,
      "maxLength": 128
    },
    "aggregate": {
      "type": "string",
      "description": "聚合根名称（可选）",
      "pattern": "^[A-Z][a-zA-Z0-9]*$"
    },
    "keyType": {
      "type": "string",
      "description": "主键类型",
      "enum": ["Guid", "int", "long", "string"],
      "default": "Guid"
    },
    "description": {
      "type": "string",
      "description": "实体描述",
      "maxLength": 500
    },
    "isAggregateRoot": {
      "type": "boolean",
      "description": "是否为聚合根",
      "default": true
    },
    "isMultiTenant": {
      "type": "boolean",
      "description": "是否支持多租户",
      "default": true
    },
    "isSoftDelete": {
      "type": "boolean",
      "description": "是否软删除",
      "default": true
    },
    "hasExtraProperties": {
      "type": "boolean",
      "description": "是否支持扩展属性",
      "default": true
    },
    "properties": {
      "type": "array",
      "description": "实体属性列表",
      "items": { "$ref": "#/definitions/PropertyMetadata" },
      "default": []
    },
    "navigationProperties": {
      "type": "array",
      "description": "导航属性列表",
      "items": { "$ref": "#/definitions/NavigationPropertyMetadata" },
      "default": []
    },
    "x-ui-config": {
      "type": "object",
      "description": "前端UI配置（不影响后端代码生成）",
      "properties": {
        "formConfig": {
          "type": "object",
          "properties": {
            "layout": {
              "type": "string",
              "enum": ["horizontal", "vertical", "inline"],
              "default": "horizontal"
            },
            "labelWidth": { "type": "string", "default": "120px" },
            "size": {
              "type": "string",
              "enum": ["large", "default", "small"],
              "default": "default"
            }
          }
        },
        "tableConfig": {
          "type": "object",
          "properties": {
            "bordered": { "type": "boolean", "default": true },
            "striped": { "type": "boolean", "default": false },
            "size": {
              "type": "string",
              "enum": ["large", "default", "small"],
              "default": "default"
            }
          }
        },
        "icon": { "type": "string" },
        "color": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$"
        }
      }
    },
    "x-backend-config": {
      "type": "object",
      "description": "后端代码生成配置",
      "properties": {
        "generateRepository": { "type": "boolean", "default": true },
        "generateAppService": { "type": "boolean", "default": true },
        "generateController": { "type": "boolean", "default": true },
        "generateUnitTests": { "type": "boolean", "default": true },
        "namespace": { "type": "string" },
        "baseEntity": { "type": "string", "enum": ["Entity", "AggregateRoot", "FullAuditedAggregateRoot"] }
      }
    }
  },
  "definitions": {
    "PropertyMetadata": {
      "type": "object",
      "required": ["name", "type"],
      "properties": {
        "name": {
          "type": "string",
          "description": "属性名称（camelCase）",
          "pattern": "^[a-zA-Z][a-zA-Z0-9]*$",
          "minLength": 1,
          "maxLength": 128
        },
        "type": {
          "type": "string",
          "description": "属性类型（C#类型或TypeScript类型）",
          "enum": [
            "string", "int", "long", "decimal", "double", "bool", "DateTime",
            "Guid", "byte[]", "TimeSpan", "DateOnly", "TimeOnly"
          ]
        },
        "isRequired": {
          "type": "boolean",
          "description": "是否必填",
          "default": false
        },
        "isReadOnly": {
          "type": "boolean",
          "description": "是否只读",
          "default": false
        },
        "isUnique": {
          "type": "boolean",
          "description": "是否唯一",
          "default": false
        },
        "maxLength": {
          "type": "integer",
          "description": "最大长度（字符串）",
          "minimum": 1,
          "maximum": 10000
        },
        "minLength": {
          "type": "integer",
          "description": "最小长度（字符串）",
          "minimum": 0,
          "maximum": 10000
        },
        "minValue": {
          "type": "number",
          "description": "最小值（数值）"
        },
        "maxValue": {
          "type": "number",
          "description": "最大值（数值）"
        },
        "defaultValue": {
          "type": "string",
          "description": "默认值"
        },
        "description": {
          "type": "string",
          "description": "属性描述",
          "maxLength": 500
        },
        "displayName": {
          "type": "string",
          "description": "显示名称（用于UI）"
        },
        "validationRules": {
          "type": "array",
          "description": "验证规则列表",
          "items": { "$ref": "#/definitions/ValidationRule" },
          "default": []
        },
        "x-backend-annotations": {
          "type": "array",
          "description": "C# Attribute注解",
          "items": { "type": "string" }
        }
      }
    },
    "NavigationPropertyMetadata": {
      "type": "object",
      "required": ["name", "type", "relationType"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "^[a-zA-Z][a-zA-Z0-9]*$"
        },
        "type": {
          "type": "string",
          "description": "关联实体类型"
        },
        "relationType": {
          "type": "string",
          "enum": ["OneToOne", "OneToMany", "ManyToOne", "ManyToMany"]
        },
        "isLazyLoaded": {
          "type": "boolean",
          "default": true
        },
        "foreignKey": {
          "type": "string",
          "description": "外键字段名"
        },
        "inverseProperty": {
          "type": "string",
          "description": "反向导航属性名"
        }
      }
    },
    "ValidationRule": {
      "type": "object",
      "required": ["name", "condition", "errorMessage"],
      "properties": {
        "name": {
          "type": "string",
          "description": "验证规则名称"
        },
        "condition": {
          "type": "string",
          "description": "验证条件表达式"
        },
        "errorMessage": {
          "type": "string",
          "description": "错误提示信息"
        }
      }
    }
  }
}
```

**验证标准**:
- ✅ Schema包含前后端所有必需字段
- ✅ 使用`x-`前缀扩展字段（前端UI、后端配置）
- ✅ 完整的字段验证规则（pattern, min/max等）

---

### 步骤4.3: 编写ModuleMetadataSchema.json

**目标**: 定义统一的模块元数据Schema

**新增文件**: `src/SmartAbp.CodeGenerator/Core/Schema/v1/ModuleMetadataSchema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://smartabp.io/schemas/module-metadata-v1.json",
  "title": "模块元数据Schema v1.0",
  "description": "SmartAbp低代码引擎统一模块元数据定义",
  "type": "object",
  "required": ["name", "version"],
  "properties": {
    "schemaVersion": {
      "type": "string",
      "const": "1.0.0"
    },
    "name": {
      "type": "string",
      "pattern": "^[A-Z][a-zA-Z0-9]+$",
      "description": "模块名称（PascalCase）"
    },
    "displayName": {
      "type": "string",
      "description": "显示名称"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "模块版本（SemVer）",
      "default": "1.0.0"
    },
    "description": {
      "type": "string",
      "maxLength": 1000
    },
    "author": { "type": "string" },
    "abpStyle": {
      "type": "boolean",
      "description": "是否使用ABP风格代码生成",
      "default": true
    },
    "order": {
      "type": "integer",
      "minimum": 0,
      "default": 100
    },
    "dependsOn": {
      "type": "array",
      "description": "依赖的其他模块",
      "items": { "type": "string" },
      "default": []
    },
    "routes": {
      "type": "array",
      "items": { "$ref": "#/definitions/RouteMetadata" },
      "default": []
    },
    "stores": {
      "type": "array",
      "items": { "$ref": "#/definitions/StoreMetadata" },
      "default": []
    },
    "policies": {
      "type": "array",
      "description": "权限策略列表",
      "items": {
        "type": "string",
        "pattern": "^[A-Z][a-zA-Z0-9]*\\.[A-Z][a-zA-Z0-9]*(\\.[A-Z][a-zA-Z0-9]*)?$"
      },
      "default": []
    },
    "lifecycle": { "$ref": "#/definitions/LifecycleMetadata" },
    "features": {
      "type": "object",
      "properties": {
        "enableAuth": { "type": "boolean", "default": true },
        "enableCache": { "type": "boolean", "default": true },
        "enableI18n": { "type": "boolean", "default": true },
        "enableAuditLog": { "type": "boolean", "default": true }
      }
    },
    "menuConfig": {
      "type": "object",
      "properties": {
        "icon": { "type": "string" },
        "order": { "type": "integer", "minimum": 0 },
        "features": { "type": "array", "items": { "type": "string" } },
        "parentMenu": { "type": "string" }
      }
    },
    "x-backend-config": {
      "type": "object",
      "properties": {
        "generateAppService": { "type": "boolean", "default": true },
        "generateController": { "type": "boolean", "default": true },
        "generatePermissions": { "type": "boolean", "default": true },
        "generateLocalization": { "type": "boolean", "default": true },
        "rootNamespace": { "type": "string" }
      }
    }
  },
  "definitions": {
    "RouteMetadata": {
      "type": "object",
      "required": ["name", "path", "component"],
      "properties": {
        "name": { "type": "string", "pattern": "^[A-Z][a-zA-Z0-9]+$" },
        "path": { "type": "string", "pattern": "^\\/" },
        "component": { "type": "string", "pattern": "^@\\/" },
        "meta": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "icon": { "type": "string" },
            "policy": { "type": "string" },
            "keepAlive": { "type": "boolean" },
            "hidden": { "type": "boolean" },
            "order": { "type": "integer" },
            "requiredRoles": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    },
    "StoreMetadata": {
      "type": "object",
      "required": ["symbol", "id", "modulePath"],
      "properties": {
        "symbol": { "type": "string", "pattern": "^use[A-Z]\\w+Store$" },
        "id": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
        "modulePath": { "type": "string", "pattern": "^@\\/" }
      }
    },
    "LifecycleMetadata": {
      "type": "object",
      "properties": {
        "preInit": { "type": "string" },
        "init": { "type": "string" },
        "postInit": { "type": "string" },
        "beforeMount": { "type": "string" },
        "mounted": { "type": "string" }
      }
    }
  }
}
```

---

### 步骤4.4: 编写AspireSolutionSchema.json

**目标**: 定义Aspire微服务方案元数据Schema

**新增文件**: `src/SmartAbp.CodeGenerator/Core/Schema/v1/AspireSolutionSchema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://smartabp.io/schemas/aspire-solution-v1.json",
  "title": "Aspire微服务方案元数据Schema v1.0",
  "description": ".NET Aspire微服务编排统一元数据定义",
  "type": "object",
  "required": ["solutionName", "rootNamespace"],
  "properties": {
    "schemaVersion": { "type": "string", "const": "1.0.0" },
    "solutionName": {
      "type": "string",
      "pattern": "^[A-Z][a-zA-Z0-9]*$",
      "description": "解决方案名称（PascalCase）"
    },
    "rootNamespace": {
      "type": "string",
      "pattern": "^[A-Z][a-zA-Z0-9]*(\\.[A-Z][a-zA-Z0-9]*)*$",
      "description": "根命名空间"
    },
    "description": { "type": "string", "maxLength": 1000 },
    "microservices": {
      "type": "array",
      "description": "微服务列表",
      "items": { "$ref": "#/definitions/MicroserviceMetadata" },
      "minItems": 1
    },
    "includeApiGateway": {
      "type": "boolean",
      "description": "是否包含API网关",
      "default": true
    },
    "infrastructure": {
      "type": "object",
      "description": "基础设施服务配置",
      "properties": {
        "usePostgreSQL": { "type": "boolean", "default": true },
        "useRedis": { "type": "boolean", "default": true },
        "useRabbitMQ": { "type": "boolean", "default": true },
        "useElasticsearch": { "type": "boolean", "default": false },
        "useSeq": { "type": "boolean", "default": true },
        "usePrometheus": { "type": "boolean", "default": true },
        "useGrafana": { "type": "boolean", "default": true }
      }
    },
    "observability": {
      "type": "object",
      "description": "可观测性配置",
      "properties": {
        "useOpenTelemetry": { "type": "boolean", "default": true },
        "useJaeger": { "type": "boolean", "default": true },
        "useZipkin": { "type": "boolean", "default": false },
        "enableDistributedTracing": { "type": "boolean", "default": true },
        "enableMetrics": { "type": "boolean", "default": true },
        "enableLogging": { "type": "boolean", "default": true }
      }
    },
    "security": {
      "type": "object",
      "properties": {
        "useIdentityServer": { "type": "boolean", "default": true },
        "enableJwtAuthentication": { "type": "boolean", "default": true },
        "enableApiKeyAuthentication": { "type": "boolean", "default": false }
      }
    }
  },
  "definitions": {
    "MicroserviceMetadata": {
      "type": "object",
      "required": ["name", "type"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "^[A-Z][a-zA-Z0-9]*$",
          "description": "微服务名称"
        },
        "type": {
          "type": "string",
          "enum": ["API", "Worker", "Grpc", "SignalR"],
          "description": "微服务类型"
        },
        "description": { "type": "string" },
        "port": {
          "type": "integer",
          "minimum": 1000,
          "maximum": 65535,
          "description": "服务端口"
        },
        "replicas": {
          "type": "integer",
          "minimum": 1,
          "default": 1,
          "description": "副本数量"
        },
        "database": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": true },
            "type": {
              "type": "string",
              "enum": ["PostgreSQL", "MySQL", "SqlServer", "MongoDB"],
              "default": "PostgreSQL"
            },
            "connectionStringName": { "type": "string" }
          }
        },
        "dependencies": {
          "type": "array",
          "description": "依赖的其他微服务或基础设施",
          "items": { "type": "string" }
        },
        "healthCheck": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": true },
            "path": { "type": "string", "default": "/health" },
            "interval": { "type": "integer", "default": 30 }
          }
        }
      }
    }
  }
}
```

---

### 步骤4.5: 创建Schema版本注册表

**目标**: 建立Schema版本管理机制

**新增文件**: `src/SmartAbp.CodeGenerator/Core/Schema/registry.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SmartAbp Schema版本注册表",
  "currentVersion": "1.0.0",
  "schemaVersions": [
    {
      "version": "1.0.0",
      "releaseDate": "2025-01-27",
      "status": "current",
      "description": "初始版本，统一前后端元数据模型",
      "schemas": {
        "entity": "v1/EntityMetadataSchema.json",
        "module": "v1/ModuleMetadataSchema.json",
        "aspire": "v1/AspireSolutionSchema.json"
      },
      "compatibleWith": [],
      "breakingChanges": false
    }
  ],
  "migrations": []
}
```

**验证标准**:
- ✅ 三个核心Schema完整定义
- ✅ Schema版本注册表创建
- ✅ 所有Schema符合JSON Schema Draft 07规范

---

## 🔧 阶段7: C#模型自动生成（4天）

### 步骤7.1: 集成NJsonSchema代码生成工具

**目标**: 从JSON Schema自动生成C# DTO类

**修改文件**: `src/SmartAbp.CodeGenerator/SmartAbp.CodeGenerator.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <!-- ⬅️ 新增：JSON Schema代码生成工具 -->
    <PackageReference Include="NJsonSchema" Version="11.0.0" />
    <PackageReference Include="NJsonSchema.CodeGeneration.CSharp" Version="11.0.0" />
    
    <!-- 现有依赖 -->
    <PackageReference Include="Volo.Abp.Ddd.Application" Version="8.0.0" />
    <PackageReference Include="Microsoft.CodeAnalysis.CSharp" Version="4.8.0" />
    <!-- 其他依赖... -->
  </ItemGroup>

  <!-- ⬅️ 新增：自动生成任务 -->
  <Target Name="GenerateDtosFromSchema" BeforeTargets="BeforeBuild">
    <Exec Command="dotnet run --project $(MSBuildProjectDirectory)/Tools/SchemaCodeGenerator.csproj" />
  </Target>
</Project>
```

---

### 步骤7.2: 创建Schema到C#的代码生成器

**目标**: 编写自动化脚本，从JSON Schema生成C# DTO

**新增文件**: `src/SmartAbp.CodeGenerator/Tools/SchemaCodeGenerator.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="NJsonSchema" Version="11.0.0" />
    <PackageReference Include="NJsonSchema.CodeGeneration.CSharp" Version="11.0.0" />
  </ItemGroup>
</Project>
```

**新增文件**: `src/SmartAbp.CodeGenerator/Tools/Program.cs`

```csharp
using NJsonSchema;
using NJsonSchema.CodeGeneration.CSharp;
using System;
using System.IO;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Tools
{
    /// <summary>
    /// 从JSON Schema自动生成C# DTO代码
    /// </summary>
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("========================================");
            Console.WriteLine("  SmartAbp Schema到C#代码生成器");
            Console.WriteLine("========================================\n");

            var schemaDir = Path.Combine("..", "Core", "Schema", "v1");
            var outputDir = Path.Combine("..", "Services", "Generated");

            // 确保输出目录存在
            Directory.CreateDirectory(outputDir);

            // 生成配置
            var schemas = new[]
            {
                new { Input = "EntityMetadataSchema.json", Output = "EntityMetadataDto.cs", Namespace = "SmartAbp.CodeGenerator.Services.Generated" },
                new { Input = "ModuleMetadataSchema.json", Output = "ModuleMetadataDto.cs", Namespace = "SmartAbp.CodeGenerator.Services.Generated" },
                new { Input = "AspireSolutionSchema.json", Output = "AspireSolutionDto.cs", Namespace = "SmartAbp.CodeGenerator.Services.Generated" }
            };

            foreach (var schema in schemas)
            {
                Console.WriteLine($"[1/3] 读取Schema: {schema.Input}");
                var schemaPath = Path.Combine(schemaDir, schema.Input);

                if (!File.Exists(schemaPath))
                {
                    Console.Error.WriteLine($"  ❌ Schema文件不存在: {schemaPath}");
                    continue;
                }

                var schemaJson = await File.ReadAllTextAsync(schemaPath);

                Console.WriteLine($"[2/3] 解析Schema...");
                var jsonSchema = await JsonSchema.FromJsonAsync(schemaJson);

                Console.WriteLine($"[3/3] 生成C#代码...");

                // 配置代码生成器
                var settings = new CSharpGeneratorSettings
                {
                    Namespace = schema.Namespace,
                    ClassStyle = CSharpClassStyle.Poco,
                    GenerateDataAnnotations = true,
                    GenerateJsonMethods = false,
                    GenerateDefaultValues = true,
                    GenerateNullableReferenceTypes = true,
                    RequiredPropertiesMustBeDefined = true,
                    DateTimeType = "System.DateTime",
                    ArrayType = "System.Collections.Generic.List",
                    DictionaryType = "System.Collections.Generic.Dictionary",
                    PropertyNameGenerator = new CustomPropertyNameGenerator()
                };

                var generator = new CSharpGenerator(jsonSchema, settings);
                var code = generator.GenerateFile();

                // 添加文件头注释
                var header = @"// <auto-generated>
//   此文件由JSON Schema自动生成，请勿手动修改
//   生成时间: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @"
//   Schema版本: 1.0.0
// </auto-generated>

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

";

                code = header + code;

                // 写入文件
                var outputPath = Path.Combine(outputDir, schema.Output);
                await File.WriteAllTextAsync(outputPath, code);

                Console.WriteLine($"  ✅ 生成成功: {schema.Output}\n");
            }

            Console.WriteLine("========================================");
            Console.WriteLine("  ✅ 所有DTO生成完成！");
            Console.WriteLine("========================================");
        }
    }

    /// <summary>
    /// 自定义属性名称生成器（PascalCase）
    /// </summary>
    public class CustomPropertyNameGenerator : IPropertyNameGenerator
    {
        public string Generate(JsonSchemaProperty property)
        {
            // 将JSON属性名转换为PascalCase
            var name = property.Name;
            if (string.IsNullOrEmpty(name)) return name;

            // 首字母大写
            return char.ToUpperInvariant(name[0]) + name.Substring(1);
        }
    }
}
```

**执行生成**:
```bash
cd src/SmartAbp.CodeGenerator
dotnet build
```

**自动生成的C# DTO示例**:

```csharp
// <auto-generated>
//   此文件由JSON Schema自动生成，请勿手动修改
//   生成时间: 2025-01-27 10:00:00
//   Schema版本: 1.0.0
// </auto-generated>

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.CodeGenerator.Services.Generated
{
    /// <summary>
    /// 实体元数据
    /// </summary>
    public class EntityMetadataDto
    {
        [Required]
        [RegularExpression("^[A-Z][a-zA-Z0-9]*$")]
        [StringLength(128)]
        public string Name { get; set; } = default!;

        [Required]
        [StringLength(128)]
        public string Module { get; set; } = default!;

        [RegularExpression("^[A-Z][a-zA-Z0-9]*$")]
        public string? Aggregate { get; set; }

        public string KeyType { get; set; } = "Guid";

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsAggregateRoot { get; set; } = true;

        public bool IsMultiTenant { get; set; } = true;

        public bool IsSoftDelete { get; set; } = true;

        public bool HasExtraProperties { get; set; } = true;

        public List<PropertyMetadataDto> Properties { get; set; } = new();

        public List<NavigationPropertyMetadataDto> NavigationProperties { get; set; } = new();

        public UiConfigDto? XUiConfig { get; set; }

        public BackendConfigDto? XBackendConfig { get; set; }
    }

    /// <summary>
    /// 属性元数据
    /// </summary>
    public class PropertyMetadataDto
    {
        [Required]
        [RegularExpression("^[a-zA-Z][a-zA-Z0-9]*$")]
        [StringLength(128)]
        public string Name { get; set; } = default!;

        [Required]
        public string Type { get; set; } = default!;

        public bool IsRequired { get; set; }

        public bool IsReadOnly { get; set; }

        public bool IsUnique { get; set; }

        [Range(1, 10000)]
        public int? MaxLength { get; set; }

        [Range(0, 10000)]
        public int? MinLength { get; set; }

        public double? MinValue { get; set; }

        public double? MaxValue { get; set; }

        public string? DefaultValue { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public string? DisplayName { get; set; }

        public List<ValidationRuleDto> ValidationRules { get; set; } = new();

        public List<string>? XBackendAnnotations { get; set; }
    }

    // ... 其他生成的类
}
```

**验证标准**:
- ✅ C# DTO自动从Schema生成
- ✅ 包含所有Data Annotations
- ✅ Nullable引用类型正确处理
- ✅ 编译无错误

---

### 步骤7.3: 废弃旧DTO，引用生成的DTO

**目标**: 标记旧DTO为废弃，迁移到自动生成的DTO

**修改文件**: `src/SmartAbp.CodeGenerator/Services/Dtos.cs`

```csharp
using System;
using System.Collections.Generic;
using SmartAbp.CodeGenerator.Services.Generated;  // ⬅️ 引用生成的DTO

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 旧DTO文件（保留3个月兼容期，至2025-04-27）
    /// </summary>

    /// <summary>
    /// @deprecated 请使用 SmartAbp.CodeGenerator.Services.Generated.ModuleMetadataDto
    /// </summary>
    [Obsolete("使用 Generated.ModuleMetadataDto 代替", false)]
    public class ModuleMetadataDto : Generated.ModuleMetadataDto
    {
        // 向后兼容：继承自生成的DTO
    }

    /// <summary>
    /// @deprecated 请使用 Generated.EntityMetadataDto
    /// </summary>
    [Obsolete("使用 Generated.EntityMetadataDto 代替", false)]
    public class EntityDefinition : Generated.EntityMetadataDto
    {
        // 向后兼容
    }

    // ... 其他旧DTO类似处理
}
```

**验证标准**:
- ✅ 旧DTO标记为Obsolete
- ✅ 继承自生成的DTO保持兼容
- ✅ 编译警告显示

---

### 步骤7.4: 重构API Controller使用统一DTO

**目标**: 更新所有API接口使用统一的生成DTO

**修改文件**: `src/SmartAbp.HttpApi/Controllers/CodeGenerationController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Services.Generated;  // ⬅️ 使用生成的DTO
using System.Threading.Tasks;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.HttpApi.Controllers
{
    [Route("api/code-generator")]
    [ApiController]
    public class CodeGenerationController : AbpControllerBase
    {
        private readonly ICodeGenerationAppService _codeGenerationService;

        public CodeGenerationController(ICodeGenerationAppService codeGenerationService)
        {
            _codeGenerationService = codeGenerationService;
        }

        /// <summary>
        /// 统一元数据代码生成（新API）
        /// </summary>
        [HttpPost("unified-metadata")]
        public async Task<GeneratedModuleDto> GenerateFromUnifiedMetadata(
            [FromBody] UnifiedMetadataInputDto input)
        {
            return await _codeGenerationService.GenerateFromUnifiedMetadataAsync(input);
        }

        /// <summary>
        /// 验证元数据Schema
        /// </summary>
        [HttpPost("validate-schema")]
        public async Task<SchemaValidationResultDto> ValidateSchema(
            [FromBody] ValidateSchemaInputDto input)
        {
            return await _codeGenerationService.ValidateSchemaAsync(input);
        }

        /// <summary>
        /// 获取当前Schema版本
        /// </summary>
        [HttpGet("schema-version/current")]
        public async Task<SchemaVersionDto> GetCurrentSchemaVersion()
        {
            return await _codeGenerationService.GetCurrentSchemaVersionAsync();
        }

        /// <summary>
        /// 加载实体元数据
        /// </summary>
        [HttpGet("entity/{entityName}")]
        public async Task<EntityMetadataDto> LoadEntityMetadata(string entityName)
        {
            return await _codeGenerationService.LoadEntityMetadataAsync(entityName);
        }

        /// <summary>
        /// 保存实体元数据
        /// </summary>
        [HttpPost("entity")]
        public async Task SaveEntityMetadata([FromBody] EntityMetadataDto metadata)
        {
            await _codeGenerationService.SaveEntityMetadataAsync(metadata);
        }

        /// <summary>
        /// 删除实体元数据
        /// </summary>
        [HttpDelete("entity/{entityName}")]
        public async Task DeleteEntityMetadata(string entityName)
        {
            await _codeGenerationService.DeleteEntityMetadataAsync(entityName);
        }

        /// <summary>
        /// 批量加载模块实体
        /// </summary>
        [HttpGet("entities/by-module/{moduleName}")]
        public async Task<List<EntityMetadataDto>> LoadEntitiesByModule(string moduleName)
        {
            return await _codeGenerationService.LoadEntitiesByModuleAsync(moduleName);
        }

        /// <summary>
        /// 加载模块元数据
        /// </summary>
        [HttpGet("module/{moduleName}")]
        public async Task<ModuleMetadataDto> LoadModuleMetadata(string moduleName)
        {
            return await _codeGenerationService.LoadModuleMetadataAsync(moduleName);
        }

        /// <summary>
        /// 保存模块元数据
        /// </summary>
        [HttpPost("module")]
        public async Task SaveModuleMetadata([FromBody] ModuleMetadataDto metadata)
        {
            await _codeGenerationService.SaveModuleMetadataAsync(metadata);
        }

        /// <summary>
        /// 删除模块元数据
        /// </summary>
        [HttpDelete("module/{moduleName}")]
        public async Task DeleteModuleMetadata(string moduleName)
        {
            await _codeGenerationService.DeleteModuleMetadataAsync(moduleName);
        }

        /// <summary>
        /// 加载所有模块
        /// </summary>
        [HttpGet("modules")]
        public async Task<List<ModuleMetadataDto>> LoadAllModules()
        {
            return await _codeGenerationService.LoadAllModulesAsync();
        }

        /// <summary>
        /// 旧API（保留兼容，标记为Obsolete）
        /// </summary>
        [HttpPost("generate")]
        [Obsolete("请使用 /api/code-generator/unified-metadata 代替")]
        public async Task<object> Generate([FromBody] object input)
        {
            // 向后兼容处理
            // ...
            throw new NotImplementedException("旧API已废弃，请使用unified-metadata");
        }
    }
}
```

**验证标准**:
- ✅ 所有API使用生成的DTO
- ✅ 新API完整实现
- ✅ 旧API标记为Obsolete
- ✅ Swagger文档正确生成

---

## 🎯 阶段8: 代码生成器重构（5天）

### 步骤8.1: 重构CrudArchitectureGenerator

**目标**: 适配统一元数据模型

**修改文件**: `src/SmartAbp.CodeGenerator/Core/CrudArchitectureGenerator.cs`

```csharp
using SmartAbp.CodeGenerator.Services.Generated;  // ⬅️ 使用生成的DTO
using System;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Core
{
    /// <summary>
    /// CRUD架构代码生成器（统一元数据版本）
    /// </summary>
    public class CrudArchitectureGenerator
    {
        private readonly IEmbeddedTemplateExtractor _templateExtractor;
        private readonly SimpleVariableReplacer _variableReplacer;
        private readonly EnhancedModelProcessor _modelProcessor;

        public CrudArchitectureGenerator(
            IEmbeddedTemplateExtractor templateExtractor,
            SimpleVariableReplacer variableReplacer,
            EnhancedModelProcessor modelProcessor)
        {
            _templateExtractor = templateExtractor;
            _variableReplacer = variableReplacer;
            _modelProcessor = modelProcessor;
        }

        /// <summary>
        /// 从统一元数据生成CRUD代码
        /// </summary>
        public async Task<GeneratedModuleDto> GenerateAsync(EntityMetadataDto metadata)
        {
            var result = new GeneratedModuleDto
            {
                Success = true,
                ModuleId = $"{metadata.Module}.{metadata.Name}",
                GeneratedFiles = new List<GeneratedFileDto>(),
                Errors = new List<string>(),
                Warnings = new List<string>()
            };

            try
            {
                // 1. 验证元数据
                ValidateMetadata(metadata);

                // 2. 处理元数据（计算派生字段）
                var processedMetadata = _modelProcessor.Process(metadata);

                // 3. 生成Domain层
                if (metadata.XBackendConfig?.GenerateRepository != false)
                {
                    var domainFiles = await GenerateDomainLayerAsync(processedMetadata);
                    result.GeneratedFiles.AddRange(domainFiles);
                }

                // 4. 生成Application层
                if (metadata.XBackendConfig?.GenerateAppService != false)
                {
                    var applicationFiles = await GenerateApplicationLayerAsync(processedMetadata);
                    result.GeneratedFiles.AddRange(applicationFiles);
                }

                // 5. 生成HttpApi层
                if (metadata.XBackendConfig?.GenerateController != false)
                {
                    var httpApiFiles = await GenerateHttpApiLayerAsync(processedMetadata);
                    result.GeneratedFiles.AddRange(httpApiFiles);
                }

                // 6. 生成单元测试
                if (metadata.XBackendConfig?.GenerateUnitTests != false)
                {
                    var testFiles = await GenerateUnitTestsAsync(processedMetadata);
                    result.GeneratedFiles.AddRange(testFiles);
                }

                // 7. 生成前端代码（Vue3）
                var frontendFiles = await GenerateFrontendAsync(processedMetadata);
                result.GeneratedFiles.AddRange(frontendFiles);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Errors.Add($"生成失败: {ex.Message}");
            }

            return result;
        }

        private void ValidateMetadata(EntityMetadataDto metadata)
        {
            if (string.IsNullOrEmpty(metadata.Name))
            {
                throw new ArgumentException("实体名称不能为空");
            }

            if (string.IsNullOrEmpty(metadata.Module))
            {
                throw new ArgumentException("模块名称不能为空");
            }

            // 更多验证...
        }

        private async Task<List<GeneratedFileDto>> GenerateDomainLayerAsync(EntityMetadataDto metadata)
        {
            var files = new List<GeneratedFileDto>();

            // 生成实体类
            var entityTemplate = await _templateExtractor.ExtractAsync("Domain/Entity.template");
            var entityCode = _variableReplacer.Replace(entityTemplate, metadata);

            files.Add(new GeneratedFileDto
            {
                Path = $"src/{metadata.Module}.Domain/Entities/{metadata.Name}.cs",
                Content = entityCode,
                Language = "csharp"
            });

            // 生成Repository接口
            var repoInterfaceTemplate = await _templateExtractor.ExtractAsync("Domain/IRepository.template");
            var repoInterfaceCode = _variableReplacer.Replace(repoInterfaceTemplate, metadata);

            files.Add(new GeneratedFileDto
            {
                Path = $"src/{metadata.Module}.Domain/Repositories/I{metadata.Name}Repository.cs",
                Content = repoInterfaceCode,
                Language = "csharp"
            });

            return files;
        }

        // 其他生成方法类似...
    }
}
```

**验证标准**:
- ✅ 使用统一元数据DTO
- ✅ 根据`x-backend-config`控制生成内容
- ✅ 生成的代码符合ABP规范

---

### 步骤8.2: 重构AspireMicroservicesGenerator

**目标**: 适配Aspire方案统一元数据

**修改文件**: `src/SmartAbp.CodeGenerator/Aspire/AspireMicroservicesGenerator.cs`

```csharp
using SmartAbp.CodeGenerator.Services.Generated;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Aspire
{
    /// <summary>
    /// Aspire微服务代码生成器（统一元数据版本）
    /// </summary>
    public class AspireMicroservicesGenerator
    {
        private readonly IEmbeddedTemplateExtractor _templateExtractor;
        private readonly SimpleVariableReplacer _variableReplacer;

        public AspireMicroservicesGenerator(
            IEmbeddedTemplateExtractor templateExtractor,
            SimpleVariableReplacer variableReplacer)
        {
            _templateExtractor = templateExtractor;
            _variableReplacer = variableReplacer;
        }

        /// <summary>
        /// 从统一元数据生成Aspire微服务方案
        /// </summary>
        public async Task<GeneratedModuleDto> GenerateAsync(AspireSolutionDto metadata)
        {
            var result = new GeneratedModuleDto
            {
                Success = true,
                ModuleId = metadata.SolutionName,
                GeneratedFiles = new List<GeneratedFileDto>(),
                Errors = new List<string>(),
                Warnings = new List<string>()
            };

            try
            {
                // 1. 验证元数据
                ValidateMetadata(metadata);

                // 2. 生成AppHost项目
                var appHostFiles = await GenerateAppHostAsync(metadata);
                result.GeneratedFiles.AddRange(appHostFiles);

                // 3. 生成ServiceDefaults项目
                var serviceDefaultsFiles = await GenerateServiceDefaultsAsync(metadata);
                result.GeneratedFiles.AddRange(serviceDefaultsFiles);

                // 4. 生成每个微服务
                foreach (var microservice in metadata.Microservices)
                {
                    var microserviceFiles = await GenerateMicroserviceAsync(metadata, microservice);
                    result.GeneratedFiles.AddRange(microserviceFiles);
                }

                // 5. 生成API Gateway（如果启用）
                if (metadata.IncludeApiGateway)
                {
                    var gatewayFiles = await GenerateApiGatewayAsync(metadata);
                    result.GeneratedFiles.AddRange(gatewayFiles);
                }

                // 6. 生成基础设施配置
                var infrastructureFiles = await GenerateInfrastructureAsync(metadata);
                result.GeneratedFiles.AddRange(infrastructureFiles);

                // 7. 生成可观测性配置
                var observabilityFiles = await GenerateObservabilityAsync(metadata);
                result.GeneratedFiles.AddRange(observabilityFiles);

                // 8. 生成Solution文件和README
                var solutionFiles = await GenerateSolutionFilesAsync(metadata);
                result.GeneratedFiles.AddRange(solutionFiles);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Errors.Add($"生成Aspire方案失败: {ex.Message}");
            }

            return result;
        }

        private void ValidateMetadata(AspireSolutionDto metadata)
        {
            if (string.IsNullOrEmpty(metadata.SolutionName))
            {
                throw new ArgumentException("解决方案名称不能为空");
            }

            if (string.IsNullOrEmpty(metadata.RootNamespace))
            {
                throw new ArgumentException("根命名空间不能为空");
            }

            if (metadata.Microservices == null || metadata.Microservices.Count == 0)
            {
                throw new ArgumentException("至少需要一个微服务");
            }
        }

        private async Task<List<GeneratedFileDto>> GenerateAppHostAsync(AspireSolutionDto metadata)
        {
            var files = new List<GeneratedFileDto>();

            // 生成Program.cs
            var programTemplate = await _templateExtractor.ExtractAsync("Aspire/AppHost.Program.template");
            var programCode = _variableReplacer.Replace(programTemplate, metadata);

            files.Add(new GeneratedFileDto
            {
                Path = $"src/{metadata.SolutionName}.AppHost/Program.cs",
                Content = programCode,
                Language = "csharp"
            });

            // 生成项目文件
            var csprojTemplate = await _templateExtractor.ExtractAsync("Aspire/AppHost.csproj.template");
            var csprojContent = _variableReplacer.Replace(csprojTemplate, metadata);

            files.Add(new GeneratedFileDto
            {
                Path = $"src/{metadata.SolutionName}.AppHost/{metadata.SolutionName}.AppHost.csproj",
                Content = csprojContent,
                Language = "csharp"
            });

            // 生成appsettings.json
            var appSettingsTemplate = await _templateExtractor.ExtractAsync("Aspire/AppHost.appsettings.template");
            var appSettingsContent = _variableReplacer.Replace(appSettingsTemplate, metadata);

            files.Add(new GeneratedFileDto
            {
                Path = $"src/{metadata.SolutionName}.AppHost/appsettings.json",
                Content = appSettingsContent,
                Language = "json"
            });

            return files;
        }

        // 其他生成方法...
    }
}
```

**验证标准**:
- ✅ 使用AspireSolutionDto
- ✅ 根据`infrastructure`和`observability`配置生成
- ✅ 生成完整的Aspire编排方案

---

### 步骤8.3: 实现AppService统一接口

**目标**: 统一所有代码生成入口

**修改文件**: `src/SmartAbp.CodeGenerator/Services/ICodeGenerationAppService.cs`

```csharp
using SmartAbp.CodeGenerator.Services.Generated;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 代码生成应用服务接口（统一元数据版本）
    /// </summary>
    public interface ICodeGenerationAppService : IApplicationService
    {
        // ========== 统一元数据代码生成 ==========

        /// <summary>
        /// 从统一元数据生成代码
        /// </summary>
        Task<GeneratedModuleDto> GenerateFromUnifiedMetadataAsync(UnifiedMetadataInputDto input);

        // ========== Schema验证 ==========

        /// <summary>
        /// 验证元数据Schema
        /// </summary>
        Task<SchemaValidationResultDto> ValidateSchemaAsync(ValidateSchemaInputDto input);

        /// <summary>
        /// 获取当前Schema版本
        /// </summary>
        Task<SchemaVersionDto> GetCurrentSchemaVersionAsync();

        // ========== 实体元数据管理 ==========

        /// <summary>
        /// 加载实体元数据
        /// </summary>
        Task<EntityMetadataDto> LoadEntityMetadataAsync(string entityName);

        /// <summary>
        /// 保存实体元数据
        /// </summary>
        Task SaveEntityMetadataAsync(EntityMetadataDto metadata);

        /// <summary>
        /// 删除实体元数据
        /// </summary>
        Task DeleteEntityMetadataAsync(string entityName);

        /// <summary>
        /// 批量加载模块实体
        /// </summary>
        Task<List<EntityMetadataDto>> LoadEntitiesByModuleAsync(string moduleName);

        // ========== 模块元数据管理 ==========

        /// <summary>
        /// 加载模块元数据
        /// </summary>
        Task<ModuleMetadataDto> LoadModuleMetadataAsync(string moduleName);

        /// <summary>
        /// 保存模块元数据
        /// </summary>
        Task SaveModuleMetadataAsync(ModuleMetadataDto metadata);

        /// <summary>
        /// 删除模块元数据
        /// </summary>
        Task DeleteModuleMetadataAsync(string moduleName);

        /// <summary>
        /// 加载所有模块
        /// </summary>
        Task<List<ModuleMetadataDto>> LoadAllModulesAsync();

        // ========== Aspire方案管理 ==========

        /// <summary>
        /// 加载Aspire方案元数据
        /// </summary>
        Task<AspireSolutionDto> LoadAspireSolutionAsync(string solutionName);

        /// <summary>
        /// 保存Aspire方案元数据
        /// </summary>
        Task SaveAspireSolutionAsync(AspireSolutionDto metadata);
    }
}
```

**实现文件**: `src/SmartAbp.CodeGenerator/Services/CodeGenerationAppService.cs`

```csharp
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;
using SmartAbp.CodeGenerator.Aspire;
using SmartAbp.CodeGenerator.Services.Generated;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 代码生成应用服务（统一元数据版本）
    /// </summary>
    public class CodeGenerationAppService : ApplicationService, ICodeGenerationAppService
    {
        private readonly CrudArchitectureGenerator _crudGenerator;
        private readonly AspireMicroservicesGenerator _aspireGenerator;
        private readonly IMetadataRepository _metadataRepository;
        private readonly ISchemaValidator _schemaValidator;
        private readonly ISchemaRegistry _schemaRegistry;

        public CodeGenerationAppService(
            CrudArchitectureGenerator crudGenerator,
            AspireMicroservicesGenerator aspireGenerator,
            IMetadataRepository metadataRepository,
            ISchemaValidator schemaValidator,
            ISchemaRegistry schemaRegistry)
        {
            _crudGenerator = crudGenerator;
            _aspireGenerator = aspireGenerator;
            _metadataRepository = metadataRepository;
            _schemaValidator = schemaValidator;
            _schemaRegistry = schemaRegistry;
        }

        /// <summary>
        /// 从统一元数据生成代码
        /// </summary>
        public async Task<GeneratedModuleDto> GenerateFromUnifiedMetadataAsync(UnifiedMetadataInputDto input)
        {
            Logger.LogInformation($"开始生成代码，元数据类型: {input.MetadataType}");

            // 1. 验证Schema版本
            var currentVersion = await _schemaRegistry.GetCurrentVersionAsync();
            if (input.SchemaVersion != currentVersion.Version)
            {
                Logger.LogWarning($"Schema版本不一致: 输入{input.SchemaVersion}, 当前{currentVersion.Version}");
            }

            // 2. 验证元数据
            var validationResult = await _schemaValidator.ValidateAsync(input.Metadata, input.MetadataType);
            if (!validationResult.IsValid)
            {
                return new GeneratedModuleDto
                {
                    Success = false,
                    Errors = validationResult.Errors.Select(e => e.Message).ToList()
                };
            }

            // 3. 根据类型调用相应的生成器
            GeneratedModuleDto result;

            switch (input.MetadataType)
            {
                case "Entity":
                    var entityMetadata = (EntityMetadataDto)input.Metadata;
                    result = await _crudGenerator.GenerateAsync(entityMetadata);
                    break;

                case "Module":
                    var moduleMetadata = (ModuleMetadataDto)input.Metadata;
                    result = await GenerateModuleAsync(moduleMetadata);
                    break;

                case "AspireSolution":
                    var aspireMetadata = (AspireSolutionDto)input.Metadata;
                    result = await _aspireGenerator.GenerateAsync(aspireMetadata);
                    break;

                default:
                    throw new ArgumentException($"不支持的元数据类型: {input.MetadataType}");
            }

            Logger.LogInformation($"代码生成完成，成功: {result.Success}");

            return result;
        }

        private async Task<GeneratedModuleDto> GenerateModuleAsync(ModuleMetadataDto metadata)
        {
            // 模块级别代码生成（包含路由、Store等）
            // 实现省略...
            throw new NotImplementedException();
        }

        // 其他接口实现...
    }
}
```

**验证标准**:
- ✅ 统一接口完整实现
- ✅ Schema验证集成
- ✅ 所有元数据类型支持

---

## 🔍 阶段9: Schema验证器实现（3天）

### 步骤9.1: 实现C# Schema验证器

**目标**: 使用NJsonSchema实现运行时元数据验证

**新增文件**: `src/SmartAbp.CodeGenerator/Core/Schema/Validation/SchemaValidator.cs`

```csharp
using NJsonSchema;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Core.Schema.Validation
{
    /// <summary>
    /// Schema验证器接口
    /// </summary>
    public interface ISchemaValidator
    {
        Task<SchemaValidationResult> ValidateAsync(object metadata, string metadataType);
    }

    /// <summary>
    /// Schema验证结果
    /// </summary>
    public class SchemaValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationError> Errors { get; set; } = new();
        public List<ValidationWarning> Warnings { get; set; } = new();
        public string SchemaVersion { get; set; } = string.Empty;
    }

    public class ValidationError
    {
        public string Path { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class ValidationWarning
    {
        public string Path { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
    }

    /// <summary>
    /// Schema验证器实现
    /// </summary>
    public class SchemaValidator : ISchemaValidator
    {
        private readonly Dictionary<string, JsonSchema> _schemaCache = new();
        private readonly string _schemaBasePath;

        public SchemaValidator(string? schemaBasePath = null)
        {
            _schemaBasePath = schemaBasePath ?? Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                "Core", "Schema", "v1"
            );
        }

        public async Task<SchemaValidationResult> ValidateAsync(object metadata, string metadataType)
        {
            var result = new SchemaValidationResult { SchemaVersion = "1.0.0" };

            try
            {
                // 1. 加载对应的Schema
                var schema = await GetSchemaAsync(metadataType);

                // 2. 序列化元数据为JSON
                var metadataJson = System.Text.Json.JsonSerializer.Serialize(metadata);

                // 3. 执行验证
                var errors = schema.Validate(metadataJson);

                // 4. 转换验证错误
                if (errors.Any())
                {
                    result.IsValid = false;
                    result.Errors = errors.Select(e => new ValidationError
                    {
                        Path = e.Path,
                        Message = e.ToString(),
                        Code = e.Kind.ToString()
                    }).ToList();
                }
                else
                {
                    result.IsValid = true;
                }
            }
            catch (Exception ex)
            {
                result.IsValid = false;
                result.Errors.Add(new ValidationError
                {
                    Path = "root",
                    Message = $"Schema验证异常: {ex.Message}",
                    Code = "VALIDATION_EXCEPTION"
                });
            }

            return result;
        }

        private async Task<JsonSchema> GetSchemaAsync(string metadataType)
        {
            var cacheKey = metadataType.ToLowerInvariant();

            // 检查缓存
            if (_schemaCache.ContainsKey(cacheKey))
            {
                return _schemaCache[cacheKey];
            }

            // 加载Schema文件
            var schemaFileName = metadataType switch
            {
                "Entity" => "EntityMetadataSchema.json",
                "Module" => "ModuleMetadataSchema.json",
                "AspireSolution" => "AspireSolutionSchema.json",
                _ => throw new ArgumentException($"未知的元数据类型: {metadataType}")
            };

            var schemaPath = Path.Combine(_schemaBasePath, schemaFileName);

            if (!File.Exists(schemaPath))
            {
                throw new FileNotFoundException($"Schema文件不存在: {schemaPath}");
            }

            var schemaJson = await File.ReadAllTextAsync(schemaPath);
            var schema = await JsonSchema.FromJsonAsync(schemaJson);

            // 缓存
            _schemaCache[cacheKey] = schema;

            return schema;
        }

        /// <summary>
        /// 清空Schema缓存（用于热重载）
        /// </summary>
        public void ClearCache()
        {
            _schemaCache.Clear();
        }
    }
}
```

---

### 步骤9.2: 实现Schema版本注册表

**新增文件**: `src/SmartAbp.CodeGenerator/Core/Schema/Validation/SchemaRegistry.cs`

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Core.Schema.Validation
{
    public interface ISchemaRegistry
    {
        Task<SchemaVersion> GetCurrentVersionAsync();
        Task<bool> IsCompatibleAsync(string fromVersion, string toVersion);
        Task<List<SchemaVersion>> GetAllVersionsAsync();
    }

    public class SchemaVersion
    {
        public string Version { get; set; } = string.Empty;
        public string ReleaseDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, string> Schemas { get; set; } = new();
        public List<string> CompatibleWith { get; set; } = new();
        public bool BreakingChanges { get; set; }
    }

    public class SchemaRegistryData
    {
        public string CurrentVersion { get; set; } = string.Empty;
        public List<SchemaVersion> SchemaVersions { get; set; } = new();
    }

    public class SchemaRegistry : ISchemaRegistry
    {
        private readonly string _registryPath;
        private SchemaRegistryData? _registry;

        public SchemaRegistry(string? registryPath = null)
        {
            _registryPath = registryPath ?? Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                "Core", "Schema", "registry.json"
            );
        }

        public async Task<SchemaVersion> GetCurrentVersionAsync()
        {
            var registry = await LoadRegistryAsync();
            var current = registry.SchemaVersions
                .FirstOrDefault(v => v.Status == "current");

            if (current == null)
            {
                throw new InvalidOperationException("未找到当前Schema版本");
            }

            return current;
        }

        public async Task<bool> IsCompatibleAsync(string fromVersion, string toVersion)
        {
            var registry = await LoadRegistryAsync();
            var targetVersion = registry.SchemaVersions
                .FirstOrDefault(v => v.Version == toVersion);

            if (targetVersion == null)
            {
                return false;
            }

            // 同版本总是兼容
            if (fromVersion == toVersion)
            {
                return true;
            }

            // 检查兼容性列表
            return targetVersion.CompatibleWith.Contains(fromVersion);
        }

        public async Task<List<SchemaVersion>> GetAllVersionsAsync()
        {
            var registry = await LoadRegistryAsync();
            return registry.SchemaVersions;
        }

        private async Task<SchemaRegistryData> LoadRegistryAsync()
        {
            if (_registry != null)
            {
                return _registry;
            }

            if (!File.Exists(_registryPath))
            {
                throw new FileNotFoundException($"Schema注册表文件不存在: {_registryPath}");
            }

            var json = await File.ReadAllTextAsync(_registryPath);
            _registry = JsonSerializer.Deserialize<SchemaRegistryData>(json);

            if (_registry == null)
            {
                throw new InvalidOperationException("Schema注册表解析失败");
            }

            return _registry;
        }

        public void ClearCache()
        {
            _registry = null;
        }
    }
}
```

---

### 步骤9.3: 实现元数据持久化Repository

**目标**: 提供元数据的存储和检索能力

**新增文件**: `src/SmartAbp.CodeGenerator/Services/Repositories/IMetadataRepository.cs`

```csharp
using SmartAbp.CodeGenerator.Services.Generated;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 元数据仓储接口
    /// 负责元数据的持久化存储和检索
    /// </summary>
    public interface IMetadataRepository
    {
        // ========== 实体元数据 ==========
        Task<EntityMetadataDto?> GetEntityAsync(string entityName);
        Task SaveEntityAsync(EntityMetadataDto metadata);
        Task DeleteEntityAsync(string entityName);
        Task<List<EntityMetadataDto>> GetEntitiesByModuleAsync(string moduleName);
        Task<List<EntityMetadataDto>> GetAllEntitiesAsync();

        // ========== 模块元数据 ==========
        Task<ModuleMetadataDto?> GetModuleAsync(string moduleName);
        Task SaveModuleAsync(ModuleMetadataDto metadata);
        Task DeleteModuleAsync(string moduleName);
        Task<List<ModuleMetadataDto>> GetAllModulesAsync();

        // ========== Aspire方案 ==========
        Task<AspireSolutionDto?> GetAspireSolutionAsync(string solutionName);
        Task SaveAspireSolutionAsync(AspireSolutionDto metadata);
        Task DeleteAspireSolutionAsync(string solutionName);
        Task<List<AspireSolutionDto>> GetAllAspireSolutionsAsync();

        // ========== 元数据查询 ==========
        Task<bool> ExistsAsync(string name, string type);
        Task<List<string>> SearchAsync(string keyword, string type);
    }
}
```

**实现文件**: `src/SmartAbp.CodeGenerator/Services/Repositories/FileBasedMetadataRepository.cs`

```csharp
using SmartAbp.CodeGenerator.Services.Generated;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SmartAbp.CodeGenerator.Services.Repositories
{
    /// <summary>
    /// 基于文件系统的元数据仓储实现
    /// 适合开发阶段和中小型项目
    /// </summary>
    public class FileBasedMetadataRepository : IMetadataRepository
    {
        private readonly string _baseDirectory;
        private readonly ILogger<FileBasedMetadataRepository> _logger;

        public FileBasedMetadataRepository(
            ILogger<FileBasedMetadataRepository> logger,
            string? baseDirectory = null)
        {
            _logger = logger;
            _baseDirectory = baseDirectory ?? Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                "Data", "Metadata"
            );

            // 确保目录存在
            Directory.CreateDirectory(Path.Combine(_baseDirectory, "Entities"));
            Directory.CreateDirectory(Path.Combine(_baseDirectory, "Modules"));
            Directory.CreateDirectory(Path.Combine(_baseDirectory, "AspireSolutions"));
        }

        // ========== 实体元数据 ==========

        public async Task<EntityMetadataDto?> GetEntityAsync(string entityName)
        {
            var filePath = GetEntityFilePath(entityName);

            if (!File.Exists(filePath))
            {
                return null;
            }

            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<EntityMetadataDto>(json);
        }

        public async Task SaveEntityAsync(EntityMetadataDto metadata)
        {
            var filePath = GetEntityFilePath(metadata.Name);
            var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(filePath, json);
            _logger.LogInformation($"实体元数据已保存: {metadata.Name}");
        }

        public async Task DeleteEntityAsync(string entityName)
        {
            var filePath = GetEntityFilePath(entityName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation($"实体元数据已删除: {entityName}");
            }
        }

        public async Task<List<EntityMetadataDto>> GetEntitiesByModuleAsync(string moduleName)
        {
            var allEntities = await GetAllEntitiesAsync();
            return allEntities.Where(e => e.Module == moduleName).ToList();
        }

        public async Task<List<EntityMetadataDto>> GetAllEntitiesAsync()
        {
            var directory = Path.Combine(_baseDirectory, "Entities");
            var files = Directory.GetFiles(directory, "*.json");

            var entities = new List<EntityMetadataDto>();

            foreach (var file in files)
            {
                var json = await File.ReadAllTextAsync(file);
                var entity = JsonSerializer.Deserialize<EntityMetadataDto>(json);
                if (entity != null)
                {
                    entities.Add(entity);
                }
            }

            return entities;
        }

        // ========== 模块元数据 ==========

        public async Task<ModuleMetadataDto?> GetModuleAsync(string moduleName)
        {
            var filePath = GetModuleFilePath(moduleName);

            if (!File.Exists(filePath))
            {
                return null;
            }

            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<ModuleMetadataDto>(json);
        }

        public async Task SaveModuleAsync(ModuleMetadataDto metadata)
        {
            var filePath = GetModuleFilePath(metadata.Name);
            var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(filePath, json);
            _logger.LogInformation($"模块元数据已保存: {metadata.Name}");
        }

        public async Task DeleteModuleAsync(string moduleName)
        {
            var filePath = GetModuleFilePath(moduleName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation($"模块元数据已删除: {moduleName}");
            }
        }

        public async Task<List<ModuleMetadataDto>> GetAllModulesAsync()
        {
            var directory = Path.Combine(_baseDirectory, "Modules");
            var files = Directory.GetFiles(directory, "*.json");

            var modules = new List<ModuleMetadataDto>();

            foreach (var file in files)
            {
                var json = await File.ReadAllTextAsync(file);
                var module = JsonSerializer.Deserialize<ModuleMetadataDto>(json);
                if (module != null)
                {
                    modules.Add(module);
                }
            }

            return modules;
        }

        // ========== Aspire方案 ==========

        public async Task<AspireSolutionDto?> GetAspireSolutionAsync(string solutionName)
        {
            var filePath = GetAspireSolutionFilePath(solutionName);

            if (!File.Exists(filePath))
            {
                return null;
            }

            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<AspireSolutionDto>(json);
        }

        public async Task SaveAspireSolutionAsync(AspireSolutionDto metadata)
        {
            var filePath = GetAspireSolutionFilePath(metadata.SolutionName);
            var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(filePath, json);
            _logger.LogInformation($"Aspire方案元数据已保存: {metadata.SolutionName}");
        }

        public async Task DeleteAspireSolutionAsync(string solutionName)
        {
            var filePath = GetAspireSolutionFilePath(solutionName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation($"Aspire方案元数据已删除: {solutionName}");
            }
        }

        public async Task<List<AspireSolutionDto>> GetAllAspireSolutionsAsync()
        {
            var directory = Path.Combine(_baseDirectory, "AspireSolutions");
            var files = Directory.GetFiles(directory, "*.json");

            var solutions = new List<AspireSolutionDto>();

            foreach (var file in files)
            {
                var json = await File.ReadAllTextAsync(file);
                var solution = JsonSerializer.Deserialize<AspireSolutionDto>(json);
                if (solution != null)
                {
                    solutions.Add(solution);
                }
            }

            return solutions;
        }

        // ========== 辅助方法 ==========

        public async Task<bool> ExistsAsync(string name, string type)
        {
            var filePath = type switch
            {
                "Entity" => GetEntityFilePath(name),
                "Module" => GetModuleFilePath(name),
                "AspireSolution" => GetAspireSolutionFilePath(name),
                _ => throw new ArgumentException($"未知类型: {type}")
            };

            return File.Exists(filePath);
        }

        public async Task<List<string>> SearchAsync(string keyword, string type)
        {
            var directory = type switch
            {
                "Entity" => Path.Combine(_baseDirectory, "Entities"),
                "Module" => Path.Combine(_baseDirectory, "Modules"),
                "AspireSolution" => Path.Combine(_baseDirectory, "AspireSolutions"),
                _ => throw new ArgumentException($"未知类型: {type}")
            };

            var files = Directory.GetFiles(directory, "*.json");
            var results = new List<string>();

            foreach (var file in files)
            {
                var fileName = Path.GetFileNameWithoutExtension(file);
                if (fileName.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                {
                    results.Add(fileName);
                }
            }

            return results;
        }

        private string GetEntityFilePath(string entityName)
        {
            return Path.Combine(_baseDirectory, "Entities", $"{entityName}.json");
        }

        private string GetModuleFilePath(string moduleName)
        {
            return Path.Combine(_baseDirectory, "Modules", $"{moduleName}.json");
        }

        private string GetAspireSolutionFilePath(string solutionName)
        {
            return Path.Combine(_baseDirectory, "AspireSolutions", $"{solutionName}.json");
        }
    }
}
```

---

### 步骤9.4: 依赖注入配置

**目标**: 注册所有新服务到ABP DI容器

**修改文件**: `src/SmartAbp.CodeGenerator/SmartAbpCodeGeneratorModule.cs`

```csharp
using Microsoft.Extensions.DependencyInjection;
using SmartAbp.CodeGenerator.Core;
using SmartAbp.CodeGenerator.Core.Schema.Validation;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Services.Repositories;
using SmartAbp.CodeGenerator.Aspire;
using Volo.Abp.Modularity;

namespace SmartAbp.CodeGenerator
{
    [DependsOn(
        typeof(AbpDddApplicationModule),
        typeof(AbpAutoMapperModule)
    )]
    public class SmartAbpCodeGeneratorModule : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
            // ========== 统一元数据相关服务 ==========
            
            // Schema验证器
            context.Services.AddSingleton<ISchemaValidator, SchemaValidator>();
            context.Services.AddSingleton<ISchemaRegistry, SchemaRegistry>();
            
            // 元数据仓储（可切换实现：File-based, Database-based, Redis-based）
            context.Services.AddSingleton<IMetadataRepository, FileBasedMetadataRepository>();
            
            // 代码生成器
            context.Services.AddTransient<CrudArchitectureGenerator>();
            context.Services.AddTransient<AspireMicroservicesGenerator>();
            
            // 模板处理
            context.Services.AddSingleton<IEmbeddedTemplateExtractor, EmbeddedTemplateExtractor>();
            context.Services.AddTransient<SimpleVariableReplacer>();
            context.Services.AddTransient<EnhancedModelProcessor>();
            
            // 内存管理
            context.Services.AddSingleton<AdvancedMemoryManager>();
            
            // 应用服务
            context.Services.AddTransient<ICodeGenerationAppService, CodeGenerationAppService>();
        }
    }
}
```

**验证标准**:
- ✅ 所有服务正确注册
- ✅ 依赖注入无循环依赖
- ✅ 编译无错误

---

## 🧪 阶段10: 单元测试与集成测试（3天）

### 步骤10.1: Schema验证器测试

**新增文件**: `tests/SmartAbp.CodeGenerator.Tests/Schema/SchemaValidatorTests.cs`

```csharp
using SmartAbp.CodeGenerator.Core.Schema.Validation;
using SmartAbp.CodeGenerator.Services.Generated;
using System.Threading.Tasks;
using Xunit;

namespace SmartAbp.CodeGenerator.Tests.Schema
{
    public class SchemaValidatorTests
    {
        private readonly ISchemaValidator _validator;

        public SchemaValidatorTests()
        {
            _validator = new SchemaValidator();
        }

        [Fact]
        public async Task Should_Validate_Valid_EntityMetadata()
        {
            // Arrange
            var metadata = new EntityMetadataDto
            {
                Name = "Book",
                Module = "Library",
                KeyType = "Guid",
                IsAggregateRoot = true,
                Properties = new List<PropertyMetadataDto>
                {
                    new PropertyMetadataDto
                    {
                        Name = "title",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 200
                    }
                }
            };

            // Act
            var result = await _validator.ValidateAsync(metadata, "Entity");

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task Should_Reject_Invalid_EntityName()
        {
            // Arrange
            var metadata = new EntityMetadataDto
            {
                Name = "book",  // 应该是PascalCase
                Module = "Library"
            };

            // Act
            var result = await _validator.ValidateAsync(metadata, "Entity");

            // Assert
            Assert.False(result.IsValid);
            Assert.NotEmpty(result.Errors);
            Assert.Contains(result.Errors, e => e.Message.Contains("PascalCase") || e.Message.Contains("pattern"));
        }

        [Fact]
        public async Task Should_Validate_Complex_Entity_With_NavigationProperties()
        {
            // Arrange
            var metadata = new EntityMetadataDto
            {
                Name = "Order",
                Module = "Sales",
                Properties = new List<PropertyMetadataDto>
                {
                    new PropertyMetadataDto { Name = "orderNumber", Type = "string" }
                },
                NavigationProperties = new List<NavigationPropertyMetadataDto>
                {
                    new NavigationPropertyMetadataDto
                    {
                        Name = "customer",
                        Type = "Customer",
                        RelationType = "ManyToOne",
                        ForeignKey = "customerId"
                    }
                }
            };

            // Act
            var result = await _validator.ValidateAsync(metadata, "Entity");

            // Assert
            Assert.True(result.IsValid);
        }
    }
}
```

---

### 步骤10.2: 代码生成器集成测试

**新增文件**: `tests/SmartAbp.CodeGenerator.Tests/Integration/UnifiedMetadataGenerationTests.cs`

```csharp
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Services.Generated;
using System.Threading.Tasks;
using Xunit;
using Microsoft.Extensions.DependencyInjection;

namespace SmartAbp.CodeGenerator.Tests.Integration
{
    public class UnifiedMetadataGenerationTests : SmartAbpTestBase
    {
        private readonly ICodeGenerationAppService _codeGenerationService;

        public UnifiedMetadataGenerationTests()
        {
            _codeGenerationService = GetRequiredService<ICodeGenerationAppService>();
        }

        [Fact]
        public async Task Should_Generate_CRUD_Code_From_UnifiedMetadata()
        {
            // Arrange
            var metadata = new EntityMetadataDto
            {
                Name = "Book",
                Module = "Library",
                Description = "图书实体",
                Properties = new List<PropertyMetadataDto>
                {
                    new() { Name = "title", Type = "string", IsRequired = true, MaxLength = 200 },
                    new() { Name = "isbn", Type = "string", IsUnique = true, MaxLength = 20 },
                    new() { Name = "publishDate", Type = "DateTime" }
                }
            };

            var input = new UnifiedMetadataInputDto
            {
                MetadataType = "Entity",
                SchemaVersion = "1.0.0",
                Metadata = metadata
            };

            // Act
            var result = await _codeGenerationService.GenerateFromUnifiedMetadataAsync(input);

            // Assert
            Assert.True(result.Success);
            Assert.NotEmpty(result.GeneratedFiles);
            
            // 验证生成的文件
            Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("Book.cs"));
            Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("BookAppService.cs"));
            Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("BookController.cs"));
        }

        [Fact]
        public async Task Should_Generate_Aspire_Solution_From_UnifiedMetadata()
        {
            // Arrange
            var metadata = new AspireSolutionDto
            {
                SolutionName = "ECommerce",
                RootNamespace = "ECommerce",
                Microservices = new List<MicroserviceMetadataDto>
                {
                    new()
                    {
                        Name = "OrderService",
                        Type = "API",
                        Port = 5001,
                        Database = new DatabaseConfigDto { Enabled = true, Type = "PostgreSQL" }
                    },
                    new()
                    {
                        Name = "PaymentService",
                        Type = "API",
                        Port = 5002
                    }
                },
                Infrastructure = new InfrastructureConfigDto
                {
                    UsePostgreSQL = true,
                    UseRedis = true,
                    UseRabbitMQ = true
                }
            };

            var input = new UnifiedMetadataInputDto
            {
                MetadataType = "AspireSolution",
                SchemaVersion = "1.0.0",
                Metadata = metadata
            };

            // Act
            var result = await _codeGenerationService.GenerateFromUnifiedMetadataAsync(input);

            // Assert
            Assert.True(result.Success);
            Assert.NotEmpty(result.GeneratedFiles);
            
            // 验证Aspire Host
            Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("AppHost/Program.cs"));
            
            // 验证微服务
            Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("OrderService"));
            Assert.Contains(result.GeneratedFiles, f => f.Path.Contains("PaymentService"));
        }
    }
}
```

---

### 步骤10.3: 性能基准测试

**新增文件**: `tests/SmartAbp.CodeGenerator.Tests/Performance/CodeGenerationBenchmarks.cs`

```csharp
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Services.Generated;

namespace SmartAbp.CodeGenerator.Tests.Performance
{
    [MemoryDiagnoser]
    public class CodeGenerationBenchmarks
    {
        private ICodeGenerationAppService _service = null!;
        private EntityMetadataDto _simpleEntity = null!;
        private EntityMetadataDto _complexEntity = null!;

        [GlobalSetup]
        public void Setup()
        {
            // 初始化服务
            // _service = ...

            // 准备测试数据
            _simpleEntity = new EntityMetadataDto
            {
                Name = "Book",
                Module = "Library",
                Properties = new List<PropertyMetadataDto>
                {
                    new() { Name = "title", Type = "string" }
                }
            };

            _complexEntity = new EntityMetadataDto
            {
                Name = "Order",
                Module = "Sales",
                Properties = Enumerable.Range(1, 50)
                    .Select(i => new PropertyMetadataDto
                    {
                        Name = $"field{i}",
                        Type = "string"
                    })
                    .ToList()
            };
        }

        [Benchmark]
        public async Task<GeneratedModuleDto> Generate_Simple_Entity()
        {
            return await _service.GenerateFromUnifiedMetadataAsync(new UnifiedMetadataInputDto
            {
                MetadataType = "Entity",
                SchemaVersion = "1.0.0",
                Metadata = _simpleEntity
            });
        }

        [Benchmark]
        public async Task<GeneratedModuleDto> Generate_Complex_Entity()
        {
            return await _service.GenerateFromUnifiedMetadataAsync(new UnifiedMetadataInputDto
            {
                MetadataType = "Entity",
                SchemaVersion = "1.0.0",
                Metadata = _complexEntity
            });
        }
    }

    // 运行基准测试
    // dotnet run --configuration Release --project tests/SmartAbp.CodeGenerator.Tests
}
```

**执行基准测试**:
```bash
cd tests/SmartAbp.CodeGenerator.Tests
dotnet run --configuration Release
```

**性能基准**:
- ✅ 简单实体（5个属性）：<200ms
- ✅ 复杂实体（50个属性）：<500ms
- ✅ Aspire方案（5个微服务）：<1000ms

---

## 📊 完整时间表

| 阶段 | 步骤 | 工作量 | 依赖 | 输出 |
|------|------|--------|------|------|
| 阶段4 | 4.1-4.5 | 3天 | 无 | JSON Schema体系 |
| 阶段7 | 7.1-7.4 | 4天 | 阶段4 | C#模型自动生成 |
| 阶段8 | 8.1-8.3 | 5天 | 阶段7 | 代码生成器重构 |
| 阶段9 | 9.1-9.4 | 3天 | 阶段8 | Schema验证器 |
| 阶段10 | 10.1-10.3 | 3天 | 阶段9 | 测试验证 |
| **总计** | | **18天** | | **后端完整交付** |

---

## ✅ 交付标准

### 功能完整性
- ✅ JSON Schema完整定义（Entity、Module、Aspire）
- ✅ C# DTO自动从Schema生成
- ✅ 代码生成器适配统一元数据
- ✅ Aspire编排器适配统一元数据
- ✅ 前后端元数据100%一致

### 代码质量
- ✅ C#编译0错误0警告
- ✅ 单元测试覆盖率≥80%
- ✅ 集成测试100%通过
- ✅ 性能测试通过（无退化）

### 架构合规
- ✅ Schema-First设计完整实现
- ✅ 向后兼容性100%保证
- ✅ API符合RESTful规范
- ✅ ABP规范100%遵守

### 性能指标
- ✅ 代码生成时间<原有20%
- ✅ Schema验证时间<100ms
- ✅ API响应时间<500ms

---

## 🚨 风险控制

### 兼容性风险
- **风险**: 旧DTO不兼容
- **缓解**: 继承生成DTO保持兼容
- **应对**: 保留兼容层3个月

### 性能风险
- **风险**: Schema验证影响性能
- **缓解**: 使用高效验证库（NJsonSchema）
- **应对**: 缓存Schema，异步验证

### 数据迁移风险
- **风险**: 现有元数据需要迁移
- **缓解**: 提供完整迁移脚本
- **应对**: 逐步迁移，保留旧格式

---

## 🚀 后续优化方向

### 性能优化
- Schema验证结果缓存
- 代码生成并行化
- 增量式代码生成

### 功能增强
- Schema可视化编辑器
- 元数据版本管理UI
- 代码生成预览功能

### 生态集成
- 支持OpenAPI规范导入
- 支持Protobuf Schema转换
- 支持GraphQL Schema映射

---

**版本**: v1.0.0  
**最后更新**: 2025-01-27  
**负责人**: AI架构团队  
**审批**: 待定

