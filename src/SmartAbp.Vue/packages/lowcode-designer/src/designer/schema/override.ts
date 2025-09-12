// AUTO-GENERATED SUPPORT TYPES – minimal runtime/type contract for VisualDesigner

export interface DesignerOverrideSchema {
  metadata: {
    schemaVersion: string
    moduleName: string
    pageName: string
    timestamp: string
    author?: string
  }
  selectors: {
    byBlockId?: Record<string, string>
    byDataNodeId?: Record<string, string>
  }
  operations: Array<
    | {
        type: 'add'
        targetSelector: { blockId?: string; dataNodeId?: string }
        componentType: string
        props?: Record<string, unknown>
        position?: { index?: number }
      }
    | {
        type: 'update'
        targetSelector: { blockId?: string; dataNodeId?: string }
        propPatches?: Record<string, unknown>
        eventPatches?: Record<string, string>
      }
    | {
        type: 'remove'
        targetSelector: { blockId?: string; dataNodeId?: string }
      }
  >
  constraints: {
    version: string
    compatibility: string
    checksum?: string
  }
}


