/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import SandboxPreview from "@/components/lowcode/SandboxPreview.vue"

describe("SandboxPreview.vue", () => {
  it("should render an iframe with the correct sandbox attributes", () => {
    const wrapper = mount(SandboxPreview, { props: { code: "<p>test</p>" } })
    const iframe = wrapper.find("iframe")
    
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes("sandbox")).toContain("allow-scripts")
  })

  it("should render an iframe with a restrictive Content Security Policy (CSP)", () => {
    const wrapper = mount(SandboxPreview, { props: { code: "<p>test</p>" } })
    const iframe = wrapper.find("iframe")

    expect(iframe.attributes("csp")).toContain("script-src 'self'")
  })

  it("should pass the code prop to the iframe's srcdoc", () => {
    const code = "<h1>Hello World</h1>"
    const wrapper = mount(SandboxPreview, { props: { code } })
    const iframe = wrapper.find("iframe")

    expect(iframe.attributes("srcdoc")).toContain(code)
  })
})
