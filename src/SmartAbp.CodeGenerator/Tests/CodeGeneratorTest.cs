using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.Tests
{
    /// <summary>
    /// Simple test program to validate the Roslyn code generation engine
    /// </summary>
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            // Setup logging
            using var loggerFactory = LoggerFactory.Create(builder =>
                builder.AddConsole().SetMinimumLevel(LogLevel.Debug));
            
            var logger = loggerFactory.CreateLogger<RoslynCodeEngine>();
            
            // Create the code generation engine
            using var engine = new RoslynCodeEngine(logger);
            
            // Create a test entity definition
            var entityDefinition = new EntityDefinition
            {
                Name = "Product",
                Module = "Catalog",
                Aggregate = "Products",
                Description = "Product entity for e-commerce catalog",
                IsAggregateRoot = true,
                IsMultiTenant = true,
                IsSoftDelete = true,
                HasExtraProperties = true,
                Properties = new[]
                {
                    new PropertyDefinition
                    {
                        Name = "Name",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 256,
                        Description = "Product name"
                    },
                    new PropertyDefinition
                    {
                        Name = "Price",
                        Type = "decimal",
                        IsRequired = true,
                        Description = "Product price"
                    },
                    new PropertyDefinition
                    {
                        Name = "Description",
                        Type = "string?",
                        IsRequired = false,
                        MaxLength = 1000,
                        Description = "Product description"
                    }
                },
                Constants = new[]
                {
                    new ConstantDefinition
                    {
                        Name = "MaxNameLength",
                        Type = "int",
                        Value = "256",
                        Description = "Maximum length for product name"
                    }
                }
            };
            
            try
            {
                Console.WriteLine("🚀 Starting code generation test...");
                Console.WriteLine($"📝 Generating entity: {entityDefinition.Name}");
                
                // Generate the entity
                var result = await engine.GenerateEntityAsync(entityDefinition);
                
                Console.WriteLine("✅ Code generation completed successfully!");
                Console.WriteLine($"⏱️  Generation time: {result.GenerationTime.TotalMilliseconds:F2}ms");
                Console.WriteLine($"📊 Generated code length: {result.SourceCode.Length:N0} characters");
                Console.WriteLine();
                Console.WriteLine("📋 Generated Code:");
                Console.WriteLine("".PadRight(80, '='));
                Console.WriteLine(result.SourceCode);
                Console.WriteLine("".PadRight(80, '='));
                
                // Show performance metrics
                Console.WriteLine();
                Console.WriteLine("📈 Performance Metrics:");
                // Note: Engine doesn't expose performance counters publicly yet
                Console.WriteLine($"✓ Entity generated successfully in {result.GenerationTime.TotalMilliseconds:F2}ms");
                
                Console.WriteLine();
                Console.WriteLine("🎉 Test completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error during code generation: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}