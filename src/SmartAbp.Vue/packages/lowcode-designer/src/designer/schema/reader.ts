import type { DesignerOverrideSchema } from './override'

export class BasicSchemaReader {
  public readFromVueSFC(
    _content: string,
    meta: { moduleName: string; pageName: string }
  ): DesignerOverrideSchema {
    // Minimal placeholder implementation to satisfy imports and basic flows
    return {
      metadata: {
        schemaVersion: '0.1.0',
        moduleName: meta.moduleName,
        pageName: meta.pageName,
        timestamp: new Date().toISOString()
      },
      selectors: {
        byBlockId: {},
        byDataNodeId: {}
      },
      operations: [],
      constraints: {
        version: '1.0.0',
        compatibility: 'vue3-element-plus',
        checksum: '0'
      }
    }
  }
}

export function buildOverridesFromState(
  _state: any,
  moduleName: string,
  pageName: string
): DesignerOverrideSchema {
  // Minimal placeholder – return empty operations with metadata
  return {
    metadata: {
      schemaVersion: '0.1.0',
      moduleName,
      pageName,
      timestamp: new Date().toISOString()
    },
    selectors: {
      byBlockId: {},
      byDataNodeId: {}
    },
    operations: [],
    constraints: {
      version: '1.0.0',
      compatibility: 'vue3-element-plus',
      checksum: '0'
    }
  }
}
