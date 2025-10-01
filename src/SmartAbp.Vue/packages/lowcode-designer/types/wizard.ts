export enum WizardStep {
  BASIC_INFO = "basic-info",
  ENTITY_DESIGN = "entity-design",
  FEATURE_CONFIG = "feature-config",
  PREVIEW = "preview",
}

export interface CustomPermission {
  entity: string;
  action: string;
  displayName: string;
}
