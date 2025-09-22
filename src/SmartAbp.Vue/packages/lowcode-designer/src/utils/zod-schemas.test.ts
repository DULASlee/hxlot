import { describe, it, expect } from "vitest"
import {
  PropertySchema,
  EntitySchema,
  ModuleMetadataSchema,
  CustomPermissionSchema,
  validateModuleMetadata,
  validateEntityDefinition,
  validatePropertyDefinition,
  validateWithErrors,
  safeParse,
} from "./zod-schemas"
import { PropertyType } from "../types/wizard"

describe("Zod Schemas Validation", () => {
  describe("PropertySchema", () => {
    it("should validate valid property", () => {
      const validProperty = {
        name: "userName",
        type: "string",
        displayName: "用户名",
        description: "用户名称",
        required: true,
        maxLength: 50,
      }

      const result = PropertySchema.safeParse(validProperty)
      expect(result.success).toBe(true)
    })

    it("should reject invalid property name", () => {
      const invalidProperty = {
        name: "123user", // 不能以数字开头
        type: "string",
      }

      const result = PropertySchema.safeParse(invalidProperty)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain("Property name must start with letter")
    })

    it("should reject missing required fields", () => {
      const invalidProperty = {
        name: "userName",
        // 缺少 type 字段
      }

      const result = PropertySchema.safeParse(invalidProperty)
      expect(result.success).toBe(false)
    })
  })

  describe("EntitySchema", () => {
    it("should validate valid entity", () => {
      const validEntity = {
        name: "User",
        displayName: "用户",
        description: "用户实体",
        properties: [
          {
            name: "id",
            type: "guid",
            isPrimaryKey: true,
          },
          {
            name: "name",
            type: "string",
            required: true,
          },
        ],
      }

      const result = EntitySchema.safeParse(validEntity)
      expect(result.success).toBe(true)
    })

    it("should reject entity without properties", () => {
      const invalidEntity = {
        name: "User",
        displayName: "用户",
        properties: [], // 空数组
      }

      const result = EntitySchema.safeParse(invalidEntity)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain("Entity must have at least one property")
    })

    it("should reject invalid entity name", () => {
      const invalidEntity = {
        name: "123user", // 不能以数字开头
        displayName: "用户",
        properties: [
          {
            name: "id",
            type: "guid",
          },
        ],
      }

      const result = EntitySchema.safeParse(invalidEntity)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain("Entity name must start with letter")
    })
  })

  describe("ModuleMetadataSchema", () => {
    it("should validate complete module metadata", () => {
      const validMetadata = {
        systemName: "SmartAbp",
        name: "UserManagement",
        displayName: "用户管理模块",
        version: "1.0.0",
        architecturePattern: "DDD",
        featureManagement: {
          isEnabled: true,
          defaultPolicy: "RequireAuthentication",
        },
        entities: [
          {
            name: "User",
            displayName: "用户",
            properties: [
              {
                name: "id",
                type: "guid",
                isPrimaryKey: true,
              },
            ],
          },
        ],
        databaseInfo: {
          connectionStringName: "Default",
          provider: "SqlServer",
        },
        permissionConfig: {
          customActions: [],
        },
      }

      const result = ModuleMetadataSchema.safeParse(validMetadata)
      expect(result.success).toBe(true)
    })

    it("should apply default values", () => {
      const minimalMetadata = {
        systemName: "SmartAbp",
        name: "TestModule",
        displayName: "测试模块",
        entities: [
          {
            name: "Test",
            displayName: "测试",
            properties: [
              {
                name: "id",
                type: "guid",
              },
            ],
          },
        ],
      }

      const result = ModuleMetadataSchema.parse(minimalMetadata)
      expect(result.version).toBe("1.0.0")
      expect(result.architecturePattern).toBe("Crud")
      expect(result.featureManagement.isEnabled).toBe(true)
    })
  })

  describe("Validation Functions", () => {
    it("validateModuleMetadata should return validated data", () => {
      const metadata = {
        systemName: "SmartAbp",
        name: "Test",
        displayName: "测试",
        entities: [
          {
            name: "User",
            displayName: "用户",
            properties: [
              {
                name: "id",
                type: "guid",
              },
            ],
          },
        ],
      }

      const result = validateModuleMetadata(metadata)
      expect(result.name).toBe("Test")
      expect(result.description).toBe("") // 默认值
    })

    it("validateModuleMetadata should throw on invalid data", () => {
      const invalidMetadata = {
        systemName: "smartabp", // 应该以大写字母开头
        name: "Test",
        displayName: "测试",
        entities: [],
      }

      expect(() => validateModuleMetadata(invalidMetadata)).toThrow()
    })

    it("safeParse should return success with valid data", () => {
      const validProperty = {
        name: "test",
        type: "string",
      }

      const result = safeParse(validProperty, PropertySchema)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        ...validProperty,
        description: "", // 默认值
      })
    })

    it("safeParse should return errors with invalid data", () => {
      const invalidProperty = {
        name: "123test", // 无效名称
        type: PropertyType.String,
      }

      const result = safeParse(invalidProperty, PropertySchema)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })
  })

  describe("CustomPermissionSchema", () => {
    it("should validate custom permission", () => {
      const validPermission = {
        entity: "User",
        action: "Export",
        displayName: "导出用户",
      }

      const result = CustomPermissionSchema.safeParse(validPermission)
      expect(result.success).toBe(true)
    })

    it("should reject permission with empty fields", () => {
      const invalidPermission = {
        entity: "",
        action: "Export",
        displayName: "导出用户",
      }

      const result = CustomPermissionSchema.safeParse(invalidPermission)
      expect(result.success).toBe(false)
    })
  })

  describe("Edge Cases", () => {
    it("should handle maximum length constraints", () => {
      const longDescription = "a".repeat(501) // 超过500字符
      const property = {
        name: "test",
        type: "string",
        description: longDescription,
      }

      const result = PropertySchema.safeParse(property)
      expect(result.success).toBe(false)
    })

    it("should validate enum values", () => {
      const property = {
        name: "test",
        type: "InvalidType", // 无效的枚举值
      }

      const result = PropertySchema.safeParse(property)
      expect(result.success).toBe(false)
    })

    it("should validate with error formatting", () => {
      const invalidData = {
        name: "123test",
        type: PropertyType.String,
      }

      expect(() => validateWithErrors(invalidData, PropertySchema)).toThrow()
    })
  })
})
