import { z } from "zod"

// 导入正确的类型定义
import type { PropertyType } from "../types/index"

type ModuleMetadata = any
type EntityDefinition = any
type CustomPermission = any
type EntityProperty = any

// Base schemas
export const PropertySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message:
        "Property name must start with letter or underscore and contain only alphanumeric characters",
    }),
  type: z.string(), // PropertyType仅作为类型，不作为值使用
  displayName: z.string().optional(),
  description: z.string().max(500).default(""),
  required: z.boolean().optional(),
  maxLength: z.number().optional(),
  minLength: z.number().optional(),
  defaultValue: z.any().optional(),
  isPrimaryKey: z.boolean().optional(),
  isForeignKey: z.boolean().optional(),
  inherits: z.boolean().optional(),
})

export const EntitySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message:
        "Entity name must start with letter or underscore and contain only alphanumeric characters",
    }),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isAggregateRoot: z.boolean().default(false),
  isMultiTenant: z.boolean().default(false),
  isSoftDelete: z.boolean().default(false),
  hasExtraProperties: z.boolean().default(false),
  properties: z.array(PropertySchema).min(1, "Entity must have at least one property"),
})

export const CustomPermissionSchema = z.object({
  entity: z.string().min(1),
  action: z.string().min(1),
  displayName: z.string().min(1).max(100),
})

export const DatabaseInfoSchema = z.object({
  connectionStringName: z.string().min(1),
  provider: z.enum(["SqlServer", "PostgreSql", "MySql", "SQLite"]),
  schema: z.string().optional(),
})

export const FeatureManagementSchema = z
  .object({
    isEnabled: z.boolean().default(true),
    defaultPolicy: z
      .enum(["RequireAuthentication", "AllowAnonymous", "RequirePermission"])
      .default("RequireAuthentication"),
  })
  .default({
    isEnabled: true,
    defaultPolicy: "RequireAuthentication",
  })

export const PermissionConfigSchema = z.object({
  customActions: z.array(CustomPermissionSchema).default([]),
})

// Main module metadata schema
export const ModuleMetadataSchema = z.object({
  systemName: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z][a-zA-Z0-9]*$/, {
      message: "System name must be in PascalCase and start with uppercase letter",
    }),
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z][a-zA-Z0-9]*$/, {
      message: "Module name must be in PascalCase and start with uppercase letter",
    }),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be in format x.y.z")
    .default("1.0.0"),
  architecturePattern: z.enum(["Crud", "DDD", "CQRS"]).default("Crud"),
  featureManagement: FeatureManagementSchema,
  entities: z.array(EntitySchema).min(1, "At least one entity is required"),
  databaseInfo: DatabaseInfoSchema.default({
    connectionStringName: "Default",
    provider: "SqlServer",
  }),
  permissionConfig: PermissionConfigSchema.default({ customActions: [] }),
})

// Runtime validation functions
export function validateModuleMetadata(data: unknown): ModuleMetadata {
  const result = ModuleMetadataSchema.parse(data)
  return {
    ...result,
    description: result.description || "",
  }
}

export function validateEntityDefinition(data: unknown): EntityDefinition {
  const result = EntitySchema.parse(data)
  return {
    ...result,
    description: result.description || "",
    properties: result.properties.map((prop) => ({
      ...prop,
      type: prop.type as PropertyType,
    })),
  }
}

export function validatePropertyDefinition(data: unknown): EntityProperty {
  const result = PropertySchema.parse(data)
  return {
    ...result,
    inherits: result.inherits || false,
  }
}

export function validateCustomPermission(data: unknown): CustomPermission {
  return CustomPermissionSchema.parse(data)
}

// Type guards
export function isModuleMetadata(data: unknown): data is ModuleMetadata {
  return ModuleMetadataSchema.safeParse(data).success
}

export function isEntityDefinition(data: unknown): data is EntityDefinition {
  return EntitySchema.safeParse(data).success
}

export function isPropertyDefinition(data: unknown): data is EntityProperty {
  return PropertySchema.safeParse(data).success
}

// Partial validation for incremental updates
export const PartialModuleMetadataSchema = ModuleMetadataSchema.partial()
export const PartialEntitySchema = EntitySchema.partial()
export const PartialPropertySchema = PropertySchema.partial()

// Validation with error formatting
export function validateWithErrors(data: unknown, schema: z.ZodSchema<any>) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      path: err.path.join("."),
      message: err.message,
      code: err.code,
    }))
    throw new Error(JSON.stringify(errors))
  }
  return result.data
}

// Safe parsing with fallback
export function safeParse<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
): { success: boolean; data?: T; errors?: string[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const errors = result.error.issues.map((err) => err.message)
    return { success: false, errors }
  }
}
