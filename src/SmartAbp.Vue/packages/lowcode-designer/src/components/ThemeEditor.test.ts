import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { ThemeEditor } from '@smartabp/lowcode-designer'
import theme from '@smartabp/lowcode-core'

describe("ThemeEditor.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset document body style for each test
    document.documentElement.style.cssText = ""
  })

  it("should load initial primary color from the theme store", () => {
    const store = useThemeStore()
    const wrapper = mount(ThemeEditor)
    const colorInput = wrapper.find<HTMLInputElement>('input[type="color"]')
    // Default color in store is #409EFF
    expect(colorInput.element.value).toBe("#409eff")
    expect(store.themeVariables["--el-color-primary"]).toBe("#409EFF")
  })

  it("should update the primary color in the store and apply it to the document root when changed", async () => {
    const store = useThemeStore()
    const wrapper = mount(ThemeEditor)

    const colorInput = wrapper.find('input[type="color"]')
    await colorInput.setValue("#ff0000")

    // Assert store state is updated
    expect(store.themeVariables["--el-color-primary"]).toBe("#ff0000")

    // Assert that the CSS variable on the root element is updated
    const rootStyle = document.documentElement.style
    expect(rootStyle.getPropertyValue("--el-color-primary")).toBe("#ff0000")
  })
})
