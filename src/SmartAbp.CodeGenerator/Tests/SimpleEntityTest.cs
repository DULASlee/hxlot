using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.Tests
{
    /// <summary>
    /// Simple entity generation test without ABP dependencies
    /// </summary>
    public static class SimpleEntityTest
    {
        public static async Task TestSimpleEntityGeneration()
        {
            // Setup logging
            using var loggerFactory = LoggerFactory.Create(builder =>
                builder.AddConsole().SetMinimumLevel(LogLevel.Information));
            
            var logger = loggerFactory.CreateLogger<RoslynCodeEngine>();
            
            // Create the code generation engine
            using var engine = new RoslynCodeEngine(logger);
            
            // Create a simple entity definition without ABP dependencies
            var entityDefinition = new EntityDefinition
            {
                Name = "Customer",
                Module = "Sales",
                Aggregate = "Customers",
                Description = "Customer entity for basic testing",
                IsAggregateRoot = false, // Disable ABP features
                IsMultiTenant = false,
                IsSoftDelete = false,
                HasExtraProperties = false,
                Properties = new[]
                {
                    new PropertyDefinition
                    {
                        Name = "Name",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 100,
                        Description = "Customer name"
                    },
                    new PropertyDefinition
                    {
                        Name = "Email",
                        Type = "string",
                        IsRequired = true,
                        Description = "Customer email"
                    },
                    new PropertyDefinition
                    {
                        Name = "Age",
                        Type = "int",
                        IsRequired = false,
                        Description = "Customer age"
                    }
                }
            };
            
            try
            {
                Console.WriteLine("🎯 Testing simple entity generation...");
                Console.WriteLine($"📝 Generating entity: {entityDefinition.Name}");
                
                // Generate the entity
                var result = await engine.GenerateEntityAsync(entityDefinition);
                
                Console.WriteLine("✅ Simple entity generation completed successfully!");
                Console.WriteLine($"⏱️  Generation time: {result.GenerationTime.TotalMilliseconds:F2}ms");
                Console.WriteLine($"📊 Generated code length: {result.SourceCode.Length:N0} characters");
                Console.WriteLine();
                Console.WriteLine("📋 Generated Simple Entity Code:");
                Console.WriteLine("".PadRight(80, '='));
                Console.WriteLine(result.SourceCode);
                Console.WriteLine("".PadRight(80, '='));
                
                Console.WriteLine();
                Console.WriteLine("🎉 Simple entity test completed successfully!");
                return;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error during simple entity generation: {ex.Message}");
                throw;
            }
        }
    }
}