// SmartAbp LowCode CodeGen Package Entry Point
export const VERSION = '1.0.0'
export const PACKAGE_NAME = '@smartabp/lowcode-codegen'

// Code generation interfaces
export interface CodeGenerator {
  generateCode: (template: string, data: any) => string
  generateFiles: (templates: any[], data: any) => any[]
}

// Placeholder for code generator
export const codeGenerator: CodeGenerator = {
  generateCode: (template: string, data: any) => {
    console.log('Generating code with template:', template, 'data:', data)
    return `// Generated code for ${data.entityName || 'Unknown'}`
  },
  generateFiles: (templates: any[], data: any) => {
    console.log('Generating files with templates:', templates, 'data:', data)
    return templates.map(template => ({
      filename: `${data.entityName || 'Unknown'}.generated.${template.extension || 'ts'}`,
      content: `// Generated ${template.type || 'file'} for ${data.entityName || 'Unknown'}`
    }))
  }
}

export default {
  VERSION,
  PACKAGE_NAME,
  codeGenerator
}
