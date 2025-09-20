import { describe, it, expect } from "vitest"
import {
  uiConfigToPageSchema,
  pageSchemaToUIConfig,
} from "@smartabp/lowcode-designer/utils/uiConfigMapper"

describe("uiConfigMapper", () => {
  it("maps uiConfig to page schema and back", () => {
    const ui = {
      listConfig: { defaultPageSize: 20, displayColumns: ["name", "email"] },
      formConfig: { layout: "grid", columnCount: 2 },
      detailConfig: { layout: "basic" },
    }

    const schema = uiConfigToPageSchema(ui as any)
    expect(schema.name).toBe("Generated Page")
    expect(schema.components.length).toBe(0)

    const ui2 = pageSchemaToUIConfig(schema)
    expect(ui2.layout).toBe("grid")
    expect(ui2.theme).toBe("default")
  })
})
