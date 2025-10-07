using System.Collections.Generic;
using System.Threading.Tasks;
using Shouldly;
using Xunit;

namespace SmartAbp.CodeGenerator.ABP
{
    public class AbpModuleGeneratorTests
    {
        private readonly AbpModuleGenerator _generator;
        private readonly FakeTemplateService _templateService;

        public AbpModuleGeneratorTests()
        {
            _templateService = new FakeTemplateService();
            _generator = new AbpModuleGenerator(_templateService);
        }

        [Fact]
        public async Task Should_Generate_Module_With_Dependencies()
        {
            // Arrange
            _templateService.AddTemplate("AbpModule", 
@"namespace {{Namespace}}
{
{{Dependencies}}
    public class {{ModuleName}} : AbpModule
    {
    }
}");
            var args = new AbpModuleGenerationArgs
            {
                Namespace = "MyProject.MyModule",
                ModuleName = "MyModuleModule",
                Dependencies = new List<string> { "AbpAutofacModule", "AbpHttpClientModule" }
            };

            // Act
            var result = await _generator.GenerateAsync(args);

            // Assert
            result.ShouldContain("namespace MyProject.MyModule");
            result.ShouldContain("public class MyModuleModule : AbpModule");
            result.ShouldContain("[DependsOn(typeof(AbpAutofacModule))]");
            result.ShouldContain("[DependsOn(typeof(AbpHttpClientModule))]");
        }

        [Fact]
        public async Task Should_Generate_Module_Without_Dependencies()
        {
            // Arrange
            _templateService.AddTemplate("AbpModule", 
@"namespace {{Namespace}}
{
{{Dependencies}}
    public class {{ModuleName}} : AbpModule
    {
    }
}");
            var args = new AbpModuleGenerationArgs
            {
                Namespace = "MyProject.SimpleModule",
                ModuleName = "SimpleModule"
            };

            // Act
            var result = await _generator.GenerateAsync(args);

            // Assert
            result.ShouldContain("namespace MyProject.SimpleModule");
            result.ShouldContain("public class SimpleModule : AbpModule");
            result.ShouldNotContain("[DependsOn");
        }

        [Fact]
        public async Task Should_Generate_Module_With_Custom_Configuration()
        {
            // Arrange
            _templateService.AddTemplate("AbpModule", 
@"namespace {{Namespace}}
{
{{Dependencies}}
    public class {{ModuleName}} : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
{{CustomConfiguration}}
        }
    }
}");
            var args = new AbpModuleGenerationArgs
            {
                Namespace = "MyProject.CustomModule",
                ModuleName = "CustomModule",
                CustomConfiguration = "            Configure<AbpAutoMapperOptions>(options => { });"
            };

            // Act
            var result = await _generator.GenerateAsync(args);

            // Assert
            result.ShouldContain("Configure<AbpAutoMapperOptions>");
        }
    }
}
