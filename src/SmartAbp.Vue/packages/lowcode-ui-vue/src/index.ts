// SmartAbp LowCode UI Vue Package Entry Point
export const VERSION = '1.0.0'
export const PACKAGE_NAME = '@smartabp/lowcode-ui-vue'

// Vue UI components for low-code
export interface LowCodeUIComponents {
  DragDropContainer: any
  ComponentPalette: any
  PropertyEditor: any
  CodePreview: any
}

// Placeholder for UI components
export const components: LowCodeUIComponents = {
  DragDropContainer: null,
  ComponentPalette: null,
  PropertyEditor: null,
  CodePreview: null
}

export default {
  VERSION,
  PACKAGE_NAME,
  components
}
