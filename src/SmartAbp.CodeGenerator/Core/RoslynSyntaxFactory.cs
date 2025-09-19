using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Formatting;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp.DependencyInjection;
using static Microsoft.CodeAnalysis.CSharp.SyntaxFactory;

namespace SmartAbp.CodeGenerator.Core
{
    /// <summary>
    /// A utility library for building C# syntax trees using Roslyn.
    /// This factory provides a set of reusable static helper methods to construct common C# code elements programmatically.
    /// It is designed to be the foundational layer for higher-level, pattern-specific code generators.
    /// </summary>
    public static class RoslynSyntaxFactory
    {
        public static CompilationUnitSyntax CreateCompilationUnit(params UsingDirectiveSyntax[] usings)
        {
            return CompilationUnit().AddUsings(usings);
        }

        public static UsingDirectiveSyntax CreateUsing(string namespaceName)
        {
            return UsingDirective(ParseName(namespaceName));
        }

        public static NamespaceDeclarationSyntax CreateNamespace(string namespaceName)
        {
            return NamespaceDeclaration(ParseName(namespaceName));
        }

        public static ClassDeclarationSyntax CreateClass(string className, string? baseClass = null, SyntaxKind[]? modifiers = null, string[]? baseInterfaces = null)
        {
            var classDeclaration = ClassDeclaration(className);

            classDeclaration = classDeclaration.AddModifiers(
                modifiers?.Select(Token).ToArray() ?? new[] { Token(SyntaxKind.PublicKeyword) }
            );

            var baseTypes = new List<BaseTypeSyntax>();
            if (!string.IsNullOrEmpty(baseClass))
            {
                baseTypes.Add(SimpleBaseType(ParseTypeName(baseClass)));
            }
            if (baseInterfaces != null)
            {
                baseTypes.AddRange(baseInterfaces.Select(i => SimpleBaseType(ParseTypeName(i))));
            }
            if (baseTypes.Any())
            {
                classDeclaration = classDeclaration.AddBaseListTypes(baseTypes.ToArray());
            }

            return classDeclaration;
        }

        public static PropertyDeclarationSyntax CreateProperty(string name, string type, SyntaxKind[]? modifiers = null, bool hasGetter = true, bool hasSetter = true)
        {
            var property = PropertyDeclaration(ParseTypeName(type), Identifier(name));

            property = property.AddModifiers(
                modifiers?.Select(Token).ToArray() ?? new[] { Token(SyntaxKind.PublicKeyword) }
            );

            var accessors = new List<AccessorDeclarationSyntax>();
            if (hasGetter)
            {
                accessors.Add(AccessorDeclaration(SyntaxKind.GetAccessorDeclaration).WithSemicolonToken(Token(SyntaxKind.SemicolonToken)));
            }
            if (hasSetter)
            {
                accessors.Add(AccessorDeclaration(SyntaxKind.SetAccessorDeclaration).WithSemicolonToken(Token(SyntaxKind.SemicolonToken)));
            }
            
            return property.AddAccessorListAccessors(accessors.ToArray());
        }
        
        public static AttributeListSyntax CreateAttribute(string name, params string[] arguments)
        {
            var attribute = Attribute(IdentifierName(name));
            if (arguments.Any())
            {
                var attributeArguments = arguments.Select(arg => AttributeArgument(ParseExpression(arg)));
                attribute = attribute.WithArgumentList(AttributeArgumentList(SeparatedList(attributeArguments)));
            }
            return AttributeList(SingletonSeparatedList(attribute));
        }
        
        public static ConstructorDeclarationSyntax CreateConstructor(string className, SyntaxKind[]? modifiers = null, ParameterSyntax[]? parameters = null, BlockSyntax? body = null, ConstructorInitializerSyntax? baseInitializer = null)
        {
            var constructor = ConstructorDeclaration(Identifier(className));
            
            constructor = constructor.AddModifiers(
                modifiers?.Select(Token).ToArray() ?? new[] { Token(SyntaxKind.PublicKeyword) }
            );

            if (parameters != null)
            {
                constructor = constructor.AddParameterListParameters(parameters);
            }

            if (baseInitializer != null)
            {
                constructor = constructor.WithInitializer(baseInitializer);
            }

            return constructor.WithBody(body ?? Block());
        }
        
        public static ConstructorInitializerSyntax CreateBaseConstructorInitializer(params string[] arguments)
        {
            var argumentSyntaxes = arguments.Select(arg => Argument(IdentifierName(arg)));
            return ConstructorInitializer(SyntaxKind.BaseConstructorInitializer, ArgumentList(SeparatedList(argumentSyntaxes)));
        }

        public static ParameterSyntax CreateParameter(string name, string type)
        {
            return Parameter(Identifier(name)).WithType(ParseTypeName(type));
        }

        public static MethodDeclarationSyntax CreateMethod(string name, string returnType, SyntaxKind[]? modifiers = null, ParameterSyntax[]? parameters = null, BlockSyntax? body = null)
        {
            var method = MethodDeclaration(ParseTypeName(returnType), Identifier(name));

            method = method.AddModifiers(
                modifiers?.Select(Token).ToArray() ?? new[] { Token(SyntaxKind.PublicKeyword) }
            );

            if (parameters != null)
            {
                method = method.AddParameterListParameters(parameters);
            }

            return method.WithBody(body ?? Block());
        }

        public static string FormatCode(CompilationUnitSyntax compilationUnit)
        {
            using (var workspace = new AdhocWorkspace())
            {
                var formattedNode = Formatter.Format(compilationUnit.NormalizeWhitespace(), workspace);
                return formattedNode.ToFullString();
            }
        }
    }
}
