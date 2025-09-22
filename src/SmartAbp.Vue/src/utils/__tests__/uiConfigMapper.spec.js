import { describe, it, expect } from "vitest";
import { uiConfigToPageSchema } from "@smartabp/lowcode-designer/utils/uiConfigMapper";
describe("uiConfigToPageSchema", () => {
    it("should return a basic schema even if config is minimal", () => {
        const ui = {
            listConfig: { defaultPageSize: 20, displayColumns: ["name", "email"] },
            formConfig: { layout: "grid", columnCount: 2 },
            detailConfig: { layout: "basic" },
        };
        const schema = uiConfigToPageSchema(ui);
        expect(schema.name).toBe("Generated Page");
        expect(schema.components.length).toBe(0);
    });
});
