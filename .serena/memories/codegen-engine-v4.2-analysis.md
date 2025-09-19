V4.2 codegen engine analysis (2025-09-18)

Current capabilities
- CodeGenerationAppService orchestrates generation, solution integration, EF migrations add, and frontend placeholders
- Uses CrudArchitectureGenerator + FrontendGenerator; writes files via CodeWriterService; integrates projects to SmartAbp.sln
- DTOs (V9) provide unified ModuleMetadataDto, EnhancedEntityModelDto, UI config skeleton; ConnectionStrings API present; MenuTree API is a mock

Gaps vs V4.2 plan
- GenerateModuleAsync ignores input and uses hardcoded test data → must accept ModuleMetadataDto from request
- GetMenuTreeAsync is mock → implement real repository-backed menu tree
- OrchestrateDatabaseMigrationAsync only adds migrations → must also run database update
- No DefaultUIConfigGenerator service → implement rules to auto-fill QueryFields, TableColumns, FormFields, ActionBar
- No FrontendIntegrationService → add TS AST integration for routes/menus in SmartAbp.Vue
- FrontendGenerator contains placeholders (management view/store) → upgrade to use UI config and templates

Key files
- src/SmartAbp.CodeGenerator/Services/CodeGenerationAppService.cs
- src/SmartAbp.CodeGenerator/Services/Dtos.cs (V9 unified metadata)
- src/SmartAbp.CodeGenerator/Core/Generation/Crud/*.cs (Domain, EFCore, App, Contracts)

Next actions (high-level)
1) Accept real input in GenerateModuleAsync; remove test data
2) Implement real menu API; wire to repository/service
3) Add DefaultUIConfigGenerator and integrate early in orchestration
4) Extend EF orchestration to run database update
5) Add FrontendIntegrationService to modify routes/menus via TS Compiler API
6) Upgrade FrontendGenerator to consume UI config and project templates