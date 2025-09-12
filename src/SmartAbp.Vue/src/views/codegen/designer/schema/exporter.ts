type DesignerOverrideSchema = any

export function exportSchema(_schema: DesignerOverrideSchema): string {
  return JSON.stringify(_schema, null, 2)
}

export function buildOverridesFromState(_state: any, moduleName: string, pageName: string) {
  return {
    metadata: { schemaVersion: "0.1.0", moduleName, pageName, timestamp: new Date().toISOString() },
    selectors: {},
    operations: [],
  }
}
