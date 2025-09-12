import type { DesignerOverrideSchema } from './override'

export function exportSchema(_schema: DesignerOverrideSchema): string {
  return JSON.stringify(_schema, null, 2)
}

export { buildOverridesFromState } from './reader'


