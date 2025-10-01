/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ModuleMetadata } from "@smartabp/lowcode-api"

export function uiConfigToPageSchema(metadata: ModuleMetadata): any {
  // TODO: Implement the actual transformation logic
  console.log("Mapping UI config to page schema for:", metadata.name)
  return {
    type: "page",
    title: metadata.displayName,
    body: [],
  }
}
