
// 本地类型定义，避免包依赖
interface ModuleMetadata {
  name: string;
  displayName: string;
  [key: string]: any;
}

export function uiConfigToPageSchema(metadata: ModuleMetadata): any {
  // TODO: Implement the actual transformation logic
  console.log("Mapping UI config to page schema for:", metadata.name);
  return {
    type: "page",
    title: metadata.displayName,
    body: [],
  };
}
