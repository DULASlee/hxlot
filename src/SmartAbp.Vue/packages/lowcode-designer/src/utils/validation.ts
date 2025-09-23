/**
 * Validation utilities for wizard data using Zod schemas
 */

import { z } from "zod"
import type { ModuleMetadata, EntityDefinition, EntityProperty } from "../types/wizard"
import { ElMessage } from "element-plus"

/**
 * Entity property validation schema
 */
const EntityPropertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  type: z.string().min(1, "Property type is required"),
  displayName: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  maxLength: z.number().positive().optional(),
  minLength: z.number().nonnegative().optional(),
  pattern: z.string().optional(),
  defaultValue: z.any().optional(),
  isPrimaryKey: z.boolean().optional(),
  isForeignKey: z.boolean().optional(),
  foreignEntity: z.string().optional(),
  foreignProperty: z.string().optional(),
  isNavigationProperty: z.boolean().optional(),
  isReadOnly: z.boolean().optional(),
  isSearchable: z.boolean().optional(),
  isSortable: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  ui: z
    .object({
      component: z.string().optional(),
      options: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
})

/**
 * Entity definition validation schema
 */
const EntityDefinitionSchema = z.object({
  name: z.string().min(1, "Entity name is required"),
  displayName: z.string().optional(),
  description: z.string().optional(),
  namespace: z.string().min(1, "Namespace is required"),
  tableName: z.string().optional(),
  properties: z.array(EntityPropertySchema).min(1, "Entity must have at least one property"),
  primaryKeys: z.array(z.string()).optional(),
  foreignKeys: z
    .array(
      z.object({
        property: z.string(),
        entity: z.string(),
        propertyName: z.string(),
      }),
    )
    .optional(),
  navigationProperties: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        entity: z.string(),
        property: z.string(),
      }),
    )
    .optional(),
  indexes: z
    .array(
      z.object({
        name: z.string(),
        properties: z.array(z.string()),
        isUnique: z.boolean().optional(),
      }),
    )
    .optional(),
  auditEnabled: z.boolean().optional(),
  softDeleteEnabled: z.boolean().optional(),
  multiTenantEnabled: z.boolean().optional(),
  isAbstract: z.boolean().optional(),
  baseEntity: z.string().optional(),
  discriminator: z.string().optional(),
  discriminatorValue: z.string().optional(),
})

/**
 * Module metadata validation schema
 */
export const ModuleMetadataSchema = z.object({
  name: z.string().min(1, "Module name is required"),
  displayName: z.string().optional(),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z"),
  author: z.string().optional(),
  company: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  entities: z.array(EntityDefinitionSchema).min(1, "Module must have at least one entity"),
  permissions: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string(),
        description: z.string().optional(),
        isEnabled: z.boolean().optional(),
      }),
    )
    .optional(),
  features: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string(),
        description: z.string().optional(),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
        provider: z
          .object({
            name: z.string(),
            value: z.string(),
          })
          .optional(),
      }),
    )
    .optional(),
  settings: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string(),
        description: z.string().optional(),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
        provider: z
          .object({
            name: z.string(),
            value: z.string(),
          })
          .optional(),
      }),
    )
    .optional(),
  dependencies: z
    .array(
      z.object({
        name: z.string(),
        version: z.string(),
      }),
    )
    .optional(),
  databaseProvider: z.enum(["SqlServer", "MySQL", "PostgreSQL", "Oracle"]).optional(),
  uiFramework: z.enum(["Vue", "React", "Angular"]).optional(),
  generateMigration: z.boolean().optional(),
  generatePermissions: z.boolean().optional(),
  generateApi: z.boolean().optional(),
  generateUI: z.boolean().optional(),
  generateTests: z.boolean().optional(),
  isMultiTenant: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
})

/**
 * Wizard step validation schema
 */
