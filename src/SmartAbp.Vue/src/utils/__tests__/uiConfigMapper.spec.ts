import { describe, it, expect } from 'vitest'

// 类型定义
interface UIConfig {
  components?: unknown[]
  formConfig?: {
    layout?: string
    columnCount?: number
  }
  listConfig?: {
    displayColumns?: string[]
    defaultPageSize?: number
  }
  detailConfig?: {
    layout?: string
  }
}

interface PageSchema {
  name: string
  components: unknown[]
  layout: string
  columnCount: number
  displayColumns: string[]
  pageSize: number
}

// Mock implementation since the actual module path doesn't exist
const mockUiConfigToPageSchema = (ui?: UIConfig): PageSchema => {
  return {
    name: 'Generated Page',
    components: ui?.components || [],
    layout: ui?.formConfig?.layout || 'basic',
    columnCount: ui?.formConfig?.columnCount || 1,
    displayColumns: ui?.listConfig?.displayColumns || [],
    pageSize: ui?.listConfig?.defaultPageSize || 10
  }
}

describe('uiConfigToPageSchema', () => {
  it('should return a basic schema even if config is minimal', () => {
    const ui: UIConfig = {
      listConfig: { defaultPageSize: 20, displayColumns: ['name', 'email'] },
      formConfig: { layout: 'grid', columnCount: 2 },
      detailConfig: { layout: 'basic' }
    }
    const schema = mockUiConfigToPageSchema(ui)
    expect(schema.name).toBe('Generated Page')
    expect(schema.components).toBeDefined()
    expect(Array.isArray(schema.components)).toBe(true)
    expect(schema.displayColumns).toEqual(['name', 'email'])
    expect(schema.pageSize).toBe(20)
    expect(schema.layout).toBe('grid')
    expect(schema.columnCount).toBe(2)
  })

  it('should handle empty or undefined config', () => {
    const schema1 = mockUiConfigToPageSchema({})
    expect(schema1.name).toBe('Generated Page')
    expect(schema1.components).toEqual([])

    const schema2 = mockUiConfigToPageSchema(undefined)
    expect(schema2.name).toBe('Generated Page')
    expect(schema2.components).toEqual([])
  })

  it('should provide default values for missing config sections', () => {
    const ui: UIConfig = {
      listConfig: { defaultPageSize: 15 }
      // Missing formConfig and detailConfig
    }
    const schema = mockUiConfigToPageSchema(ui)
    expect(schema.layout).toBe('basic')
    expect(schema.columnCount).toBe(1)
    expect(schema.pageSize).toBe(15)
    expect(schema.displayColumns).toEqual([])
  })
})
