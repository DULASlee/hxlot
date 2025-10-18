 
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SmartAbpApplicationBusinessRulesServicesScriptValidationResult {
  isValid?: boolean;
  errors?: string[] | null;
  warnings?: string[] | null;
  syntaxInfo?: Record<string, any>;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleActionDto {
  /** @format int32 */
  id?: number;
  type?: string | null;
  target?: string | null;
  value?: string | null;
  parameters?: Record<string, any>;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleConditionDto {
  /** @format int32 */
  id?: number;
  field?: string | null;
  operator?: string | null;
  value?: string | null;
  logicalOperator?: string | null;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDto {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  creationTime?: string;
  /** @format uuid */
  creatorId?: string | null;
  /** @format date-time */
  lastModificationTime?: string | null;
  /** @format uuid */
  lastModifierId?: string | null;
  isDeleted?: boolean;
  /** @format uuid */
  deleterId?: string | null;
  /** @format date-time */
  deletionTime?: string | null;
  name?: string | null;
  entityName?: string | null;
  description?: string | null;
  type?: string | null;
  /** @format int32 */
  priority?: number;
  isActive?: boolean;
  hasError?: boolean;
  conditions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleConditionDto[]
    | null;
  actions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleActionDto[]
    | null;
  executionTiming?: string[] | null;
  lastExecutionResult?: SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleExecutionResultDto | null;
  /** @format date-time */
  lastExecutionTime?: string | null;
  /** @format int32 */
  executionCount?: number;
  /** @format int32 */
  successCount?: number;
  /** @format int32 */
  failureCount?: number;
  /** @format double */
  averageExecutionTime?: number;
  /** @format double */
  successRate?: number;
  /** @format int32 */
  version?: number;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleExecutionResultDto {
  success?: boolean;
  /** @format int32 */
  executionTime?: number;
  /** @format int64 */
  timestamp?: number;
  error?: string | null;
  details?: Record<string, any>;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleStatsDto {
  /** @format int32 */
  totalRules?: number;
  /** @format int32 */
  activeRules?: number;
  /** @format int32 */
  executionCount?: number;
  /** @format double */
  successRate?: number;
  /** @format double */
  averageExecutionTime?: number;
  /** @format int32 */
  todayExecutionCount?: number;
  /** @format int32 */
  errorRules?: number;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleValidationResultDto {
  isValid?: boolean;
  errors?: string[] | null;
  warnings?: string[] | null;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosCreateBusinessRuleDto {
  /**
   * @minLength 1
   * @maxLength 200
   */
  name: string;
  /**
   * @minLength 1
   * @maxLength 100
   */
  entityName: string;
  /** @maxLength 1000 */
  description?: string | null;
  /** @minLength 1 */
  type: string;
  /**
   * @format int32
   * @min 1
   * @max 100
   */
  priority?: number;
  conditions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleConditionDto[]
    | null;
  actions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleActionDto[]
    | null;
  executionTiming?: string[] | null;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosExecuteBusinessRuleDto {
  ruleIds?: string[] | null;
  context?: Record<string, any>;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosUpdateBusinessRuleDto {
  /**
   * @minLength 1
   * @maxLength 200
   */
  name: string;
  /** @maxLength 1000 */
  description?: string | null;
  /**
   * @format int32
   * @min 1
   * @max 100
   */
  priority?: number;
  isActive?: boolean;
  conditions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleConditionDto[]
    | null;
  actions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleActionDto[]
    | null;
  executionTiming?: string[] | null;
}

export interface SmartAbpApplicationContractsBusinessRulesDtosValidateScriptInput {
  /**
   * @minLength 1
   * @maxLength 10000
   */
  script: string;
  /**
   * @minLength 1
   * @maxLength 50
   */
  scriptType: string;
}

export interface SmartAbpApplicationContractsCodeGeneratorCqrsValidationResultDto {
  isValid?: boolean;
  errors?: SmartAbpApplicationContractsCodeGeneratorValidationErrorDto[] | null;
}

export interface SmartAbpApplicationContractsCodeGeneratorValidationErrorDto {
  field?: string | null;
  message?: string | null;
  severity?: string | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosCodeGenerationConfigDto {
  generateEntity?: boolean;
  generateDto?: boolean;
  generateAppService?: boolean;
  generateController?: boolean;
  generateRepository?: boolean;
  generateFrontend?: boolean;
  generateTests?: boolean;
}

export interface SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityDefinitionDto {
  name?: string | null;
  tableName?: string | null;
  displayName?: string | null;
  description?: string | null;
  entityType?: string | null;
  baseType?: string | null;
  namespace?: string | null;
  fields?: SmartAbpApplicationContractsLowCodeDtosEntityFieldDto[] | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityFieldDto {
  /** @format uuid */
  entityDefinitionId?: string;
  name?: string | null;
  displayName?: string | null;
  type?: string | null;
  /** @format int32 */
  length?: number | null;
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  defaultValue?: string | null;
  comment?: string | null;
  /** @format int32 */
  order?: number;
}

export interface SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityRelationDto {
  fromEntity?: string | null;
  toEntity?: string | null;
  relationType?: string | null;
  foreignKey?: string | null;
  navigationProperty?: string | null;
  joinTable?: string | null;
  cascadeDelete?: boolean;
}

export interface SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateModuleDto {
  systemName?: string | null;
  moduleName?: string | null;
  displayName?: string | null;
  description?: string | null;
  namespace?: string | null;
  version?: string | null;
  /** 模块架构配置 */
  architectureConfig?: SmartAbpDomainEntitiesLowCodeModuleArchitectureConfig | null;
  /** 模块前端配置 */
  frontendConfig?: SmartAbpDomainEntitiesLowCodeModuleFrontendConfig | null;
  /** 模块代码生成选项 */
  codeGenOptions?: SmartAbpDomainEntitiesLowCodeModuleCodeGenOptions | null;
  status?: string | null;
  isActive?: boolean;
}

export interface SmartAbpApplicationContractsLowCodeDtosEntityConstraintDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  entityDefinitionId?: string;
  name?: string | null;
  type?: string | null;
  definition?: string | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  creationTime?: string;
  /** @format uuid */
  creatorId?: string | null;
  /** @format date-time */
  lastModificationTime?: string | null;
  /** @format uuid */
  lastModifierId?: string | null;
  isDeleted?: boolean;
  /** @format uuid */
  deleterId?: string | null;
  /** @format date-time */
  deletionTime?: string | null;
  name?: string | null;
  tableName?: string | null;
  displayName?: string | null;
  description?: string | null;
  entityType?: string | null;
  baseType?: string | null;
  namespace?: string | null;
  schema?: string | null;
  isAggregateRoot?: boolean;
  baseClass?: string | null;
  interfaces?: string[] | null;
  isAudited?: boolean;
  isSoftDelete?: boolean;
  isMultiTenant?: boolean;
  fields?: SmartAbpApplicationContractsLowCodeDtosEntityFieldDto[] | null;
  relationships?:
    | SmartAbpApplicationContractsLowCodeDtosEntityRelationDto[]
    | null;
  validationRules?:
    | SmartAbpApplicationContractsLowCodeDtosValidationRuleDto[]
    | null;
  businessRules?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDto[]
    | null;
  indexes?: SmartAbpApplicationContractsLowCodeDtosEntityIndexDto[] | null;
  constraints?:
    | SmartAbpApplicationContractsLowCodeDtosEntityConstraintDto[]
    | null;
  permissions?:
    | SmartAbpApplicationContractsLowCodeDtosEntityPermissionDto[]
    | null;
  /** 页面配置DTO（JSON存储） */
  pageConfig?: SmartAbpDomainEntitiesLowCodePageConfigDto | null;
  codeGeneration?: SmartAbpApplicationContractsLowCodeDtosCodeGenerationConfigDto | null;
  /** @format uuid */
  tenantId?: string | null;
  navigationProperties?:
    | SmartAbpApplicationContractsLowCodeDtosNavigationPropertyDto[]
    | null;
  /** @format uuid */
  moduleId?: string | null;
  isCompleted?: boolean;
  tags?: string[] | null;
  schemaVersion?: string | null;
  version?: string | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosEntityFieldDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  entityDefinitionId?: string;
  name?: string | null;
  displayName?: string | null;
  type?: string | null;
  /** @format int32 */
  length?: number | null;
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  defaultValue?: string | null;
  comment?: string | null;
  /** @format int32 */
  order?: number;
  isPrimaryKey?: boolean;
  /** @format int32 */
  minLength?: number | null;
  /** @format int32 */
  precision?: number | null;
  /** @format int32 */
  scale?: number | null;
  /** @format double */
  minValue?: number | null;
  /** @format double */
  maxValue?: number | null;
  pattern?: string | null;
  enumValues?: SmartAbpApplicationContractsLowCodeDtosEnumValueDto[] | null;
  validationRules?:
    | SmartAbpApplicationContractsLowCodeDtosValidationRuleDto[]
    | null;
  /**
   * 属性UI配置（JSON存储）
   * Phase 1A 调整：保留在 Domain 层，通过 NSwag 配置扫描
   */
  uiConfig?: SmartAbpDomainEntitiesLowCodePropertyUIConfig | null;
  columnName?: string | null;
  columnType?: string | null;
  isAuditField?: boolean;
  isSoftDeleteField?: boolean;
  isTenantField?: boolean;
}

export interface SmartAbpApplicationContractsLowCodeDtosEntityIndexDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  entityDefinitionId?: string;
  name?: string | null;
  columns?: string[] | null;
  isUnique?: boolean;
  isClustered?: boolean;
}

export interface SmartAbpApplicationContractsLowCodeDtosEntityPermissionDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  entityDefinitionId?: string;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  isGranted?: boolean;
}

export interface SmartAbpApplicationContractsLowCodeDtosEntityRelationDto {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  creationTime?: string;
  /** @format uuid */
  creatorId?: string | null;
  /** @format date-time */
  lastModificationTime?: string | null;
  /** @format uuid */
  lastModifierId?: string | null;
  isDeleted?: boolean;
  /** @format uuid */
  deleterId?: string | null;
  /** @format date-time */
  deletionTime?: string | null;
  fromEntity?: string | null;
  toEntity?: string | null;
  /** @format int32 */
  type?: 0 | 1 | 2 | 3;
  foreignKey?: string | null;
  navigationProperty?: string | null;
  joinTable?: string | null;
  cascadeDelete?: boolean;
  /** @format uuid */
  tenantId?: string | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosEnumValueDto {
  /** @format uuid */
  id?: string;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  stringValue?: string | null;
  /** @format int32 */
  intValue?: number | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosGeneratedFileDto {
  path?: string | null;
  content?: string | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosIndustryTemplateConfigDto {
  templateId?: string | null;
  systemName?: string | null;
  description?: string | null;
  companyName?: string | null;
  selectedModules?: string[] | null;
  selectedHardware?: string[] | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosIndustryTemplateGenerationResultDto {
  success?: boolean;
  generatedFiles?:
    | SmartAbpApplicationContractsLowCodeDtosGeneratedFileDto[]
    | null;
  errors?: string[] | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosModuleDto {
  /** @format uuid */
  id?: string;
  systemName?: string | null;
  moduleName?: string | null;
  displayName?: string | null;
  description?: string | null;
  namespace?: string | null;
  version?: string | null;
  /** 模块架构配置 */
  architectureConfig?: SmartAbpDomainEntitiesLowCodeModuleArchitectureConfig | null;
  /** 模块前端配置 */
  frontendConfig?: SmartAbpDomainEntitiesLowCodeModuleFrontendConfig | null;
  /** 模块代码生成选项 */
  codeGenOptions?: SmartAbpDomainEntitiesLowCodeModuleCodeGenOptions | null;
  status?: string | null;
  isActive?: boolean;
  /** @format uuid */
  tenantId?: string | null;
  entities?:
    | SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto[]
    | null;
  /** @format date-time */
  creationTime?: string;
  /** @format uuid */
  creatorId?: string | null;
  /** @format date-time */
  lastModificationTime?: string | null;
  /** @format uuid */
  lastModifierId?: string | null;
}

export interface SmartAbpApplicationContractsLowCodeDtosNavigationPropertyDto {
  name?: string | null;
  targetEntityName?: string | null;
  /** @format uuid */
  targetEntityId?: string | null;
  /** @format int32 */
  relationType?: 0 | 1 | 2 | 3;
  foreignKeyName?: string | null;
  inversePropertyName?: string | null;
  /** @format int32 */
  cascadeDelete?: 0 | 1 | 2 | 3;
  isRequired?: boolean;
  joinTableName?: string | null;
  comment?: string | null;
  /** @format int32 */
  order?: number;
}

export interface SmartAbpApplicationContractsLowCodeDtosValidationRuleDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  entityDefinitionId?: string;
  fieldName?: string | null;
  ruleType?: string | null;
  ruleValue?: string | null;
  errorMessage?: string | null;
  trigger?: string | null;
  description?: string | null;
  isEnabled?: boolean;
  /** @format int32 */
  priority?: number;
}

export interface SmartAbpApplicationContractsLowCodeSchemaValidationResult {
  isValid?: boolean;
  errors?: string[] | null;
  warnings?: string[] | null;
}

export interface SmartAbpCodeGeneratorDtosCodeGenStatsDto {
  /** @format int32 */
  totalProjects?: number;
  /** @format int32 */
  monthlyGenerations?: number;
  /** @format int32 */
  savedHours?: number;
  /** @format double */
  qualityScore?: number;
  /** @format date-time */
  lastUpdated?: string;
}

export interface SmartAbpCodeGeneratorDtosCreateGenerationHistoryDto {
  mode?: string | null;
  templateName?: string | null;
  projectName?: string | null;
  /** @format int32 */
  entityCount?: number;
  /** @format int32 */
  generatedFileCount?: number;
  /** @format int32 */
  generationDuration?: number;
  status?: string | null;
  errorMessage?: string | null;
  metadata?: string | null;
}

export interface SmartAbpCodeGeneratorDtosGenerationHistoryDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  userId?: string;
  mode?: string | null;
  templateName?: string | null;
  projectName?: string | null;
  /** @format int32 */
  entityCount?: number;
  /** @format int32 */
  generatedFileCount?: number;
  /** @format int32 */
  generationDuration?: number;
  status?: string | null;
  errorMessage?: string | null;
  /** @format date-time */
  creationTime?: string;
}

export interface SmartAbpCodeGeneratorDtosIndustryRecommendationDto {
  template?: string | null;
  name?: string | null;
  reason?: string | null;
  benefits?: string | null;
}

export interface SmartAbpCodeGeneratorDtosUpdateUserProfileDto {
  industry?: string | null;
  companyName?: string | null;
  companySize?: string | null;
  lastUsedMode?: string | null;
}

export interface SmartAbpCodeGeneratorDtosUserProfileDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  userId?: string;
  industry?: string | null;
  companyName?: string | null;
  companySize?: string | null;
  lastUsedMode?: string | null;
  isFirstVisit?: boolean;
}

export interface SmartAbpCodeGeneratorServicesCommandDefinitionDto {
  name?: string | null;
  description?: string | null;
  returnType?: string | null;
  properties?: SmartAbpCodeGeneratorServicesPropertyDefinitionDto[] | null;
  requiresTransaction?: boolean;
  requiresAuthorization?: boolean;
}

export interface SmartAbpCodeGeneratorServicesCqrsDefinitionDto {
  moduleName?: string | null;
  namespace?: string | null;
  commands?: SmartAbpCodeGeneratorServicesCommandDefinitionDto[] | null;
  queries?: SmartAbpCodeGeneratorServicesQueryDefinitionDto[] | null;
  events?: SmartAbpCodeGeneratorServicesEventDefinitionDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesEventDefinitionDto {
  name?: string | null;
  description?: string | null;
  properties?: SmartAbpCodeGeneratorServicesPropertyDefinitionDto[] | null;
  isIntegrationEvent?: boolean;
}

export interface SmartAbpCodeGeneratorServicesGeneratedCqrsSolutionDto {
  moduleName?: string | null;
  files?: Record<string, string>;
  /** @format int32 */
  commandCount?: number;
  /** @format int32 */
  queryCount?: number;
  /** @format int32 */
  eventCount?: number;
  /** @format date-time */
  generatedAt?: string;
  sessionId?: string | null;
}

export interface SmartAbpCodeGeneratorServicesParameterDefinitionDto {
  name?: string | null;
  type?: string | null;
  isOptional?: boolean;
  defaultValue?: string | null;
}

export interface SmartAbpCodeGeneratorServicesPropertyDefinitionDto {
  name?: string | null;
  type?: string | null;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isPrivateSetter?: boolean;
  isUnique?: boolean;
  /** @format int32 */
  maxLength?: number | null;
  /** @format int32 */
  minLength?: number | null;
  defaultValue?: string | null;
  description?: string | null;
}

export interface SmartAbpCodeGeneratorServicesQueryDefinitionDto {
  name?: string | null;
  description?: string | null;
  returnType?: string | null;
  parameters?: SmartAbpCodeGeneratorServicesParameterDefinitionDto[] | null;
  isPaged?: boolean;
  isCacheable?: boolean;
}

export interface SmartAbpCodeGeneratorServicesV9BusinessRuleDto {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  type?: string | null;
  condition?: string | null;
  action?: string | null;
  /** @format int32 */
  priority?: number;
  isActive?: boolean;
  errorMessage?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9CodeGenerationConfigDto {
  generateEntity?: boolean;
  generateRepository?: boolean;
  generateService?: boolean;
  generateController?: boolean;
  generateDto?: boolean;
  generateTests?: boolean;
  customTemplates?: Record<string, string>;
  options?: SmartAbpCodeGeneratorServicesV9CodeGenerationOptionsDto | null;
}

export interface SmartAbpCodeGeneratorServicesV9CodeGenerationOptionsDto {
  useAutoMapper?: boolean;
  generateValidation?: boolean;
  generateSwaggerDoc?: boolean;
  generatePermissions?: boolean;
  generateAuditLog?: boolean;
}

export interface SmartAbpCodeGeneratorServicesV9ColumnSchemaDto {
  name?: string | null;
  dataType?: string | null;
  isNullable?: boolean;
  /** @format int32 */
  maxLength?: number | null;
  isPrimaryKey?: boolean;
}

export interface SmartAbpCodeGeneratorServicesV9CustomPermissionActionDto {
  entityName?: string | null;
  actionKey?: string | null;
  displayName?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9DatabaseConfigDto {
  connectionStringName?: string | null;
  schema?: string | null;
  provider?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9DatabaseConnectionRequestDto {
  provider?: string | null;
  connectionString?: string | null;
  schema?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9DatabaseConnectionTestResultDto {
  success?: boolean;
  message?: string | null;
  serverVersion?: string | null;
  databaseName?: string | null;
  /** @format int32 */
  schemaCount?: number | null;
  /** @format int32 */
  tableCount?: number | null;
  tables?: string[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9DatabaseIntrospectionRequestDto {
  connectionStringName?: string | null;
  provider?: string | null;
  schema?: string | null;
  tables?: string[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9DatabaseSchemaDto {
  tables?: SmartAbpCodeGeneratorServicesV9TableSchemaDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9DetailConfigDto {
  layout?: string | null;
  sections?: SmartAbpCodeGeneratorServicesV9DetailSectionDto[] | null;
  actions?: SmartAbpCodeGeneratorServicesV9UIActionDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9DetailSectionDto {
  id?: string | null;
  title?: string | null;
  type?: string | null;
  properties?: string[] | null;
  relationships?: string[] | null;
  customComponent?: string | null;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface SmartAbpCodeGeneratorServicesV9EnhancedEntityModelDto {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  module?: string | null;
  namespace?: string | null;
  isAggregateRoot?: boolean;
  isAudited?: boolean;
  isSoftDelete?: boolean;
  isMultiTenant?: boolean;
  baseClass?: string | null;
  interfaces?: string[] | null;
  properties?: SmartAbpCodeGeneratorServicesV9EntityPropertyDto[] | null;
  relationships?: SmartAbpCodeGeneratorServicesV9EntityRelationshipDto[] | null;
  tableName?: string | null;
  schema?: string | null;
  indexes?: SmartAbpCodeGeneratorServicesV9EntityIndexDto[] | null;
  constraints?: SmartAbpCodeGeneratorServicesV9EntityConstraintDto[] | null;
  businessRules?: SmartAbpCodeGeneratorServicesV9BusinessRuleDto[] | null;
  permissions?: SmartAbpCodeGeneratorServicesV9EntityPermissionDto[] | null;
  codeGeneration?: SmartAbpCodeGeneratorServicesV9CodeGenerationConfigDto | null;
  uiConfig?: SmartAbpCodeGeneratorServicesV9EntityUIConfigDto | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  version?: string | null;
  tags?: string[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9EntityConstraintDto {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  columns?: string[] | null;
  expression?: string | null;
  referencedTable?: string | null;
  referencedColumns?: string[] | null;
  onDelete?: string | null;
  onUpdate?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9EntityIndexDto {
  id?: string | null;
  name?: string | null;
  columns?: string[] | null;
  isUnique?: boolean;
  isClustered?: boolean;
  includeColumns?: string[] | null;
  filterCondition?: string | null;
  description?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9EntityPermissionDto {
  id?: string | null;
  operation?: string | null;
  roles?: string[] | null;
  condition?: string | null;
  fieldLevelPermissions?:
    | SmartAbpCodeGeneratorServicesV9FieldPermissionDto[]
    | null;
}

export interface SmartAbpCodeGeneratorServicesV9EntityPropertyDto {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  type?: string | null;
  isRequired?: boolean;
  isKey?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  defaultValue?: object | null;
  description?: string | null;
  helpText?: string | null;
  /** @format int32 */
  maxLength?: number | null;
  /** @format int32 */
  minLength?: number | null;
  pattern?: string | null;
  /** @format int32 */
  precision?: number | null;
  /** @format int32 */
  scale?: number | null;
  /** @format double */
  minValue?: number | null;
  /** @format double */
  maxValue?: number | null;
  enumValues?: SmartAbpCodeGeneratorServicesV9EnumValueDto[] | null;
  validationRules?: SmartAbpCodeGeneratorServicesV9ValidationRuleDto[] | null;
  /** @format int32 */
  displayOrder?: number;
  groupName?: string | null;
  isVisible?: boolean;
  isReadonly?: boolean;
  columnName?: string | null;
  columnType?: string | null;
  isAuditField?: boolean;
  isSoftDeleteField?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  listVisible?: boolean;
  detailVisible?: boolean;
  formVisible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  isTenantField?: boolean;
}

export interface SmartAbpCodeGeneratorServicesV9EntityRelationshipDto {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  sourceEntityId?: string | null;
  targetEntityId?: string | null;
  targetEntity?: string | null;
  type?: string | null;
  sourceProperty?: string | null;
  targetProperty?: string | null;
  sourceNavigationProperty?: string | null;
  targetNavigationProperty?: string | null;
  cascadeDelete?: boolean;
  isRequired?: boolean;
  foreignKeyProperty?: string | null;
  joinTableName?: string | null;
  onDeleteAction?: string | null;
  isForeignKeyRequired?: boolean;
  /** @format int32 */
  onDeleteBehavior?: 0 | 1 | 2 | 3;
  joinEntity?: SmartAbpCodeGeneratorServicesV9EnhancedEntityModelDto | null;
}

export interface SmartAbpCodeGeneratorServicesV9EntityUIConfigDto {
  listConfig?: SmartAbpCodeGeneratorServicesV9ListConfigDto | null;
  formConfig?: SmartAbpCodeGeneratorServicesV9FormConfigDto | null;
  detailConfig?: SmartAbpCodeGeneratorServicesV9DetailConfigDto | null;
}

export interface SmartAbpCodeGeneratorServicesV9EnumValueDto {
  id?: string | null;
  name?: string | null;
  value?: object | null;
  displayName?: string | null;
  description?: string | null;
  isDefault?: boolean;
}

export interface SmartAbpCodeGeneratorServicesV9FeatureManagementDto {
  isEnabled?: boolean;
  defaultPolicy?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9FieldGroupDto {
  id?: string | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  collapsible?: boolean;
  collapsed?: boolean;
  /** @format int32 */
  columns?: number;
  fields?: string[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9FieldPermissionDto {
  propertyName?: string | null;
  operation?: string | null;
  roles?: string[] | null;
  condition?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9ForeignKeySchemaDto {
  column?: string | null;
  referencedSchema?: string | null;
  referencedTable?: string | null;
  referencedColumn?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9FormConfigDto {
  layout?: string | null;
  /** @format int32 */
  columnCount?: number;
  fieldGroups?: SmartAbpCodeGeneratorServicesV9FieldGroupDto[] | null;
  validationStrategy?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9FrontendConfigDto {
  parentId?: string | null;
  routePrefix?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9GeneratedModuleDto {
  moduleName?: string | null;
  generatedFiles?: string[] | null;
  generationReport?: string | null;
  sessionId?: string | null;
  success?: boolean;
  message?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9GenerationDryRunResultDto {
  success?: boolean;
  moduleName?: string | null;
  /** @format int32 */
  totalFiles?: number;
  /** @format int32 */
  totalLines?: number;
  files?: string[] | null;
  generationReport?: string | null;
  /** @format date-time */
  generatedAt?: string;
}

export interface SmartAbpCodeGeneratorServicesV9GenerationStatusDto {
  sessionId?: string | null;
  status?: string | null;
  /** @format int32 */
  percentage?: number;
  currentStep?: string | null;
  error?: string | null;
  /** @format date-time */
  startedAt?: string;
  /** @format date-time */
  completedAt?: string | null;
  completedFiles?: string[] | null;
  moduleName?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9ListConfigDto {
  /** @format int32 */
  defaultPageSize?: number;
  sortableColumns?: string[] | null;
  filterableColumns?: string[] | null;
  searchableColumns?: string[] | null;
  displayColumns?: string[] | null;
  actions?: SmartAbpCodeGeneratorServicesV9UIActionDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9MenuConfigDto {
  id?: string | null;
  title?: string | null;
  path?: string | null;
  icon?: string | null;
  componentPath?: string | null;
  requiredPermission?: string | null;
  children?: SmartAbpCodeGeneratorServicesV9MenuConfigDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9MenuItemDto {
  id?: string | null;
  label?: string | null;
  children?: SmartAbpCodeGeneratorServicesV9MenuItemDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9ModuleMetadataDto {
  id?: string | null;
  systemName?: string | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  version?: string | null;
  architecturePattern?: string | null;
  namespace?: string | null;
  author?: string | null;
  databaseInfo?: SmartAbpCodeGeneratorServicesV9DatabaseConfigDto | null;
  featureManagement?: SmartAbpCodeGeneratorServicesV9FeatureManagementDto | null;
  frontend?: SmartAbpCodeGeneratorServicesV9FrontendConfigDto | null;
  generateMobilePages?: boolean;
  dependencies?: string[] | null;
  entities?: SmartAbpCodeGeneratorServicesV9EnhancedEntityModelDto[] | null;
  menuConfig?: SmartAbpCodeGeneratorServicesV9MenuConfigDto[] | null;
  permissionConfig?: SmartAbpCodeGeneratorServicesV9PermissionConfigDto | null;
}

export interface SmartAbpCodeGeneratorServicesV9PermissionConfigDto {
  groups?: SmartAbpCodeGeneratorServicesV9PermissionGroupDefinitionDto[] | null;
  customActions?:
    | SmartAbpCodeGeneratorServicesV9CustomPermissionActionDto[]
    | null;
}

export interface SmartAbpCodeGeneratorServicesV9PermissionDefinitionDto {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  parentName?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9PermissionGroupDefinitionDto {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  permissions?: SmartAbpCodeGeneratorServicesV9PermissionDefinitionDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9SchemaVersionManifestDto {
  currentVersion?: string | null;
  /** @format int32 */
  currentMajor?: number;
  /** @format int32 */
  minSupportedMajor?: number;
  /** @format int32 */
  maxSupportedMajor?: number;
}

export interface SmartAbpCodeGeneratorServicesV9TableSchemaDto {
  schema?: string | null;
  name?: string | null;
  columns?: SmartAbpCodeGeneratorServicesV9ColumnSchemaDto[] | null;
  foreignKeys?: SmartAbpCodeGeneratorServicesV9ForeignKeySchemaDto[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9UIActionDto {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  icon?: string | null;
  color?: string | null;
  size?: string | null;
  position?: string | null;
  action?: string | null;
  condition?: string | null;
  permissions?: string[] | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedCustomPermissionActionDto {
  entityName?: string | null;
  actionKey?: string | null;
  displayName?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedDatabaseConfigDto {
  connectionStringName?: string | null;
  provider?: string | null;
  schema?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedEntitySchemaDto {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  module?: string | null;
  namespace?: string | null;
  tableName?: string | null;
  schema?: string | null;
  isAggregateRoot?: boolean;
  isMultiTenant?: boolean;
  isSoftDelete?: boolean;
  baseClass?: string | null;
  properties?: SmartAbpCodeGeneratorServicesV9UnifiedPropertySchemaDto[] | null;
  relationships?:
    | SmartAbpCodeGeneratorServicesV9UnifiedRelationshipSchemaDto[]
    | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedFeatureManagementDto {
  isEnabled?: boolean;
  defaultPolicy?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedFrontendConfigDto {
  parentId?: string | null;
  routePrefix?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedModuleSchemaDto {
  id?: string | null;
  systemName?: string | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  version?: string | null;
  architecturePattern?: string | null;
  databaseInfo?: SmartAbpCodeGeneratorServicesV9UnifiedDatabaseConfigDto | null;
  featureManagement?: SmartAbpCodeGeneratorServicesV9UnifiedFeatureManagementDto | null;
  frontend?: SmartAbpCodeGeneratorServicesV9UnifiedFrontendConfigDto | null;
  generateMobilePages?: boolean;
  dependencies?: string[] | null;
  entities?: SmartAbpCodeGeneratorServicesV9UnifiedEntitySchemaDto[] | null;
  permissionConfig?: SmartAbpCodeGeneratorServicesV9UnifiedPermissionConfigDto | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedPermissionConfigDto {
  customActions?:
    | SmartAbpCodeGeneratorServicesV9UnifiedCustomPermissionActionDto[]
    | null;
  inheritedPermissions?: string[] | null;
  roleBasedAccess?: Record<string, string[]>;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedPropertySchemaDto {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  isRequired?: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  /** @format int32 */
  maxLength?: number | null;
  /** @format int32 */
  minLength?: number | null;
  defaultValue?: object | null;
  description?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9UnifiedRelationshipSchemaDto {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  sourceEntityId?: string | null;
  targetEntityId?: string | null;
  sourcePropertyName?: string | null;
  targetPropertyName?: string | null;
  cascadeDelete?: boolean;
  isRequired?: boolean;
}

export interface SmartAbpCodeGeneratorServicesV9ValidationIssueDto {
  severity?: string | null;
  message?: string | null;
  path?: string | null;
}

export interface SmartAbpCodeGeneratorServicesV9ValidationReportDto {
  isValid?: boolean;
  issues?: SmartAbpCodeGeneratorServicesV9ValidationIssueDto[] | null;
  /** @format int32 */
  entitiesCount?: number;
  /** @format int32 */
  propertiesCount?: number;
}

export interface SmartAbpCodeGeneratorServicesV9ValidationRuleDto {
  id?: string | null;
  type?: string | null;
  value?: object | null;
  message?: string | null;
  condition?: string | null;
}

/** 操作按钮配置 */
export interface SmartAbpDomainEntitiesLowCodeActionConfig {
  /**
   * 按钮类型（create | edit | delete | custom）
   * @minLength 1
   */
  type: string;
  /**
   * 按钮标签
   * @minLength 1
   */
  label: string;
  /** 按钮图标 */
  icon?: string | null;
  /** 按钮动作（openDialog | api | navigate） */
  action?: string | null;
  /** 显示条件（表达式） */
  condition?: string | null;
  /** 按钮配置 */
  config?: Record<string, any>;
}

/** 列定义 */
export interface SmartAbpDomainEntitiesLowCodeColumnDefinition {
  /**
   * 列属性名
   * @minLength 1
   */
  prop: string;
  /**
   * 列标签
   * @minLength 1
   */
  label: string;
  /**
   * 列宽度（px）
   * @format int32
   */
  width?: number | null;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可筛选 */
  filterable?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 格式化器（函数名称） */
  formatter?: string | null;
}

/** 数据源配置 */
export interface SmartAbpDomainEntitiesLowCodeDataSourceConfig {
  /** 数据源类型（static | api | dict） */
  type?: string | null;
  /** API URL（type=api时） */
  url?: string | null;
  /** 显示字段名（如：name, title） */
  labelField?: string | null;
  /** 值字段名（如：id, value） */
  valueField?: string | null;
  /** 请求参数 */
  params?: Record<string, any>;
}

/** 详情配置 */
export interface SmartAbpDomainEntitiesLowCodeDetailConfig {
  /** 布局方式（vertical | horizontal） */
  layout?: string | null;
  /** 详情区段 */
  sections?: SmartAbpDomainEntitiesLowCodeDetailSection[] | null;
}

/** 详情区段 */
export interface SmartAbpDomainEntitiesLowCodeDetailSection {
  /**
   * 区段标题
   * @minLength 1
   */
  title: string;
  /** 区段类型（fields | table） */
  type?: string | null;
  /** 显示字段列表 */
  fields?: string[] | null;
  /** 数据源字段名（type=table时） */
  data?: string | null;
}

/** 事件配置 */
export interface SmartAbpDomainEntitiesLowCodeEventConfig {
  /**
   * 事件类型（api | navigate | dialog | validate）
   * @minLength 1
   */
  type: string;
  /** API URL（type=api时） */
  url?: string | null;
  /** HTTP方法（GET | POST | PUT | DELETE） */
  method?: string | null;
  /** 请求参数 */
  params?: Record<string, any>;
  /** 成功提示信息 */
  successMessage?: string | null;
  /** 后续事件（链式调用） */
  then?: SmartAbpDomainEntitiesLowCodeEventConfig | null;
  /** 成功后的事件 */
  afterSuccess?: SmartAbpDomainEntitiesLowCodeEventConfig | null;
}

/** 字段联动效果 */
export interface SmartAbpDomainEntitiesLowCodeFieldEffect {
  /**
   * 源字段（触发联动的字段）
   * @minLength 1
   */
  source: string;
  /**
   * 目标字段（被联动的字段）
   * @minLength 1
   */
  target: string;
  /**
   * 触发事件（change | blur | focus）
   * @minLength 1
   */
  event: string;
  /**
   * 联动效果（show | hide | enable | disable | setValue | options）
   * @minLength 1
   */
  effect: string;
  /** 条件表达式（如：value === 'admin'） */
  condition?: string | null;
  /** 联动配置 */
  config?: Record<string, any>;
}

/** 表单配置（form-create完整规则） */
export interface SmartAbpDomainEntitiesLowCodeFormConfig {
  /** form-create rules数组 */
  rules?: SmartAbpDomainEntitiesLowCodeFormCreateRule[] | null;
  /** 全局配置 */
  config?: SmartAbpDomainEntitiesLowCodeFormGlobalConfig | null;
  /** 字段联动规则 */
  effects?: SmartAbpDomainEntitiesLowCodeFieldEffect[] | null;
}

/** form-create规则（与form-create完全对齐） */
export interface SmartAbpDomainEntitiesLowCodeFormCreateRule {
  /**
   * 控件类型（input | select | date | ...）
   * @minLength 1
   */
  type: string;
  /**
   * 字段名称
   * @minLength 1
   */
  field: string;
  /**
   * 字段标题
   * @minLength 1
   */
  title: string;
  /** 默认值 */
  value?: object | null;
  /** 控件属性 */
  props?: Record<string, any>;
  /** 验证规则 */
  validate?: SmartAbpDomainEntitiesLowCodeValidationRuleConfig[] | null;
  /** 栅格配置 */
  col?: Record<string, any>;
}

/** 表单字段配置 */
export interface SmartAbpDomainEntitiesLowCodeFormFieldConfig {
  /**
   * 占用列数（1-24，基于24栅格系统）
   * @format int32
   */
  col?: number;
  /**
   * 占用行数
   * @format int32
   */
  row?: number;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
}

/** 表单全局配置 */
export interface SmartAbpDomainEntitiesLowCodeFormGlobalConfig {
  /** 表单尺寸（default | small | large） */
  size?: string | null;
  /** 标签位置（right | left | top） */
  labelPosition?: string | null;
  /**
   * 标签宽度（px）
   * @format int32
   */
  labelWidth?: number;
  /** 是否行内表单 */
  inline?: boolean;
  /** 是否显示重置按钮 */
  showResetButton?: boolean;
  /** 是否显示提交按钮 */
  showSubmitButton?: boolean;
  /** 提交按钮文本 */
  submitButtonText?: string | null;
  /** 重置按钮文本 */
  resetButtonText?: string | null;
}

/** 布局配置 */
export interface SmartAbpDomainEntitiesLowCodeLayoutConfig {
  /** 布局类型（grid | flex） */
  type?: string | null;
  /**
   * 栅格列数（24栅格系统）
   * @format int32
   */
  columns?: number;
  /**
   * 栅格间距（px）
   * @format int32
   */
  gutter?: number;
}

/** 列表配置 */
export interface SmartAbpDomainEntitiesLowCodeListConfig {
  /** 列定义 */
  columns?: SmartAbpDomainEntitiesLowCodeColumnDefinition[] | null;
  /** 分页配置 */
  pagination?: SmartAbpDomainEntitiesLowCodePaginationConfig | null;
  /** 操作按钮配置 */
  actions?: SmartAbpDomainEntitiesLowCodeActionConfig[] | null;
}

/** 列表列配置 */
export interface SmartAbpDomainEntitiesLowCodeListFieldConfig {
  /**
   * 列宽度（px）
   * @format int32
   */
  width?: number | null;
  /** 对齐方式（left | center | right） */
  align?: string | null;
  /** 固定列（left | right） */
  fixed?: string | null;
  /** 格式化器（函数名称） */
  formatter?: string | null;
}

/** 模块架构配置 */
export interface SmartAbpDomainEntitiesLowCodeModuleArchitectureConfig {
  /** 架构模式：Crud | DDD | CQRS */
  pattern?: string | null;
  /** 数据库提供程序：SqlServer | PostgreSQL | MySQL */
  databaseProvider?: string | null;
  /** 连接字符串名称 */
  connectionString?: string | null;
  /** 数据库Schema名称 */
  schema?: string | null;
}

/** 模块代码生成选项 */
export interface SmartAbpDomainEntitiesLowCodeModuleCodeGenOptions {
  /** 是否生成后端代码 */
  generateBackend?: boolean;
  /** 是否生成前端代码 */
  generateFrontend?: boolean;
  /** 是否生成数据库迁移 */
  generateDatabase?: boolean;
  /** 是否生成测试代码 */
  generateTests?: boolean;
  /** 是否使用AutoMapper */
  useAutoMapper?: boolean;
  /** 是否生成Swagger文档 */
  generateSwagger?: boolean;
}

/** 模块前端配置 */
export interface SmartAbpDomainEntitiesLowCodeModuleFrontendConfig {
  /** 路由前缀（如：/project-management） */
  routePrefix?: string | null;
  /** 父级菜单ID */
  parentMenuId?: string | null;
  /** 菜单图标 */
  menuIcon?: string | null;
  /**
   * 菜单排序
   * @format int32
   */
  menuOrder?: number;
}

/** 页面配置DTO（JSON存储） */
export interface SmartAbpDomainEntitiesLowCodePageConfigDto {
  /** 表单配置（form-create完整规则） */
  form?: SmartAbpDomainEntitiesLowCodeFormConfig | null;
  /** 列表配置 */
  list?: SmartAbpDomainEntitiesLowCodeListConfig | null;
  /** 详情配置 */
  detail?: SmartAbpDomainEntitiesLowCodeDetailConfig | null;
  /** 页面事件配置 */
  events?: Record<string, SmartAbpDomainEntitiesLowCodeEventConfig>;
  /** 布局配置 */
  layout?: SmartAbpDomainEntitiesLowCodeLayoutConfig | null;
}

/** 分页配置 */
export interface SmartAbpDomainEntitiesLowCodePaginationConfig {
  /**
   * 每页显示数量
   * @format int32
   */
  pageSize?: number;
  /** 每页显示数量选项 */
  pageSizes?: number[] | null;
}

/**
 * 属性UI配置（JSON存储）
 * Phase 1A 调整：保留在 Domain 层，通过 NSwag 配置扫描
 */
export interface SmartAbpDomainEntitiesLowCodePropertyUIConfig {
  /** 列表页是否显示 */
  listVisible?: boolean;
  /** 表单页是否显示 */
  formVisible?: boolean;
  /** 详情页是否显示 */
  detailVisible?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可筛选 */
  filterable?: boolean;
  /**
   * 控件类型（input, select, date, datetime, textarea, switch, radio, checkbox, upload, editor）
   * @minLength 1
   */
  controlType: string;
  /** 控件属性配置（如：{placeholder: "请输入", disabled: false}） */
  controlProps?: Record<string, any>;
  /** 数据源配置（下拉框、单选框等需要） */
  dataSource?: SmartAbpDomainEntitiesLowCodeDataSourceConfig | null;
  /** 列表列配置 */
  list?: SmartAbpDomainEntitiesLowCodeListFieldConfig | null;
  /** 表单字段配置 */
  form?: SmartAbpDomainEntitiesLowCodeFormFieldConfig | null;
  /** 显示格式化（如：{date} -> YYYY-MM-DD） */
  displayFormat?: string | null;
  /** 前缀（如：¥、$） */
  prefix?: string | null;
  /** 后缀（如：元、美元） */
  suffix?: string | null;
}

/**
 * 验证规则配置（UI控件验证规则，非DTO）
 * Phase 1A: 重命名避免与 ValidationRuleDto 冲突
 */
export interface SmartAbpDomainEntitiesLowCodeValidationRuleConfig {
  /**
   * 验证类型（required | pattern | min | max | email | phone | async）
   * @minLength 1
   */
  type: string;
  /** 验证值（如：pattern的正则表达式，min的最小值） */
  value?: string | null;
  /**
   * 错误提示信息
   * @minLength 1
   */
  message: string;
  /** 自定义验证器名称（type=async时） */
  validator?: string | null;
}

export interface SmartAbpHttpApiControllersBatchDeleteInput {
  ruleIds?: string[] | null;
}

export interface SmartAbpHttpApiControllersBatchUpdateStatusInput {
  ruleIds?: string[] | null;
  isActive?: boolean;
}

export interface SmartAbpHttpApiControllersImportRuleData {
  name?: string | null;
  entityName?: string | null;
  description?: string | null;
  type?: string | null;
  /** @format int32 */
  priority?: number;
  conditions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleConditionDto[]
    | null;
  actions?:
    | SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleActionDto[]
    | null;
  executionTiming?: string[] | null;
}

export interface SmartAbpHttpApiControllersImportRulesInput {
  rules?: SmartAbpHttpApiControllersImportRuleData[] | null;
}

export interface SmartAbpHttpApiControllersImportRulesResultDto {
  /** @format int32 */
  totalCount?: number;
  /** @format int32 */
  successCount?: number;
  /** @format int32 */
  failureCount?: number;
  errors?: string[] | null;
}

export interface VoloAbpAccountChangePasswordInput {
  /**
   * @minLength 0
   * @maxLength 128
   */
  currentPassword?: string | null;
  /**
   * @minLength 0
   * @maxLength 128
   */
  newPassword: string;
}

export interface VoloAbpAccountProfileDto {
  extraProperties?: Record<string, any>;
  userName?: string | null;
  email?: string | null;
  name?: string | null;
  surname?: string | null;
  phoneNumber?: string | null;
  isExternal?: boolean;
  hasPassword?: boolean;
  concurrencyStamp?: string | null;
}

export interface VoloAbpAccountRegisterDto {
  extraProperties?: Record<string, any>;
  /**
   * @minLength 0
   * @maxLength 256
   */
  userName: string;
  /**
   * @format email
   * @minLength 0
   * @maxLength 256
   */
  emailAddress: string;
  /**
   * @format password
   * @minLength 0
   * @maxLength 128
   */
  password: string;
  /** @minLength 1 */
  appName: string;
}

export interface VoloAbpAccountResetPasswordDto {
  /** @format uuid */
  userId?: string;
  /** @minLength 1 */
  resetToken: string;
  /** @minLength 1 */
  password: string;
}

export interface VoloAbpAccountSendPasswordResetCodeDto {
  /**
   * @format email
   * @minLength 0
   * @maxLength 256
   */
  email: string;
  /** @minLength 1 */
  appName: string;
  returnUrl?: string | null;
  returnUrlHash?: string | null;
}

export interface VoloAbpAccountUpdateProfileDto {
  extraProperties?: Record<string, any>;
  /**
   * @minLength 0
   * @maxLength 256
   */
  userName?: string | null;
  /**
   * @minLength 0
   * @maxLength 256
   */
  email?: string | null;
  /**
   * @minLength 0
   * @maxLength 64
   */
  name?: string | null;
  /**
   * @minLength 0
   * @maxLength 64
   */
  surname?: string | null;
  /**
   * @minLength 0
   * @maxLength 16
   */
  phoneNumber?: string | null;
  concurrencyStamp?: string | null;
}

export interface VoloAbpAccountVerifyPasswordResetTokenInput {
  /** @format uuid */
  userId?: string;
  /** @minLength 1 */
  resetToken: string;
}

export interface VoloAbpAccountWebAreasAccountControllersModelsAbpLoginResult {
  /** @format int32 */
  result?: 1 | 2 | 3 | 4 | 5;
  description?: string | null;
}

export interface VoloAbpAccountWebAreasAccountControllersModelsUserLoginInfo {
  /**
   * @minLength 0
   * @maxLength 255
   */
  userNameOrEmailAddress: string;
  /**
   * @format password
   * @minLength 0
   * @maxLength 32
   */
  password: string;
  rememberMe?: boolean;
}

export interface VoloAbpApplicationDtosListResultDto1VoloAbpIdentityIdentityRoleDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull {
  items?: VoloAbpIdentityIdentityRoleDto[] | null;
}

export interface VoloAbpApplicationDtosListResultDto1VoloAbpUsersUserDataVoloAbpUsersAbstractionsVersion9110CultureNeutralPublicKeyTokenNull {
  items?: VoloAbpUsersUserData[] | null;
}

export interface VoloAbpApplicationDtosPagedResultDto1SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDtoSmartAbpApplicationContractsVersion1000CultureNeutralPublicKeyTokenNull {
  items?: SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDto[] | null;
  /** @format int64 */
  totalCount?: number;
}

export interface VoloAbpApplicationDtosPagedResultDto1SmartAbpApplicationContractsLowCodeDtosModuleDtoSmartAbpApplicationContractsVersion1000CultureNeutralPublicKeyTokenNull {
  items?: SmartAbpApplicationContractsLowCodeDtosModuleDto[] | null;
  /** @format int64 */
  totalCount?: number;
}

export interface VoloAbpApplicationDtosPagedResultDto1VoloAbpIdentityIdentityRoleDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull {
  items?: VoloAbpIdentityIdentityRoleDto[] | null;
  /** @format int64 */
  totalCount?: number;
}

export interface VoloAbpApplicationDtosPagedResultDto1VoloAbpIdentityIdentityUserDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull {
  items?: VoloAbpIdentityIdentityUserDto[] | null;
  /** @format int64 */
  totalCount?: number;
}

export interface VoloAbpApplicationDtosPagedResultDto1VoloAbpTenantManagementTenantDtoVoloAbpTenantManagementApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull {
  items?: VoloAbpTenantManagementTenantDto[] | null;
  /** @format int64 */
  totalCount?: number;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationAuthConfigurationDto {
  grantedPolicies?: Record<string, boolean>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationConfigurationDto {
  localization?: VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationLocalizationConfigurationDto | null;
  auth?: VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationAuthConfigurationDto | null;
  setting?: VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationSettingConfigurationDto | null;
  currentUser?: VoloAbpAspNetCoreMvcApplicationConfigurationsCurrentUserDto | null;
  features?: VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationFeatureConfigurationDto | null;
  globalFeatures?: VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationGlobalFeatureConfigurationDto | null;
  multiTenancy?: VoloAbpAspNetCoreMvcMultiTenancyMultiTenancyInfoDto | null;
  currentTenant?: VoloAbpAspNetCoreMvcMultiTenancyCurrentTenantDto | null;
  timing?: VoloAbpAspNetCoreMvcApplicationConfigurationsTimingDto | null;
  clock?: VoloAbpAspNetCoreMvcApplicationConfigurationsClockDto | null;
  objectExtensions?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingObjectExtensionsDto | null;
  extraProperties?: Record<string, any>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationFeatureConfigurationDto {
  values?: Record<string, string | null>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationGlobalFeatureConfigurationDto {
  /** @uniqueItems true */
  enabledFeatures?: string[] | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationLocalizationConfigurationDto {
  values?: Record<string, Record<string, string>>;
  resources?: Record<
    string,
    VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationLocalizationResourceDto
  >;
  languages?: VoloAbpLocalizationLanguageInfo[] | null;
  currentCulture?: VoloAbpAspNetCoreMvcApplicationConfigurationsCurrentCultureDto | null;
  defaultResourceName?: string | null;
  languagesMap?: Record<string, VoloAbpNameValue[]>;
  languageFilesMap?: Record<string, VoloAbpNameValue[]>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationLocalizationDto {
  resources?: Record<
    string,
    VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationLocalizationResourceDto
  >;
  currentCulture?: VoloAbpAspNetCoreMvcApplicationConfigurationsCurrentCultureDto | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationLocalizationResourceDto {
  texts?: Record<string, string>;
  baseResources?: string[] | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationSettingConfigurationDto {
  values?: Record<string, string | null>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsClockDto {
  kind?: string | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsCurrentCultureDto {
  displayName?: string | null;
  englishName?: string | null;
  threeLetterIsoLanguageName?: string | null;
  twoLetterIsoLanguageName?: string | null;
  isRightToLeft?: boolean;
  cultureName?: string | null;
  name?: string | null;
  nativeName?: string | null;
  dateTimeFormat?: VoloAbpAspNetCoreMvcApplicationConfigurationsDateTimeFormatDto | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsCurrentUserDto {
  isAuthenticated?: boolean;
  /** @format uuid */
  id?: string | null;
  /** @format uuid */
  tenantId?: string | null;
  /** @format uuid */
  impersonatorUserId?: string | null;
  /** @format uuid */
  impersonatorTenantId?: string | null;
  impersonatorUserName?: string | null;
  impersonatorTenantName?: string | null;
  userName?: string | null;
  name?: string | null;
  surName?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean;
  roles?: string[] | null;
  sessionId?: string | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsDateTimeFormatDto {
  calendarAlgorithmType?: string | null;
  dateTimeFormatLong?: string | null;
  shortDatePattern?: string | null;
  fullDateTimePattern?: string | null;
  dateSeparator?: string | null;
  shortTimePattern?: string | null;
  longTimePattern?: string | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsIanaTimeZone {
  timeZoneName?: string | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingEntityExtensionDto {
  properties?: Record<
    string,
    VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyDto
  >;
  configuration?: Record<string, any>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionEnumDto {
  fields?:
    | VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionEnumFieldDto[]
    | null;
  localizationResource?: string | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionEnumFieldDto {
  name?: string | null;
  value?: object | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiCreateDto {
  isAvailable?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiDto {
  onGet?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiGetDto | null;
  onCreate?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiCreateDto | null;
  onUpdate?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiUpdateDto | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiGetDto {
  isAvailable?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiUpdateDto {
  isAvailable?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyAttributeDto {
  typeSimple?: string | null;
  config?: Record<string, any>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyDto {
  type?: string | null;
  typeSimple?: string | null;
  displayName?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingLocalizableStringDto | null;
  api?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyApiDto | null;
  ui?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiDto | null;
  policy?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyPolicyDto | null;
  attributes?:
    | VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyAttributeDto[]
    | null;
  configuration?: Record<string, any>;
  defaultValue?: object | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyFeaturePolicyDto {
  features?: string[] | null;
  requiresAll?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyGlobalFeaturePolicyDto {
  features?: string[] | null;
  requiresAll?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyPermissionPolicyDto {
  permissionNames?: string[] | null;
  requiresAll?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyPolicyDto {
  globalFeatures?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyGlobalFeaturePolicyDto | null;
  features?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyFeaturePolicyDto | null;
  permissions?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyPermissionPolicyDto | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiDto {
  onTable?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiTableDto | null;
  onCreateForm?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiFormDto | null;
  onEditForm?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiFormDto | null;
  lookup?: VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiLookupDto | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiFormDto {
  isVisible?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiLookupDto {
  url?: string | null;
  resultListPropertyName?: string | null;
  displayPropertyName?: string | null;
  valuePropertyName?: string | null;
  filterParamName?: string | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionPropertyUiTableDto {
  isVisible?: boolean;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingLocalizableStringDto {
  name?: string | null;
  resource?: string | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingModuleExtensionDto {
  entities?: Record<
    string,
    VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingEntityExtensionDto
  >;
  configuration?: Record<string, any>;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingObjectExtensionsDto {
  modules?: Record<
    string,
    VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingModuleExtensionDto
  >;
  enums?: Record<
    string,
    VoloAbpAspNetCoreMvcApplicationConfigurationsObjectExtendingExtensionEnumDto
  >;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsTimeZone {
  iana?: VoloAbpAspNetCoreMvcApplicationConfigurationsIanaTimeZone | null;
  windows?: VoloAbpAspNetCoreMvcApplicationConfigurationsWindowsTimeZone | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsTimingDto {
  timeZone?: VoloAbpAspNetCoreMvcApplicationConfigurationsTimeZone | null;
}

export interface VoloAbpAspNetCoreMvcApplicationConfigurationsWindowsTimeZone {
  timeZoneId?: string | null;
}

export interface VoloAbpAspNetCoreMvcMultiTenancyCurrentTenantDto {
  /** @format uuid */
  id?: string | null;
  name?: string | null;
  isAvailable?: boolean;
}

export interface VoloAbpAspNetCoreMvcMultiTenancyFindTenantResultDto {
  success?: boolean;
  /** @format uuid */
  tenantId?: string | null;
  name?: string | null;
  normalizedName?: string | null;
  isActive?: boolean;
}

export interface VoloAbpAspNetCoreMvcMultiTenancyMultiTenancyInfoDto {
  isEnabled?: boolean;
}

export interface VoloAbpFeatureManagementFeatureDto {
  name?: string | null;
  displayName?: string | null;
  value?: string | null;
  provider?: VoloAbpFeatureManagementFeatureProviderDto | null;
  description?: string | null;
  valueType?: VoloAbpValidationStringValuesIStringValueType | null;
  /** @format int32 */
  depth?: number;
  parentName?: string | null;
}

export interface VoloAbpFeatureManagementFeatureGroupDto {
  name?: string | null;
  displayName?: string | null;
  features?: VoloAbpFeatureManagementFeatureDto[] | null;
}

export interface VoloAbpFeatureManagementFeatureProviderDto {
  name?: string | null;
  key?: string | null;
}

export interface VoloAbpFeatureManagementGetFeatureListResultDto {
  groups?: VoloAbpFeatureManagementFeatureGroupDto[] | null;
}

export interface VoloAbpFeatureManagementUpdateFeatureDto {
  name?: string | null;
  value?: string | null;
}

export interface VoloAbpFeatureManagementUpdateFeaturesDto {
  features?: VoloAbpFeatureManagementUpdateFeatureDto[] | null;
}

export interface VoloAbpHttpModelingActionApiDescriptionModel {
  uniqueName?: string | null;
  name?: string | null;
  httpMethod?: string | null;
  url?: string | null;
  supportedVersions?: string[] | null;
  parametersOnMethod?:
    | VoloAbpHttpModelingMethodParameterApiDescriptionModel[]
    | null;
  parameters?: VoloAbpHttpModelingParameterApiDescriptionModel[] | null;
  returnValue?: VoloAbpHttpModelingReturnValueApiDescriptionModel | null;
  allowAnonymous?: boolean | null;
  implementFrom?: string | null;
}

export interface VoloAbpHttpModelingApplicationApiDescriptionModel {
  modules?: Record<string, VoloAbpHttpModelingModuleApiDescriptionModel>;
  types?: Record<string, VoloAbpHttpModelingTypeApiDescriptionModel>;
}

export interface VoloAbpHttpModelingControllerApiDescriptionModel {
  controllerName?: string | null;
  controllerGroupName?: string | null;
  isRemoteService?: boolean;
  isIntegrationService?: boolean;
  apiVersion?: string | null;
  type?: string | null;
  interfaces?:
    | VoloAbpHttpModelingControllerInterfaceApiDescriptionModel[]
    | null;
  actions?: Record<string, VoloAbpHttpModelingActionApiDescriptionModel>;
}

export interface VoloAbpHttpModelingControllerInterfaceApiDescriptionModel {
  type?: string | null;
  name?: string | null;
  methods?: VoloAbpHttpModelingInterfaceMethodApiDescriptionModel[] | null;
}

export interface VoloAbpHttpModelingInterfaceMethodApiDescriptionModel {
  name?: string | null;
  parametersOnMethod?:
    | VoloAbpHttpModelingMethodParameterApiDescriptionModel[]
    | null;
  returnValue?: VoloAbpHttpModelingReturnValueApiDescriptionModel | null;
}

export interface VoloAbpHttpModelingMethodParameterApiDescriptionModel {
  name?: string | null;
  typeAsString?: string | null;
  type?: string | null;
  typeSimple?: string | null;
  isOptional?: boolean;
  defaultValue?: object | null;
}

export interface VoloAbpHttpModelingModuleApiDescriptionModel {
  rootPath?: string | null;
  remoteServiceName?: string | null;
  controllers?: Record<
    string,
    VoloAbpHttpModelingControllerApiDescriptionModel
  >;
}

export interface VoloAbpHttpModelingParameterApiDescriptionModel {
  nameOnMethod?: string | null;
  name?: string | null;
  jsonName?: string | null;
  type?: string | null;
  typeSimple?: string | null;
  isOptional?: boolean;
  defaultValue?: object | null;
  constraintTypes?: string[] | null;
  bindingSourceId?: string | null;
  descriptorName?: string | null;
}

export interface VoloAbpHttpModelingPropertyApiDescriptionModel {
  name?: string | null;
  jsonName?: string | null;
  type?: string | null;
  typeSimple?: string | null;
  isRequired?: boolean;
  /** @format int32 */
  minLength?: number | null;
  /** @format int32 */
  maxLength?: number | null;
  minimum?: string | null;
  maximum?: string | null;
  regex?: string | null;
}

export interface VoloAbpHttpModelingReturnValueApiDescriptionModel {
  type?: string | null;
  typeSimple?: string | null;
}

export interface VoloAbpHttpModelingTypeApiDescriptionModel {
  baseType?: string | null;
  isEnum?: boolean;
  enumNames?: string[] | null;
  enumValues?: any[] | null;
  genericArguments?: string[] | null;
  properties?: VoloAbpHttpModelingPropertyApiDescriptionModel[] | null;
}

export interface VoloAbpHttpRemoteServiceErrorInfo {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  data?: Record<string, any>;
  validationErrors?: VoloAbpHttpRemoteServiceValidationErrorInfo[] | null;
}

export interface VoloAbpHttpRemoteServiceErrorResponse {
  error?: VoloAbpHttpRemoteServiceErrorInfo | null;
}

export interface VoloAbpHttpRemoteServiceValidationErrorInfo {
  message?: string | null;
  members?: string[] | null;
}

export type VoloAbpIdentityIdentityRoleCreateDto =
  VoloAbpIdentityIdentityRoleCreateOrUpdateDtoBase;

export interface VoloAbpIdentityIdentityRoleCreateOrUpdateDtoBase {
  extraProperties?: Record<string, any>;
  /**
   * @minLength 0
   * @maxLength 256
   */
  name: string;
  isDefault?: boolean;
  isPublic?: boolean;
}

export interface VoloAbpIdentityIdentityRoleDto {
  extraProperties?: Record<string, any>;
  /** @format uuid */
  id?: string;
  name?: string | null;
  isDefault?: boolean;
  isStatic?: boolean;
  isPublic?: boolean;
  concurrencyStamp?: string | null;
  /** @format date-time */
  creationTime?: string;
}

export type VoloAbpIdentityIdentityRoleUpdateDto =
  VoloAbpIdentityIdentityRoleCreateOrUpdateDtoBase & {
    concurrencyStamp?: string | null;
  };

export type VoloAbpIdentityIdentityUserCreateDto =
  VoloAbpIdentityIdentityUserCreateOrUpdateDtoBase & {
    /**
     * @minLength 0
     * @maxLength 128
     */
    password: string;
  };

export interface VoloAbpIdentityIdentityUserCreateOrUpdateDtoBase {
  extraProperties?: Record<string, any>;
  /**
   * @minLength 0
   * @maxLength 256
   */
  userName: string;
  /**
   * @minLength 0
   * @maxLength 64
   */
  name?: string | null;
  /**
   * @minLength 0
   * @maxLength 64
   */
  surname?: string | null;
  /**
   * @format email
   * @minLength 0
   * @maxLength 256
   */
  email: string;
  /**
   * @minLength 0
   * @maxLength 16
   */
  phoneNumber?: string | null;
  isActive?: boolean;
  lockoutEnabled?: boolean;
  roleNames?: string[] | null;
}

export interface VoloAbpIdentityIdentityUserDto {
  extraProperties?: Record<string, any>;
  /** @format uuid */
  id?: string;
  /** @format date-time */
  creationTime?: string;
  /** @format uuid */
  creatorId?: string | null;
  /** @format date-time */
  lastModificationTime?: string | null;
  /** @format uuid */
  lastModifierId?: string | null;
  isDeleted?: boolean;
  /** @format uuid */
  deleterId?: string | null;
  /** @format date-time */
  deletionTime?: string | null;
  /** @format uuid */
  tenantId?: string | null;
  userName?: string | null;
  name?: string | null;
  surname?: string | null;
  email?: string | null;
  emailConfirmed?: boolean;
  phoneNumber?: string | null;
  phoneNumberConfirmed?: boolean;
  isActive?: boolean;
  lockoutEnabled?: boolean;
  /** @format int32 */
  accessFailedCount?: number;
  /** @format date-time */
  lockoutEnd?: string | null;
  concurrencyStamp?: string | null;
  /** @format int32 */
  entityVersion?: number;
  /** @format date-time */
  lastPasswordChangeTime?: string | null;
}

export type VoloAbpIdentityIdentityUserUpdateDto =
  VoloAbpIdentityIdentityUserCreateOrUpdateDtoBase & {
    /**
     * @minLength 0
     * @maxLength 128
     */
    password?: string | null;
    concurrencyStamp?: string | null;
  };

export interface VoloAbpIdentityIdentityUserUpdateRolesDto {
  roleNames: string[];
}

export interface VoloAbpLocalizationLanguageInfo {
  cultureName?: string | null;
  uiCultureName?: string | null;
  displayName?: string | null;
  twoLetterISOLanguageName?: string | null;
}

export type VoloAbpNameValue =
  VoloAbpNameValue1SystemStringSystemPrivateCoreLibVersion9000CultureNeutralPublicKeyToken7Cec85D7Bea7798E;

export interface VoloAbpNameValue1SystemStringSystemPrivateCoreLibVersion9000CultureNeutralPublicKeyToken7Cec85D7Bea7798E {
  name?: string | null;
  value?: string | null;
}

export interface VoloAbpPermissionManagementGetPermissionListResultDto {
  entityDisplayName?: string | null;
  groups?: VoloAbpPermissionManagementPermissionGroupDto[] | null;
}

export interface VoloAbpPermissionManagementPermissionGrantInfoDto {
  name?: string | null;
  displayName?: string | null;
  parentName?: string | null;
  isGranted?: boolean;
  allowedProviders?: string[] | null;
  grantedProviders?: VoloAbpPermissionManagementProviderInfoDto[] | null;
}

export interface VoloAbpPermissionManagementPermissionGroupDto {
  name?: string | null;
  displayName?: string | null;
  displayNameKey?: string | null;
  displayNameResource?: string | null;
  permissions?: VoloAbpPermissionManagementPermissionGrantInfoDto[] | null;
}

export interface VoloAbpPermissionManagementProviderInfoDto {
  providerName?: string | null;
  providerKey?: string | null;
}

export interface VoloAbpPermissionManagementUpdatePermissionDto {
  name?: string | null;
  isGranted?: boolean;
}

export interface VoloAbpPermissionManagementUpdatePermissionsDto {
  permissions?: VoloAbpPermissionManagementUpdatePermissionDto[] | null;
}

export interface VoloAbpSettingManagementEmailSettingsDto {
  smtpHost?: string | null;
  /** @format int32 */
  smtpPort?: number;
  smtpUserName?: string | null;
  smtpPassword?: string | null;
  smtpDomain?: string | null;
  smtpEnableSsl?: boolean;
  smtpUseDefaultCredentials?: boolean;
  defaultFromAddress?: string | null;
  defaultFromDisplayName?: string | null;
}

export interface VoloAbpSettingManagementSendTestEmailInput {
  /** @minLength 1 */
  senderEmailAddress: string;
  /** @minLength 1 */
  targetEmailAddress: string;
  /** @minLength 1 */
  subject: string;
  body?: string | null;
}

export interface VoloAbpSettingManagementUpdateEmailSettingsDto {
  /** @maxLength 256 */
  smtpHost?: string | null;
  /**
   * @format int32
   * @min 1
   * @max 65535
   */
  smtpPort?: number;
  /** @maxLength 1024 */
  smtpUserName?: string | null;
  /**
   * @format password
   * @maxLength 1024
   */
  smtpPassword?: string | null;
  /** @maxLength 1024 */
  smtpDomain?: string | null;
  smtpEnableSsl?: boolean;
  smtpUseDefaultCredentials?: boolean;
  /**
   * @minLength 1
   * @maxLength 1024
   */
  defaultFromAddress: string;
  /**
   * @minLength 1
   * @maxLength 1024
   */
  defaultFromDisplayName: string;
}

export type VoloAbpTenantManagementTenantCreateDto =
  VoloAbpTenantManagementTenantCreateOrUpdateDtoBase & {
    /**
     * @format email
     * @minLength 1
     * @maxLength 256
     */
    adminEmailAddress: string;
    /**
     * @minLength 1
     * @maxLength 128
     */
    adminPassword: string;
  };

export interface VoloAbpTenantManagementTenantCreateOrUpdateDtoBase {
  extraProperties?: Record<string, any>;
  /**
   * @minLength 0
   * @maxLength 64
   */
  name: string;
}

export interface VoloAbpTenantManagementTenantDto {
  extraProperties?: Record<string, any>;
  /** @format uuid */
  id?: string;
  name?: string | null;
  concurrencyStamp?: string | null;
}

export type VoloAbpTenantManagementTenantUpdateDto =
  VoloAbpTenantManagementTenantCreateOrUpdateDtoBase & {
    concurrencyStamp?: string | null;
  };

export interface VoloAbpUsersUserData {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  tenantId?: string | null;
  userName?: string | null;
  name?: string | null;
  surname?: string | null;
  isActive?: boolean;
  email?: string | null;
  emailConfirmed?: boolean;
  phoneNumber?: string | null;
  phoneNumberConfirmed?: boolean;
  extraProperties?: Record<string, any>;
}

export interface VoloAbpValidationStringValuesIStringValueType {
  name?: string | null;
  properties?: Record<string, any>;
  validator?: VoloAbpValidationStringValuesIValueValidator | null;
}

export interface VoloAbpValidationStringValuesIValueValidator {
  name?: string | null;
  properties?: Record<string, any>;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title SmartAbp API
 * @version v1
 *
 * SmartAbp 低代码平台 REST API - 后端SSOT架构
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags AbpApiDefinition
     * @name AbpApiDefinitionList
     * @request GET:/api/abp/api-definition
     */
    abpApiDefinitionList: (
      query?: {
        IncludeTypes?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpHttpModelingApplicationApiDescriptionModel,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/abp/api-definition`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags AbpApplicationConfiguration
     * @name AbpApplicationConfigurationList
     * @request GET:/api/abp/application-configuration
     */
    abpApplicationConfigurationList: (
      query?: {
        IncludeLocalizationResources?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationConfigurationDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/abp/application-configuration`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags AbpApplicationLocalization
     * @name AbpApplicationLocalizationList
     * @request GET:/api/abp/application-localization
     */
    abpApplicationLocalizationList: (
      query: {
        CultureName: string;
        OnlyDynamics?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpAspNetCoreMvcApplicationConfigurationsApplicationLocalizationDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/abp/application-localization`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags AbpTenant
     * @name AbpMultiTenancyTenantsByNameDetail
     * @request GET:/api/abp/multi-tenancy/tenants/by-name/{name}
     */
    abpMultiTenancyTenantsByNameDetail: (
      name: string,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpAspNetCoreMvcMultiTenancyFindTenantResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/abp/multi-tenancy/tenants/by-name/${name}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags AbpTenant
     * @name AbpMultiTenancyTenantsByIdDetail
     * @request GET:/api/abp/multi-tenancy/tenants/by-id/{id}
     */
    abpMultiTenancyTenantsByIdDetail: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpAspNetCoreMvcMultiTenancyFindTenantResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/abp/multi-tenancy/tenants/by-id/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountRegisterCreate
     * @request POST:/api/account/register
     */
    accountRegisterCreate: (
      data: VoloAbpAccountRegisterDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpIdentityIdentityUserDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/account/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountSendPasswordResetCodeCreate
     * @request POST:/api/account/send-password-reset-code
     */
    accountSendPasswordResetCodeCreate: (
      data: VoloAbpAccountSendPasswordResetCodeDto,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/account/send-password-reset-code`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountVerifyPasswordResetTokenCreate
     * @request POST:/api/account/verify-password-reset-token
     */
    accountVerifyPasswordResetTokenCreate: (
      data: VoloAbpAccountVerifyPasswordResetTokenInput,
      params: RequestParams = {},
    ) =>
      this.request<boolean, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/account/verify-password-reset-token`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountResetPasswordCreate
     * @request POST:/api/account/reset-password
     */
    accountResetPasswordCreate: (
      data: VoloAbpAccountResetPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/account/reset-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesList
     * @request GET:/api/business-rules
     */
    businessRulesList: (
      query?: {
        SearchKeyword?: string;
        EntityName?: string;
        Type?: string;
        IsActive?: boolean;
        HasError?: boolean;
        Sorting?: string;
        /**
         * @format int32
         * @min 0
         * @max 2147483647
         */
        SkipCount?: number;
        /**
         * @format int32
         * @min 1
         * @max 2147483647
         */
        MaxResultCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpApplicationDtosPagedResultDto1SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDtoSmartAbpApplicationContractsVersion1000CultureNeutralPublicKeyTokenNull,
        any
      >({
        path: `/api/business-rules`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesCreate
     * @request POST:/api/business-rules
     */
    businessRulesCreate: (
      data: SmartAbpApplicationContractsBusinessRulesDtosCreateBusinessRuleDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDto,
        any
      >({
        path: `/api/business-rules`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesDetail
     * @request GET:/api/business-rules/{id}
     */
    businessRulesDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDto,
        any
      >({
        path: `/api/business-rules/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesUpdate
     * @request PUT:/api/business-rules/{id}
     */
    businessRulesUpdate: (
      id: string,
      data: SmartAbpApplicationContractsBusinessRulesDtosUpdateBusinessRuleDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDto,
        any
      >({
        path: `/api/business-rules/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesDelete
     * @request DELETE:/api/business-rules/{id}
     */
    businessRulesDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/business-rules/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesExecuteCreate
     * @request POST:/api/business-rules/execute
     */
    businessRulesExecuteCreate: (
      data: SmartAbpApplicationContractsBusinessRulesDtosExecuteBusinessRuleDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleExecutionResultDto[],
        any
      >({
        path: `/api/business-rules/execute`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesValidateCreate
     * @request POST:/api/business-rules/{id}/validate
     */
    businessRulesValidateCreate: (id: string, params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleValidationResultDto,
        any
      >({
        path: `/api/business-rules/${id}/validate`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesValidateAllCreate
     * @request POST:/api/business-rules/validate-all
     */
    businessRulesValidateAllCreate: (params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleValidationResultDto[],
        any
      >({
        path: `/api/business-rules/validate-all`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesStatsList
     * @request GET:/api/business-rules/stats
     */
    businessRulesStatsList: (params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleStatsDto,
        any
      >({
        path: `/api/business-rules/stats`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesEntitiesList
     * @request GET:/api/business-rules/entities
     */
    businessRulesEntitiesList: (params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto[],
        any
      >({
        path: `/api/business-rules/entities`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesEntitiesFieldsList
     * @request GET:/api/business-rules/entities/{entityName}/fields
     */
    businessRulesEntitiesFieldsList: (
      entityName: string,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityFieldDto[],
        any
      >({
        path: `/api/business-rules/entities/${entityName}/fields`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesBatchStatusUpdate
     * @request PUT:/api/business-rules/batch-status
     */
    businessRulesBatchStatusUpdate: (
      data: SmartAbpHttpApiControllersBatchUpdateStatusInput,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/business-rules/batch-status`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesDuplicateCreate
     * @request POST:/api/business-rules/{id}/duplicate
     */
    businessRulesDuplicateCreate: (id: string, params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsBusinessRulesDtosBusinessRuleDto,
        any
      >({
        path: `/api/business-rules/${id}/duplicate`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesValidateScriptCreate
     * @request POST:/api/business-rules/validate-script
     */
    businessRulesValidateScriptCreate: (
      data: SmartAbpApplicationContractsBusinessRulesDtosValidateScriptInput,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationBusinessRulesServicesScriptValidationResult,
        any
      >({
        path: `/api/business-rules/validate-script`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesScriptTypesList
     * @request GET:/api/business-rules/script-types
     */
    businessRulesScriptTypesList: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/api/business-rules/script-types`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesBatchDelete
     * @request DELETE:/api/business-rules/batch
     */
    businessRulesBatchDelete: (
      data: SmartAbpHttpApiControllersBatchDeleteInput,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/business-rules/batch`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesExportCreate
     * @request POST:/api/business-rules/export
     */
    businessRulesExportCreate: (data: string[], params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/business-rules/export`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BusinessRule
     * @name BusinessRulesImportCreate
     * @request POST:/api/business-rules/import
     */
    businessRulesImportCreate: (
      data: SmartAbpHttpApiControllersImportRulesInput,
      params: RequestParams = {},
    ) =>
      this.request<SmartAbpHttpApiControllersImportRulesResultDto, any>({
        path: `/api/business-rules/import`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorConnectionStringsList
     * @request GET:/api/code-generator/connection-strings
     */
    codeGeneratorConnectionStringsList: (params: RequestParams = {}) =>
      this.request<string[], VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/code-generator/connection-strings`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorMenusList
     * @request GET:/api/code-generator/menus
     */
    codeGeneratorMenusList: (params: RequestParams = {}) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9MenuItemDto[],
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/menus`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorGenerateModuleCreate
     * @request POST:/api/code-generator/generate-module
     */
    codeGeneratorGenerateModuleCreate: (
      data: SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9GeneratedModuleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/generate-module`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorUnifiedGenerateModuleCreate
     * @request POST:/api/code-generator/unified/generate-module
     */
    codeGeneratorUnifiedGenerateModuleCreate: (
      data: SmartAbpCodeGeneratorServicesV9UnifiedModuleSchemaDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9GeneratedModuleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/unified/generate-module`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorValidateCqrsDefinitionCreate
     * @request POST:/api/code-generator/validate-cqrs-definition
     */
    codeGeneratorValidateCqrsDefinitionCreate: (
      data: SmartAbpCodeGeneratorServicesCqrsDefinitionDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsCodeGeneratorCqrsValidationResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/validate-cqrs-definition`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorValidateCreate
     * @request POST:/api/code-generator/validate
     */
    codeGeneratorValidateCreate: (
      data: SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9ValidationReportDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/validate`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorDryRunCreate
     * @request POST:/api/code-generator/dry-run
     */
    codeGeneratorDryRunCreate: (
      data: SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9GenerationDryRunResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/dry-run`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorUnifiedValidateCreate
     * @request POST:/api/code-generator/unified/validate
     */
    codeGeneratorUnifiedValidateCreate: (
      data: SmartAbpCodeGeneratorServicesV9UnifiedModuleSchemaDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9ValidationReportDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/unified/validate`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorUnifiedDryRunCreate
     * @request POST:/api/code-generator/unified/dry-run
     */
    codeGeneratorUnifiedDryRunCreate: (
      data: SmartAbpCodeGeneratorServicesV9UnifiedModuleSchemaDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9GenerationDryRunResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/unified/dry-run`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorSchemaVersionManifestList
     * @request GET:/api/code-generator/schema-version-manifest
     */
    codeGeneratorSchemaVersionManifestList: (params: RequestParams = {}) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9SchemaVersionManifestDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/schema-version-manifest`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorTestConnectionCreate
     * @request POST:/api/code-generator/test-connection
     */
    codeGeneratorTestConnectionCreate: (
      data: SmartAbpCodeGeneratorServicesV9DatabaseConnectionRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9DatabaseConnectionTestResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/test-connection`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorIntrospectDbCreate
     * @request POST:/api/code-generator/introspect-db
     */
    codeGeneratorIntrospectDbCreate: (
      data: SmartAbpCodeGeneratorServicesV9DatabaseIntrospectionRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9DatabaseSchemaDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/introspect-db`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorUiConfigList
     * @request GET:/api/code-generator/ui-config
     */
    codeGeneratorUiConfigList: (
      query?: {
        module?: string;
        entity?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9EntityUIConfigDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/ui-config`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorUiConfigCreate
     * @request POST:/api/code-generator/ui-config
     */
    codeGeneratorUiConfigCreate: (
      data: SmartAbpCodeGeneratorServicesV9EntityUIConfigDto,
      query?: {
        module?: string;
        entity?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/code-generator/ui-config`,
        method: "POST",
        query: query,
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorStatusDetail
     * @request GET:/api/code-generator/status/{sessionId}
     */
    codeGeneratorStatusDetail: (
      sessionId: string,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9GenerationStatusDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/status/${sessionId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorExportDetail
     * @request GET:/api/code-generator/export/{sessionId}
     */
    codeGeneratorExportDetail: (
      sessionId: string,
      params: RequestParams = {},
    ) =>
      this.request<any, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/code-generator/export/${sessionId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGeneration
     * @name CodeGeneratorGenerateCqrsCreate
     * @request POST:/api/code-generator/generate-cqrs
     */
    codeGeneratorGenerateCqrsCreate: (
      data: SmartAbpCodeGeneratorServicesCqrsDefinitionDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesGeneratedCqrsSolutionDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/code-generator/generate-cqrs`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CodeGenStats
     * @name CodeGenStatsMyList
     * @request GET:/api/code-gen/stats/my
     */
    codeGenStatsMyList: (params: RequestParams = {}) =>
      this.request<SmartAbpCodeGeneratorDtosCodeGenStatsDto, any>({
        path: `/api/code-gen/stats/my`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags DynamicClaims
     * @name AccountDynamicClaimsRefreshCreate
     * @request POST:/api/account/dynamic-claims/refresh
     */
    accountDynamicClaimsRefreshCreate: (params: RequestParams = {}) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/account/dynamic-claims/refresh`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailSettings
     * @name SettingManagementEmailingList
     * @request GET:/api/setting-management/emailing
     */
    settingManagementEmailingList: (params: RequestParams = {}) =>
      this.request<
        VoloAbpSettingManagementEmailSettingsDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/setting-management/emailing`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailSettings
     * @name SettingManagementEmailingCreate
     * @request POST:/api/setting-management/emailing
     */
    settingManagementEmailingCreate: (
      data: VoloAbpSettingManagementUpdateEmailSettingsDto,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/setting-management/emailing`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EmailSettings
     * @name SettingManagementEmailingSendTestEmailCreate
     * @request POST:/api/setting-management/emailing/send-test-email
     */
    settingManagementEmailingSendTestEmailCreate: (
      data: VoloAbpSettingManagementSendTestEmailInput,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/setting-management/emailing/send-test-email`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingEntitiesList
     * @request GET:/api/lowcode/entity-modeling/entities
     */
    lowcodeEntityModelingEntitiesList: (params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto[],
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/entities`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingEntitiesCreate
     * @request POST:/api/lowcode/entity-modeling/entities
     */
    lowcodeEntityModelingEntitiesCreate: (
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityDefinitionDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/entities`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingEntitiesDetail
     * @request GET:/api/lowcode/entity-modeling/entities/{id}
     */
    lowcodeEntityModelingEntitiesDetail: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/entities/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingEntitiesUpdate
     * @request PUT:/api/lowcode/entity-modeling/entities/{id}
     */
    lowcodeEntityModelingEntitiesUpdate: (
      id: string,
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityDefinitionDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/entities/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingEntitiesDelete
     * @request DELETE:/api/lowcode/entity-modeling/entities/{id}
     */
    lowcodeEntityModelingEntitiesDelete: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/lowcode/entity-modeling/entities/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingEntitiesByNameDetail
     * @request GET:/api/lowcode/entity-modeling/entities/by-name/{name}
     */
    lowcodeEntityModelingEntitiesByNameDetail: (
      name: string,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/entities/by-name/${name}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingFieldsCreate
     * @request POST:/api/lowcode/entity-modeling/fields
     */
    lowcodeEntityModelingFieldsCreate: (
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityFieldDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityFieldDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/fields`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingFieldsUpdate
     * @request PUT:/api/lowcode/entity-modeling/fields/{id}
     */
    lowcodeEntityModelingFieldsUpdate: (
      id: string,
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityFieldDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityFieldDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/fields/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingFieldsDelete
     * @request DELETE:/api/lowcode/entity-modeling/fields/{id}
     */
    lowcodeEntityModelingFieldsDelete: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/lowcode/entity-modeling/fields/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingRelationsList
     * @request GET:/api/lowcode/entity-modeling/relations
     */
    lowcodeEntityModelingRelationsList: (params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityRelationDto[],
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/relations`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingRelationsCreate
     * @request POST:/api/lowcode/entity-modeling/relations
     */
    lowcodeEntityModelingRelationsCreate: (
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityRelationDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityRelationDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/relations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingRelationsUpdate
     * @request PUT:/api/lowcode/entity-modeling/relations/{id}
     */
    lowcodeEntityModelingRelationsUpdate: (
      id: string,
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityRelationDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosEntityRelationDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/relations/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingRelationsDelete
     * @request DELETE:/api/lowcode/entity-modeling/relations/{id}
     */
    lowcodeEntityModelingRelationsDelete: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/lowcode/entity-modeling/relations/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags EntityModeling
     * @name LowcodeEntityModelingValidateSchemaCreate
     * @request POST:/api/lowcode/entity-modeling/validate-schema
     */
    lowcodeEntityModelingValidateSchemaCreate: (params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsLowCodeSchemaValidationResult,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/entity-modeling/validate-schema`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Features
     * @name FeatureManagementFeaturesList
     * @request GET:/api/feature-management/features
     */
    featureManagementFeaturesList: (
      query?: {
        providerName?: string;
        providerKey?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpFeatureManagementGetFeatureListResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/feature-management/features`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Features
     * @name FeatureManagementFeaturesUpdate
     * @request PUT:/api/feature-management/features
     */
    featureManagementFeaturesUpdate: (
      data: VoloAbpFeatureManagementUpdateFeaturesDto,
      query?: {
        providerName?: string;
        providerKey?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/feature-management/features`,
        method: "PUT",
        query: query,
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Features
     * @name FeatureManagementFeaturesDelete
     * @request DELETE:/api/feature-management/features
     */
    featureManagementFeaturesDelete: (
      query?: {
        providerName?: string;
        providerKey?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/feature-management/features`,
        method: "DELETE",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags GenerationHistory
     * @name CodeGenGenerationHistoryRecentList
     * @request GET:/api/code-gen/generation-history/recent
     */
    codeGenGenerationHistoryRecentList: (
      query?: {
        /**
         * @format int32
         * @default 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SmartAbpCodeGeneratorDtosGenerationHistoryDto[], any>({
        path: `/api/code-gen/generation-history/recent`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GenerationHistory
     * @name CodeGenGenerationHistoryAllList
     * @request GET:/api/code-gen/generation-history/all
     */
    codeGenGenerationHistoryAllList: (
      query?: {
        /**
         * @format int32
         * @default 0
         */
        skipCount?: number;
        /**
         * @format int32
         * @default 20
         */
        maxResultCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SmartAbpCodeGeneratorDtosGenerationHistoryDto[], any>({
        path: `/api/code-gen/generation-history/all`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GenerationHistory
     * @name CodeGenGenerationHistoryCreate
     * @request POST:/api/code-gen/generation-history
     */
    codeGenGenerationHistoryCreate: (
      data: SmartAbpCodeGeneratorDtosCreateGenerationHistoryDto,
      params: RequestParams = {},
    ) =>
      this.request<SmartAbpCodeGeneratorDtosGenerationHistoryDto, any>({
        path: `/api/code-gen/generation-history`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GenerationHistory
     * @name CodeGenGenerationHistoryDelete
     * @request DELETE:/api/code-gen/generation-history/{id}
     */
    codeGenGenerationHistoryDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/code-gen/generation-history/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags IndustryTemplate
     * @name LowcodeIndustryTemplatesGenerateCreate
     * @request POST:/api/lowcode/industry-templates/generate
     */
    lowcodeIndustryTemplatesGenerateCreate: (
      data: SmartAbpApplicationContractsLowCodeDtosIndustryTemplateConfigDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosIndustryTemplateGenerationResultDto,
        any
      >({
        path: `/api/lowcode/industry-templates/generate`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Login
     * @name AccountLoginCreate
     * @request POST:/api/account/login
     */
    accountLoginCreate: (
      data: VoloAbpAccountWebAreasAccountControllersModelsUserLoginInfo,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpAccountWebAreasAccountControllersModelsAbpLoginResult,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/account/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Login
     * @name AccountLogoutList
     * @request GET:/api/account/logout
     */
    accountLogoutList: (params: RequestParams = {}) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/account/logout`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Login
     * @name AccountCheckPasswordCreate
     * @request POST:/api/account/check-password
     */
    accountCheckPasswordCreate: (
      data: VoloAbpAccountWebAreasAccountControllersModelsUserLoginInfo,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpAccountWebAreasAccountControllersModelsAbpLoginResult,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/account/check-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Metadata
     * @name MetadataRegisterModuleCreate
     * @request POST:/api/metadata/register-module
     */
    metadataRegisterModuleCreate: (
      data: SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/metadata/register-module`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Metadata
     * @name MetadataCreate
     * @request POST:/api/metadata
     */
    metadataCreate: (
      data: SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/metadata`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Metadata
     * @name MetadataUpdate
     * @request PUT:/api/metadata
     */
    metadataUpdate: (
      data: SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/metadata`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Metadata
     * @name MetadataDetail
     * @request GET:/api/metadata/{moduleName}
     */
    metadataDetail: (moduleName: string, params: RequestParams = {}) =>
      this.request<
        SmartAbpCodeGeneratorServicesV9ModuleMetadataDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/metadata/${moduleName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Module
     * @name LowcodeModulesList
     * @request GET:/api/lowcode/modules
     */
    lowcodeModulesList: (
      query?: {
        Filter?: string;
        Status?: string;
        IsActive?: boolean;
        Sorting?: string;
        /**
         * @format int32
         * @min 0
         * @max 2147483647
         */
        SkipCount?: number;
        /**
         * @format int32
         * @min 1
         * @max 2147483647
         */
        MaxResultCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpApplicationDtosPagedResultDto1SmartAbpApplicationContractsLowCodeDtosModuleDtoSmartAbpApplicationContractsVersion1000CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/modules`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Module
     * @name LowcodeModulesCreate
     * @request POST:/api/lowcode/modules
     */
    lowcodeModulesCreate: (
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateModuleDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosModuleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/modules`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Module
     * @name LowcodeModulesDetail
     * @request GET:/api/lowcode/modules/{id}
     */
    lowcodeModulesDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosModuleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/modules/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Module
     * @name LowcodeModulesUpdate
     * @request PUT:/api/lowcode/modules/{id}
     */
    lowcodeModulesUpdate: (
      id: string,
      data: SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateModuleDto,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosModuleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/modules/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Module
     * @name LowcodeModulesDelete
     * @request DELETE:/api/lowcode/modules/{id}
     */
    lowcodeModulesDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/lowcode/modules/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Module
     * @name LowcodeModulesBySystemNameDetail
     * @request GET:/api/lowcode/modules/by-system-name/{systemName}
     */
    lowcodeModulesBySystemNameDetail: (
      systemName: string,
      params: RequestParams = {},
    ) =>
      this.request<
        SmartAbpApplicationContractsLowCodeDtosModuleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/lowcode/modules/by-system-name/${systemName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Permissions
     * @name PermissionManagementPermissionsList
     * @request GET:/api/permission-management/permissions
     */
    permissionManagementPermissionsList: (
      query?: {
        providerName?: string;
        providerKey?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpPermissionManagementGetPermissionListResultDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/permission-management/permissions`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Permissions
     * @name PermissionManagementPermissionsUpdate
     * @request PUT:/api/permission-management/permissions
     */
    permissionManagementPermissionsUpdate: (
      data: VoloAbpPermissionManagementUpdatePermissionsDto,
      query?: {
        providerName?: string;
        providerKey?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/permission-management/permissions`,
        method: "PUT",
        query: query,
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Profile
     * @name AccountMyProfileList
     * @request GET:/api/account/my-profile
     */
    accountMyProfileList: (params: RequestParams = {}) =>
      this.request<
        VoloAbpAccountProfileDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/account/my-profile`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Profile
     * @name AccountMyProfileUpdate
     * @request PUT:/api/account/my-profile
     */
    accountMyProfileUpdate: (
      data: VoloAbpAccountUpdateProfileDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpAccountProfileDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/account/my-profile`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Profile
     * @name AccountMyProfileChangePasswordCreate
     * @request POST:/api/account/my-profile/change-password
     */
    accountMyProfileChangePasswordCreate: (
      data: VoloAbpAccountChangePasswordInput,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/account/my-profile/change-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Role
     * @name IdentityRolesAllList
     * @request GET:/api/identity/roles/all
     */
    identityRolesAllList: (params: RequestParams = {}) =>
      this.request<
        VoloAbpApplicationDtosListResultDto1VoloAbpIdentityIdentityRoleDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/roles/all`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Role
     * @name IdentityRolesList
     * @request GET:/api/identity/roles
     */
    identityRolesList: (
      query?: {
        Filter?: string;
        Sorting?: string;
        /**
         * @format int32
         * @min 0
         * @max 2147483647
         */
        SkipCount?: number;
        /**
         * @format int32
         * @min 1
         * @max 2147483647
         */
        MaxResultCount?: number;
        ExtraProperties?: Record<string, any>;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpApplicationDtosPagedResultDto1VoloAbpIdentityIdentityRoleDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/roles`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Role
     * @name IdentityRolesCreate
     * @request POST:/api/identity/roles
     */
    identityRolesCreate: (
      data: VoloAbpIdentityIdentityRoleCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpIdentityIdentityRoleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/roles`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Role
     * @name IdentityRolesDetail
     * @request GET:/api/identity/roles/{id}
     */
    identityRolesDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        VoloAbpIdentityIdentityRoleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/roles/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Role
     * @name IdentityRolesUpdate
     * @request PUT:/api/identity/roles/{id}
     */
    identityRolesUpdate: (
      id: string,
      data: VoloAbpIdentityIdentityRoleUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpIdentityIdentityRoleDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/roles/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Role
     * @name IdentityRolesDelete
     * @request DELETE:/api/identity/roles/{id}
     */
    identityRolesDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/identity/roles/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsDetail
     * @request GET:/api/multi-tenancy/tenants/{id}
     */
    multiTenancyTenantsDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        VoloAbpTenantManagementTenantDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/multi-tenancy/tenants/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsUpdate
     * @request PUT:/api/multi-tenancy/tenants/{id}
     */
    multiTenancyTenantsUpdate: (
      id: string,
      data: VoloAbpTenantManagementTenantUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpTenantManagementTenantDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/multi-tenancy/tenants/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsDelete
     * @request DELETE:/api/multi-tenancy/tenants/{id}
     */
    multiTenancyTenantsDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/multi-tenancy/tenants/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsList
     * @request GET:/api/multi-tenancy/tenants
     */
    multiTenancyTenantsList: (
      query?: {
        Filter?: string;
        Sorting?: string;
        /**
         * @format int32
         * @min 0
         * @max 2147483647
         */
        SkipCount?: number;
        /**
         * @format int32
         * @min 1
         * @max 2147483647
         */
        MaxResultCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpApplicationDtosPagedResultDto1VoloAbpTenantManagementTenantDtoVoloAbpTenantManagementApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/multi-tenancy/tenants`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsCreate
     * @request POST:/api/multi-tenancy/tenants
     */
    multiTenancyTenantsCreate: (
      data: VoloAbpTenantManagementTenantCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpTenantManagementTenantDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/multi-tenancy/tenants`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsDefaultConnectionStringList
     * @request GET:/api/multi-tenancy/tenants/{id}/default-connection-string
     */
    multiTenancyTenantsDefaultConnectionStringList: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<string, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/multi-tenancy/tenants/${id}/default-connection-string`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsDefaultConnectionStringUpdate
     * @request PUT:/api/multi-tenancy/tenants/{id}/default-connection-string
     */
    multiTenancyTenantsDefaultConnectionStringUpdate: (
      id: string,
      query?: {
        defaultConnectionString?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/multi-tenancy/tenants/${id}/default-connection-string`,
        method: "PUT",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tenant
     * @name MultiTenancyTenantsDefaultConnectionStringDelete
     * @request DELETE:/api/multi-tenancy/tenants/{id}/default-connection-string
     */
    multiTenancyTenantsDefaultConnectionStringDelete: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/multi-tenancy/tenants/${id}/default-connection-string`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags TimeZoneSettings
     * @name SettingManagementTimezoneList
     * @request GET:/api/setting-management/timezone
     */
    settingManagementTimezoneList: (params: RequestParams = {}) =>
      this.request<string, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/setting-management/timezone`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags TimeZoneSettings
     * @name SettingManagementTimezoneCreate
     * @request POST:/api/setting-management/timezone
     */
    settingManagementTimezoneCreate: (
      query?: {
        timezone?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/setting-management/timezone`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags TimeZoneSettings
     * @name SettingManagementTimezoneTimezonesList
     * @request GET:/api/setting-management/timezone/timezones
     */
    settingManagementTimezoneTimezonesList: (params: RequestParams = {}) =>
      this.request<VoloAbpNameValue[], VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/setting-management/timezone/timezones`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersDetail
     * @request GET:/api/identity/users/{id}
     */
    identityUsersDetail: (id: string, params: RequestParams = {}) =>
      this.request<
        VoloAbpIdentityIdentityUserDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersUpdate
     * @request PUT:/api/identity/users/{id}
     */
    identityUsersUpdate: (
      id: string,
      data: VoloAbpIdentityIdentityUserUpdateDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpIdentityIdentityUserDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersDelete
     * @request DELETE:/api/identity/users/{id}
     */
    identityUsersDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/identity/users/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersList
     * @request GET:/api/identity/users
     */
    identityUsersList: (
      query?: {
        Filter?: string;
        Sorting?: string;
        /**
         * @format int32
         * @min 0
         * @max 2147483647
         */
        SkipCount?: number;
        /**
         * @format int32
         * @min 1
         * @max 2147483647
         */
        MaxResultCount?: number;
        ExtraProperties?: Record<string, any>;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpApplicationDtosPagedResultDto1VoloAbpIdentityIdentityUserDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersCreate
     * @request POST:/api/identity/users
     */
    identityUsersCreate: (
      data: VoloAbpIdentityIdentityUserCreateDto,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpIdentityIdentityUserDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersRolesList
     * @request GET:/api/identity/users/{id}/roles
     */
    identityUsersRolesList: (id: string, params: RequestParams = {}) =>
      this.request<
        VoloAbpApplicationDtosListResultDto1VoloAbpIdentityIdentityRoleDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users/${id}/roles`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersRolesUpdate
     * @request PUT:/api/identity/users/{id}/roles
     */
    identityUsersRolesUpdate: (
      id: string,
      data: VoloAbpIdentityIdentityUserUpdateRolesDto,
      params: RequestParams = {},
    ) =>
      this.request<void, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/identity/users/${id}/roles`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersAssignableRolesList
     * @request GET:/api/identity/users/assignable-roles
     */
    identityUsersAssignableRolesList: (params: RequestParams = {}) =>
      this.request<
        VoloAbpApplicationDtosListResultDto1VoloAbpIdentityIdentityRoleDtoVoloAbpIdentityApplicationContractsVersion9110CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users/assignable-roles`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersByUsernameDetail
     * @request GET:/api/identity/users/by-username/{userName}
     */
    identityUsersByUsernameDetail: (
      userName: string,
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpIdentityIdentityUserDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users/by-username/${userName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name IdentityUsersByEmailDetail
     * @request GET:/api/identity/users/by-email/{email}
     */
    identityUsersByEmailDetail: (email: string, params: RequestParams = {}) =>
      this.request<
        VoloAbpIdentityIdentityUserDto,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users/by-email/${email}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserLookup
     * @name IdentityUsersLookupDetail
     * @request GET:/api/identity/users/lookup/{id}
     */
    identityUsersLookupDetail: (id: string, params: RequestParams = {}) =>
      this.request<VoloAbpUsersUserData, VoloAbpHttpRemoteServiceErrorResponse>(
        {
          path: `/api/identity/users/lookup/${id}`,
          method: "GET",
          format: "json",
          ...params,
        },
      ),

    /**
     * No description
     *
     * @tags UserLookup
     * @name IdentityUsersLookupByUsernameDetail
     * @request GET:/api/identity/users/lookup/by-username/{userName}
     */
    identityUsersLookupByUsernameDetail: (
      userName: string,
      params: RequestParams = {},
    ) =>
      this.request<VoloAbpUsersUserData, VoloAbpHttpRemoteServiceErrorResponse>(
        {
          path: `/api/identity/users/lookup/by-username/${userName}`,
          method: "GET",
          format: "json",
          ...params,
        },
      ),

    /**
     * No description
     *
     * @tags UserLookup
     * @name IdentityUsersLookupSearchList
     * @request GET:/api/identity/users/lookup/search
     */
    identityUsersLookupSearchList: (
      query?: {
        Filter?: string;
        Sorting?: string;
        /**
         * @format int32
         * @min 0
         * @max 2147483647
         */
        SkipCount?: number;
        /**
         * @format int32
         * @min 1
         * @max 2147483647
         */
        MaxResultCount?: number;
        ExtraProperties?: Record<string, any>;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        VoloAbpApplicationDtosListResultDto1VoloAbpUsersUserDataVoloAbpUsersAbstractionsVersion9110CultureNeutralPublicKeyTokenNull,
        VoloAbpHttpRemoteServiceErrorResponse
      >({
        path: `/api/identity/users/lookup/search`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserLookup
     * @name IdentityUsersLookupCountList
     * @request GET:/api/identity/users/lookup/count
     */
    identityUsersLookupCountList: (
      query?: {
        Filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<number, VoloAbpHttpRemoteServiceErrorResponse>({
        path: `/api/identity/users/lookup/count`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserProfile
     * @name CodeGenUserProfileMyList
     * @request GET:/api/code-gen/user-profile/my
     */
    codeGenUserProfileMyList: (params: RequestParams = {}) =>
      this.request<SmartAbpCodeGeneratorDtosUserProfileDto, any>({
        path: `/api/code-gen/user-profile/my`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserProfile
     * @name CodeGenUserProfileMyUpdate
     * @request PUT:/api/code-gen/user-profile/my
     */
    codeGenUserProfileMyUpdate: (
      data: SmartAbpCodeGeneratorDtosUpdateUserProfileDto,
      params: RequestParams = {},
    ) =>
      this.request<SmartAbpCodeGeneratorDtosUserProfileDto, any>({
        path: `/api/code-gen/user-profile/my`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags UserProfile
     * @name CodeGenUserProfileRecommendationList
     * @request GET:/api/code-gen/user-profile/recommendation
     */
    codeGenUserProfileRecommendationList: (params: RequestParams = {}) =>
      this.request<SmartAbpCodeGeneratorDtosIndustryRecommendationDto, any>({
        path: `/api/code-gen/user-profile/recommendation`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
