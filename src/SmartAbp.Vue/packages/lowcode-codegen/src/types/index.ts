export interface CodeGenerator {
  generate: (schema: any, options?: any) => Promise<CodeGenerationResult>
  validate: (schema: any) => Promise<ValidationResult>
  transform: (schema: any, transformations: any[]) => Promise<any>
}

export interface CodeGenerationResult {
  success: boolean
  files: GeneratedFile[]
  warnings: string[]
  errors: string[]
  duration: number
  stats: {
    components: number
    lines: number
    files: number
  }
}

export interface GeneratedFile {
  path: string
  content: string
  type: string
  language: string
  size: number
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  code: string
  message: string
  path: string
  severity: "error" | "warning"
}

export interface ValidationWarning {
  code: string
  message: string
  path: string
}

export interface Vue3Plugin extends CodeGenerator {
  target: "vue3"
  options: {
    composition: boolean
    typescript: boolean
    setup: boolean
    router: boolean
    pinia: boolean
  }
}
