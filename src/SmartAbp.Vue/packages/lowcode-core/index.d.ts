export interface LowCodeEngine {
    version: string;
    initialize(): Promise<void>;
    destroy(): void;
}
export interface LowCodePlugin {
    name: string;
    version: string;
    install(engine: LowCodeEngine): void;
}
export { default as ErrorBoundary } from './src/components/ErrorBoundary.vue';
export { default as WorkspaceContainer } from './src/components/WorkspaceContainer.vue';
export { default as GlobalLoadingOverlay } from './src/components/GlobalLoadingOverlay.vue';
export { useWorkspaceStore } from './src/stores/workspace';
export { useEntityModelingStore, type EntityDefinition, type EntityField, type EntityRelation } from './src/stores/entityModeling';
export { usePageDesignStore } from './src/stores/pageDesign';
export { useCodeGenerationStore } from './src/stores/codeGeneration';
export { useEnhancedThemeStore } from './src/stores/enhancedTheme';
export { useEnhancedStateMachineStore } from './src/stores/enhancedStateMachine';
export { useStateMachineStore } from './src/stores/statemachine';
export { useTemplatesStore } from './src/stores/templates';
export * from './src/types/manifest';
export * from './src/types/entity-designer';
export type { MDIWindowConfig, TabConfig } from '@smartabp/lowcode-shared';
export * from './src/utils/manifestWriter';
export * from './src/composables/useCodeGenerationProgress';
export * from './src/composables/useDragDrop';
export * from './src/composables/useSecurityDashboard';
export * from './src/composables/useRealTimeAlerts';
export * from './src/composables/useFullscreen';
export declare const createLowCodeEngine: () => LowCodeEngine;
export default createLowCodeEngine;
//# sourceMappingURL=index.d.ts.map