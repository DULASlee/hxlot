import type { CodeGeneratorApi } from "./types/index"
import { codeGeneratorApi as realApi } from "../code-generator"

export const codeGeneratorApi: CodeGeneratorApi = realApi as unknown as CodeGeneratorApi
