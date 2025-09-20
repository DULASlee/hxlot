import { describe, it, expect } from "vitest"
import {
  uiConfigToPageSchema,
  pageSchemaToUiConfig,
} from "@smartabp/lowcode-designer/utils/uiConfigMapper"

describe("uiConfigMapper", () => {
  it("maps uiConfig to page schema and back", () => {
    const ui = {
      listConfig: { defaultPageSize: 20, displayColumns: ["name", "email"] },
      formConfig: { layout: "grid", columnCount: 2 },
      detailConfig: { layout: "basic" },
    }

    const schema = uiConfigToPageSchema("User", ui as any)
    expect(schema.pageType).toBe("list")
    expect(schema.components.length).toBe(2)
    expect(schema.components[0].prop).toBe("name")

    const ui2 = pageSchemaToUiConfig(schema as any, ui as any)
    expect(ui2.listConfig.displayColumns).toEqual(["name", "email"])
    expect(ui2.listConfig.defaultPageSize).toBe(20)
  })
})