const WizardStepSchema = z.object({
  id: z.string().min(1, "Step ID is required"),
  title: z.string().min(1, "Step title is required"),
  description: z.string().optional(),
  type: z.enum([
    "basic",
    "entities",
    "properties",
    "permissions",
    "features",
    "settings",
    "review",
  ]),
  isRequired: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  order: z.number().positive().optional(),
  validation: z
    .object({
      requiredFields: z.array(z.string()).optional(),
      customValidator: z.any().optional(),
    })
    .optional(),
  ui: z
    .object({
      component: z.string().optional(),
      props: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
})

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
  severity: "error" | "warning"
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  field: string
  message: string
  code?: string
}

/**
 * Wizard validator class
 */
export class WizardValidator {
  /**
   * Validate module metadata
   */
  static validateModuleMetadata(metadata: any): ValidationResult {
    try {
      // 输入验证
      if (!metadata) {
        return {
          isValid: false,
          errors: [
            { field: "metadata", message: "Module metadata is required", severity: "error" },
          ],
          warnings: [],
        }
      }

      // 如果是字符串，尝试解析JSON
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          return {
            isValid: false,
            errors: [
              { field: "metadata", message: `Invalid JSON: ${errorMessage}`, severity: "error" },
            ],
            warnings: [],
          }
        }
      }

      // 使用Zod模式验证
      const result = ModuleMetadataSchema.safeParse(metadata)

      if (result.success) {
        // 执行自定义验证逻辑
        const customValidation = this.validateCustomModuleRules(metadata)

        return {
          isValid: customValidation.isValid,
          errors: customValidation.errors,
          warnings: customValidation.warnings,
        }
      } else {
        // 转换Zod错误为ValidationError格式
    const errors: ValidationError[] = result.error.issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join(".") : String(err.path ?? ""),
          message: String(err.message ?? "Validation error"),
          code: String((err.code ?? "ZOD_ERROR") as string),
          severity: "error" as const,
        }))

        return {
          isValid: false,
          errors,
          warnings: [],
        }
      }
    } catch (error) {
      console.error("[validateModuleMetadata] 验证模块元数据失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Module validation failed: ${errorMessage}`,
        duration: 4000,
      })

      return {
        isValid: false,
        errors: [
          { field: "metadata", message: `Validation error: ${errorMessage}`, severity: "error" },
        ],
        warnings: [],
      }
    }
  }

  /**
   * Validate entity definition
   */
  static validateEntityDefinition(entity: any): ValidationResult {
    try {
      // 输入验证
      if (!entity) {
        return {
          isValid: false,
          errors: [
            { field: "entity", message: "Entity definition is required", severity: "error" },
          ],
          warnings: [],
        }
      }

      // 使用Zod模式验证
      const result = EntityDefinitionSchema.safeParse(entity)

      if (result.success) {
        // 执行自定义验证逻辑
        const customValidation = this.validateCustomEntityRules(entity)

        return {
          isValid: customValidation.isValid,
          errors: customValidation.errors,
          warnings: customValidation.warnings,
        }
      } else {
        // 转换Zod错误为ValidationError格式
        const errors: ValidationError[] = result.error.issues.map((err) => ({
          field: `entity.${err.path.join(".")}`,
          message: err.message,
          code: err.code,
          severity: "error" as const,
        }))

        return {
          isValid: false,
          errors,
          warnings: [],
        }
      }
    } catch (error) {
      console.error("[validateEntityDefinition] 验证实体定义失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Entity validation failed: ${errorMessage}`,
        duration: 4000,
      })

      return {
        isValid: false,
        errors: [
          { field: "entity", message: `Validation error: ${errorMessage}`, severity: "error" },
        ],
        warnings: [],
      }
    }
  }

  /**
   * Validate entity property
   */
  static validateEntityProperty(property: any): ValidationResult {
    try {
      // 输入验证
      if (!property) {
        return {
          isValid: false,
          errors: [
            { field: "property", message: "Entity property is required", severity: "error" },
          ],
          warnings: [],
        }
      }

      // 使用Zod模式验证
      const result = EntityPropertySchema.safeParse(property)

      if (result.success) {
        // 执行自定义验证逻辑
        const customValidation = this.validateCustomPropertyRules(property)

        return {
          isValid: customValidation.isValid,
          errors: customValidation.errors,
          warnings: customValidation.warnings,
        }
      } else {
        // 转换Zod错误为ValidationError格式
        const errors: ValidationError[] = result.error.issues.map((err) => ({
          field: `property.${err.path.join(".")}`,
          message: err.message,
          code: err.code,
          severity: "error" as const,
        }))

        return {
          isValid: false,
          errors,
          warnings: [],
        }
      }
    } catch (error) {
      console.error("[validateEntityProperty] 验证实体属性失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Property validation failed: ${errorMessage}`,
        duration: 4000,
      })

      return {
        isValid: false,
        errors: [
          { field: "property", message: `Validation error: ${errorMessage}`, severity: "error" },
        ],
        warnings: [],
      }
    }
  }

  /**
   * Validate wizard step
   */
  static validateWizardStep(step: any): ValidationResult {
    try {
      // 输入验证
      if (!step) {
        return {
          isValid: false,
          errors: [{ field: "step", message: "Wizard step is required", severity: "error" }],
          warnings: [],
        }
      }

      // 使用Zod模式验证
      const result = WizardStepSchema.safeParse(step)

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          warnings: [],
        }
      } else {
        // 转换Zod错误为ValidationError格式
        const errors: ValidationError[] = result.error.issues.map((err) => ({
          field: `step.${err.path.join(".")}`,
          message: err.message,
          code: err.code,
          severity: "error" as const,
        }))

        return {
          isValid: false,
          errors,
          warnings: [],
        }
      }
    } catch (error) {
      console.error("[validateWizardStep] 验证向导步骤失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Step validation failed: ${errorMessage}`,
        duration: 4000,
      })

      return {
        isValid: false,
        errors: [
          { field: "step", message: `Validation error: ${errorMessage}`, severity: "error" },
        ],
        warnings: [],
      }
    }
  }

  /**
   * Validate type
   */
  static validateType(value: any, type: string): ValidationResult {
    try {
      // 输入验证
      if (!type?.trim()) {
        return {
          isValid: false,
          errors: [{ field: "type", message: "Type is required", severity: "error" }],
          warnings: [],
        }
      }

      // 根据类型进行验证
      switch (type.toLowerCase()) {
        case "string":
          return {
            isValid: typeof value === "string",
            errors:
              typeof value === "string"
                ? []
                : [{ field: "value", message: "Value must be a string", severity: "error" }],
            warnings: [],
          }
        case "number":
          return {
            isValid: typeof value === "number" && !isNaN(value),
            errors:
              typeof value === "number" && !isNaN(value)
                ? []
                : [{ field: "value", message: "Value must be a valid number", severity: "error" }],
            warnings: [],
          }
        case "boolean":
          return {
            isValid: typeof value === "boolean",
            errors:
              typeof value === "boolean"
                ? []
                : [{ field: "value", message: "Value must be a boolean", severity: "error" }],
            warnings: [],
          }
        case "array":
          return {
            isValid: Array.isArray(value),
            errors: Array.isArray(value)
              ? []
              : [{ field: "value", message: "Value must be an array", severity: "error" }],
            warnings: [],
          }
        case "object":
          return {
            isValid: typeof value === "object" && value !== null && !Array.isArray(value),
            errors:
              typeof value === "object" && value !== null && !Array.isArray(value)
                ? []
                : [{ field: "value", message: "Value must be an object", severity: "error" }],
            warnings: [],
          }
        default:
          return {
            isValid: true,
            errors: [],
            warnings: [{ field: "type", message: `Unknown type: ${type}`, code: "unknown_type" }],
          }
      }
    } catch (error) {
      console.error("[validateType] 验证类型失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Type validation failed: ${errorMessage}`,
        duration: 4000,
      })

      return {
        isValid: false,
        errors: [
          { field: "type", message: `Validation error: ${errorMessage}`, severity: "error" },
        ],
        warnings: [],
      }
    }
  }

  /**
   * Create validator function
   */
  static createValidator<T>(schema: z.ZodSchema<T>): (value: unknown) => ValidationResult {
    try {
      // 验证参数
      if (!schema) {
        throw new Error("Schema is required")
      }

      return (value: unknown): ValidationResult => {
        try {
          const result = schema.safeParse(value)

          if (result.success) {
            return {
              isValid: true,
              errors: [],
              warnings: [],
            }
          } else {
            // 转换Zod错误为ValidationError格式
            const errors: ValidationError[] = result.error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
              severity: "error" as const,
            }))

            return {
              isValid: false,
              errors,
              warnings: [],
            }
          }
        } catch (error) {
          console.error("[createValidator] 验证失败:", error)

          const errorMessage = error instanceof Error ? error.message : String(error)

          return {
            isValid: false,
            errors: [
              { field: "value", message: `Validation error: ${errorMessage}`, severity: "error" },
            ],
            warnings: [],
          }
        }
      }
    } catch (error) {
      console.error("[createValidator] 创建验证器失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to create validator: ${errorMessage}`,
        duration: 4000,
      })

      // 返回默认验证器
      return (value: any): ValidationResult => ({
        isValid: false,
        errors: [
          {
            field: "validator",
            message: `Validator creation failed: ${errorMessage}`,
            severity: "error",
          },
        ],
        warnings: [],
      })
    }
  }

  /**
   * Validate custom module rules
   */
  private static validateCustomModuleRules(module: ModuleMetadata): {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
  } {
    try {
      const errors: ValidationError[] = []
      const warnings: ValidationWarning[] = []

      // 检查实体名称重复
      const entityNames = module.entities.map((e) => e.name)
      const duplicateNames = entityNames.filter(
        (name, index) => entityNames.indexOf(name) !== index,
      )
      if (duplicateNames.length > 0) {
        errors.push({
          field: "entities",
          message: `Duplicate entity names found: ${duplicateNames.join(", ")}`,
          severity: "error",
        })
      }

      // 检查权限名称重复
      /* TODO: Re-enable after clarifying ModuleMetadata type
      if (module.permissions) {
        const permissionNames = module.permissions.map((p: any) => p.name)
        const duplicatePermissions = permissionNames.filter(
          (name: string, index: number) => permissionNames.indexOf(name) !== index,
        )
        if (duplicatePermissions.length > 0) {
          warnings.push({
            field: "permissions",
            message: `Duplicate permission names found: ${duplicatePermissions.join(", ")}`,
            code: "duplicate_permission_names",
          })
        }
      }
      */

      // 检查功能名称重复
      /* TODO: Re-enable after clarifying ModuleMetadata type
      if (module.features) {
        const featureNames = module.features.map((f: any) => f.name)
        const duplicateFeatures = featureNames.filter(
          (name: string, index: number) => featureNames.indexOf(name) !== index,
        )
        if (duplicateFeatures.length > 0) {
          warnings.push({
            field: "features",
            message: `Duplicate feature names found: ${duplicateFeatures.join(", ")}`,
            code: "duplicate_feature_names",
          })
        }
      }
      */

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      }
    } catch (error) {
      console.error("[validateCustomModuleRules] 验证自定义模块规则失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      return {
        isValid: false,
        errors: [
          {
            field: "module",
            message: `Custom validation error: ${errorMessage}`,
            severity: "error",
          },
        ],
        warnings: [],
      }
    }
  }

  /**
   * Validate custom entity rules
   */
  private static validateCustomEntityRules(entity: EntityDefinition): {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
  } {
    try {
      const errors: ValidationError[] = []
      const warnings: ValidationWarning[] = []

      // 检查属性名称重复
      const propertyNames = entity.properties.map((p) => p.name)
      const duplicateNames = propertyNames.filter(
        (name, index) => propertyNames.indexOf(name) !== index,
      )
      if (duplicateNames.length > 0) {
        errors.push({
          field: "properties",
          message: `Duplicate property names found: ${duplicateNames.join(", ")}`,
          severity: "error",
        })
      }

      // 检查主键设置
      if (!entity.primaryKeys || entity.primaryKeys.length === 0) {
        // 如果没有明确设置主键，检查是否有属性标记为主键
        const primaryKeyProperties = entity.properties.filter((p) => p.isPrimaryKey)
        if (primaryKeyProperties.length === 0) {
          warnings.push({
            field: "primaryKeys",
            message: "No primary key defined for entity",
            code: "missing_primary_key",
          })
        }
      }

      // 检查外键引用
      if (entity.foreignKeys) {
        entity.foreignKeys.forEach((fk, index) => {
          const propertyExists = entity.properties.some((p) => p.name === fk.property)
          if (!propertyExists) {
            errors.push({
              field: `foreignKeys[${index}].property`,
              message: `Foreign key property '${fk.property}' not found in entity properties`,
              severity: "error",
            })
          }
        })
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      }
    } catch (error) {
      console.error("[validateCustomEntityRules] 验证自定义实体规则失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      return {
        isValid: false,
        errors: [
          {
            field: "entity",
            message: `Custom validation error: ${errorMessage}`,
            severity: "error",
          },
        ],
        warnings: [],
      }
    }
  }

  /**
   * Validate custom property rules
   */
  private static validateCustomPropertyRules(property: EntityProperty): {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
  } {
    try {
      const errors: ValidationError[] = []
      const warnings: ValidationWarning[] = []

      // 检查属性名称有效性
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(property.name)) {
        errors.push({
          field: "name",
          message:
            "Property name must start with a letter or underscore and contain only letters, numbers, and underscores",
          severity: "error",
        })
      }

      // 检查字符串类型的长度限制
      if (property.type === "string" && property.maxLength && property.minLength) {
        if (property.minLength > property.maxLength) {
          errors.push({
            field: "validation",
            message: "Minimum length cannot be greater than maximum length",
            severity: "error",
          })
        }
      }

      // 检查默认值类型匹配
      if (property.defaultValue !== undefined && property.type) {
        const typeValidation = this.validateType(property.defaultValue, property.type)
        if (!typeValidation.isValid) {
          errors.push({
            field: "defaultValue",
            message: `Default value type does not match property type '${property.type}'`,
            severity: "error",
          })
        }
      }

      // 检查导航属性设置
      if (property.isNavigationProperty && !property.foreignEntity) {
        warnings.push({
          field: "foreignEntity",
          message: "Navigation property should specify foreign entity",
          code: "missing_foreign_entity",
        })
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      }
    } catch (error) {
      console.error("[validateCustomPropertyRules] 验证自定义属性规则失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      return {
        isValid: false,
        errors: [
          {
            field: "property",
            message: `Custom validation error: ${errorMessage}`,
            severity: "error",
          },
        ],
        warnings: [],
      }
    }
  }
}
