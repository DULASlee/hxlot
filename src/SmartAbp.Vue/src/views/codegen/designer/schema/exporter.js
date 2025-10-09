export function exportSchema(_schema) {
    return JSON.stringify(_schema, null, 2);
}
export function buildOverridesFromState(_state, moduleName, pageName) {
    return {
        metadata: { schemaVersion: "0.1.0", moduleName, pageName, timestamp: new Date().toISOString() },
        selectors: {},
        operations: [],
    };
}
